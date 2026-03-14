import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type OwnerProfile = {
  name: string;
  email: string;
  role: "owner";
  avatar: string;
};

type AuthState = {
  isAuthenticated: boolean;
  owner: OwnerProfile | null;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<OwnerProfile & { password?: string; newPassword?: string }>) => { success: boolean; error?: string };
};

const OWNER_SESSION_KEY = "nabd_dashboard_owner";
const OWNER_PROFILE_KEY = "nabd_dashboard_profile";
const ADMIN_TOKEN_KEY = "nabd_admin_token";

const AuthContext = createContext<AuthState>({} as AuthState);

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(OWNER_SESSION_KEY);
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (session && savedToken) {
      try {
        setOwner(JSON.parse(session));
        setAdminToken(savedToken);
        setIsAuthenticated(true);
      } catch {}
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "البريد الإلكتروني أو كلمة السر غير صحيحة" };
      }
      const data = await res.json();
      const token = data.token as string;

      const savedProfile = localStorage.getItem(OWNER_PROFILE_KEY);
      const profile: OwnerProfile = savedProfile
        ? JSON.parse(savedProfile)
        : { name: "مالك التطبيق", email: email.trim(), role: "owner" as const, avatar: "م" };

      setOwner(profile);
      setAdminToken(token);
      setIsAuthenticated(true);
      localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(profile));
      localStorage.setItem(ADMIN_TOKEN_KEY, token);

      return { success: true };
    } catch {
      return { success: false, error: "خطأ في الاتصال بالخادم" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setOwner(null);
    setAdminToken(null);
    localStorage.removeItem(OWNER_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  const updateProfile = (data: Partial<OwnerProfile & { password?: string; newPassword?: string }>) => {
    if (owner) {
      const updated: OwnerProfile = {
        ...owner,
        name: data.name ?? owner.name,
        email: data.email ?? owner.email,
        avatar: data.avatar ?? owner.avatar,
      };
      setOwner(updated);
      localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(updated));
      localStorage.setItem(OWNER_PROFILE_KEY, JSON.stringify(updated));
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, owner, adminToken, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDashboardAuth() {
  return useContext(AuthContext);
}
