import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { pointsLogTable, patientsTable } from "@workspace/db";

function s(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

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

router.get("/points-log/by-phone", async (req, res): Promise<void> => {
  const phone = String(req.query.phone || "");
  if (!phone) { res.status(400).json({ error: "phone query required" }); return; }

  const logs = await db.select().from(pointsLogTable)
    .where(eq(pointsLogTable.patientPhone, phone))
    .orderBy(desc(pointsLogTable.createdAt));

  res.json(logs.map(s));
});

export default router;
