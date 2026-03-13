import { useState } from "react";
import { 
  useGetClinics, 
  getGetClinicsQueryKey, 
  useCreateClinic, 
  useUpdateClinic, 
  useDeleteClinic 
} from "@workspace/api-client-react";
import type { Clinic, ClinicInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Edit2, Trash2, MapPin, Phone, Users, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const clinicSchema = z.object({
  name: z.string().min(1, "مطلوب"),
  nameAr: z.string().min(1, "مطلوب"),
  specialty: z.string().min(1, "مطلوب"),
  specialtyAr: z.string().min(1, "مطلوب"),
  phone: z.string().min(1, "مطلوب"),
  email: z.string().email("بريد غير صالح"),
  address: z.string().min(1, "مطلوب"),
  addressAr: z.string().min(1, "مطلوب"),
  city: z.string().min(1, "مطلوب"),
  openHours: z.string().min(1, "مطلوب"),
  pointsPerVisit: z.coerce.number().min(0),
  latitude: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().min(-90).max(90).nullable().optional()),
  longitude: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().min(-180).max(180).nullable().optional()),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export default function ClinicsPage() {
  const queryClient = useQueryClient();
  const { data: clinics = [], isLoading } = useGetClinics();
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();
  const deleteMutation = useDeleteClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
  });

  const openModal = (clinic?: Clinic) => {
    if (clinic) {
      setEditingClinic(clinic);
      reset({
        ...clinic,
        latitude: clinic.latitude ?? null,
        longitude: clinic.longitude ?? null,
        description: clinic.description || "",
        descriptionAr: clinic.descriptionAr || "",
        imageUrl: clinic.imageUrl || "",
      });
    } else {
      setEditingClinic(null);
      reset({
        name: "", nameAr: "", specialty: "", specialtyAr: "", phone: "", email: "", 
        address: "", addressAr: "", city: "", openHours: "", pointsPerVisit: 100,
        latitude: null, longitude: null,
        description: "", descriptionAr: "", imageUrl: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClinic(null);
  };

  const onSubmit = (data: ClinicFormData) => {
    if (editingClinic) {
      updateMutation.mutate({ id: editingClinic.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClinicsQueryKey() });
          closeModal();
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClinicsQueryKey() });
          closeModal();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه العيادة؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetClinicsQueryKey() })
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة العيادات</h1>
            <p className="text-muted-foreground mt-1">عرض وتعديل بيانات العيادات المشتركة في المنصة.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus size={20} />
            إضافة عيادة
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-card rounded-2xl border border-border/50"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                      {clinic.nameAr.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-tight">{clinic.nameAr}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{clinic.specialtyAr}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(clinic)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(clinic.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin size={16} className="text-primary/70" />
                    <span>{clinic.city} - {clinic.addressAr}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone size={16} className="text-primary/70" />
                    <span dir="ltr">{clinic.phone}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span className="font-bold text-foreground">{clinic.totalPatients}</span>
                    <span className="text-xs text-muted-foreground">مريض</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                    <Star size={14} className="fill-current" />
                    <span className="font-bold text-sm">{clinic.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">{editingClinic ? "تعديل بيانات العيادة" : "إضافة عيادة جديدة"}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-2 text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الاسم بالعربية</label>
                  <input {...register("nameAr")} className={cn("w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all", errors.nameAr && "border-destructive focus:ring-destructive")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الاسم بالإنجليزية</label>
                  <input {...register("name")} dir="ltr" className={cn("w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all", errors.name && "border-destructive focus:ring-destructive")} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">التخصص بالعربية</label>
                  <input {...register("specialtyAr")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">التخصص بالإنجليزية</label>
                  <input {...register("specialty")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">رقم الهاتف</label>
                  <input {...register("phone")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                  <input {...register("email")} type="email" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">المدينة</label>
                  <input {...register("city")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">ساعات العمل</label>
                  <input {...register("openHours")} placeholder="مثال: 9:00 ص - 9:00 م" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">العنوان بالعربية</label>
                  <input {...register("addressAr")} className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">العنوان بالإنجليزية</label>
                  <input {...register("address")} dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">النقاط المكتسبة لكل زيارة</label>
                  <input {...register("pointsPerVisit")} type="number" dir="ltr" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">خط العرض (Latitude)</label>
                  <input {...register("latitude")} type="number" step="any" dir="ltr" placeholder="مثال: 23.5880" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">خط الطول (Longitude)</label>
                  <input {...register("longitude")} type="number" step="any" dir="ltr" placeholder="مثال: 58.3829" className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-foreground bg-muted hover:bg-muted/80 transition-all">إلغاء</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                  {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
