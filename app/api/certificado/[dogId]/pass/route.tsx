import { ImageResponse } from "next/og";
import { getVaccinationCertificate } from "@/lib/certificate";
import { kintalLogoDataUrl } from "@/lib/kintal-logo";
import { DOG_SIZE_LABELS } from "@/lib/types";
import {
  PASSPORT_SUBTITLE,
  PASSPORT_TITLE,
  passportAppliedLabel,
  passportDueLabel,
  passportNextDoseLabel,
  passportOverview,
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
  const overview = passportOverview(items, todayIsoDate());
  const logoSrc = kintalLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1032px",
          height: "336px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F9F7F1",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#3A2C24",
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
              color: "#3A2C24",
              lineHeight: 1,
            }}
          >
            {dog.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "8px 16px",
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
            color: "#8C7B70",
          }}
        >
          {dog.breed} · {DOG_SIZE_LABELS[dog.size]} · Tutor {tutor.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 18,
            backgroundColor: "#FFFFFF",
            border: "1px solid #D1C7BD",
            borderLeft: "8px solid #F2B705",
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#8C7B70",
            }}
          >
            <div style={{ display: "flex" }}>Próxima dose</div>
            <div
              style={{
                display: "flex",
                color: overview.urgent ? "#F2B705" : "#8C7B70",
              }}
            >
              {overview.nextBadge ?? ""}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontSize: 28,
              fontWeight: 700,
              color: "#3A2C24",
            }}
          >
            {passportNextDoseLabel(overview.next)}
          </div>
          <div style={{ display: "flex", marginTop: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", marginRight: 40 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#8C7B70",
                }}
              >
                Aplicada em
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#3A2C24",
                }}
              >
                {passportAppliedLabel(overview.next)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#8C7B70",
                }}
              >
                Próxima dose
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#3A2C24",
                }}
              >
                {passportDueLabel(overview.next)}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    ),
    { width: 1032, height: 336, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
