import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import {
  certificatePath,
  getCertificateUrl,
  getVaccinationCertificate,
} from "@/lib/certificate";
import { todayIsoDate } from "@/lib/format";
import {
  PASSPORT_BACKGROUND,
  PASSPORT_TITLE,
  passportStatusColor,
  passportStatusLine,
} from "@/lib/passport";
import { DOG_SIZE_LABELS } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HERO_WIDTH = 1032;
const HERO_HEIGHT = 812;
const PRODUCTION_ORIGIN = "https://next-e2.vercel.app";
const QR_SIZE = 220;

async function passCertificateUrl(dogId: number) {
  try {
    const url = await getCertificateUrl(dogId);
    if (!url.includes("localhost")) return url;
  } catch {
    // No request scope.
  }
  return `${PRODUCTION_ORIGIN}${certificatePath(dogId)}`;
}

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
  const certificateUrl = await passCertificateUrl(dogId);
  const qrSrc = await QRCode.toDataURL(certificateUrl, {
    margin: 1,
    width: QR_SIZE,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#ffffff" },
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: `${HERO_WIDTH}px`,
          height: `${HERO_HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PASSPORT_BACKGROUND,
          fontFamily: "Arial, sans-serif",
          padding: "56px 80px 48px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: 0.4,
              lineHeight: 1,
            }}
          >
            {PASSPORT_TITLE}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 36,
              marginBottom: 12,
            }}
          />
          <img src={qrSrc} width={QR_SIZE} height={QR_SIZE} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
              width: "100%",
              fontSize: 24,
              fontWeight: 600,
              color: "#F2EDE6",
            }}
          >
            Escaneie para verificar este certificado
          </div>
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
