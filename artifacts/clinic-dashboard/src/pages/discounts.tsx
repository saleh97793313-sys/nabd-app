import { useState } from "react";
import { 
  useGetDiscounts, 
  getGetDiscountsQueryKey, 
  useCreateDiscount, 
  useUpdateDiscount, 
  useDeleteDiscount 
} from "@workspace/api-client-react";
import type { Discount, DiscountInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Edit2, Trash2, Tag, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clsx } from "clsx";

const discountSchema = z.object({
  code: z.string().min(3, "مطلوب"),
  title: z.string().min(1, "مطلوب"),
  titleAr: z.string().min(1, "مطلوب"),
  description: z.string().min(1, "مطلوب"),
  discountPercent: z.coerce.number().min(1).max(100),
  requiredLevel: z.enum(["bronze", "silver", "gold", "platinum"]),
  service: z.string().min(1, "مطلوب"),
  expiryDate: z.string().min(1, "مطلوب"),
  isActive: z.boolean(),
  maxUsage: z.coerce.number().min(1),
  clinicId: z.coerce.number().nullable().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

const LEVEL_COLORS = {
  bronze: "bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20",
  silver: "bg-[#A0AEC0]/10 text-[#718096] border-[#A0AEC0]/20",
  gold: "bg-[#FFB800]/10 text-[#D69E00] border-[#FFB800]/20",
  platinum: "bg-[#7C3AED]/10 text-[#6D28D9] border-[#7C3AED]/20",
};

const LEVEL_NAMES_AR = {
  bronze: "برونزي",
  silver: "فضي",
  gold: "ذهبي",
  platinum: "بلاتيني",
};

export default function DiscountsPage() {
  const queryClient = useQueryClient();
  const { data: discounts = [], isLoading } = useGetDiscounts();
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const { register, handleSubmit, reset } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
  });

  const openModal = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      reset({
        ...discount,
        expiryDate: discount.expiryDate.split('T')[0],
      });
    } else {
      setEditingDiscount(null);
      reset({
        code: "", title: "", titleAr: "", description: "",
        discountPercent: 10, requiredLevel: "silver", service: "جميع الخدمات",
        expiryDate: new Date().toISOString().split('T')[0],
        isActive: true, maxUsage: 100, clinicId: null
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  const onSubmit = (data: DiscountFormData) => {
    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDiscountsQueryKey() });
          closeModal();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDiscountsQueryKey() });
          closeModal();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الكود؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDiscountsQueryKey() })
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">أكواد الخصم</h1>
            <p className="text-muted-foreground mt-1">أكواد الخصم الخاصة بمستويات الولاء.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            إضافة كود جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div key={discount.id} className={clsx(
              "bg-card rounded-2xl p-6 border shadow-lg transition-all",
              discount.isActive ? "border-border/50 shadow-black/5 hover:shadow-xl" : "border-muted shadow-none opacity-70"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{discount.titleAr}</h3>
                    <p className="text-muted-foreground text-sm">{discount.service}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(discount)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(discount.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="my-6 p-4 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-between">
                <span className="font-mono text-xl font-bold tracking-wider text-foreground">{discount.code}</span>
                <span className="text-2xl font-bold text-primary">{discount.discountPercent}%</span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-bold", LEVEL_COLORS[discount.requiredLevel])}>
                  <ShieldAlert size={14} />
                  <span>عضو {LEVEL_NAMES_AR[discount.requiredLevel]}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  استخدم {discount.usageCount} / {discount.maxUsage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10">
            <div className="p-6 border-b border-border/50 sticky top-0 bg-card flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingDiscount ? "تعديل الكود" : "إضافة كود خصم"}</h2>
              <button onClick={closeModal} className="text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">كود الخصم</label>
                  <input {...register("code")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary uppercase font-mono tracking-widest" placeholder="e.g. SILVER10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">نسبة الخصم (%)</label>
                  <input {...register("discountPercent")} type="number" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">العنوان (عربي)</label>
                  <input {...register("titleAr")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">العنوان (إنجليزي)</label>
                  <input {...register("title")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold">الخدمة المشمولة</label>
                  <input {...register("service")} placeholder="مثال: جميع الخدمات، تبييض الأسنان" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">المستوى المطلوب</label>
                  <select {...register("requiredLevel")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary">
                    <option value="bronze">برونزي</option>
                    <option value="silver">فضي</option>
                    <option value="gold">ذهبي</option>
                    <option value="platinum">بلاتيني</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">تاريخ الانتهاء</label>
                  <input {...register("expiryDate")} type="date" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">الحد الأقصى للاستخدام</label>
                  <input {...register("maxUsage")} type="number" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2 flex items-center pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register("isActive")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                    <span className="font-bold">مفعل</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold bg-muted">إلغاء</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-primary">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
