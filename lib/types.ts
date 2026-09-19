export type UserType = "Admin" | "User";

export const USER_TYPES: UserType[] = ["Admin", "User"];

export interface User {
  user_id: number;
  name: string;
  email: string;
  user_type: UserType;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
}
