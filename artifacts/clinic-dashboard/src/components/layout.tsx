import { ReactNode } from "react";
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
  HeartPulse
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "العيادات", href: "/clinics", icon: Building2 },
  { name: "العروض", href: "/offers", icon: Tags },
  { name: "المواعيد", href: "/appointments", icon: Calendar },
  { name: "الخصومات", href: "/discounts", icon: Percent },
  { name: "المرضى", href: "/patients", icon: Users },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground font-sans flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 w-[280px] bg-card border-e border-border/50 flex flex-col shadow-2xl shadow-black/5 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none text-foreground">HealthPoints</h1>
            <p className="text-xs text-muted-foreground mt-1">منصة الولاء الصحي</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ms-[280px] flex flex-col min-h-screen">
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 flex items-center justify-between px-8">
          <h2 className="text-2xl font-bold text-foreground">
            {navItems.find(i => location === i.href || (i.href !== "/" && location.startsWith(i.href)))?.name || "Dashboard"}
          </h2>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 end-2.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
            </button>
            <div className="flex items-center gap-3 ps-4 border-s border-border/50">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                م.ع
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold">مدير النظام</p>
                <p className="text-muted-foreground text-xs">admin@healthpoints.com</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
