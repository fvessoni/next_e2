import { ImageResponse } from "next/og";
import { getVaccinationCertificate } from "@/lib/certificate";
import { todayIsoDate } from "@/lib/format";
import {
  PASSPORT_BACKGROUND,
  passportStatusColor,
  passportStatusLine,
} from "@/lib/passport";
import { DOG_SIZE_LABELS } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HERO_WIDTH = 1032;
const HERO_HEIGHT = 812;

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

  const { dog, tutor, items } = certificate;
  const statusLine = passportStatusLine(items, todayIsoDate());

  return new ImageResponse(
    (
      <div
        style={{
          width: `${HERO_WIDTH}px`,
          height: `${HERO_HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: PASSPORT_BACKGROUND,
          fontFamily: "Arial, sans-serif",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: passportStatusColor(statusLine),
            lineHeight: 1.15,
          }}
        >
          {statusLine}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 120,
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
            marginTop: 28,
            fontSize: 48,
            fontWeight: 700,
            color: "#F2EDE6",
            lineHeight: 1.25,
          }}
        >
          {dog.breed} · {DOG_SIZE_LABELS[dog.size]}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 44,
            fontWeight: 700,
            color: "#F2EDE6",
          }}
        >
          Tutor {tutor.name}
        </div>
      </div>
    ),
    {
      width: HERO_WIDTH,
      height: HERO_HEIGHT,
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
