import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: integer("amount").notNull(),
  type: text("type", { enum: ["win", "loss"] }).notNull(),
  category: text("category", {
    enum: ["slot", "scommesse", "poker", "gratta_e_vinci"],
  }).notNull(),
  note: text("note"),
  createdAt: integer("created_at").notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionType = Transaction["type"];
export type TransactionCategory = Transaction["category"];
