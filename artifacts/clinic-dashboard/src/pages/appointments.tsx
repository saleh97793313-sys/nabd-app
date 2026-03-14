import { useState, useMemo } from "react";
import {
  useGetAppointments,
  getGetAppointmentsQueryKey,
  useUpdateAppointmentStatus,
} from "@workspace/api-client-react";
import type {
  Appointment,
  AppointmentStatus,
} from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  CalendarDays,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const STATUS_MAP = {
  pending: {
    label: "قيد الانتظار",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  confirmed: {
    label: "مؤكد",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: CalendarDays,
  },
  completed: {
    label: "مكتمل",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "ملغي",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

function getWeekDates(refDate: Date): Date[] {
  const d = new Date(refDate);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(d);
    date.setDate(diff + i);
    dates.push(date);
  }
  return dates;
}

const HOUR_SLOTS = Array.from({ length: 12 }, (_, i) => i + 8);

const DAY_NAMES_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function WeekCalendar({
  appointments,
  onStatusChange,
  isPending,
}: {
  appointments: Appointment[];
  onStatusChange: (id: number, status: AppointmentStatus) => void;
  isPending: boolean;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const refDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
  const today = formatDateKey(new Date());

  const appointmentsByDateHour = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const app of appointments) {
      const dateKey = app.date;
      const timeMatch = app.time.match(/(\d{1,2})/);
      const hour = timeMatch ? parseInt(timeMatch[1]) : 9;
      const adjustedHour = app.time.includes("م") && hour !== 12 ? hour + 12 : hour;
      const key = `${dateKey}-${adjustedHour}`;
      if (!map[key]) map[key] = [];
      map[key].push(app);
    }
    return map;
  }, [appointments]);

  const weekStart = weekDates[0].toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  const weekEnd = weekDates[6].toLocaleDateString("ar-EG", { month: "short", day: "numeric" });

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          <ChevronRight size={18} />
        </button>
        <div className="text-center">
          <p className="font-bold text-foreground">
            {weekStart} — {weekEnd}
          </p>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs text-primary hover:underline font-semibold mt-0.5"
          >
            اليوم
          </button>
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-card z-10">
            <div className="p-2 text-center text-xs text-muted-foreground border-e border-border" />
            {weekDates.map((d, i) => {
              const isToday = formatDateKey(d) === today;
              return (
                <div
                  key={i}
                  className={clsx(
                    "p-2 text-center border-e border-border last:border-e-0",
                    isToday && "bg-primary/5"
                  )}
                >
                  <p className="text-xs text-muted-foreground">{DAY_NAMES_AR[d.getDay()]}</p>
                  <p
                    className={clsx(
                      "text-sm font-bold mt-0.5",
                      isToday ? "text-primary" : "text-foreground"
                    )}
                  >
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {HOUR_SLOTS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/30 min-h-[56px]"
              >
                <div className="p-1.5 text-center text-xs text-muted-foreground border-e border-border flex items-start justify-center pt-2">
                  {hour > 12 ? `${hour - 12} م` : hour === 12 ? "12 م" : `${hour} ص`}
                </div>
                {weekDates.map((d, di) => {
                  const dateKey = formatDateKey(d);
                  const key = `${dateKey}-${hour}`;
                  const apps = appointmentsByDateHour[key] || [];
                  const isToday = dateKey === today;
                  return (
                    <div
                      key={di}
                      className={clsx(
                        "p-0.5 border-e border-border/30 last:border-e-0 min-h-[56px]",
                        isToday && "bg-primary/[0.02]"
                      )}
                    >
                      {apps.map((app) => {
                        const statusInfo = STATUS_MAP[app.status as keyof typeof STATUS_MAP];
                        return (
                          <div
                            key={app.id}
                            className={clsx(
                              "text-[10px] leading-tight rounded-lg p-1.5 mb-0.5 border cursor-default group relative",
                              statusInfo.color
                            )}
                            title={`${app.patientName} — ${app.clinicName} — ${statusInfo.label}`}
                          >
                            <p className="font-bold truncate">{app.patientName}</p>
                            <p className="truncate opacity-80">{app.clinicName}</p>
                            <div className="hidden group-hover:flex absolute top-full left-0 right-0 z-20 mt-1">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  onStatusChange(app.id, e.target.value as AppointmentStatus)
                                }
                                disabled={isPending}
                                className="w-full text-[10px] bg-card border border-border rounded-lg p-1 shadow-lg"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useGetAppointments();
  const updateStatusMutation = useUpdateAppointmentStatus();
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const filteredAppointments =
    filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: getGetAppointmentsQueryKey() }),
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-muted-foreground mt-1">
              تتبع وتحديث حالات الحجوزات القادمة والسابقة.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setView("list")}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all",
                view === "list"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <List size={16} />
              قائمة
            </button>
            <button
              onClick={() => setView("calendar")}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all",
                view === "calendar"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Grid3X3 size={16} />
              تقويم
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-card p-2 rounded-2xl border border-border w-fit shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "all"
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "pending"
                ? "bg-amber-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            قيد الانتظار
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "confirmed"
                ? "bg-blue-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            مؤكد
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filter === "completed"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            مكتمل
          </button>
        </div>

        {view === "calendar" ? (
          <WeekCalendar
            appointments={filteredAppointments}
            onStatusChange={handleStatusChange}
            isPending={updateStatusMutation.isPending}
          />
        ) : (
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
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        لا توجد مواعيد مطابقة
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => {
                      const statusInfo = STATUS_MAP[app.status as keyof typeof STATUS_MAP];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 px-6">
                            <p className="font-bold text-foreground">{app.patientName}</p>
                            <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                              {app.patientPhone}
                            </p>
                          </td>
                          <td className="p-4 px-6">
                            <p className="font-bold text-primary">{app.clinicName}</p>
                            <p className="text-sm text-muted-foreground mt-1">{app.serviceAr}</p>
                          </td>
                          <td className="p-4 px-6">
                            <p className="font-semibold text-foreground">{app.date}</p>
                            <p className="text-sm text-muted-foreground mt-1" dir="ltr">
                              {app.time}
                            </p>
                          </td>
                          <td className="p-4 px-6">
                            <div className="relative group">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleStatusChange(app.id, e.target.value as AppointmentStatus)
                                }
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
        )}
      </div>
    </Layout>
  );
}
