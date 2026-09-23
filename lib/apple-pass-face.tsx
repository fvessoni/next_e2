import { ImageResponse } from "next/og";

const WIDTH = 1125;
const HEIGHT = 432;

export async function applePassStripPng({
  dogName,
  breed,
  tutorName,
  vaccines,
}: {
  dogName: string;
  breed: string;
  tutorName: string;
  vaccines: string[];
}) {
  const lines = vaccines.length > 0 ? vaccines : ["Nenhum item sanitário"];
  const lineSize = lines.length > 5 ? 20 : lines.length > 3 ? 24 : 30;
  const lineBox = lines.length > 5 ? 22 : lines.length > 3 ? 26 : 32;
  const lineGap = lines.length > 5 ? 4 : lines.length > 3 ? 6 : 12;

  const response = new ImageResponse(
    (
      <div
        style={{
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
          padding: "168px 48px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 58,
            alignItems: "center",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          {dogName}
        </div>
        <div style={{ display: "flex", height: 32, width: "100%" }} />
        <div
          style={{
            display: "flex",
            height: 22,
            alignItems: "center",
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: 2,
            color: "#A3A3A3",
          }}
        >
          VACINAS
        </div>
        {lines.map((line, index) => (
          <div
            key={`${index}-${line}`}
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <div style={{ display: "flex", height: index === 0 ? 8 : lineGap, width: "100%" }} />
            <div
              style={{
                display: "flex",
                height: lineBox,
                alignItems: "center",
                fontSize: lineSize,
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              {line}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", height: 8, width: "100%" }} />
        <div
          style={{
            display: "flex",
            height: 28,
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            fontSize: 26,
            lineHeight: 1,
            color: "#F2EDE6",
          }}
        >
          {`${breed} · ${tutorName}`}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );

  return Buffer.from(await response.arrayBuffer());
}
