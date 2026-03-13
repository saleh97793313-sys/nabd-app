import { useState } from "react";
import { HeartPulse, Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { useDashboardAuth } from "@/context/DashboardAuth";

export default function LoginPage() {
  const { login } = useDashboardAuth();
  const [email, setEmail] = useState("owner@nabd.om");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || "خطأ في تسجيل الدخول");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-2xl shadow-primary/30 mx-auto mb-4">
            <HeartPulse size={36} strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold text-foreground">نبض</h1>
          <p className="text-muted-foreground mt-1 text-sm">منصة الولاء الصحي — لوحة التحكم</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-3xl shadow-2xl shadow-black/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">تسجيل دخول المالك</h2>
              <p className="text-xs text-muted-foreground">صلاحيات كاملة للنظام</p>
            </div>
            <div className="ms-auto">
              <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">👑 مالك</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="owner@nabd.om"
                  className="w-full bg-muted/50 border border-border rounded-xl py-3 pe-10 ps-4 text-right placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">كلمة السر</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute top-1/2 -translate-y-1/2 end-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-xl py-3 pe-10 ps-4 text-right placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              دخول لوحة التحكم
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/50">
            <p className="text-xs text-muted-foreground/70 text-center">
              هذه اللوحة مخصصة لمالك التطبيق فقط — صلاحيات إدارية كاملة
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 نبض — منصة الولاء الصحي
        </p>
      </div>
    </div>
  );
}
