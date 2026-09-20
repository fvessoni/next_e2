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

export async function ensureTutorsTable(pool: Pool) {
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'clients'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tutors'
      ) THEN
        ALTER TABLE clients RENAME TO tutors;
      END IF;
    END $$
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tutors (
      tutor_id SERIAL PRIMARY KEY,
      cpf TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tutors' AND column_name = 'client_id'
      ) THEN
        ALTER TABLE tutors RENAME COLUMN client_id TO tutor_id;
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'clients_client_id_seq'
      ) THEN
        ALTER SEQUENCE clients_client_id_seq RENAME TO tutors_tutor_id_seq;
      END IF;
    END $$
  `);
}

export async function ensureDogsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dogs (
      dog_id SERIAL PRIMARY KEY,
      tutor_id INTEGER NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      breed TEXT NOT NULL,
      size TEXT NOT NULL CHECK (size IN ('Small', 'Medium', 'Large')),
      registration_date DATE NOT NULL DEFAULT CURRENT_DATE
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dogs' AND column_name = 'nome'
      ) THEN
        ALTER TABLE dogs RENAME COLUMN nome TO name;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dogs' AND column_name = 'raca'
      ) THEN
        ALTER TABLE dogs RENAME COLUMN raca TO breed;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dogs' AND column_name = 'porte'
      ) THEN
        ALTER TABLE dogs RENAME COLUMN porte TO size;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dogs' AND column_name = 'data_cadastro'
      ) THEN
        ALTER TABLE dogs RENAME COLUMN data_cadastro TO registration_date;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dogs' AND column_name = 'client_id'
      ) THEN
        ALTER TABLE dogs RENAME COLUMN client_id TO tutor_id;
      END IF;
    END $$
  `);

  await pool.query(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'dogs'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) LIKE '%size%'
      LOOP
        EXECUTE format('ALTER TABLE dogs DROP CONSTRAINT %I', r.conname);
      END LOOP;
    END $$
  `);

  await pool.query(`
    UPDATE dogs
    SET size = CASE size
      WHEN 'Pequeno' THEN 'Small'
      WHEN 'Médio' THEN 'Medium'
      WHEN 'Grande' THEN 'Large'
      ELSE size
    END
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dogs_size_check'
      ) THEN
        ALTER TABLE dogs
        ADD CONSTRAINT dogs_size_check
        CHECK (size IN ('Small', 'Medium', 'Large'));
      END IF;
    END $$
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'idx_dogs_client_id'
      ) THEN
        ALTER INDEX idx_dogs_client_id RENAME TO idx_dogs_tutor_id;
      END IF;
    END $$
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_dogs_tutor_id ON dogs (tutor_id)
  `);

  await pool.query(`
    ALTER TABLE dogs ADD COLUMN IF NOT EXISTS photo BYTEA
  `);

  await pool.query(`
    ALTER TABLE dogs ADD COLUMN IF NOT EXISTS photo_type TEXT
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dogs_photo_type_check'
      ) THEN
        ALTER TABLE dogs
        ADD CONSTRAINT dogs_photo_type_check
        CHECK (photo_type IS NULL OR photo_type IN ('image/jpeg', 'image/png'));
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dogs_photo_pair_check'
      ) THEN
        ALTER TABLE dogs
        ADD CONSTRAINT dogs_photo_pair_check
        CHECK ((photo IS NULL) = (photo_type IS NULL));
      END IF;
    END $$
  `);
}

export async function ensureSanitaryItensTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sanitary_itens (
      sanitary_item_id SERIAL PRIMARY KEY,
      dog_id INTEGER NOT NULL REFERENCES dogs(dog_id) ON DELETE CASCADE,
      item TEXT NOT NULL,
      valid_from DATE NOT NULL,
      valid_to DATE NOT NULL,
      updated DATE NOT NULL DEFAULT CURRENT_DATE,
      observations TEXT NOT NULL DEFAULT ''
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sanitary_itens_dog_id
    ON sanitary_itens (dog_id)
  `);
}

export async function ensureSchema(pool: Pool) {
  await ensureUsersTable(pool);
  await ensureTutorsTable(pool);
  await ensureDogsTable(pool);
  await ensureSanitaryItensTable(pool);
}
