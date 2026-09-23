import { ImageResponse } from "next/og";
import { APPLE_BACK_HINT, TELECONSULT_BUTTON_LABEL } from "@/lib/passport";

const WIDTH = 1125;
const HEIGHT = 432;
const LABEL_SIZE = 30;

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
  const tight = lines.length > 3;
  const lineSize = lines.length > 5 ? 18 : tight ? 22 : 26;
  const lineBox = lines.length > 5 ? 20 : tight ? 24 : 26;
  const lineGap = lines.length > 5 ? 3 : tight ? 5 : 6;
  const nameGap = tight ? 16 : 24;
  const teleGap = tight ? 16 : 24;

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
          padding: "148px 48px 4px",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 48,
            flexShrink: 0,
            alignItems: "center",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          {dogName}
        </div>
        <div
          style={{ display: "flex", height: nameGap, width: "100%", flexShrink: 0 }}
        />
        <div
          style={{
            display: "flex",
            height: 30,
            flexShrink: 0,
            alignItems: "center",
            fontSize: LABEL_SIZE,
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
            style={{ display: "flex", flexDirection: "column", width: "100%", flexShrink: 0 }}
          >
            <div
              style={{
                display: "flex",
                height: index === 0 ? 6 : lineGap,
                width: "100%",
                flexShrink: 0,
              }}
            />
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
        <div
          style={{ display: "flex", height: teleGap, width: "100%", flexShrink: 0 }}
        />
        <div
          style={{
            display: "flex",
            height: 30,
            flexShrink: 0,
            alignItems: "center",
            fontSize: LABEL_SIZE,
            lineHeight: 1,
            letterSpacing: 2,
            color: "#A3A3A3",
          }}
        >
          {TELECONSULT_BUTTON_LABEL.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: lineBox,
            marginTop: 4,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: lineSize,
              lineHeight: 1,
              color: "#ffffff",
            }}
          >
            {APPLE_BACK_HINT}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              lineHeight: 1,
              color: "#F2EDE6",
            }}
          >
            {`${breed} · ${tutorName}`}
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );

  return Buffer.from(await response.arrayBuffer());
}
