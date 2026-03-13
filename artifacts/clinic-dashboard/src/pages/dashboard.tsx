import { useGetDashboardStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import {
  Users,
  Building2,
  CalendarCheck,
  Tags,
  Loader2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowLeft,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
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
  Legend,
} from "recharts";
import { Link } from "wouter";

const LEVEL_COLORS = {
  bronze: "#CD7F32",
  silver: "#A0AEC0",
  gold: "#FFB800",
  platinum: "#7C3AED",
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
    { name: "برونزي", value: stats.levelDistribution.bronze, color: LEVEL_COLORS.bronze },
    { name: "فضي", value: stats.levelDistribution.silver, color: LEVEL_COLORS.silver },
    { name: "ذهبي", value: stats.levelDistribution.gold, color: LEVEL_COLORS.gold },
    { name: "بلاتيني", value: stats.levelDistribution.platinum, color: LEVEL_COLORS.platinum },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      title: "إجمالي المرضى",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      trend: "+12%",
      up: true,
      href: "/patients",
    },
    {
      title: "العيادات النشطة",
      value: stats.totalClinics,
      icon: Building2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      trend: "+3",
      up: true,
      href: "/clinics",
    },
    {
      title: "مواعيد هذا الشهر",
      value: stats.appointmentsThisMonth,
      icon: CalendarCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      trend: "-5%",
      up: false,
      href: "/appointments",
    },
    {
      title: "العروض المتاحة",
      value: stats.activeOffers,
      icon: Tags,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      trend: "+2",
      up: true,
      href: "/offers",
    },
  ];

  const quickActions = [
    { label: "إضافة عيادة جديدة", href: "/clinics", icon: Building2, color: "bg-blue-500" },
    { label: "إنشاء عرض جديد", href: "/offers", icon: Tags, color: "bg-amber-500" },
    { label: "إضافة موعد", href: "/appointments", icon: CalendarCheck, color: "bg-purple-500" },
    { label: "إضافة خصم", href: "/discounts", icon: Star, color: "bg-rose-500" },
  ];

  const recentActivity = [
    { text: "تم إضافة عيادة جديدة", time: "منذ 5 دقائق", type: "success" },
    { text: "موعد جديد تم حجزه", time: "منذ 23 دقيقة", type: "info" },
    { text: "عرض منتهي الصلاحية", time: "منذ ساعة", type: "warning" },
    { text: "مريض جديد انضم", time: "منذ 2 ساعة", type: "success" },
    { text: "تم تحديث خصم برونزي", time: "منذ 3 ساعات", type: "info" },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/70 rounded-2xl p-6 text-white shadow-xl shadow-primary/20 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">مرحباً بك 👋</p>
            <h2 className="text-2xl font-bold">مدير النظام</h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              اليوم {new Date().toLocaleDateString("ar-OM", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-4xl">
            🏥
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <Link key={i} href={card.href}>
              <div className={`bg-card rounded-2xl p-5 shadow-sm border ${card.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon size={24} strokeWidth={2} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.up ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
                    {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {card.trend}
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{card.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">إجراءات سريعة</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="bg-card border border-border/50 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col items-center gap-3 text-center">
                  <div className={`w-12 h-12 rounded-xl ${action.color} bg-opacity-15 flex items-center justify-center group-hover:scale-110 transition-transform`}
                    style={{ backgroundColor: `color-mix(in srgb, var(--primary) 0%, transparent)` }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}/20`}>
                      <action.icon size={20} className={`${action.color.replace("bg-", "text-")}`} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-tight">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Level Distribution */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-foreground">توزيع مستويات الولاء</h3>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Level breakdown */}
            <div className="mt-2 space-y-2">
              {Object.entries(stats.levelDistribution).map(([level, count]) => {
                if (!count) return null;
                const total = Object.values(stats.levelDistribution).reduce((a, b) => a + b, 0);
                const pct = total ? Math.round((count / total) * 100) : 0;
                const labels: Record<string, string> = { bronze: "برونزي", silver: "فضي", gold: "ذهبي", platinum: "بلاتيني" };
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] }} />
                    <span className="text-xs text-muted-foreground flex-1">{labels[level]}</span>
                    <span className="text-xs font-bold">{count}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Appointments */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-foreground">المواعيد الشهرية</h3>
              <Link href="/appointments">
                <button className="flex items-center gap-1 text-sm text-primary hover:underline font-semibold">
                  عرض الكل
                  <ArrowLeft size={14} />
                </button>
              </Link>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyAppointments} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    dx={-4}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", radius: 8 }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                  />
                  <Bar
                    dataKey="count"
                    name="عدد المواعيد"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-foreground">النشاط الأخير</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
              <Clock size={12} />
              <span>آخر تحديث: الآن</span>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === "success" ? "bg-emerald-500/10 text-emerald-500"
                  : item.type === "warning" ? "bg-amber-500/10 text-amber-500"
                  : "bg-blue-500/10 text-blue-500"
                }`}>
                  {item.type === "success" ? <CheckCircle2 size={16} />
                  : item.type === "warning" ? <AlertCircle size={16} />
                  : <Clock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.text}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
