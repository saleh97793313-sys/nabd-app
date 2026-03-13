import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useEffect, useState } from "react";

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

const MOCK_CLINICS: Clinic[] = [
  {
    id: "c1",
    name: "عيادة الدكتور أحمد الصحة",
    specialty: "طب الأسنان",
    rating: 4.8,
    totalPatients: 1250,
    address: "مسقط، الخوير - شارع المطار",
    phone: "+968 2456 7890",
    offerCount: 3,
    verified: true,
  },
  {
    id: "c2",
    name: "مركز الشفاء الطبي",
    specialty: "العلاج الطبيعي",
    rating: 4.9,
    totalPatients: 890,
    address: "مسقط، الغبرة - طريق الملك فهد",
    phone: "+968 2412 3456",
    offerCount: 5,
    verified: true,
  },
  {
    id: "c3",
    name: "عيادة الجلدية المتخصصة",
    specialty: "الجلدية والتجميل",
    rating: 4.7,
    totalPatients: 670,
    address: "مسقط، الروي - شارع 18 نوفمبر",
    phone: "+968 2434 5678",
    offerCount: 4,
    verified: true,
  },
  {
    id: "c4",
    name: "مختبر الدقة التشخيصية",
    specialty: "المختبرات والتحاليل",
    rating: 4.6,
    totalPatients: 2100,
    address: "مسقط، بوشر",
    phone: "+968 2478 9012",
    offerCount: 2,
    verified: true,
  },
  {
    id: "c5",
    name: "عيادة الرعاية الأولية",
    specialty: "طب الأسرة",
    rating: 4.5,
    totalPatients: 3400,
    address: "مسقط، القرم - الشارع الرئيسي",
    phone: "+968 2467 8901",
    offerCount: 6,
    verified: false,
  },
];

const MOCK_OFFERS: Offer[] = [
  {
    id: "o1",
    clinicId: "c1",
    clinicName: "عيادة الدكتور أحمد",
    clinicSpecialty: "طب الأسنان",
    title: "تنظيف الأسنان وتلميعها",
    description: "تنظيف شامل مع فحص الأسنان وجلسة تبييض مجانية",
    originalPrice: 45,
    discountedPrice: 25,
    pointsRequired: 0,
    pointsEarned: 250,
    expiryDate: "2026-04-30",
    category: "أسنان",
    isFeatured: true,
  },
  {
    id: "o2",
    clinicId: "c2",
    clinicName: "مركز الشفاء",
    clinicSpecialty: "علاج طبيعي",
    title: "جلسة علاج طبيعي كاملة",
    description: "جلسة علاج طبيعي 45 دقيقة مع تقييم شامل",
    originalPrice: 35,
    discountedPrice: 20,
    pointsRequired: 500,
    pointsEarned: 200,
    expiryDate: "2026-05-15",
    category: "علاج طبيعي",
    isFeatured: true,
  },
  {
    id: "o3",
    clinicId: "c3",
    clinicName: "عيادة الجلدية",
    clinicSpecialty: "جلدية",
    title: "استشارة جلدية + علاج",
    description: "فحص جلدي شامل مع وصفة طبية مجانية",
    originalPrice: 30,
    discountedPrice: 15,
    pointsRequired: 300,
    pointsEarned: 150,
    expiryDate: "2026-04-20",
    category: "جلدية",
    isFeatured: false,
  },
  {
    id: "o4",
    clinicId: "c4",
    clinicName: "مختبر الدقة",
    clinicSpecialty: "تحاليل طبية",
    title: "باقة التحاليل الشاملة",
    description: "صورة الدم الكاملة + سكر + كولسترول + وظائف كلى",
    originalPrice: 25,
    discountedPrice: 12,
    pointsRequired: 0,
    pointsEarned: 120,
    expiryDate: "2026-06-01",
    category: "تحاليل",
    isFeatured: false,
  },
  {
    id: "o5",
    clinicId: "c5",
    clinicName: "عيادة الرعاية الأولية",
    clinicSpecialty: "طب الأسرة",
    title: "كشف + وصفة طبية مجاناً",
    description: "كشف طب أسرة كامل مع الوصفة الطبية بدون رسوم إضافية",
    originalPrice: 15,
    discountedPrice: 8,
    pointsRequired: 200,
    pointsEarned: 80,
    expiryDate: "2026-05-30",
    category: "طب عام",
    isFeatured: true,
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    clinicId: "c2",
    clinicName: "مركز الشفاء الطبي",
    clinicSpecialty: "العلاج الطبيعي",
    date: "2026-03-18",
    time: "10:00 ص",
    status: "upcoming",
    notes: "جلسة العلاج الثالثة - ألم الظهر",
  },
  {
    id: "a2",
    clinicId: "c1",
    clinicName: "عيادة الدكتور أحمد",
    clinicSpecialty: "طب الأسنان",
    date: "2026-03-10",
    time: "2:30 م",
    status: "completed",
    pointsEarned: 250,
  },
  {
    id: "a3",
    clinicId: "c4",
    clinicName: "مختبر الدقة",
    clinicSpecialty: "تحاليل طبية",
    date: "2026-03-05",
    time: "8:00 ص",
    status: "completed",
    pointsEarned: 120,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "نقاط جديدة!",
    message: "حصلت على 250 نقطة من زيارتك لعيادة الأسنان",
    type: "points",
    isRead: false,
    createdAt: "2026-03-10T14:30:00Z",
  },
  {
    id: "n2",
    title: "عرض حصري لك!",
    message: "مركز الشفاء يقدم خصم 43% على جلسات العلاج الطبيعي",
    type: "offer",
    isRead: false,
    createdAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "n3",
    title: "موعدك غداً",
    message: "لديك موعد في مركز الشفاء غداً الساعة 10:00 صباحاً",
    type: "appointment",
    isRead: true,
    createdAt: "2026-03-17T18:00:00Z",
  },
];

type AppContextType = {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  patient: Patient;
  setPatient: (p: Patient) => void;
  clinics: Clinic[];
  offers: Offer[];
  appointments: Appointment[];
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  bookAppointment: (clinicId: string) => void;
  redeemOffer: (offerId: string) => void;
};

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

const [AppContextProvider, useAppContext] = createContextHook<AppContextType>(
  () => {
    const [userRole, setUserRole] = useState<UserRole>("patient");
    const [patient, setPatient] = useState<Patient>(MOCK_PATIENT);
    const [notifications, setNotifications] =
      useState<Notification[]>(MOCK_NOTIFICATIONS);

    const markNotificationRead = (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    };

    const bookAppointment = (clinicId: string) => {
      const clinic = MOCK_CLINICS.find((c) => c.id === clinicId);
      if (!clinic) return;
      setPatient((prev) => ({
        ...prev,
        totalVisits: prev.totalVisits + 1,
      }));
    };

    const redeemOffer = (offerId: string) => {
      const offer = MOCK_OFFERS.find((o) => o.id === offerId);
      if (!offer) return;
      if (patient.points >= offer.pointsRequired) {
        setPatient((prev) => ({
          ...prev,
          points: prev.points - offer.pointsRequired + offer.pointsEarned,
        }));
      }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      userRole,
      setUserRole,
      patient,
      setPatient,
      clinics: MOCK_CLINICS,
      offers: MOCK_OFFERS,
      appointments: MOCK_APPOINTMENTS,
      notifications,
      unreadCount,
      markNotificationRead,
      bookAppointment,
      redeemOffer,
    };
  }
);

export { AppContextProvider, useAppContext };
