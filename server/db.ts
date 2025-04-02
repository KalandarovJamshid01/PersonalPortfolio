import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Format should be: mysql://username:password@hostname:port/database",
  );
}

// Create MySQL connection
export const getConnection = async () => {
  return await createConnection(process.env.DATABASE_URL);
};

export const getDb = async () => {
  const connection = await getConnection();
  return drizzle(connection, { schema, mode: 'default' });
};

// For compatibility with existing code
export const db = {
  select: () => ({
    from: (table: any) => {
      return {
        where: async (condition: any) => {
          const connection = await getConnection();
          const db = drizzle(connection, { schema, mode: 'default' });
          const result = await db.select().from(table).where(condition);
          await connection.end();
          return result;
        },
        orderBy: async (...args: any[]) => {
          const connection = await getConnection();
          const db = drizzle(connection, { schema, mode: 'default' });
          const result = await db.select().from(table).orderBy(...args);
          await connection.end();
          return result;
        },
        limit: async (limit: number) => {
          const connection = await getConnection();
          const db = drizzle(connection, { schema, mode: 'default' });
          const result = await db.select().from(table).limit(limit);
          await connection.end();
          return result;
        }
      };
    }
  }),
  insert: (table: any) => ({
    values: (values: any) => ({
      returning: async () => {
        const connection = await getConnection();
        const db = drizzle(connection, { schema, mode: 'default' });
        const result = await db.insert(table).values(values);
        // Get the inserted record
        const id = result.insertId;
        const inserted = await db.select().from(table).where({ id });
        await connection.end();
        return inserted;
      }
    })
  }),
  update: (table: any) => ({
    set: (values: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          const connection = await getConnection();
          const db = drizzle(connection, { schema, mode: 'default' });
          await db.update(table).set(values).where(condition);
          // Get the updated record
          const updated = await db.select().from(table).where(condition);
          await connection.end();
          return updated;
        }
      })
    })
  }),
  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: async () => {
        const connection = await getConnection();
        const db = drizzle(connection, { schema, mode: 'default' });
        // Get the record before deletion
        const record = await db.select().from(table).where(condition);
        await db.delete(table).where(condition);
        await connection.end();
        return record;
      }
    })
  })
};
