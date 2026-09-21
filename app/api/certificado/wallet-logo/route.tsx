import { NextResponse } from "next/server";
import { kintalLogoBuffer } from "@/lib/kintal-logo";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(kintalLogoBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
