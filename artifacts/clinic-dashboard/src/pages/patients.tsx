import { useState, useEffect } from "react";
import { useGetPatients, useGetPatientPointsLog } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Search, ShieldAlert, Trophy, Plus, Minus, X, Check, Users, Star, Edit3, Clock, Calendar, Gift, UserPlus, ChevronLeft, History } from "lucide-react";
import { clsx } from "clsx";

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

type Patient = {
  id: number;
  name: string;
  phone: string;
  email: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  totalVisits: number;
  joinedAt: string;
};

type PointsAction = "add" | "subtract" | "set";

function PointsModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<PointsAction>("add");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = [50, 100, 200, 500];

  const handleSubmit = async () => {
    const val = parseInt(amount);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    try {
      const body: Record<string, any> = { autoLevel: true };
      if (action === "add") body.pointsDelta = val;
      else if (action === "subtract") body.pointsDelta = -val;
      else body.points = val;

      await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await queryClient.invalidateQueries();
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const preview = () => {
    const val = parseInt(amount) || 0;
    if (action === "add") return Math.max(0, patient.points + val);
    if (action === "subtract") return Math.max(0, patient.points - val);
    return val;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </button>
          <div className="text-right">
            <h3 className="font-bold text-lg">إدارة النقاط</h3>
            <p className="text-sm text-muted-foreground">{patient.name}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check size={32} className="text-emerald-500" />
              </div>
              <p className="font-bold text-lg">تم التحديث بنجاح!</p>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500">
                  <Trophy size={20} />
                  <span className="font-bold text-xl">{patient.points.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">نقطة</span>
                </div>
                <div className={clsx("px-3 py-1.5 rounded-lg border text-sm font-bold", LEVEL_COLORS[patient.level])}>
                  {LEVEL_NAMES_AR[patient.level]}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-muted-foreground mb-2 text-right">نوع العملية</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["add", "إضافة", "text-emerald-500", "border-emerald-500", "bg-emerald-500/10"],
                    ["subtract", "خصم", "text-destructive", "border-destructive", "bg-destructive/10"],
                    ["set", "تعيين", "text-blue-500", "border-blue-500", "bg-blue-500/10"],
                  ] as const).map(([a, label, color, border, bg]) => (
                    <button
                      key={a}
                      onClick={() => setAction(a)}
                      className={clsx(
                        "py-2.5 rounded-xl border-2 font-bold text-sm transition-all",
                        action === a ? `${border} ${color} ${bg}` : "border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-muted-foreground mb-2 text-right">كمية النقاط</p>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setAmount(v => String(Math.max(0, (parseInt(v) || 0) - 50)))}
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-center text-2xl font-bold bg-muted/50 border border-border rounded-xl py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                    min="0"
                  />
                  <button
                    onClick={() => setAmount(v => String((parseInt(v) || 0) + 50))}
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  {presets.map(p => (
                    <button
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className="flex-1 py-1.5 rounded-lg bg-muted/60 text-sm font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {amount && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-bold text-primary text-lg">{preview().toLocaleString()} نقطة</span>
                  <span className="text-sm text-muted-foreground">الرصيد الجديد</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !amount}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={20} />
                )}
                تأكيد التحديث
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const TYPE_CONFIG: Record<string, { icon: typeof Calendar; color: string; label: string }> = {
  visit: { icon: Calendar, color: "text-emerald-500", label: "زيارة" },
  bonus: { icon: Gift, color: "text-amber-500", label: "مكافأة" },
  manual: { icon: Edit3, color: "text-purple-500", label: "يدوي" },
  registration: { icon: UserPlus, color: "text-blue-500", label: "تسجيل" },
};

function PointsLogPanel({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const { data: logs = [], isLoading } = useGetPatientPointsLog(patient.id);

  const totalEarned = logs.filter((l: any) => l.points > 0).reduce((s: number, l: any) => s + l.points, 0);
  const totalDeducted = logs.filter((l: any) => l.points < 0).reduce((s: number, l: any) => s + Math.abs(l.points), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </button>
          <div className="text-right">
            <h3 className="font-bold text-lg">سجل نقاط المريض</h3>
            <p className="text-sm text-muted-foreground">{patient.name} • {patient.phone}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-500">+{totalEarned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">مكتسب</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-destructive">-{totalDeducted.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">مخصوم</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">{patient.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">الرصيد</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <History size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد عمليات بعد</p>
              </div>
            ) : (
              logs.map((entry: any) => {
                const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.visit;
                const Icon = cfg.icon;
                const isPositive = entry.points > 0;
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isPositive ? "bg-emerald-500/10" : "bg-destructive/10"
                    )}>
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-semibold text-sm truncate">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 justify-end">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={clsx("text-xs px-2 py-0.5 rounded-md font-bold", cfg.color, isPositive ? "bg-emerald-500/10" : "bg-destructive/10")}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className={clsx(
                      "font-bold text-sm px-3 py-1.5 rounded-lg shrink-0",
                      isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"
                    )}>
                      {isPositive ? "+" : ""}{entry.points}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useGetPatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [logPatient, setLogPatient] = useState<Patient | null>(null);

  const filtered = patients.filter(p => {
    const matchSearch = p.name.includes(searchTerm) || p.phone.includes(searchTerm) || p.email.includes(searchTerm);
    const matchLevel = levelFilter === "all" || p.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const totalPoints = patients.reduce((s, p) => s + p.points, 0);
  const goldPlat = patients.filter(p => p.level === "gold" || p.level === "platinum").length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-foreground">سجل المرضى</h1>
          <p className="text-muted-foreground mt-1">إدارة نقاط ومستويات الولاء للمرضى</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "إجمالي المرضى", value: patients.length, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Trophy, label: "إجمالي النقاط", value: totalPoints.toLocaleString(), color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Star, label: "ذهبي وبلاتيني", value: goldPlat, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
                <Icon size={22} className={color} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم أو الهاتف أو الإيميل..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none text-right"
            />
          </div>
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none font-bold min-w-[200px]"
          >
            <option value="all">جميع المستويات</option>
            <option value="platinum">البلاتيني</option>
            <option value="gold">الذهبي</option>
            <option value="silver">الفضي</option>
            <option value="bronze">البرونزي</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground text-sm font-bold">
                  <th className="p-4 px-6 text-start">المريض</th>
                  <th className="p-4 px-6 text-start">المستوى</th>
                  <th className="p-4 px-6 text-start">النقاط الحالية</th>
                  <th className="p-4 px-6 text-start">إجمالي الزيارات</th>
                  <th className="p-4 px-6 text-start">تاريخ الانضمام</th>
                  <th className="p-4 px-6 text-start">إدارة النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا يوجد مرضى مطابقين</td></tr>
                ) : (
                  filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{patient.phone}</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5" dir="ltr">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold", LEVEL_COLORS[patient.level])}>
                          <ShieldAlert size={14} />
                          {LEVEL_NAMES_AR[patient.level]}
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Trophy size={18} />
                          <span className="font-bold text-lg">{patient.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 px-6 font-semibold text-muted-foreground">
                        {patient.totalVisits} زيارة
                      </td>
                      <td className="p-4 px-6 text-sm text-muted-foreground">
                        {new Date(patient.joinedAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPatient(patient as Patient)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-sm transition-all group"
                          >
                            <Edit3 size={15} className="group-hover:scale-110 transition-transform" />
                            تعديل النقاط
                          </button>
                          <button
                            onClick={() => setLogPatient(patient as Patient)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white font-bold text-sm transition-all group"
                          >
                            <History size={15} className="group-hover:scale-110 transition-transform" />
                            السجل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPatient && (
        <PointsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
      {logPatient && (
        <PointsLogPanel patient={logPatient} onClose={() => setLogPatient(null)} />
      )}
    </Layout>
  );
}
