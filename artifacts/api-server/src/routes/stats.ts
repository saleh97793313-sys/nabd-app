import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { clinicsTable, offersTable, appointmentsTable, patientsTable } from "@workspace/db";
import { GetDashboardStatsResponse, GetPatientsResponse } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

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
    .reduce((_sum, _a) => _sum + 50, 0);

  const levelDistribution = {
    bronze: patients.filter(p => p.level === "bronze").length,
    silver: patients.filter(p => p.level === "silver").length,
    gold: patients.filter(p => p.level === "gold").length,
    platinum: patients.filter(p => p.level === "platinum").length,
  };

  const monthlyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    monthlyMap.set(key, 0);
  }
  appointments.forEach(a => {
    const month = a.date.substring(0, 7);
    if (monthlyMap.has(month)) {
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
    }
  });

  const arabicMonths = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const monthlyAppointments = Array.from(monthlyMap.entries()).map(([key, count]) => {
    const [, m] = key.split("-");
    return { month: arabicMonths[parseInt(m, 10) - 1] ?? m, count };
  });

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
  res.json(GetPatientsResponse.parse(patients));
});

export default router;
