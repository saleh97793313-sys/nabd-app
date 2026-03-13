import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { appointmentsTable } from "@workspace/db";
import {
  GetAppointmentsResponse,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", async (_req, res): Promise<void> => {
  const appointments = await db.select().from(appointmentsTable).orderBy(appointmentsTable.createdAt);
  res.json(GetAppointmentsResponse.parse(appointments));
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
  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: parsed.data.status })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(UpdateAppointmentStatusResponse.parse(appointment));
});

export default router;
