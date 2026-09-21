import { ImageResponse } from "next/og";
import { getVaccinationCertificate } from "@/lib/certificate";
import { kintalLogoDataUrl } from "@/lib/kintal-logo";
import { DOG_SIZE_LABELS } from "@/lib/types";
import {
  PASSPORT_SUBTITLE,
  PASSPORT_TITLE,
  passportOverview,
  passportStatusLine,
} from "@/lib/passport";
import { todayIsoDate } from "@/lib/format";

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

  const { dog, tutor, items } = certificate;
  const today = todayIsoDate();
  const overview = passportOverview(items, today);
  const statusLine = passportStatusLine(items, today);
  const logoSrc = kintalLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1032px",
          height: "336px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#000000",
            padding: "16px 28px",
          }}
        >
          <img
            src={logoSrc}
            width={56}
            height={56}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              {PASSPORT_TITLE}
            </div>
            <div
              style={{
                display: "flex",
                color: "#D1C7BD",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {PASSPORT_SUBTITLE}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "18px 28px 20px",
          }}
        >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 48,
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
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "10px 20px",
              borderRadius: 24,
              backgroundColor: overview.allGood ? "#E8F5E9" : "#FFF3E0",
              color: overview.allGood ? "#2E7D32" : "#E65100",
              border: overview.allGood ? "1px solid #A5D6A7" : "1px solid #FFCC80",
            }}
          >
            {overview.statusLabel}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 18,
            color: "#C4B8AE",
          }}
        >
          {dog.breed} · {DOG_SIZE_LABELS[dog.size]} · Tutor {tutor.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: 0.4,
            color: "#F2B705",
          }}
        >
          {statusLine}
        </div>
        </div>
      </div>
    ),
    { width: 1032, height: 336, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
