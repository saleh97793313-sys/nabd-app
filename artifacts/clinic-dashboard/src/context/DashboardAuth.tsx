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
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<OwnerProfile & { password?: string; newPassword?: string }>) => { success: boolean; error?: string };
};

const OWNER_SESSION_KEY = "nabd_dashboard_owner";
const OWNER_PROFILE_KEY = "nabd_dashboard_profile";
const CREDS_KEY = "nabd_dashboard_creds";

const DEFAULT_OWNER: OwnerProfile = {
  name: "مالك التطبيق",
  email: "owner@nabd.om",
  role: "owner",
  avatar: "م",
};

const DEFAULT_PASSWORD = "nabd@2026";

const AuthContext = createContext<AuthState>({} as AuthState);

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(OWNER_SESSION_KEY);
    if (session) {
      try {
        setOwner(JSON.parse(session));
        setIsAuthenticated(true);
      } catch {}
    }
  }, []);

  const getCreds = () => {
    const saved = localStorage.getItem(CREDS_KEY);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return { email: DEFAULT_OWNER.email, password: DEFAULT_PASSWORD };
  };

  const login = (email: string, password: string) => {
    const creds = getCreds();
    if (email.trim().toLowerCase() === creds.email.toLowerCase() && password === creds.password) {
      const profileRaw = localStorage.getItem(OWNER_PROFILE_KEY);
      const profile: OwnerProfile = profileRaw ? JSON.parse(profileRaw) : DEFAULT_OWNER;
      setOwner(profile);
      setIsAuthenticated(true);
      localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(profile));
      return { success: true };
    }
    return { success: false, error: "البريد الإلكتروني أو كلمة السر غير صحيحة" };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setOwner(null);
    localStorage.removeItem(OWNER_SESSION_KEY);
  };

  const updateProfile = (data: Partial<OwnerProfile & { password?: string; newPassword?: string }>) => {
    const creds = getCreds();
    if (data.password !== undefined) {
      if (data.password !== creds.password) {
        return { success: false, error: "كلمة السر الحالية غير صحيحة" };
      }
    }
    if (data.newPassword) {
      const newCreds = { ...creds, password: data.newPassword };
      if (data.email) newCreds.email = data.email;
      localStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
    } else if (data.email && owner) {
      const newCreds = { ...creds, email: data.email };
      localStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
    }
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
    <AuthContext.Provider value={{ isAuthenticated, owner, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDashboardAuth() {
  return useContext(AuthContext);
}
