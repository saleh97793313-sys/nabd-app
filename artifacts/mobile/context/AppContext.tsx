import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

export type UserRole = "patient" | "clinic";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalVisits: number;
  level: "bronze" | "silver" | "gold" | "platinum";
  joinDate: string;
  conditions: string[];
};

export type Clinic = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  totalPatients: number;
  address: string;
  phone: string;
  offerCount: number;
  image?: string;
  verified: boolean;
  email?: string;
  openHours?: string;
  descriptionAr?: string;
};

export type Offer = {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicSpecialty: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  pointsRequired: number;
  pointsEarned: number;
  expiryDate: string;
  category: string;
  isFeatured: boolean;
};

export type Appointment = {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicSpecialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  pointsEarned?: number;
  notes?: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "points" | "offer" | "appointment" | "level_up";
  isRead: boolean;
  createdAt: string;
};

export type Discount = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  applicableTo: string;
  expiryDate: string;
  isUsed: boolean;
  requiredLevel: "bronze" | "silver" | "gold" | "platinum";
  clinicName?: string;
  clinicId?: string;
  color: string;
};

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (Platform.OS === "web") {
    return "/api";
  }
  if (domain) {
    return `https://${domain}/api`;
  }
  return "/api";
}

const LEVEL_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#708090",
  gold: "#FFB800",
  platinum: "#7C3AED",
};

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    clinicId: "1",
    clinicName: "مركز رويال للعلاج الطبيعي",
    clinicSpecialty: "العلاج الطبيعي",
    date: "2026-03-18",
    time: "10:00 ص",
    status: "upcoming",
    notes: "جلسة العلاج الثالثة - ألم الظهر",
  },
  {
    id: "a2",
    clinicId: "2",
    clinicName: "عيادة الشفاء للأسنان",
    clinicSpecialty: "طب الأسنان",
    date: "2026-03-10",
    time: "2:30 م",
    status: "completed",
    pointsEarned: 120,
  },
  {
    id: "a3",
    clinicId: "4",
    clinicName: "معهد عيون عُمان",
    clinicSpecialty: "طب العيون",
    date: "2026-03-05",
    time: "8:00 ص",
    status: "completed",
    pointsEarned: 180,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "نقاط جديدة!",
    message: "حصلت على 180 نقطة من زيارتك لمعهد عيون عُمان",
    type: "points",
    isRead: false,
    createdAt: "2026-03-10T14:30:00Z",
  },
  {
    id: "n2",
    title: "عرض حصري لك!",
    message: "مركز رويال يقدم خصم على جلسات العلاج الطبيعي",
    type: "offer",
    isRead: false,
    createdAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "n3",
    title: "موعدك غداً",
    message: "لديك موعد في مركز رويال غداً الساعة 10:00 صباحاً",
    type: "appointment",
    isRead: true,
    createdAt: "2026-03-17T18:00:00Z",
  },
];

const MOCK_PATIENT: Patient = {
  id: "p1",
  name: "محمد بن علي الراشدي",
  phone: "+968 9876 5432",
  points: 1350,
  totalVisits: 8,
  level: "silver",
  joinDate: "2025-09-01",
  conditions: ["ضغط الدم", "متابعة دورية"],
};

type AppContextType = {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  patient: Patient;
  setPatient: (p: Patient) => void;
  clinics: Clinic[];
  clinicsLoading: boolean;
  offers: Offer[];
  offersLoading: boolean;
  appointments: Appointment[];
  notifications: Notification[];
  discounts: Discount[];
  discountsLoading: boolean;
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  bookAppointment: (clinicId: string) => void;
  redeemOffer: (offerId: string) => void;
  markDiscountUsed: (id: string) => void;
  refreshClinics: () => void;
  refreshOffers: () => void;
  refreshDiscounts: () => void;
};

