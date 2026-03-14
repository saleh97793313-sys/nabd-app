import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { desc } from "drizzle-orm";
import { z } from "zod/v4";
import crypto from "crypto";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";

function s(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getAdminEmail(): string {
  const v = process.env.ADMIN_EMAIL;
  if (!v) throw new Error("ADMIN_EMAIL environment variable is required");
  return v;
}

function getAdminPassword(): string {
  const v = process.env.ADMIN_PASSWORD;
  if (!v) throw new Error("ADMIN_PASSWORD environment variable is required");
  return v;
}

function getSecret(): string {
  const v = process.env.SESSION_SECRET;
  if (!v) throw new Error("SESSION_SECRET environment variable is required");
  return v;
}

function signAdminToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS });
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

function verifyAdminToken(token: string): boolean {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(payload);
    if (data.email !== getAdminEmail()) return false;
    if (typeof data.exp === "number" && Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({ error: "غير مصرح — صلاحيات المسؤول مطلوبة" });
    return;
  }
  const token = authHeader.slice(7);
  if (!verifyAdminToken(token)) {
    res.status(403).json({ error: "غير مصرح — جلسة غير صالحة أو منتهية" });
    return;
  }
  next();
}

const CreateNotificationBody = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.enum(["info", "offer", "points", "appointment"]).default("info"),
  targetLevel: z.enum(["all", "bronze", "silver", "gold", "platinum"]).default("all"),
});

const router: IRouter = Router();

router.post("/admin/login", (req: Request, res: Response): void => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: "البريد وكلمة السر مطلوبان" });
    return;
  }
  if (email.toLowerCase() !== getAdminEmail().toLowerCase() || password !== getAdminPassword()) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }
  const token = signAdminToken(email);
  res.json({ token });
});

router.get("/notifications", async (req, res): Promise<void> => {
  const level = String(req.query.level || "all");

  const all = await db.select().from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));

  const filtered = level === "all"
    ? all
    : all.filter(n => n.targetLevel === "all" || n.targetLevel === level);

  res.json(filtered.map(s));
});

router.post("/notifications", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.insert(notificationsTable).values({
    title: parsed.data.title,
    body: parsed.data.body,
    type: parsed.data.type,
    targetLevel: parsed.data.targetLevel,
  }).returning();

  res.status(201).json(s(entry));
});

export default router;
