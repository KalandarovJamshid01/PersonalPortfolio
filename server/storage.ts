import { contacts, content, pageViews, users, type Contact, type InsertContact, type User, type Content, type InsertContent, type PageView } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Контакты
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactAsRead(id: number): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Пользователи
  getUserByUsername(username: string): Promise<User | undefined>;

  // Контент
  getContent(): Promise<Content[]>;
  updateContent(id: number, value: string): Promise<Content | undefined>;

  // Статистика
  incrementPageView(path: string): Promise<PageView>;
  getPageViews(): Promise<PageView[]>;
}

export class DatabaseStorage implements IStorage {
  // Контакты
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return result;
  }

  async getContacts(): Promise<Contact[]> {
    return db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async markContactAsRead(id: number): Promise<Contact | undefined> {
    const [result] = await db
      .update(contacts)
      .set({ isRead: true })
      .where(eq(contacts.id, id))
      .returning();
    return result;
  }

  async deleteContact(id: number): Promise<boolean> {
    const [result] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    return !!result;
  }

  // Пользователи
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result;
  }

  // Контент
  async getContent(): Promise<Content[]> {
    return db
      .select()
      .from(content)
      .orderBy(content.section, content.key);
  }

  async updateContent(id: number, value: string): Promise<Content | undefined> {
    const [result] = await db
      .update(content)
      .set({ value, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return result;
  }

  // Статистика
  async incrementPageView(path: string): Promise<PageView> {
    const [existing] = await db
      .select()
      .from(pageViews)
      .where(eq(pageViews.path, path))
      .limit(1);

    if (existing) {
      const [result] = await db
        .update(pageViews)
        .set({ 
          count: existing.count + 1,
          updatedAt: new Date()
        })
        .where(eq(pageViews.id, existing.id))
        .returning();
      return result;
    }

    const [result] = await db
      .insert(pageViews)
      .values({ path, count: 1 })
      .returning();
    return result;
  }

  async getPageViews(): Promise<PageView[]> {
    return db
      .select()
      .from(pageViews)
      .orderBy(desc(pageViews.count));
  }
}

export const storage = new DatabaseStorage();