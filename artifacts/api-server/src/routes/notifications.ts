import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { desc } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";

function s(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const ADMIN_EMAIL = "Saleh97793313@gmail.com";

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.status(403).json({ error: "غير مصرح — صلاحيات المسؤول مطلوبة" });
    return;
  }
  try {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const [email] = decoded.split(":");
    if (email !== ADMIN_EMAIL) {
      res.status(403).json({ error: "غير مصرح — صلاحيات المسؤول مطلوبة" });
      return;
    }
    next();
  } catch {
    res.status(403).json({ error: "غير مصرح — صلاحيات المسؤول مطلوبة" });
  }
}

const CreateNotificationBody = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.enum(["info", "offer", "points", "appointment"]).default("info"),
  targetLevel: z.enum(["all", "bronze", "silver", "gold", "platinum"]).default("all"),
});

const router: IRouter = Router();

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
