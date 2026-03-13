import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Tags,
  Calendar,
  Percent,
  Users,
  Bell,
  LogOut,
  HeartPulse,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard, color: "text-emerald-500" },
  { name: "العيادات", href: "/clinics", icon: Building2, color: "text-blue-500" },
  { name: "العروض", href: "/offers", icon: Tags, color: "text-amber-500" },
  { name: "المواعيد", href: "/appointments", icon: Calendar, color: "text-purple-500" },
  { name: "الخصومات", href: "/discounts", icon: Percent, color: "text-rose-500" },
  { name: "المرضى", href: "/patients", icon: Users, color: "text-indigo-500" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const currentPage = navItems.find(
    (i) => location === i.href || (i.href !== "/" && location.startsWith(i.href))
  );

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[260px]";
  const mainMargin = collapsed ? "ms-[72px]" : "ms-[260px]";

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 text-foreground font-sans flex">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 bg-card border-e border-border/50 flex flex-col shadow-xl z-40 transition-all duration-300 ease-in-out",
          sidebarWidth,
          "hidden lg:flex",
          mobileOpen && "flex w-[260px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-border/50 h-16 flex-shrink-0",
          collapsed ? "justify-center px-0" : "gap-3 px-5"
        )}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight text-foreground whitespace-nowrap">نبض</h1>
              <p className="text-xs text-muted-foreground">لوحة التحكم</p>
            </div>
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
                  collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("flex-shrink-0", !isActive && item.color, "group-hover:scale-110 transition-transform")}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className={cn("p-3 border-t border-border/50 space-y-1", collapsed && "flex flex-col items-center")}>
          {!collapsed && (
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings size={20} />
              <span>الإعدادات</span>
            </Link>
          )}
          <button
            className={cn(
              "flex items-center gap-3 rounded-xl font-semibold text-destructive hover:bg-destructive/10 transition-colors",
              collapsed ? "px-0 py-3 justify-center w-full" : "px-4 py-3 w-full"
            )}
            title={collapsed ? "تسجيل الخروج" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="absolute top-1/2 -translate-y-1/2 -end-3 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all z-10 hidden lg:flex"
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 w-[260px] bg-card border-e border-border/50 flex flex-col shadow-xl z-40 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 border-b border-border/50 h-16">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-lg">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">نبض</h1>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
          <button className="ms-auto p-1" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={!isActive ? item.color : ""} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ms-0", `lg:${mainMargin}`)}>

        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8 shadow-sm">

          {/* Mobile menu button */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-foreground">
              {currentPage?.name || "نبض"}
            </h2>
          </div>

          {/* Search bar */}
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
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 ps-3 border-s border-border/50 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                م
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-sm leading-none">مدير النظام</p>
                <p className="text-muted-foreground text-xs mt-0.5">admin@healthpoints.om</p>
              </div>
            </div>
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

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
