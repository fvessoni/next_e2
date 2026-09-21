import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserType } from "@/lib/types";

const PUBLIC_PATHS = [
  "/auth/login",
  "/certificado",
  "/api/certificado",
  "/videocall",
];
const ADMIN_PATHS = ["/users"];

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

type SessionPayload = {
  userId: number;
  userType: UserType;
};

async function getSessionPayload(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as number,
      userType: (payload.userType as UserType) ?? "User",
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const session = await getSessionPayload(request);

  if (isPublic) {
    if (pathname === "/auth/login" && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (requiresAdmin && session.userType !== "Admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
