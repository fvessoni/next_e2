import { digitsOnly } from "./br";
import { getPool } from "./pg";
import type { Client, ClientListRow, CreateClientInput } from "./types";

type ClientRow = {
  client_id: number;
  cpf: string;
  name: string;
  email: string;
  mobile: string;
};

function rowToClient(row: ClientRow): Client {
  return {
    client_id: row.client_id,
    cpf: row.cpf,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
  };
}

function normalizeInput(input: CreateClientInput) {
  return {
    cpf: digitsOnly(input.cpf),
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    mobile: digitsOnly(input.mobile),
  };
}

export async function getClients(): Promise<ClientListRow[]> {
  const { rows } = await getPool().query<ClientRow & { dog_count: string }>(
    `SELECT c.client_id, c.cpf, c.name, c.email, c.mobile,
            COUNT(d.dog_id)::text AS dog_count
     FROM clients c
     LEFT JOIN dogs d ON d.client_id = c.client_id
     GROUP BY c.client_id
     ORDER BY c.name ASC`,
  );
  return rows.map((row) => ({
    ...rowToClient(row),
    dogCount: Number(row.dog_count),
  }));
}

export async function getClientById(
  clientId: number,
): Promise<Client | undefined> {
  const { rows } = await getPool().query<ClientRow>(
    `SELECT client_id, cpf, name, email, mobile
     FROM clients
     WHERE client_id = $1`,
    [clientId],
  );
  return rows[0] ? rowToClient(rows[0]) : undefined;
}

export async function getClientByCpf(
  cpf: string,
): Promise<Client | undefined> {
  const { rows } = await getPool().query<ClientRow>(
    `SELECT client_id, cpf, name, email, mobile
     FROM clients
     WHERE cpf = $1`,
    [digitsOnly(cpf)],
  );
  return rows[0] ? rowToClient(rows[0]) : undefined;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const data = normalizeInput(input);
  const { rows } = await getPool().query<ClientRow>(
    `INSERT INTO clients (cpf, name, email, mobile)
     VALUES ($1, $2, $3, $4)
     RETURNING client_id, cpf, name, email, mobile`,
    [data.cpf, data.name, data.email, data.mobile],
  );
  return rowToClient(rows[0]);
}

export async function updateClient(
  clientId: number,
  input: CreateClientInput,
): Promise<Client | null> {
  const data = normalizeInput(input);
  const { rows } = await getPool().query<ClientRow>(
    `UPDATE clients
     SET cpf = $2, name = $3, email = $4, mobile = $5
     WHERE client_id = $1
     RETURNING client_id, cpf, name, email, mobile`,
    [clientId, data.cpf, data.name, data.email, data.mobile],
  );
  return rows[0] ? rowToClient(rows[0]) : null;
}

export async function deleteClient(clientId: number): Promise<boolean> {
  const result = await getPool().query(
    `DELETE FROM clients WHERE client_id = $1`,
    [clientId],
  );
  return (result.rowCount ?? 0) > 0;
}