const [AppContextProvider, useAppContext] = createContextHook<AppContextType>(
  () => {
    const [userRole, setUserRole] = useState<UserRole>("patient");
    const [patient, setPatient] = useState<Patient>(MOCK_PATIENT);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [discountsUsed, setDiscountsUsed] = useState<Set<string>>(new Set());

    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [clinicsLoading, setClinicsLoading] = useState(true);

    const [offers, setOffers] = useState<Offer[]>([]);
    const [offersLoading, setOffersLoading] = useState(true);

    const [apiDiscounts, setApiDiscounts] = useState<Discount[]>([]);
    const [discountsLoading, setDiscountsLoading] = useState(true);

    const fetchClinics = async () => {
      try {
        setClinicsLoading(true);
        const res = await fetch(`${getApiBase()}/clinics`);
        if (!res.ok) throw new Error("Failed to fetch clinics");
        const data = await res.json();
        const mapped: Clinic[] = data.map((c: any) => ({
          id: String(c.id),
          name: c.nameAr || c.name,
          specialty: c.specialtyAr || c.specialty,
          rating: c.rating ?? 4.5,
          totalPatients: c.totalPatients ?? 0,
          address: c.addressAr || c.address,
          phone: c.phone,
          email: c.email,
          openHours: c.openHours,
          descriptionAr: c.descriptionAr,
          offerCount: 0,
          verified: c.isActive ?? true,
          image: c.imageUrl,
        }));
        setClinics(mapped);
      } catch (e) {
        console.warn("Could not fetch clinics:", e);
        setClinics([]);
      } finally {
        setClinicsLoading(false);
      }
    };

    const fetchOffers = async () => {
      try {
        setOffersLoading(true);
        const res = await fetch(`${getApiBase()}/offers`);
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        const mapped: Offer[] = data
          .filter((o: any) => o.isActive)
          .map((o: any) => ({
            id: String(o.id),
            clinicId: String(o.clinicId),
            clinicName: o.clinicName || "",
            clinicSpecialty: "",
            title: o.titleAr || o.title,
            description: o.descriptionAr || o.description,
            originalPrice: o.originalPrice,
            discountedPrice: o.discountedPrice,
            pointsRequired: o.pointsRequired,
            pointsEarned: Math.floor(o.discountedPrice * 2),
            expiryDate: o.expiryDate,
            category: o.category,
            isFeatured: o.isFeatured,
          }));
        setOffers(mapped);
      } catch (e) {
        console.warn("Could not fetch offers:", e);
        setOffers([]);
      } finally {
        setOffersLoading(false);
      }
    };

    const fetchDiscounts = async () => {
      try {
        setDiscountsLoading(true);
        const res = await fetch(`${getApiBase()}/discounts`);
        if (!res.ok) throw new Error("Failed to fetch discounts");
        const data = await res.json();
        const mapped: Discount[] = data
          .filter((d: any) => d.isActive)
          .map((d: any) => ({
            id: String(d.id),
            title: d.titleAr || d.title,
            description: d.description,
            discountPercent: d.discountPercent,
            code: d.code,
            applicableTo: d.service,
            expiryDate: d.expiryDate,
            isUsed: discountsUsed.has(String(d.id)),
            requiredLevel: d.requiredLevel as Discount["requiredLevel"],
            clinicName: d.clinicName ?? undefined,
            clinicId: d.clinicId ? String(d.clinicId) : undefined,
            color: LEVEL_COLORS[d.requiredLevel] ?? "#00C896",
          }));
        setApiDiscounts(mapped);
      } catch (e) {
        console.warn("Could not fetch discounts:", e);
        setApiDiscounts([]);
      } finally {
        setDiscountsLoading(false);
      }
    };

    useEffect(() => {
      fetchClinics();
      fetchOffers();
      fetchDiscounts();
    }, []);

    const discounts = apiDiscounts.map((d) => ({
      ...d,
      isUsed: discountsUsed.has(d.id),
    }));

    const markNotificationRead = (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    };

    const bookAppointment = (clinicId: string) => {
      setPatient((prev) => ({
        ...prev,
        totalVisits: prev.totalVisits + 1,
      }));
    };

    const redeemOffer = (offerId: string) => {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return;
      if (patient.points >= offer.pointsRequired) {
        setPatient((prev) => ({
          ...prev,
          points: prev.points - offer.pointsRequired + offer.pointsEarned,
        }));
      }
    };

    const markDiscountUsed = (id: string) => {
      setDiscountsUsed((prev) => new Set([...prev, id]));
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      userRole,
      setUserRole,
      patient,
      setPatient,
      clinics,
      clinicsLoading,
      offers,
      offersLoading,
      appointments: MOCK_APPOINTMENTS,
      notifications,
      discounts,
      discountsLoading,
      unreadCount,
      markNotificationRead,
      bookAppointment,
      redeemOffer,
      markDiscountUsed,
      refreshClinics: fetchClinics,
      refreshOffers: fetchOffers,
      refreshDiscounts: fetchDiscounts,
    };
  }
);

export { AppContextProvider, useAppContext };
