import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";

function s(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
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

router.post("/notifications", async (req, res): Promise<void> => {
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
