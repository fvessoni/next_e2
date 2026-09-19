import type { User } from "./types";

export function isAdmin(user: User | null | undefined): boolean {
  return user?.user_type === "Admin";
}
