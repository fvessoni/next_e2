import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const file = readFileSync(path.join(process.cwd(), "public/kintal-logo.png"));
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
