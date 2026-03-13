import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clinicsTable = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  specialty: text("specialty").notNull(),
  specialtyAr: text("specialty_ar").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  addressAr: text("address_ar").notNull(),
  city: text("city").notNull(),
  openHours: text("open_hours").notNull(),
  rating: real("rating").notNull().default(4.5),
  isActive: boolean("is_active").notNull().default(true),
  totalPatients: integer("total_patients").notNull().default(0),
  pointsPerVisit: integer("points_per_visit").notNull().default(100),
  description: text("description"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClinicSchema = createInsertSchema(clinicsTable).omit({ id: true, createdAt: true, rating: true, totalPatients: true });
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinicsTable.$inferSelect;
