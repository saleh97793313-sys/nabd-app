import { Router, type IRouter } from "express";
import { eq, avg, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { ratingsTable, clinicsTable } from "@workspace/db";
import {
  CreateRatingBody,
  GetClinicRatingsParams,
  GetClinicRatingsResponse,
  CheckRatingQueryParams,
  CheckRatingResponse,
} from "@workspace/api-zod";

function s(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

const router: IRouter = Router();

router.post("/ratings", async (req, res): Promise<void> => {
  const parsed = CreateRatingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.appointmentId, parsed.data.appointmentId));
  if (existing.length > 0) {
    res.status(409).json({ error: "This appointment has already been rated" });
    return;
  }

  const [rating] = await db.insert(ratingsTable).values(parsed.data).returning();

  const [stats] = await db
    .select({
      avgRating: avg(ratingsTable.stars),
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.clinicId, parsed.data.clinicId));

  if (stats?.avgRating) {
    await db
      .update(clinicsTable)
      .set({ rating: parseFloat(parseFloat(stats.avgRating).toFixed(1)) })
      .where(eq(clinicsTable.id, parsed.data.clinicId));
  }

  res.status(201).json(s(rating));
});

router.get("/clinics/:id/ratings", async (req, res): Promise<void> => {
  const params = GetClinicRatingsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const ratings = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.clinicId, params.data.id))
    .orderBy(ratingsTable.createdAt);
  res.json(GetClinicRatingsResponse.parse(ratings.map(s)));
});

router.get("/ratings/check", async (req, res): Promise<void> => {
  const parsed = CheckRatingQueryParams.safeParse({
    appointmentId: req.query.appointmentId ? Number(req.query.appointmentId) : undefined,
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.appointmentId, parsed.data.appointmentId));
  res.json(CheckRatingResponse.parse({ rated: existing.length > 0 }));
});

export default router;
