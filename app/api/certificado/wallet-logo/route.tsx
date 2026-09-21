import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "660px",
          height: "660px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F2B705",
          color: "#3A2C24",
          fontSize: 420,
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
        }}
      >
        K
      </div>
    ),
    { width: 660, height: 660 },
  );
}
