import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { clinicsTable } from "@workspace/db";
import {
  GetClinicsResponse,
  GetClinicParams,
  GetClinicResponse,
  CreateClinicBody,
  UpdateClinicParams,
  UpdateClinicBody,
  UpdateClinicResponse,
  DeleteClinicParams,
  GetClinicOffersParams,
  GetClinicOffersResponse,
} from "@workspace/api-zod";
import { offersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/clinics", async (_req, res): Promise<void> => {
  const clinics = await db.select().from(clinicsTable).orderBy(clinicsTable.createdAt);
  res.json(GetClinicsResponse.parse(clinics));
});

router.post("/clinics", async (req, res): Promise<void> => {
  const parsed = CreateClinicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [clinic] = await db.insert(clinicsTable).values(parsed.data).returning();
  res.status(201).json(GetClinicResponse.parse(clinic));
});

router.get("/clinics/:id", async (req, res): Promise<void> => {
  const params = GetClinicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [clinic] = await db.select().from(clinicsTable).where(eq(clinicsTable.id, params.data.id));
  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }
  res.json(GetClinicResponse.parse(clinic));
});

router.patch("/clinics/:id", async (req, res): Promise<void> => {
  const params = UpdateClinicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateClinicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [clinic] = await db
    .update(clinicsTable)
    .set(parsed.data)
    .where(eq(clinicsTable.id, params.data.id))
    .returning();
  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }
  res.json(UpdateClinicResponse.parse(clinic));
});

router.delete("/clinics/:id", async (req, res): Promise<void> => {
  const params = DeleteClinicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(clinicsTable).where(eq(clinicsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/clinics/:id/offers", async (req, res): Promise<void> => {
  const params = GetClinicOffersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.id, params.data.id));
  const clinic = clinics[0];
  const offers = await db.select().from(offersTable).where(eq(offersTable.clinicId, params.data.id));
  const withClinicName = offers.map(o => ({ ...o, clinicName: clinic?.nameAr ?? "" }));
  res.json(GetClinicOffersResponse.parse(withClinicName));
});

export default router;
