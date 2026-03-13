import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Building2, Tags, Calendar, Percent, Users,
  Bell, LogOut, HeartPulse, Menu, X, Search, ChevronLeft,
  ChevronRight, Moon, Sun, Settings, Crown, Check, Info,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useDashboardAuth } from "@/context/DashboardAuth";

function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

const navItems = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard, color: "text-emerald-500" },
  { name: "العيادات", href: "/clinics", icon: Building2, color: "text-blue-500" },
  { name: "العروض", href: "/offers", icon: Tags, color: "text-amber-500" },
  { name: "المواعيد", href: "/appointments", icon: Calendar, color: "text-purple-500" },
  { name: "الخصومات", href: "/discounts", icon: Percent, color: "text-rose-500" },
  { name: "المرضى", href: "/patients", icon: Users, color: "text-indigo-500" },
];

type Notif = { id: number; title: string; body: string; type: "info" | "success" | "warning"; read: boolean; time: string };

const INIT_NOTIFS: Notif[] = [
  { id: 1, title: "مرحباً بك في نبض!", body: "أنت مسجّل دخول كمالك التطبيق بصلاحيات كاملة.", type: "success", read: false, time: "الآن" },
  { id: 2, title: "تحديث النظام", body: "تم تحديث منصة نبض بنجاح إلى الإصدار الأحدث.", type: "info", read: false, time: "منذ ساعة" },
  { id: 3, title: "نقاط المرضى", body: "لديك مرضى في المستوى الذهبي — قد يستحقون عروضاً حصرية.", type: "warning", read: true, time: "أمس" },
];

const notifIcons = { info: Info, success: CheckCircle2, warning: AlertTriangle };
const notifColors = { info: "text-blue-500", success: "text-emerald-500", warning: "text-amber-500" };
const notifBg = { info: "bg-blue-500/10", success: "bg-emerald-500/10", warning: "bg-amber-500/10" };

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { owner, logout } = useDashboardAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nabd_dark_mode") === "true";
    }
    return false;
  });
  const [notifs, setNotifs] = useState<Notif[]>(INIT_NOTIFS);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("nabd_dark_mode", String(isDark));
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const unread = notifs.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const currentPage = navItems.find(
    (i) => location === i.href || (i.href !== "/" && location.startsWith(i.href))
  );

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[260px]";
  const mainMargin = collapsed ? "ms-[72px]" : "ms-[260px]";

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-border/50 h-16 flex-shrink-0",
        collapsed && !isMobile ? "justify-center px-0" : "gap-3 px-5"
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <HeartPulse size={20} strokeWidth={2.5} />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight text-foreground whitespace-nowrap">نبض</h1>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        )}
        {isMobile && (
          <button className="ms-auto p-1" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl font-semibold transition-all duration-200 group",
                collapsed && !isMobile ? "px-0 py-3 justify-center" : "px-4 py-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("flex-shrink-0", !isActive && item.color, "group-hover:scale-110 transition-transform")}
              />
              {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Owner info strip */}
      {(!collapsed || isMobile) && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {owner?.avatar || "م"}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{owner?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{owner?.email}</p>
            </div>
            <Crown size={14} className="text-amber-500 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Settings & Logout */}
      <div className={cn("p-3 border-t border-border/50 space-y-1", collapsed && !isMobile && "flex flex-col items-center")}>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            collapsed && !isMobile ? "px-0 py-3 justify-center w-full" : "px-4 py-3 w-full"
          )}
          title={collapsed && !isMobile ? "الإعدادات" : undefined}
        >
          <Settings size={20} />
          {(!collapsed || isMobile) && <span>الإعدادات</span>}
        </Link>
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 rounded-xl font-semibold text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && !isMobile ? "px-0 py-3 justify-center w-full" : "px-4 py-3 w-full"
          )}
          title={collapsed && !isMobile ? "تسجيل الخروج" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 text-foreground font-sans flex">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 start-0 bg-card border-e border-border/50 flex flex-col shadow-xl z-40 transition-all duration-300 ease-in-out hidden lg:flex",
        sidebarWidth
      )}>
        <SidebarContent />
        <button
          onClick={toggleCollapse}
          className="absolute top-1/2 -translate-y-1/2 -end-3 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all z-10"
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 start-0 w-[260px] bg-card border-e border-border/50 flex flex-col shadow-xl z-40 transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
      )}>
        <SidebarContent isMobile />
      </aside>

      {/* Main */}
      <main className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ms-0", `lg:${mainMargin}`)}>

        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8 shadow-sm">
          <button className="lg:hidden w-9 h-9 rounded-xl bg-muted flex items-center justify-center" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-foreground">{currentPage?.name || "نبض"}</h2>
          </div>

          <div className="flex-1 max-w-xs lg:max-w-sm mx-auto lg:mx-0 lg:ms-4">
            <div className="relative">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث سريع..."
                className="w-full bg-muted/60 border border-border/50 rounded-xl py-2 pe-9 ps-4 text-sm text-right placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ms-auto">
            {/* Dark mode */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors relative"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1.5 end-1.5 w-4 h-4 rounded-full bg-destructive border-2 border-card flex items-center justify-center text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute top-12 end-0 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline font-semibold">
                      {unread > 0 ? "تعليم الكل كمقروء" : ""}
                    </button>
                    <span className="font-bold text-foreground">الإشعارات</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                    {notifs.map((n) => {
                      const Icon = notifIcons[n.type];
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn("flex gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors", !n.read && "bg-primary/5")}
                        >
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", notifBg[n.type])}>
                            <Icon size={15} className={notifColors[n.type]} />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">{n.time}</span>
                              <p className="font-bold text-sm text-foreground">{n.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      {notifs.filter(n => n.read).length} من {notifs.length} مقروءة
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Owner avatar */}
            <Link href="/settings" className="flex items-center gap-2 ps-3 border-s border-border/50 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-primary text-white flex items-center justify-center font-bold text-sm">
                {owner?.avatar || "م"}
              </div>
              <div className="hidden sm:block text-right">
                <p className="font-bold text-sm leading-none flex items-center gap-1">
                  {owner?.name} <Crown size={11} className="text-amber-500" />
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">{owner?.email}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Breadcrumb */}
        {currentPage && (
          <div className="px-4 lg:px-8 py-3 border-b border-border/30 bg-background/50 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">الرئيسية</span>
            <ChevronLeft size={14} />
            <span className="text-foreground font-semibold">{currentPage.name}</span>
          </div>
        )}

        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
