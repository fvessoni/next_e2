import { NextResponse } from "next/server";
import { getDogPhoto } from "@/lib/dogs";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dogId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dogId = Number((await params).dogId);
  if (!Number.isInteger(dogId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const photo = await getDogPhoto(dogId);
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = new Uint8Array(photo.bytes);
  return new NextResponse(body, {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "private, no-store",
    },
  });
}
