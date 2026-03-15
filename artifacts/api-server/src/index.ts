import app from "./app";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, clinicsTable, offersTable, appointmentsTable, discountsTable, patientsTable } from "@workspace/db";

const KNOWN_TEST_ACCOUNTS = [
  { name: "محمد بن علي الراشدي", phone: "+968 9912 3456", email: "mohammed@example.com" },
  { name: "فاطمة الزهراء البلوشي", phone: "+968 9923 4567", email: "fatima@example.com" },
  { name: "أحمد سالم الحارثي", phone: "+968 9934 5678", email: "ahmed@example.com" },
  { name: "مريم خالد العمري", phone: "+968 9945 6789", email: "mariam@example.com" },
];

async function fixSeededPatients() {
  try {
    const allPatients = await db.select().from(patientsTable);
    if (allPatients.length === 0) return;

    const hash = await bcrypt.hash("nabd1234", 10);
    let fixedCount = 0;

    for (const p of allPatients) {
      const updates: Record<string, string> = {};

      if (!p.passwordHash) {
        updates.passwordHash = hash;
      }

      const knownAccount = KNOWN_TEST_ACCOUNTS.find(
        (k) => k.email === p.email || k.phone === p.phone || k.name === p.name
      );
      if (knownAccount) {
        if (!p.email) updates.email = knownAccount.email;
        if (!p.phone) updates.phone = knownAccount.phone;
      }

      if (Object.keys(updates).length > 0) {
        await db.update(patientsTable).set(updates).where(eq(patientsTable.id, p.id));
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} patients (passwords/email/phone).`);
    }
  } catch (err) {
    console.error("Fix seeded patients failed:", err);
  }
}

async function autoSeed() {
  try {
    const existing = await db.select().from(clinicsTable);
    if (existing.length > 0) {
      console.log("Database already seeded, skipping auto-seed.");
      await fixSeededPatients();
      return;
    }
    console.log("Auto-seeding database...");

    const clinics = await db.insert(clinicsTable).values([
      { name: "Ahmed Al-Saleh Medical Center", nameAr: "مركز أحمد الصالح الطبي", specialty: "General Medicine", specialtyAr: "طب عام", phone: "+968 2234 5678", email: "info@ahmed-medical.om", address: "Al Qurum, Muscat", addressAr: "القرم، مسقط", city: "مسقط", openHours: "السبت - الخميس: 8 ص - 10 م", rating: 4.8, isActive: true, totalPatients: 342, pointsPerVisit: 150, latitude: 23.5880, longitude: 58.4241, descriptionAr: "مركز طبي متكامل يقدم خدمات الرعاية الأولية والمتخصصة", description: "Comprehensive medical center offering primary and specialized care" },
      { name: "Al-Shifa Dental Clinic", nameAr: "عيادة الشفاء للأسنان", specialty: "Dentistry", specialtyAr: "طب الأسنان", phone: "+968 2245 6789", email: "contact@alshifa-dental.om", address: "Ruwi, Muscat", addressAr: "الروي، مسقط", city: "مسقط", openHours: "الأحد - الخميس: 9 ص - 9 م", rating: 4.6, isActive: true, totalPatients: 218, pointsPerVisit: 120, latitude: 23.6100, longitude: 58.5400, descriptionAr: "عيادة أسنان متخصصة بأحدث التقنيات", description: "Specialized dental clinic with the latest technologies" },
      { name: "Royal Physiotherapy Center", nameAr: "مركز رويال للعلاج الطبيعي", specialty: "Physiotherapy", specialtyAr: "علاج طبيعي", phone: "+968 2256 7890", email: "royal@physio.om", address: "Seeb, Muscat", addressAr: "السيب، مسقط", city: "مسقط", openHours: "السبت - الأربعاء: 7 ص - 11 م", rating: 4.9, isActive: true, totalPatients: 156, pointsPerVisit: 200, latitude: 23.6700, longitude: 58.1800, descriptionAr: "مركز متخصص في العلاج الطبيعي وإعادة التأهيل", description: "Specialized center for physiotherapy and rehabilitation" },
      { name: "Oman Eye Institute", nameAr: "معهد عيون عُمان", specialty: "Ophthalmology", specialtyAr: "طب العيون", phone: "+968 2267 8901", email: "info@omaneye.om", address: "Bawshar, Muscat", addressAr: "بوشر، مسقط", city: "مسقط", openHours: "السبت - الخميس: 8 ص - 8 م", rating: 4.7, isActive: true, totalPatients: 289, pointsPerVisit: 180, latitude: 23.5950, longitude: 58.3700, descriptionAr: "معهد متخصص في أمراض وجراحة العيون", description: "Specialized institute for eye diseases and surgery" },
      { name: "Wellness Family Clinic", nameAr: "عيادة ويلنس العائلية", specialty: "Family Medicine", specialtyAr: "طب الأسرة", phone: "+968 2278 9012", email: "wellness@family.om", address: "Al Khoud, Muscat", addressAr: "الخوض، مسقط", city: "مسقط", openHours: "يومياً: 8 ص - 12 م", rating: 4.5, isActive: true, totalPatients: 198, pointsPerVisit: 100, latitude: 23.6400, longitude: 58.1600, descriptionAr: "عيادة عائلية شاملة لجميع الاحتياجات الصحية", description: "Comprehensive family clinic for all health needs" },
    ]).returning();

    await db.insert(offersTable).values([
      { clinicId: clinics[0].id, title: "Full Health Checkup", titleAr: "فحص صحي شامل", description: "Complete health screening including blood tests, ECG, and doctor consultation", descriptionAr: "فحص صحي شامل يشمل تحاليل الدم والقلب واستشارة الطبيب", originalPrice: 85, discountedPrice: 55, pointsRequired: 500, category: "فحوصات", isFeatured: true, isActive: true, expiryDate: "2026-06-30", usageCount: 45 },
      { clinicId: clinics[1].id, title: "Teeth Cleaning & Whitening", titleAr: "تنظيف وتبييض الأسنان", description: "Professional dental cleaning and whitening session", descriptionAr: "جلسة تنظيف وتبييض احترافي للأسنان", originalPrice: 120, discountedPrice: 80, pointsRequired: 800, category: "أسنان", isFeatured: true, isActive: true, expiryDate: "2026-07-31", usageCount: 28 },
      { clinicId: clinics[2].id, title: "10 Physiotherapy Sessions", titleAr: "10 جلسات علاج طبيعي", description: "Package of 10 physiotherapy sessions for chronic pain relief", descriptionAr: "باقة 10 جلسات علاج طبيعي لعلاج الآلام المزمنة", originalPrice: 250, discountedPrice: 180, pointsRequired: 1500, category: "علاج طبيعي", isFeatured: false, isActive: true, expiryDate: "2026-08-31", usageCount: 12 },
      { clinicId: clinics[3].id, title: "Laser Eye Examination", titleAr: "فحص العين بالليزر", description: "Comprehensive laser eye examination with detailed report", descriptionAr: "فحص شامل للعين بالليزر مع تقرير مفصل", originalPrice: 95, discountedPrice: 65, pointsRequired: 600, category: "عيون", isFeatured: true, isActive: true, expiryDate: "2026-09-30", usageCount: 34 },
      { clinicId: clinics[4].id, title: "Family Vaccination Package", titleAr: "باقة تطعيمات عائلية", description: "Complete vaccination package for the whole family", descriptionAr: "باقة تطعيمات شاملة للعائلة بأكملها", originalPrice: 200, discountedPrice: 140, pointsRequired: 1200, category: "تطعيمات", isFeatured: false, isActive: true, expiryDate: "2026-10-31", usageCount: 19 },
    ]);

    const testPasswordHash = await bcrypt.hash("nabd1234", 10);
    await db.insert(patientsTable).values([
      { name: "محمد بن علي الراشدي", phone: "+968 9912 3456", email: "mohammed@example.com", passwordHash: testPasswordHash, level: "silver", points: 1350, totalVisits: 8 },
      { name: "فاطمة الزهراء البلوشي", phone: "+968 9923 4567", email: "fatima@example.com", passwordHash: testPasswordHash, level: "gold", points: 4200, totalVisits: 22 },
      { name: "أحمد سالم الحارثي", phone: "+968 9934 5678", email: "ahmed@example.com", passwordHash: testPasswordHash, level: "bronze", points: 450, totalVisits: 3 },
      { name: "مريم خالد العمري", phone: "+968 9945 6789", email: "mariam@example.com", passwordHash: testPasswordHash, level: "platinum", points: 8900, totalVisits: 41 },
    ]);

    await db.insert(appointmentsTable).values([
      { patientName: "محمد بن علي الراشدي", patientPhone: "+968 9912 3456", clinicId: clinics[0].id, clinicName: "مركز أحمد الصالح الطبي", service: "General Checkup", serviceAr: "فحص عام", date: "2026-03-15", time: "10:00", status: "confirmed", pointsEarned: 150 },
      { patientName: "فاطمة الزهراء البلوشي", patientPhone: "+968 9923 4567", clinicId: clinics[1].id, clinicName: "عيادة الشفاء للأسنان", service: "Teeth Cleaning", serviceAr: "تنظيف الأسنان", date: "2026-03-16", time: "14:00", status: "pending", pointsEarned: 0 },
    ]);

    await db.insert(discountsTable).values([
      { code: "BRONZE10", title: "Bronze Member Discount", titleAr: "خصم العضو البرونزي", description: "10% discount for bronze members on all dental services", discountPercent: 10, requiredLevel: "bronze", clinicId: clinics[1].id, clinicName: "عيادة الشفاء للأسنان", service: "جميع خدمات الأسنان", expiryDate: "2026-12-31", isActive: true, usageCount: 15, maxUsage: 200 },
      { code: "SILVER15", title: "Silver Member Discount", titleAr: "خصم العضو الفضي", description: "15% discount for silver members on general checkups", discountPercent: 15, requiredLevel: "silver", clinicId: clinics[0].id, clinicName: "مركز أحمد الصالح الطبي", service: "الفحوصات العامة", expiryDate: "2026-09-30", isActive: true, usageCount: 28, maxUsage: 100 },
      { code: "GOLD20", title: "Gold Member Discount", titleAr: "خصم العضو الذهبي", description: "20% discount for gold members on physiotherapy sessions", discountPercent: 20, requiredLevel: "gold", clinicId: clinics[2].id, clinicName: "مركز رويال للعلاج الطبيعي", service: "جلسات العلاج الطبيعي", expiryDate: "2026-06-30", isActive: true, usageCount: 8, maxUsage: 50 },
      { code: "PLAT30", title: "Platinum Exclusive Discount", titleAr: "خصم البلاتيني الحصري", description: "30% discount for platinum members on all services", discountPercent: 30, requiredLevel: "platinum", clinicId: null, clinicName: null, service: "جميع الخدمات", expiryDate: "2026-12-31", isActive: true, usageCount: 3, maxUsage: 30 },
      { code: "EYE25", title: "Eye Care Discount", titleAr: "خصم العناية بالعيون", description: "25% discount on eye examinations for gold+ members", discountPercent: 25, requiredLevel: "gold", clinicId: clinics[3].id, clinicName: "معهد عيون عُمان", service: "فحوصات العيون", expiryDate: "2026-08-31", isActive: true, usageCount: 12, maxUsage: 80 },
    ]);

    console.log("✅ Auto-seed completed successfully!");
  } catch (err) {
    console.error("Auto-seed failed:", err);
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

autoSeed().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
