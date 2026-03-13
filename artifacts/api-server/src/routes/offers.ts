import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { offersTable, clinicsTable } from "@workspace/db";
import {
  GetOffersResponse,
  CreateOfferBody,
  UpdateOfferParams,
  UpdateOfferBody,
  UpdateOfferResponse,
  DeleteOfferParams,
} from "@workspace/api-zod";

function s(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const router: IRouter = Router();

router.get("/offers", async (_req, res): Promise<void> => {
  const offers = await db.select().from(offersTable).orderBy(offersTable.createdAt);
  const clinics = await db.select().from(clinicsTable);
  const clinicMap = new Map(clinics.map(c => [c.id, c.nameAr]));
  const withClinicName = offers.map(o => ({ ...s(o), clinicName: clinicMap.get(o.clinicId) ?? "" }));
  res.json(GetOffersResponse.parse(withClinicName));
});

router.post("/offers", async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [offer] = await db.insert(offersTable).values(parsed.data).returning();
  const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.id, offer.clinicId));
  const clinicName = clinics[0]?.nameAr ?? "";
  res.status(201).json({ ...s(offer), clinicName });
});

router.patch("/offers/:id", async (req, res): Promise<void> => {
  const params = UpdateOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [offer] = await db
    .update(offersTable)
    .set(parsed.data)
    .where(eq(offersTable.id, params.data.id))
    .returning();
  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }
  const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.id, offer.clinicId));
  const clinicName = clinics[0]?.nameAr ?? "";
  res.json(UpdateOfferResponse.parse({ ...s(offer), clinicName }));
});

router.delete("/offers/:id", async (req, res): Promise<void> => {
  const params = DeleteOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(offersTable).where(eq(offersTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
