import { Pool } from "pg";
import { getConnectionString, loadEnvFile } from "../lib/env";
import { ensureUsersTable } from "../lib/schema";
import { createUser, getUserByEmail } from "../lib/users";

loadEnvFile();

async function main() {
  const pool = new Pool({ connectionString: getConnectionString() });
  await ensureUsersTable(pool);

  await pool.query(
    `UPDATE users SET user_type = 'Admin' WHERE email = 'demo@jurix.local'`,
  );

  await pool.end();

  const email = "demo@jurix.local";
  const existing = await getUserByEmail(email);
  if (existing) {
    console.log(`User already exists: ${email} (${existing.user_type})`);
    console.log("Re-login to refresh session with user type.");
    return;
  }

  const user = await createUser({
    name: "Usuário Demo",
    email,
    password: "demo123",
    user_type: "Admin",
  });

  console.log(`Created admin: ${user.email} (id ${user.user_id})`);
  console.log("Login with: demo@jurix.local / demo123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
