import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined };

export function getPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("Database connection string not found in environment.");
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({ connectionString });
  }

  return globalForPg.pgPool;
}
