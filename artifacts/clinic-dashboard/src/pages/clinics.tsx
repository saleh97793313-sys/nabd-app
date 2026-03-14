import { useState, useCallback, useEffect } from "react";
import { 
  useGetClinics, 
  getGetClinicsQueryKey, 
  useCreateClinic, 
  useUpdateClinic, 
  useDeleteClinic,
  useGetClinicRatings,
} from "@workspace/api-client-react";
import type { Clinic, ClinicInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, Edit2, Trash2, MapPin, Phone, Users, Star, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import MapPicker from "@/components/MapPicker";

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

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function ClinicRatingsPanel({ clinicId }: { clinicId: number }) {
  const { data: ratings = [], isLoading } = useGetClinicRatings(clinicId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="p-12 text-center">
        <MessageSquare size={40} className="mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium">لا توجد تقييمات بعد</p>
        <p className="text-sm text-muted-foreground/70 mt-1">ستظهر التقييمات هنا عندما يقيّم المرضى زياراتهم</p>
      </div>
    );
  }

  const avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between bg-amber-50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-amber-600">{avgRating.toFixed(1)}</div>
          <div>
            <StarDisplay rating={avgRating} size={16} />
            <p className="text-xs text-muted-foreground mt-1">{ratings.length} تقييم</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {ratings.map((rating) => (
          <div key={rating.id} className="border border-border/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <StarDisplay rating={rating.stars} />
              <span className="text-xs text-muted-foreground" dir="ltr">
                {rating.patientPhone}
              </span>
            </div>
            {rating.comment && (
              <p className="text-sm text-foreground mt-2 leading-relaxed">{rating.comment}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(rating.createdAt).toLocaleDateString("ar-OM", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const queryClient = useQueryClient();
  const { data: clinics = [], isLoading } = useGetClinics();
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();
  const deleteMutation = useDeleteClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [modalTab, setModalTab] = useState<"form" | "ratings">("form");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
  });

  const watchedLat = watch("latitude");
  const watchedLng = watch("longitude");

  const handleMapChange = useCallback((lat: number, lng: number) => {
    setValue("latitude", parseFloat(lat.toFixed(6)), { shouldValidate: true });
    setValue("longitude", parseFloat(lng.toFixed(6)), { shouldValidate: true });
  }, [setValue]);

  const openModal = (clinic?: Clinic, tab: "form" | "ratings" = "form") => {
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
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClinic(null);
    setModalTab("form");
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
                    <button onClick={() => openModal(clinic, "ratings")} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="التقييمات">
                      <MessageSquare size={16} />
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
                  <button 
                    onClick={() => openModal(clinic, "ratings")}
                    className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Star size={14} className="fill-current" />
                    <span className="font-bold text-sm">{clinic.rating.toFixed(1)}</span>
                    <span className="text-xs text-amber-400">({clinic.ratingCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingClinic ? editingClinic.nameAr : "إضافة عيادة جديدة"}
                </h2>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-2 text-xl">&times;</button>
              </div>
              
              {editingClinic && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalTab("form")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      modalTab === "form"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    بيانات العيادة
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab("ratings")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      modalTab === "ratings"
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Star size={14} />
                    التقييمات
                  </button>
                </div>
              )}
            </div>

            {modalTab === "ratings" && editingClinic ? (
              <ClinicRatingsPanel clinicId={editingClinic.id} />
            ) : (
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

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-foreground">موقع العيادة على الخريطة</label>
                    <MapPicker
                      latitude={watchedLat}
                      longitude={watchedLng}
                      onChange={handleMapChange}
                    />
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>خط العرض:</span>
                        <span dir="ltr" className="font-mono text-foreground">{watchedLat ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>خط الطول:</span>
                        <span dir="ltr" className="font-mono text-foreground">{watchedLng ?? "—"}</span>
                      </div>
                      {(watchedLat != null && watchedLng != null) && (
                        <button
                          type="button"
                          onClick={() => {
                            setValue("latitude", null);
                            setValue("longitude", null);
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          مسح الموقع
                        </button>
                      )}
                    </div>
                    <input type="hidden" {...register("latitude")} />
                    <input type="hidden" {...register("longitude")} />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-foreground bg-muted hover:bg-muted/80 transition-all">إلغاء</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                    {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
