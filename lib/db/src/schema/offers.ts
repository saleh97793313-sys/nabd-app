import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  originalPrice: real("original_price").notNull(),
  discountedPrice: real("discounted_price").notNull(),
  pointsRequired: integer("points_required").notNull(),
  category: text("category").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  expiryDate: text("expiry_date").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true, usageCount: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
