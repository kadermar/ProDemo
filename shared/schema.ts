import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  sources: jsonb("sources"), // Array of source references
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productData = pgTable("product_data", {
  id: serial("id").primaryKey(),
  system: text("system").notNull(), // 'TPO', 'EPDM', 'PVC', etc.
  manufacturer: text("manufacturer").notNull(),
  membraneType: text("membrane_type").notNull(),
  thickness: text("thickness"),
  buildingHeight: text("building_height"),
  warranty: text("warranty"),
  windSpeed: text("wind_speed"),
  location: text("location"),
  contractor: text("contractor"),
  projectName: text("project_name").notNull(),
  date: text("date"),
  specifications: jsonb("specifications").notNull(),
  sourceDocument: text("source_document"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertProductDataSchema = createInsertSchema(productData).omit({
  id: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertProductData = z.infer<typeof insertProductDataSchema>;
export type ProductData = typeof productData.$inferSelect;
