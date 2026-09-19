import bcrypt from "bcryptjs";
import { getPool } from "./pg";
import type { CreateUserInput, User, UserType } from "./types";

type UserRow = {
  user_id: number;
  name: string;
  email: string;
  password: string;
  user_type: UserType;
};

function rowToUser(row: UserRow): User {
  return {
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    user_type: row.user_type,
  };
}

const PUBLIC_COLUMNS = "user_id, name, email, user_type";

export async function getUsers(): Promise<User[]> {
  const { rows } = await getPool().query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY name ASC`,
  );
  return rows.map(rowToUser);
}

export async function getUserById(userId: number): Promise<User | undefined> {
  const { rows } = await getPool().query<UserRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function getUserByEmail(
  email: string,
): Promise<(User & { password: string }) | undefined> {
  const { rows } = await getPool().query<UserRow>(
    `SELECT user_id, name, email, password, user_type FROM users WHERE email = $1`,
    [email.toLowerCase().trim()],
  );
  if (!rows[0]) return undefined;
  return {
    user_id: rows[0].user_id,
    name: rows[0].name,
    email: rows[0].email,
    user_type: rows[0].user_type,
    password: rows[0].password,
  };
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const { rows } = await getPool().query<UserRow>(
    `INSERT INTO users (name, email, password, user_type)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, user_type`,
    [
      input.name.trim(),
      input.email.toLowerCase().trim(),
      passwordHash,
      input.user_type,
    ],
  );
  return rowToUser(rows[0]);
}

export async function updateUser(
  userId: number,
  input: {
    name: string;
    email: string;
    user_type: UserType;
    password?: string;
  },
): Promise<User | null> {
  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const { rows } = await getPool().query<UserRow>(
      `UPDATE users SET name = $2, email = $3, user_type = $4, password = $5
       WHERE user_id = $1
       RETURNING user_id, name, email, user_type`,
      [
        userId,
        input.name.trim(),
        input.email.toLowerCase().trim(),
        input.user_type,
        passwordHash,
      ],
    );
    return rows[0] ? rowToUser(rows[0]) : null;
  }

  const { rows } = await getPool().query<UserRow>(
    `UPDATE users SET name = $2, email = $3, user_type = $4
     WHERE user_id = $1
     RETURNING user_id, name, email, user_type`,
    [
      userId,
      input.name.trim(),
      input.email.toLowerCase().trim(),
      input.user_type,
    ],
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function deleteUser(userId: number): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM users WHERE user_id = $1`, [
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function verifyUserPassword(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    user_type: user.user_type,
  };
}
