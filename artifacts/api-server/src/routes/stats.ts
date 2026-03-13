import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { clinicsTable, offersTable, appointmentsTable, patientsTable } from "@workspace/db";
import { GetDashboardStatsResponse, GetPatientsResponse } from "@workspace/api-zod";

function calcLevel(points: number): "bronze" | "silver" | "gold" | "platinum" {
  if (points >= 6000) return "platinum";
  if (points >= 3000) return "gold";
  if (points >= 1000) return "silver";
  return "bronze";
}

function s(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [patients, clinics, appointments, offers] = await Promise.all([
    db.select().from(patientsTable),
    db.select().from(clinicsTable),
    db.select().from(appointmentsTable),
    db.select().from(offersTable),
  ]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const appointmentsThisMonth = appointments.filter(a => a.date.startsWith(thisMonth)).length;
  const newPatientsThisMonth = patients.filter(p => {
    const d = new Date(p.joinedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const totalPointsIssued = patients.reduce((sum, p) => sum + p.points, 0);
  const activeOffers = offers.filter(o => o.isActive).length;
  const revenueThisMonth = appointments
    .filter(a => a.date.startsWith(thisMonth) && a.status === "completed")
    .length * 50;

  const levelDistribution = {
    bronze: patients.filter(p => p.level === "bronze").length,
    silver: patients.filter(p => p.level === "silver").length,
    gold: patients.filter(p => p.level === "gold").length,
    platinum: patients.filter(p => p.level === "platinum").length,
  };

  const arabicMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const monthlyMap = new Map<string, { label: string; count: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { label: arabicMonths[d.getMonth()], count: 0 });
  }
  appointments.forEach(a => {
    const month = a.date.substring(0, 7);
    const entry = monthlyMap.get(month);
    if (entry) entry.count++;
  });

  const monthlyAppointments = Array.from(monthlyMap.values()).map(({ label, count }) => ({
    month: label,
    count,
  }));

  const stats = {
    totalPatients: patients.length,
    totalClinics: clinics.length,
    totalAppointments: appointments.length,
    totalPointsIssued,
    activeOffers,
    revenueThisMonth,
    appointmentsThisMonth,
    newPatientsThisMonth,
    levelDistribution,
    monthlyAppointments,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/patients", async (_req, res): Promise<void> => {
  const patients = await db.select().from(patientsTable).orderBy(patientsTable.joinedAt);
  res.json(GetPatientsResponse.parse(patients.map(s)));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [p] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
  if (!p) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(s(p));
});

const UpdatePatientBody = z.object({
  points: z.number().int().optional(),
  pointsDelta: z.number().int().optional(),
  totalVisits: z.number().int().optional(),
  level: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
  autoLevel: z.boolean().optional(),
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [current] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
  if (!current) { res.status(404).json({ error: "Patient not found" }); return; }

  const updates: Record<string, any> = {};
  let newPoints = current.points;

  if (parsed.data.pointsDelta !== undefined) {
    newPoints = Math.max(0, current.points + parsed.data.pointsDelta);
    updates.points = newPoints;
  } else if (parsed.data.points !== undefined) {
    newPoints = parsed.data.points;
    updates.points = newPoints;
  }
  if (parsed.data.totalVisits !== undefined) updates.totalVisits = parsed.data.totalVisits;
  if (parsed.data.level !== undefined && !parsed.data.autoLevel) {
    updates.level = parsed.data.level;
  } else {
    updates.level = calcLevel(newPoints);
  }

  const [updated] = await db.update(patientsTable).set(updates).where(eq(patientsTable.id, id)).returning();
  res.json(s(updated));
});

export default router;
