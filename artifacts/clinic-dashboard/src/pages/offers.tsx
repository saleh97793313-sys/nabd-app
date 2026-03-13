import { useState } from "react";
import { 
  useGetOffers, 
  getGetOffersQueryKey, 
  useCreateOffer, 
  useUpdateOffer, 
  useDeleteOffer,
  useGetClinics
} from "@workspace/api-client-react";
import type { Offer, OfferInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Edit2, Trash2, Tag, Coins, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const offerSchema = z.object({
  clinicId: z.coerce.number().min(1, "مطلوب"),
  title: z.string().min(1, "مطلوب"),
  titleAr: z.string().min(1, "مطلوب"),
  description: z.string().min(1, "مطلوب"),
  descriptionAr: z.string().min(1, "مطلوب"),
  originalPrice: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().min(0),
  pointsRequired: z.coerce.number().min(0),
  category: z.string().min(1, "مطلوب"),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  expiryDate: z.string().min(1, "مطلوب"),
});

type OfferFormData = z.infer<typeof offerSchema>;

export default function OffersPage() {
  const queryClient = useQueryClient();
  const { data: offers = [], isLoading: offersLoading } = useGetOffers();
  const { data: clinics = [] } = useGetClinics();
  
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  const deleteMutation = useDeleteOffer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
  });

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      reset({
        ...offer,
        expiryDate: offer.expiryDate.split('T')[0], // format for date input
      });
    } else {
      setEditingOffer(null);
      reset({
        clinicId: clinics[0]?.id || 0,
        title: "", titleAr: "", description: "", descriptionAr: "",
        originalPrice: 0, discountedPrice: 0, pointsRequired: 500,
        category: "general", isFeatured: false, isActive: true,
        expiryDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const onSubmit = (data: OfferFormData) => {
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOffersQueryKey() });
          closeModal();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetOffersQueryKey() });
          closeModal();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العرض؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetOffersQueryKey() })
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة العروض</h1>
            <p className="text-muted-foreground mt-1">أدر العروض والخصومات المتاحة بالنقاط.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus size={20} />
            إضافة عرض
          </button>
        </div>

        {offersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-card rounded-2xl border border-border/50"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative group overflow-hidden">
                {!offer.isActive && (
                  <div className="absolute top-4 start-4 px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-lg">
                    غير فعال
                  </div>
                )}
                {offer.isFeatured && offer.isActive && (
                  <div className="absolute top-4 start-4 px-3 py-1 bg-amber-500/10 text-amber-600 text-xs font-bold rounded-lg border border-amber-500/20">
                    مميز
                  </div>
                )}

                <div className="flex justify-between items-start mb-6 mt-6">
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{offer.titleAr}</h3>
                    <p className="text-sm font-semibold text-primary">{offer.clinicName}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(offer)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(offer.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5">
                    <Tag size={14} className="text-primary" />
                    <span>{offer.discountedPrice} ر.ع</span>
                    <span className="line-through opacity-50 text-xs mx-1">{offer.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5">
                    <Coins size={14} className="text-amber-500" />
                    <span className="text-amber-600 font-bold">{offer.pointsRequired} نقطة</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>ينتهي: {new Date(offer.expiryDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <span>استخدم {offer.usageCount} مرة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10">
            <div className="p-6 border-b border-border/50 sticky top-0 bg-card flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingOffer ? "تعديل العرض" : "إضافة عرض"}</h2>
              <button onClick={closeModal} className="text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold">العيادة</label>
                  <select {...register("clinicId")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none">
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">العنوان (عربي)</label>
                  <input {...register("titleAr")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">العنوان (إنجليزي)</label>
                  <input {...register("title")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold">الوصف (عربي)</label>
                  <textarea {...register("descriptionAr")} rows={2} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">السعر الأصلي (ر.ع)</label>
                  <input {...register("originalPrice")} type="number" step="0.1" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">السعر بعد الخصم (ر.ع)</label>
                  <input {...register("discountedPrice")} type="number" step="0.1" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">النقاط المطلوبة للاستبدال</label>
                  <input {...register("pointsRequired")} type="number" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">تاريخ الانتهاء</label>
                  <input {...register("expiryDate")} type="date" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">التصنيف</label>
                  <select {...register("category")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none">
                    <option value="dental">أسنان</option>
                    <option value="derma">جلدية</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register("isActive")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                    <span className="font-bold">مفعل (يظهر للمستخدمين)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register("isFeatured")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                    <span className="font-bold">عرض مميز (في الرئيسية)</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold bg-muted hover:bg-muted/80">إلغاء</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
