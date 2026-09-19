import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { User, UserType } from "./types";

const SESSION_COOKIE = "session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }
  return new TextEncoder().encode(secret ?? "dev-secret-change-in-production");
}

export type SessionUser = User;

export async function createSession(user: User): Promise<void> {
  const token = await new SignJWT({
    userId: user.user_id,
    name: user.name,
    email: user.email,
    userType: user.user_type,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      user_id: payload.userId as number,
      name: payload.name as string,
      email: payload.email as string,
      user_type: (payload.userType as UserType) ?? "User",
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
