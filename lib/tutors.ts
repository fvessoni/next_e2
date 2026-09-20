import { digitsOnly } from "./br";
import { getPool } from "./pg";
import type { CreateTutorInput, Tutor, TutorListRow } from "./types";

type TutorRow = {
  tutor_id: number;
  cpf: string;
  name: string;
  email: string;
  mobile: string;
};

function rowToTutor(row: TutorRow): Tutor {
  return {
    tutor_id: row.tutor_id,
    cpf: row.cpf,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
  };
}

function normalizeInput(input: CreateTutorInput) {
  return {
    cpf: digitsOnly(input.cpf),
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    mobile: digitsOnly(input.mobile),
  };
}

export async function getTutors(): Promise<TutorListRow[]> {
  const { rows } = await getPool().query<TutorRow & { dog_count: string }>(
    `SELECT t.tutor_id, t.cpf, t.name, t.email, t.mobile,
            COUNT(d.dog_id)::text AS dog_count
     FROM tutors t
     LEFT JOIN dogs d ON d.tutor_id = t.tutor_id
     GROUP BY t.tutor_id
     ORDER BY t.name ASC`,
  );
  return rows.map((row) => ({
    ...rowToTutor(row),
    dogCount: Number(row.dog_count),
  }));
}

export async function getTutorById(
  tutorId: number,
): Promise<Tutor | undefined> {
  const { rows } = await getPool().query<TutorRow>(
    `SELECT tutor_id, cpf, name, email, mobile
     FROM tutors
     WHERE tutor_id = $1`,
    [tutorId],
  );
  return rows[0] ? rowToTutor(rows[0]) : undefined;
}

export async function getTutorByCpf(cpf: string): Promise<Tutor | undefined> {
  const { rows } = await getPool().query<TutorRow>(
    `SELECT tutor_id, cpf, name, email, mobile
     FROM tutors
     WHERE cpf = $1`,
    [digitsOnly(cpf)],
  );
  return rows[0] ? rowToTutor(rows[0]) : undefined;
}

export async function createTutor(input: CreateTutorInput): Promise<Tutor> {
  const data = normalizeInput(input);
  const { rows } = await getPool().query<TutorRow>(
    `INSERT INTO tutors (cpf, name, email, mobile)
     VALUES ($1, $2, $3, $4)
     RETURNING tutor_id, cpf, name, email, mobile`,
    [data.cpf, data.name, data.email, data.mobile],
  );
  return rowToTutor(rows[0]);
}

export async function updateTutor(
  tutorId: number,
  input: CreateTutorInput,
): Promise<Tutor | null> {
  const data = normalizeInput(input);
  const { rows } = await getPool().query<TutorRow>(
    `UPDATE tutors
     SET cpf = $2, name = $3, email = $4, mobile = $5
     WHERE tutor_id = $1
     RETURNING tutor_id, cpf, name, email, mobile`,
    [tutorId, data.cpf, data.name, data.email, data.mobile],
  );
  return rows[0] ? rowToTutor(rows[0]) : null;
}

export async function deleteTutor(tutorId: number): Promise<boolean> {
  const result = await getPool().query(
    `DELETE FROM tutors WHERE tutor_id = $1`,
    [tutorId],
  );
  return (result.rowCount ?? 0) > 0;
}
