import { useState } from "react";
import {
  useGetNotifications,
  getGetNotificationsQueryKey,
} from "@workspace/api-client-react";
import type { NotificationEntry, CreateNotificationInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Send, MessageSquare, Users, Filter, Clock, Info, Tag, Star, Calendar } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useDashboardAuth } from "@/context/DashboardAuth";

const LEVEL_OPTIONS = [
  { value: "all", label: "جميع المستويات", color: "bg-primary/10 text-primary" },
  { value: "bronze", label: "برونزي", color: "bg-[#CD7F32]/10 text-[#CD7F32]" },
  { value: "silver", label: "فضي", color: "bg-[#A0AEC0]/10 text-[#718096]" },
  { value: "gold", label: "ذهبي", color: "bg-[#FFB800]/10 text-[#B8860B]" },
  { value: "platinum", label: "بلاتيني", color: "bg-[#7C3AED]/10 text-[#7C3AED]" },
];

const TYPE_OPTIONS = [
  { value: "info", label: "إعلام", icon: Info },
  { value: "offer", label: "عرض", icon: Tag },
  { value: "points", label: "نقاط", icon: Star },
  { value: "appointment", label: "موعد", icon: Calendar },
];

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-600",
  offer: "bg-emerald-500/10 text-emerald-600",
  points: "bg-amber-500/10 text-amber-600",
  appointment: "bg-purple-500/10 text-purple-600",
};

const TYPE_ICONS: Record<string, typeof Info> = {
  info: Info,
  offer: Tag,
  points: Star,
  appointment: Calendar,
};

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { adminToken } = useDashboardAuth();
  const { data: messages = [], isLoading } = useGetNotifications();

  const createMutation = useMutation<NotificationEntry, Error, CreateNotificationInput>({
    mutationFn: async (input) => {
      if (!adminToken) {
        throw new Error("يرجى إعادة تسجيل الدخول");
      }
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل الإرسال");
      }
      return res.json();
    },
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [targetLevel, setTargetLevel] = useState("all");

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("يرجى ملء العنوان والرسالة");
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        type: type as NotificationEntry["type"],
        targetLevel: targetLevel as NotificationEntry["targetLevel"],
      },
      {
        onSuccess: () => {
          toast.success("تم إرسال الرسالة بنجاح");
          setTitle("");
          setBody("");
          setType("info");
          setTargetLevel("all");
          queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
        },
        onError: () => {
          toast.error("حدث خطأ في الإرسال");
        },
      }
    );
  };

  const levelLabel = (level: string) =>
    LEVEL_OPTIONS.find((l) => l.value === level)?.label || level;
  const levelColor = (level: string) =>
    LEVEL_OPTIONS.find((l) => l.value === level)?.color || "bg-muted text-muted-foreground";

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">الرسائل الجماعية</h1>
          <p className="text-muted-foreground mt-1">
            أرسل إشعارات ورسائل لمرضاك حسب المستوى
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Send size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">رسالة جديدة</h2>
                  <p className="text-xs text-muted-foreground">ستصل للمرضى في التطبيق</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">العنوان</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عرض خاص لأعضاء Ocure"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-right placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">نص الرسالة</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-right placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">نوع الرسالة</label>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                        type === t.value
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      <t.icon size={14} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Filter size={14} />
                  المستوى المستهدف
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setTargetLevel(l.value)}
                      className={clsx(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                        targetLevel === l.value
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={createMutation.isPending || !title.trim() || !body.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                <Send size={16} />
                {createMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="text-sm text-muted-foreground">{messages.length} رسالة</span>
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-primary" />
                  <h2 className="font-bold text-lg text-foreground">سجل الرسائل</h2>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto divide-y divide-border/50">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageSquare size={48} className="text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-semibold">لا توجد رسائل مرسلة بعد</p>
                    <p className="text-sm text-muted-foreground mt-1">أرسل أول رسالة لمرضاك</p>
                  </div>
                ) : (
                  messages.map((msg: NotificationEntry) => {
                    const TypeIcon = TYPE_ICONS[msg.type] || Info;
                    return (
                      <div key={msg.id} className="p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", TYPE_COLORS[msg.type] || TYPE_COLORS.info)}>
                            <TypeIcon size={18} />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className={clsx("text-xs px-2 py-0.5 rounded-lg font-bold", levelColor(msg.targetLevel))}>
                                  {levelLabel(msg.targetLevel)}
                                </span>
                              </div>
                              <h3 className="font-bold text-foreground truncate">{msg.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{msg.body}</p>
                            <div className="flex items-center gap-1.5 justify-end text-xs text-muted-foreground">
                              <Clock size={12} />
                              {new Date(msg.createdAt).toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
