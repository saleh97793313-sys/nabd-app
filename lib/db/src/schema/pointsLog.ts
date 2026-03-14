import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pointsLogTable = pgTable("points_log", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientPhone: text("patient_phone").notNull(),
  type: text("type").notNull(),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  clinicName: text("clinic_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPointsLogSchema = createInsertSchema(pointsLogTable).omit({ id: true, createdAt: true });
export type InsertPointsLog = z.infer<typeof insertPointsLogSchema>;
export type PointsLog = typeof pointsLogTable.$inferSelect;
