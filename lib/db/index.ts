import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;
const conn = globalForDb.conn ?? (
  connectionString 
    ? mysql.createPool({
        uri: connectionString,
        connectionLimit: 1, // Only 1 connection per Vercel Lambda
        maxIdle: 1, // Max 1 idle connection
        idleTimeout: 60000, // Close idle connections after 60s to prevent stale TCP sockets
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        waitForConnections: true,
        queueLimit: 0,
      }) 
    : mysql.createPool({ 
        host: "localhost",
        connectionLimit: 3,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      })
);

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, mode: "planetscale" });
export { schema };
export * from "./schema";
