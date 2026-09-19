import { Pool } from "pg";
import { getConnectionString, loadEnvFile } from "../lib/env";
import { ensureSchema } from "../lib/schema";

loadEnvFile();

async function main() {
  const pool = new Pool({ connectionString: getConnectionString() });
  await ensureSchema(pool);

  const { rows } = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('users', 'clients', 'dogs', 'sanitary_itens')
    ORDER BY table_name
  `);

  console.log("Tables ready:", rows.map((r) => r.table_name).join(", "));
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
