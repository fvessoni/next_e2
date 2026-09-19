import type { Pool } from "pg";

export async function ensureUsersTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      user_type TEXT NOT NULL DEFAULT 'User' CHECK (user_type IN ('Admin', 'User'))
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'User'
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_user_type_check'
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_user_type_check
        CHECK (user_type IN ('Admin', 'User'));
      END IF;
    END $$
  `);
}

export async function ensureSchema(pool: Pool) {
  await ensureUsersTable(pool);
}
