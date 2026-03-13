import { useState } from "react";
import { Layout } from "@/components/layout";
import { useDashboardAuth } from "@/context/DashboardAuth";
import { User, Lock, Bell, Palette, ShieldCheck, Save, Check, Eye, EyeOff, Crown } from "lucide-react";
import { clsx } from "clsx";

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={16} className="text-primary" />
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { owner, updateProfile, logout } = useDashboardAuth();
  const [name, setName] = useState(owner?.name || "");
  const [email, setEmail] = useState(owner?.email || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const saveProfile = () => {
    updateProfile({ name, email });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const savePw = () => {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("يرجى ملء جميع حقول كلمة السر"); return; }
    if (newPw !== confirmPw) { setPwError("كلمة السر الجديدة وتأكيدها غير متطابقتين"); return; }
    if (newPw.length < 6) { setPwError("كلمة السر يجب أن تكون 6 أحرف على الأقل"); return; }
    const result = updateProfile({ password: currentPw, newPassword: newPw, email });
    if (!result.success) { setPwError(result.error || "خطأ"); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  };

  const InputRow = ({ label, value, onChange, type = "text", placeholder = "", dir = "rtl", showToggle = false, show = false, onToggle }: any) => (
    <div>
      <label className="block text-sm font-bold text-muted-foreground mb-2">{label}</label>
      <div className="relative">
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 text-right focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all pe-10"
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div className="text-right">
          <h1 className="text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground mt-1">إدارة حساب المالك وإعدادات النظام</p>
        </div>

        {/* Owner badge */}
        <div className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {owner?.avatar || "م"}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-lg">{owner?.name}</span>
              <Crown size={18} className="text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">{owner?.email}</p>
          </div>
          <div className="ms-auto">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-600 font-bold text-sm border border-amber-500/30">
              👑 مالك التطبيق
            </span>
          </div>
        </div>

        {/* Profile info */}
        <Section title="معلومات الملف الشخصي" icon={User}>
          <div className="space-y-4">
            <InputRow label="الاسم الكامل" value={name} onChange={setName} placeholder="مالك التطبيق" />
            <InputRow label="البريد الإلكتروني" value={email} onChange={setEmail} placeholder="Saleh97793313@gmail.com" dir="ltr" type="email" />
            <button
              onClick={saveProfile}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                profileSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {profileSaved ? <><Check size={16} /> تم الحفظ</> : <><Save size={16} /> حفظ المعلومات</>}
            </button>
          </div>
        </Section>

        {/* Password */}
        <Section title="تغيير كلمة السر" icon={Lock}>
          <div className="space-y-4">
            <InputRow label="كلمة السر الحالية" value={currentPw} onChange={setCurrentPw} showToggle show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            <InputRow label="كلمة السر الجديدة" value={newPw} onChange={setNewPw} showToggle show={showNew} onToggle={() => setShowNew(!showNew)} />
            <InputRow label="تأكيد كلمة السر الجديدة" value={confirmPw} onChange={setConfirmPw} />
            {pwError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm font-semibold text-center">
                {pwError}
              </div>
            )}
            <button
              onClick={savePw}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                pwSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {pwSaved ? <><Check size={16} /> تم التغيير</> : <><Lock size={16} /> تغيير كلمة السر</>}
            </button>
          </div>
        </Section>

        {/* Permissions */}
        <Section title="الصلاحيات" icon={ShieldCheck}>
          <div className="space-y-3">
            {[
              "إدارة المرضى ونقاط الولاء",
              "إدارة العيادات وإضافة/حذف عيادات",
              "إدارة العروض والخصومات",
              "عرض وإدارة المواعيد",
              "الوصول للإحصائيات الكاملة",
              "تعديل إعدادات النظام",
              "تسجيل الخروج من أي جهاز",
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-emerald-500" strokeWidth={3} />
                </div>
                <span className="font-semibold text-foreground">{perm}</span>
                <span className="ms-auto text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold">مفعّل</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
          <h3 className="font-bold text-destructive mb-1 flex items-center gap-2">
            <Bell size={16} /> منطقة الخروج
          </h3>
          <p className="text-sm text-muted-foreground mb-4">سيتم تسجيل خروجك من لوحة التحكم وستحتاج إلى إعادة تسجيل الدخول.</p>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-xl border-2 border-destructive/40 text-destructive font-bold text-sm hover:bg-destructive hover:text-white transition-all"
          >
            تسجيل الخروج الآن
          </button>
        </div>
      </div>
    </Layout>
  );
}
