import { mysqlTable, varchar, text, int, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = mysqlTable("contacts", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const content = mysqlTable("content", {
  id: int("id").primaryKey().autoincrement(),
  section: varchar("section", { length: 100 }).notNull(), // hero, about, services
  key: varchar("key", { length: 100 }).notNull(), // title, subtitle, description
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pageViews = mysqlTable("page_views", {
  id: int("id").primaryKey().autoincrement(),
  path: varchar("path", { length: 255 }).notNull(),
  count: int("count").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  message: true,
}).extend({
  email: z.string().email("Пожалуйста, введите корректный email"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

export const insertContentSchema = createInsertSchema(content).pick({
  section: true,
  key: true,
  value: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;