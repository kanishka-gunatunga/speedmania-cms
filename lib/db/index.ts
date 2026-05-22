import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
const conn = globalForDb.conn ?? (
  connectionString 
    ? mysql.createPool(connectionString) 
    : mysql.createPool({ host: "localhost" })
);

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, mode: "planetscale" });
export { schema };
export * from "./schema";
