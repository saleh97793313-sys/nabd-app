import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { pointsLogTable, patientsTable } from "@workspace/db";

function s(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

function calcLevel(points: number): "bronze" | "silver" | "gold" | "platinum" {
  if (points >= 6000) return "platinum";
  if (points >= 3000) return "gold";
  if (points >= 1000) return "silver";
  return "bronze";
}

interface AwardPointsInput {
  points: number;
  type: "visit" | "bonus" | "manual" | "registration";
  description: string;
  clinicName?: string | null;
}

export async function awardPointsByPhone(phone: string, input: AwardPointsInput) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.phone, phone));
  if (!patient) return null;

  return db.transaction(async (tx) => {
    const newPoints = Math.max(0, patient.points + input.points);
    const newLevel = calcLevel(newPoints);
    const updateFields: { points: number; level: string; totalVisits?: number; lastVisit?: Date } = {
      points: newPoints,
      level: newLevel,
    };
    if (input.type === "visit") {
      updateFields.totalVisits = patient.totalVisits + 1;
      updateFields.lastVisit = new Date();
    }
    await tx.update(patientsTable).set(updateFields).where(eq(patientsTable.id, patient.id));

    const [entry] = await tx.insert(pointsLogTable).values({
      patientId: patient.id,
      patientPhone: patient.phone,
      type: input.type,
      points: input.points,
      description: input.description,
      clinicName: input.clinicName || null,
    }).returning();

    return entry;
  });
}

export async function awardPointsById(patientId: number, input: AwardPointsInput) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
  if (!patient) return null;

  return db.transaction(async (tx) => {
    const newPoints = Math.max(0, patient.points + input.points);
    const newLevel = calcLevel(newPoints);
    const updateFields: { points: number; level: string; totalVisits?: number; lastVisit?: Date } = {
      points: newPoints,
      level: newLevel,
    };
    if (input.type === "visit") {
      updateFields.totalVisits = patient.totalVisits + 1;
      updateFields.lastVisit = new Date();
    }
    await tx.update(patientsTable).set(updateFields).where(eq(patientsTable.id, patientId));

    const [entry] = await tx.insert(pointsLogTable).values({
      patientId: patient.id,
      patientPhone: patient.phone,
      type: input.type,
      points: input.points,
      description: input.description,
      clinicName: input.clinicName || null,
    }).returning();

    return entry;
  });
}

const AddPointsBody = z.object({
  points: z.number().int(),
  type: z.enum(["visit", "bonus", "manual", "registration"]),
  description: z.string(),
  clinicName: z.string().nullable().optional(),
});

const router: IRouter = Router();

router.get("/patients/:id/points-log", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient id" }); return; }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }

  const logs = await db.select().from(pointsLogTable)
    .where(eq(pointsLogTable.patientId, id))
    .orderBy(desc(pointsLogTable.createdAt));

  res.json(logs.map(s));
});

router.post("/patients/:id/points", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient id" }); return; }

  const parsed = AddPointsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const entry = await awardPointsById(id, parsed.data);
  if (!entry) { res.status(404).json({ error: "Patient not found" }); return; }

  res.json(s(entry));
});

router.get("/points-log/by-phone", async (req, res): Promise<void> => {
  const phone = String(req.query.phone || "");
  if (!phone) { res.status(400).json({ error: "phone query required" }); return; }

  const logs = await db.select().from(pointsLogTable)
    .where(eq(pointsLogTable.patientPhone, phone))
    .orderBy(desc(pointsLogTable.createdAt));

  res.json(logs.map(s));
});

export default router;
