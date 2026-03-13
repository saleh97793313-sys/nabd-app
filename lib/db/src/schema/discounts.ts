import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const discountsTable = pgTable("discounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  requiredLevel: text("required_level").notNull().default("bronze"),
  clinicId: integer("clinic_id"),
  clinicName: text("clinic_name"),
  service: text("service").notNull(),
  expiryDate: text("expiry_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  maxUsage: integer("max_usage").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDiscountSchema = createInsertSchema(discountsTable).omit({ id: true, createdAt: true, usageCount: true });
export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discountsTable.$inferSelect;
