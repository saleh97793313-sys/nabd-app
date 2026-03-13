import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { discountsTable, clinicsTable } from "@workspace/db";
import {
  GetDiscountsResponse,
  CreateDiscountBody,
  UpdateDiscountParams,
  UpdateDiscountBody,
  UpdateDiscountResponse,
  DeleteDiscountParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/discounts", async (_req, res): Promise<void> => {
  const discounts = await db.select().from(discountsTable).orderBy(discountsTable.createdAt);
  const clinics = await db.select().from(clinicsTable);
  const clinicMap = new Map(clinics.map(c => [c.id, c.nameAr]));
  const withClinicName = discounts.map(d => ({
    ...d,
    clinicName: d.clinicId ? (clinicMap.get(d.clinicId) ?? null) : null,
  }));
  res.json(GetDiscountsResponse.parse(withClinicName));
});

router.post("/discounts", async (req, res): Promise<void> => {
  const parsed = CreateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [discount] = await db.insert(discountsTable).values(parsed.data).returning();
  let clinicName: string | null = null;
  if (discount.clinicId) {
    const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.id, discount.clinicId));
    clinicName = clinics[0]?.nameAr ?? null;
  }
  res.status(201).json({ ...discount, clinicName });
});

router.patch("/discounts/:id", async (req, res): Promise<void> => {
  const params = UpdateDiscountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [discount] = await db
    .update(discountsTable)
    .set(parsed.data)
    .where(eq(discountsTable.id, params.data.id))
    .returning();
  if (!discount) {
    res.status(404).json({ error: "Discount not found" });
    return;
  }
  let clinicName: string | null = null;
  if (discount.clinicId) {
    const clinics = await db.select().from(clinicsTable).where(eq(clinicsTable.id, discount.clinicId));
    clinicName = clinics[0]?.nameAr ?? null;
  }
  res.json(UpdateDiscountResponse.parse({ ...discount, clinicName }));
});

router.delete("/discounts/:id", async (req, res): Promise<void> => {
  const params = DeleteDiscountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(discountsTable).where(eq(discountsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
