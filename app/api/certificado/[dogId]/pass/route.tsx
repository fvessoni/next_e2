import { ImageResponse } from "next/og";
import { getVaccinationCertificate } from "@/lib/certificate";
import { DOG_SIZE_LABELS } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dogId: string }> },
) {
  const dogId = Number((await params).dogId);
  if (!Number.isInteger(dogId)) {
    return new Response("Not found", { status: 404 });
  }

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) {
    return new Response("Not found", { status: 404 });
  }

  const { dog, tutor } = certificate;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1032px",
          height: "336px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000000",
          fontFamily: "Arial, sans-serif",
          padding: "36px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {dog.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 28,
            color: "#C4B8AE",
          }}
        >
          {dog.breed} · {DOG_SIZE_LABELS[dog.size]} · Tutor {tutor.name}
        </div>
      </div>
    ),
    { width: 1032, height: 336, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
