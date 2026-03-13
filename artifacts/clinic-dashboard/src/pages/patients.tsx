import { useState } from "react";
import { useGetPatients } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Search, ShieldAlert, Trophy } from "lucide-react";
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

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useGetPatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = patients.filter(p => {
    const matchSearch = p.name.includes(searchTerm) || p.phone.includes(searchTerm);
    const matchLevel = levelFilter === "all" || p.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">سجل المرضى</h1>
          <p className="text-muted-foreground mt-1">تتبع نقاط ومستويات الولاء الخاصة بالمرضى.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text"
              placeholder="البحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none"
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد مرضى مطابقين</td></tr>
                ) : (
                  filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{patient.phone}</p>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
