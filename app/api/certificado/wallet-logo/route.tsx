import { ImageResponse } from "next/og";
import { kintalLogoDataUrl } from "@/lib/kintal-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const logoSrc = kintalLogoDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "660px",
          height: "660px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3A2C24",
        }}
      >
        <img src={logoSrc} width={280} height={455} />
      </div>
    ),
    {
      width: 660,
      height: 660,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
