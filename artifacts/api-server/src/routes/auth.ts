import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const authRouter = Router();

authRouter.post("/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }
    const existing = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, email))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [patient] = await db
      .insert(patientsTable)
      .values({ name, email, phone, passwordHash, level: "bronze", points: 0, totalVisits: 0 })
      .returning();
    const { passwordHash: _ph, ...safe } = patient;
    return res.status(201).json(safe);
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة السر مطلوبان" });
    }
    const [patient] = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.email, email))
      .limit(1);
    if (!patient) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    if (!patient.passwordHash) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    const valid = await bcrypt.compare(password, patient.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    const { passwordHash: _ph, ...safe } = patient;
    return res.json(safe);
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default authRouter;
