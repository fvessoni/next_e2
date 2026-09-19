import { readFileSync } from "fs";
import path from "path";

export function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf-8");
  if (!content.trim()) {
    throw new Error(".env is empty — save the file in your editor and try again.");
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

export function getEnv(name: string): string {
  let value = process.env[name]?.trim();
  if (!value) {
    try {
      loadEnvFile();
      value = process.env[name]?.trim();
    } catch {
      // .env missing on disk — rely on process.env from Next.js
    }
  }
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Add it to .env and restart the dev server.`,
    );
  }
  return value;
}

export function getConnectionString(): string {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL in .env");
  }

  return connectionString;
}
