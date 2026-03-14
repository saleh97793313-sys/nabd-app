import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@workspace/db";
import { appointmentsTable, clinicsTable, patientsTable, pointsLogTable } from "@workspace/db";
import {
  GetAppointmentsResponse,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";

function s(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const BookAppointmentBody = z.object({
  patientName: z.string(),
  patientPhone: z.string(),
  clinicId: z.number().int(),
  service: z.string(),
  serviceAr: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});

const router: IRouter = Router();

router.get("/appointments", async (_req, res): Promise<void> => {
  const appointments = await db.select().from(appointmentsTable).orderBy(appointmentsTable.createdAt);
  res.json(GetAppointmentsResponse.parse(appointments.map(s)));
});

router.get("/appointments/patient", async (req, res): Promise<void> => {
  const phone = String(req.query.phone || "");
  if (!phone) { res.status(400).json({ error: "phone query required" }); return; }
  const all = await db.select().from(appointmentsTable).orderBy(appointmentsTable.createdAt);
  const filtered = all.filter(a => a.patientPhone === phone);
  res.json(filtered.map(s));
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = BookAppointmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [clinic] = await db.select().from(clinicsTable).where(eq(clinicsTable.id, parsed.data.clinicId));
  const clinicName = clinic?.nameAr || clinic?.name || "";
  const pointsEarned = clinic?.pointsPerVisit ?? 100;

  const [appointment] = await db.insert(appointmentsTable).values({
    ...parsed.data,
    clinicName,
    pointsEarned,
    status: "pending",
  }).returning();

  res.status(201).json(s(appointment));
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAppointmentStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: parsed.data.status })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (parsed.data.status === "completed" && existing.status !== "completed") {
    const points = appointment.pointsEarned || 0;
    if (points > 0) {
      await db.transaction(async (tx) => {
        const [patient] = await tx.select().from(patientsTable)
          .where(eq(patientsTable.phone, appointment.patientPhone));
        if (patient) {
          const newPoints = patient.points + points;
          const newLevel = newPoints >= 6000 ? "platinum" : newPoints >= 3000 ? "gold" : newPoints >= 1000 ? "silver" : "bronze";
          await tx.update(patientsTable)
            .set({
              points: newPoints,
              level: newLevel,
              totalVisits: patient.totalVisits + 1,
              lastVisit: new Date(),
            })
            .where(eq(patientsTable.id, patient.id));

          await tx.insert(pointsLogTable).values({
            patientId: patient.id,
            patientPhone: patient.phone,
            type: "visit",
            points,
            description: `زيارة ${appointment.clinicName} - ${appointment.serviceAr || appointment.service}`,
            clinicName: appointment.clinicName,
          });
        }
      });
    }
  }

  if (parsed.data.status === "confirmed" && existing.status === "pending") {
    const bonusPoints = 10;
    await db.transaction(async (tx) => {
      const [patient] = await tx.select().from(patientsTable)
        .where(eq(patientsTable.phone, appointment.patientPhone));
      if (patient) {
        const newPoints = patient.points + bonusPoints;
        const newLevel = newPoints >= 6000 ? "platinum" : newPoints >= 3000 ? "gold" : newPoints >= 1000 ? "silver" : "bronze";
        await tx.update(patientsTable)
          .set({ points: newPoints, level: newLevel })
          .where(eq(patientsTable.id, patient.id));

        await tx.insert(pointsLogTable).values({
          patientId: patient.id,
          patientPhone: patient.phone,
          type: "bonus",
          points: bonusPoints,
          description: `تأكيد موعد في ${appointment.clinicName}`,
          clinicName: appointment.clinicName,
        });
      }
    });
  }

  res.json(UpdateAppointmentStatusResponse.parse(s(appointment)));
});

export default router;
