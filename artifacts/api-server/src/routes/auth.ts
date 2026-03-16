import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { patientsTable, pointsLogTable, otpCodesTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendOtpEmail } from "../email";

const authRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendOtp(email: string, name: string): Promise<void> {
  await db.delete(otpCodesTable).where(eq(otpCodesTable.email, email));
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.insert(otpCodesTable).values({ email, code, expiresAt });
  await sendOtpEmail(email, code, name);
}

authRouter.post("/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [patient] = await db
      .insert(patientsTable)
      .values({
        name,
        email: normalizedEmail,
        phone,
        passwordHash,
        level: "bronze",
        points: 0,
        totalVisits: 0,
        isEmailVerified: false,
      })
      .returning();

    await createAndSendOtp(normalizedEmail, name);

    const { passwordHash: _ph, ...safe } = patient;
    return res.status(201).json({ ...safe, requiresVerification: true });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

authRouter.post("/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });

    const normalizedEmail = email.toLowerCase().trim();
    const [patient] = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, normalizedEmail))
      .limit(1);

    if (!patient) return res.status(404).json({ error: "الحساب غير موجود" });
    if (patient.isEmailVerified) return res.status(400).json({ error: "البريد الإلكتروني محقق بالفعل" });

    await createAndSendOtp(normalizedEmail, patient.name);
    return res.json({ success: true, message: "تم إرسال رمز التحقق" });
  } catch (e) {
    console.error("Send OTP error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

authRouter.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "البريد ورمز التحقق مطلوبان" });

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    const [otp] = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.email, normalizedEmail),
          eq(otpCodesTable.code, code.trim()),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, now)
        )
      )
      .limit(1);

    if (!otp) {
      return res.status(400).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
    }

    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));

    const [patient] = await db
      .update(patientsTable)
      .set({ isEmailVerified: true, points: 100 })
      .where(eq(patientsTable.email, normalizedEmail))
      .returning();

    await db.insert(pointsLogTable).values({
      patientId: patient.id,
      patientPhone: patient.phone,
      type: "registration",
      points: 100,
      description: "مكافأة التسجيل في نبض",
    });

    const { passwordHash: _ph, ...safe } = patient;
    return res.json({ ...safe, verified: true });
  } catch (e) {
    console.error("Verify OTP error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة السر مطلوبان" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [patient] = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, normalizedEmail))
      .limit(1);

    if (!patient || !patient.passwordHash) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const valid = await bcrypt.compare(password, patient.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    if (!patient.isEmailVerified) {
      await createAndSendOtp(normalizedEmail, patient.name);
      return res.status(403).json({
        error: "يرجى تفعيل بريدك الإلكتروني أولاً",
        requiresVerification: true,
        email: normalizedEmail,
        name: patient.name,
      });
    }

    const { passwordHash: _ph, ...safe } = patient;
    return res.json(safe);
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default authRouter;
