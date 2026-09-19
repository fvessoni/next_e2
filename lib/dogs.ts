import { getPool } from "./pg";
import type { CreateDogInput, Dog, DogSize } from "./types";

type DogRow = {
  dog_id: number;
  client_id: number;
  name: string;
  breed: string;
  size: DogSize;
  registration_date: string;
};

function rowToDog(row: DogRow): Dog {
  return {
    dog_id: row.dog_id,
    client_id: row.client_id,
    name: row.name,
    breed: row.breed,
    size: row.size,
    registration_date: row.registration_date,
  };
}

export async function getDogs(): Promise<Dog[]> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT dog_id, client_id, name, breed, size, registration_date::text
     FROM dogs
     ORDER BY name ASC`,
  );
  return rows.map(rowToDog);
}

export async function getDogsByClientId(clientId: number): Promise<Dog[]> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT dog_id, client_id, name, breed, size, registration_date::text
     FROM dogs
     WHERE client_id = $1
     ORDER BY name ASC`,
    [clientId],
  );
  return rows.map(rowToDog);
}

export async function getDogById(dogId: number): Promise<Dog | undefined> {
  const { rows } = await getPool().query<DogRow>(
    `SELECT dog_id, client_id, name, breed, size, registration_date::text
     FROM dogs
     WHERE dog_id = $1`,
    [dogId],
  );
  return rows[0] ? rowToDog(rows[0]) : undefined;
}

export async function createDog(input: CreateDogInput): Promise<Dog> {
  const { rows } = await getPool().query<DogRow>(
    `INSERT INTO dogs (client_id, name, breed, size, registration_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING dog_id, client_id, name, breed, size, registration_date::text`,
    [
      input.client_id,
      input.name.trim(),
      input.breed.trim(),
      input.size,
      input.registration_date,
    ],
  );
  return rowToDog(rows[0]);
}

export async function updateDog(
  dogId: number,
  input: Omit<CreateDogInput, "client_id">,
): Promise<Dog | null> {
  const { rows } = await getPool().query<DogRow>(
    `UPDATE dogs
     SET name = $2, breed = $3, size = $4, registration_date = $5
     WHERE dog_id = $1
     RETURNING dog_id, client_id, name, breed, size, registration_date::text`,
    [
      dogId,
      input.name.trim(),
      input.breed.trim(),
      input.size,
      input.registration_date,
    ],
  );
  return rows[0] ? rowToDog(rows[0]) : null;
}

export async function deleteDog(dogId: number): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM dogs WHERE dog_id = $1`, [
    dogId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
