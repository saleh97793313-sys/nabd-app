import { useState } from "react";
import { 
  useGetAppointments, 
  getGetAppointmentsQueryKey,
  useUpdateAppointmentStatus 
} from "@workspace/api-client-react";
import type { AppointmentStatus } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { CheckCircle2, Clock, XCircle, ChevronDown, CalendarDays } from "lucide-react";
import { clsx } from "clsx";

const STATUS_MAP = {
  pending: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CalendarDays },
  completed: { label: "مكتمل", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useGetAppointments();
  const updateStatusMutation = useUpdateAppointmentStatus();
  const [filter, setFilter] = useState<string>("all");

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() }) }
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المواعيد</h1>
          <p className="text-muted-foreground mt-1">تتبع وتحديث حالات الحجوزات القادمة والسابقة.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-card p-2 rounded-2xl border border-border w-fit shadow-sm">
          <button onClick={() => setFilter("all")} className={clsx("px-4 py-2 rounded-xl text-sm font-bold transition-all", filter === "all" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted")}>الكل</button>
          <button onClick={() => setFilter("pending")} className={clsx("px-4 py-2 rounded-xl text-sm font-bold transition-all", filter === "pending" ? "bg-amber-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted")}>قيد الانتظار</button>
          <button onClick={() => setFilter("confirmed")} className={clsx("px-4 py-2 rounded-xl text-sm font-bold transition-all", filter === "confirmed" ? "bg-blue-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted")}>مؤكد</button>
          <button onClick={() => setFilter("completed")} className={clsx("px-4 py-2 rounded-xl text-sm font-bold transition-all", filter === "completed" ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted")}>مكتمل</button>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground text-sm font-bold">
                  <th className="p-4 px-6 font-bold text-start">المريض</th>
                  <th className="p-4 px-6 font-bold text-start">العيادة / الخدمة</th>
                  <th className="p-4 px-6 font-bold text-start">التاريخ والوقت</th>
                  <th className="p-4 px-6 font-bold text-start">الحالة</th>
                  <th className="p-4 px-6 font-bold text-start">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد مواعيد مطابقة</td></tr>
                ) : (
                  filteredAppointments.map((app) => {
                    const statusInfo = STATUS_MAP[app.status as keyof typeof STATUS_MAP];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 px-6">
                          <p className="font-bold text-foreground">{app.patientName}</p>
                          <p className="text-xs text-muted-foreground mt-1" dir="ltr">{app.patientPhone}</p>
                        </td>
                        <td className="p-4 px-6">
                          <p className="font-bold text-primary">{app.clinicName}</p>
                          <p className="text-sm text-muted-foreground mt-1">{app.serviceAr}</p>
                        </td>
                        <td className="p-4 px-6">
                          <p className="font-semibold text-foreground">{app.date}</p>
                          <p className="text-sm text-muted-foreground mt-1" dir="ltr">{app.time}</p>
                        </td>
                        <td className="p-4 px-6">
                          <div className="relative group">
                            <select 
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as AppointmentStatus)}
                              disabled={updateStatusMutation.isPending}
                              className={clsx(
                                "appearance-none pl-8 pr-10 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer w-40",
                                statusInfo.color
                              )}
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="completed">مكتمل</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                            <StatusIcon className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 opacity-70" />
                            <ChevronDown className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 opacity-50" />
                          </div>
                        </td>
                        <td className="p-4 px-6 text-amber-600 font-bold">
                          +{app.pointsEarned}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
