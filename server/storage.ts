import { contacts, users, type Contact, type InsertContact, type User } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createContact(contact: InsertContact): Promise<Contact>;
  getUserByUsername(username: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result;
  }
}

export const storage = new DatabaseStorage();