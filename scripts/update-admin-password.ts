import { loadEnvFile } from "../lib/env";
import { getPool } from "../lib/pg";
import { createUser, getUserByEmail, updateUser } from "../lib/users";

loadEnvFile();

const email = process.argv[2] ?? "demo@jurix.local";
const password = process.argv[3] ?? "adm102030";
const name = process.argv[4] ?? "Administrador";

async function main() {
  let user = await getUserByEmail(email);

  if (!user) {
    const created = await createUser({
      name,
      email,
      password,
      user_type: "Admin",
    });
    console.log(`Created admin: ${created.email} (id ${created.user_id})`);
  } else {
    await updateUser(user.user_id, {
      name: user.name,
      email: user.email,
      user_type: "Admin",
      password,
    });
    console.log(`Password updated for ${email}`);
  }

  await getPool().end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await getPool().end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
