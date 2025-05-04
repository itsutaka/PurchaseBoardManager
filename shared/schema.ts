import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema (keeping this for reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Purchase requests schema
export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requester: text("requester").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedBy: text("purchased_by"),
  purchasedAt: timestamp("purchased_at"),
  purchaseNote: text("purchase_note"),
});

export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests).omit({
  id: true,
  createdAt: true,
  isPurchased: true,
  purchasedBy: true,
  purchasedAt: true,
  purchaseNote: true,
});

export const purchaseUpdateSchema = z.object({
  isPurchased: z.boolean(),
  purchasedBy: z.string(),
  purchasedAt: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ),
  purchaseNote: z.string().nullable().optional(),
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  content: text("content").notNull(),
  commenter: text("commenter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: integer("parent_id"),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertPurchaseRequest = z.infer<typeof insertPurchaseRequestSchema>;
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type UpdatePurchase = z.infer<typeof purchaseUpdateSchema>;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
