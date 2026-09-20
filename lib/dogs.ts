import { getPool } from "./pg";
import type { CreateDogInput, Dog, DogPhoto, DogSize } from "./types";

type DogRow = {
  dog_id: number;
  tutor_id: number;
  name: string;
  breed: string;
  size: DogSize;
  registration_date: string;
  has_photo: boolean;
};

function rowToDog(row: DogRow): Dog {
  return {
    dog_id: row.dog_id,
    tutor_id: row.tutor_id,
    name: row.name,
    breed: row.breed,
    size: row.size,
    registration_date: row.registration_date,
    has_photo: Boolean(row.has_photo),
  };
}

const DOG_COLUMNS = `dog_id, tutor_id, name, breed, size, registration_date::text,
            (photo IS NOT NULL) AS has_photo`;

export async function getDogs(): Promise<Dog[]> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT ${DOG_COLUMNS}
     FROM dogs
     ORDER BY name ASC`,
  );
  return rows.map(rowToDog);
}

export async function getDogsByTutorId(tutorId: number): Promise<Dog[]> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT ${DOG_COLUMNS}
     FROM dogs
     WHERE tutor_id = $1
     ORDER BY name ASC`,
    [tutorId],
  );
  return rows.map(rowToDog);
}

export async function getDogById(dogId: number): Promise<Dog | undefined> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT ${DOG_COLUMNS}
     FROM dogs
     WHERE dog_id = $1`,
    [dogId],
  );
  return rows[0] ? rowToDog(rows[0]) : undefined;
}

export async function getDogPhoto(
  dogId: number,
): Promise<DogPhoto | undefined> {
  const { rows } = await getPool().query<{
    photo: Buffer | Uint8Array;
    photo_type: DogPhoto["type"];
  }>(
    `SELECT photo, photo_type
     FROM dogs
     WHERE dog_id = $1 AND photo IS NOT NULL`,
    [dogId],
  );
  const row = rows[0];
  if (!row) return undefined;
  return {
    bytes: Buffer.isBuffer(row.photo) ? row.photo : Buffer.from(row.photo),
    type: row.photo_type,
  };
}

export async function createDog(input: CreateDogInput): Promise<Dog> {
  const { rows } = await getPool().query<DogRow>(
    `INSERT INTO dogs (tutor_id, name, breed, size, registration_date, photo, photo_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${DOG_COLUMNS}`,
    [
      input.tutor_id,
      input.name.trim(),
      input.breed.trim(),
      input.size,
      input.registration_date,
      input.photo?.bytes ?? null,
      input.photo?.type ?? null,
    ],
  );
  return rowToDog(rows[0]);
}

export async function updateDog(
  dogId: number,
  input: Omit<CreateDogInput, "tutor_id">,
): Promise<Dog | null> {
  const photoSql =
    input.photo === undefined
      ? ""
      : ", photo = $6, photo_type = $7";
  const params: unknown[] = [
    dogId,
    input.name.trim(),
    input.breed.trim(),
    input.size,
    input.registration_date,
  ];
  if (input.photo !== undefined) {
    params.push(input.photo?.bytes ?? null, input.photo?.type ?? null);
  }

  const { rows } = await getPool().query<DogRow>(
    `UPDATE dogs
     SET name = $2, breed = $3, size = $4, registration_date = $5${photoSql}
     WHERE dog_id = $1
     RETURNING ${DOG_COLUMNS}`,
    params,
  );
  return rows[0] ? rowToDog(rows[0]) : null;
}

export async function deleteDog(dogId: number): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM dogs WHERE dog_id = $1`, [
    dogId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
