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

const DEFAULT_OWNER: OwnerProfile = {
  name: "مالك التطبيق",
  email: "Saleh97793313@gmail.com",
  role: "owner",
  avatar: "م",
};

const DEFAULT_EMAIL = "Saleh97793313@gmail.com";
const DEFAULT_PASSWORD = "nabd@2026";

const AuthContext = createContext<AuthState>({} as AuthState);

async function fetchAdminToken(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
}

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(OWNER_SESSION_KEY);
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (session) {
      try {
        setOwner(JSON.parse(session));
        setIsAuthenticated(true);
        if (savedToken) setAdminToken(savedToken);
      } catch {}
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (email.trim().toLowerCase() !== DEFAULT_EMAIL.toLowerCase() || password !== DEFAULT_PASSWORD) {
      return { success: false, error: "البريد الإلكتروني أو كلمة السر غير صحيحة" };
    }
    const profileRaw = localStorage.getItem(OWNER_PROFILE_KEY);
    const profile: OwnerProfile = profileRaw ? JSON.parse(profileRaw) : DEFAULT_OWNER;
    setOwner(profile);
    setIsAuthenticated(true);
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(profile));

    const token = await fetchAdminToken(email.trim(), password);
    if (token) {
      setAdminToken(token);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }

    return { success: true };
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
