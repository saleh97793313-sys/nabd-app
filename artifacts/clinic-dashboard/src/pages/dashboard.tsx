import { useGetDashboardStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  Tags,
  Loader2
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

const LEVEL_COLORS = {
  bronze: "#CD7F32",
  silver: "#A0AEC0",
  gold: "#FFB800",
  platinum: "#7C3AED"
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'برونزي', value: stats.levelDistribution.bronze, color: LEVEL_COLORS.bronze },
    { name: 'فضي', value: stats.levelDistribution.silver, color: LEVEL_COLORS.silver },
    { name: 'ذهبي', value: stats.levelDistribution.gold, color: LEVEL_COLORS.gold },
    { name: 'بلاتيني', value: stats.levelDistribution.platinum, color: LEVEL_COLORS.platinum },
  ].filter(d => d.value > 0);

  const statCards = [
    { title: "إجمالي المرضى", value: stats.totalPatients, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "العيادات النشطة", value: stats.totalClinics, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "مواعيد هذا الشهر", value: stats.appointmentsThisMonth, icon: CalendarCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "العروض المتاحة", value: stats.activeOffers, icon: Tags, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-xl shadow-black/5 border border-border/50 hover:shadow-2xl hover:border-border transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{card.value.toLocaleString()}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={28} strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Distribution Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-xl shadow-black/5 border border-border/50 lg:col-span-1">
            <h3 className="text-lg font-bold text-foreground mb-6">توزيع مستويات الولاء</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#1A3A5C', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Appointments Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-xl shadow-black/5 border border-border/50 lg:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-6">المواعيد الشهرية</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="عدد المواعيد" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
