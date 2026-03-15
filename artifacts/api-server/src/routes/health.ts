import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db, clinicsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/debug/db", async (_req, res) => {
  try {
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    const clinicCount = await db.select().from(clinicsTable);
    res.json({
      status: "ok",
      tables: tables.rows?.map((r: any) => r.table_name) ?? [],
      clinicCount: clinicCount.length,
      dbUrl: process.env.DATABASE_URL ? "set" : "not-set",
    });
  } catch (err: any) {
    res.json({
      status: "error",
      error: err.message,
      dbUrl: process.env.DATABASE_URL ? "set" : "not-set",
    });
  }
});

export default router;
