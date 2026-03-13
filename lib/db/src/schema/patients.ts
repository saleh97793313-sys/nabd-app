import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  level: text("level").notNull().default("bronze"),
  points: integer("points").notNull().default(0),
  totalVisits: integer("total_visits").notNull().default(0),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastVisit: timestamp("last_visit", { withTimezone: true }),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, joinedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
