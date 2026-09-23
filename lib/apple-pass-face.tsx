import { ImageResponse } from "next/og";

const WIDTH = 1125;
const HEIGHT = 432;

export async function applePassStripPng({
  breed,
  tutorName,
  vaccines,
}: {
  breed: string;
  tutorName: string;
  vaccines: string[];
}) {
  const lines = vaccines.length > 0 ? vaccines : ["Nenhum item sanitário"];
  const lineSize = lines.length > 4 ? 30 : lines.length > 3 ? 34 : 40;

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
          padding: "156px 48px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 2,
            color: "#A3A3A3",
          }}
        >
          VACINAS
        </div>
        {lines.map((line, index) => (
          <div
            key={`${index}-${line}`}
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: lineSize,
              lineHeight: 1.15,
              color: "#ffffff",
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: 12,
            fontSize: 32,
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
