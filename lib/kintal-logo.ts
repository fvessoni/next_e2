import { readFileSync } from "fs";
import path from "path";

export function kintalLogoBuffer() {
  const candidates = [
    path.join(process.cwd(), "lib/kintal-logo.png"),
    path.join(process.cwd(), "public/kintal-logo.png"),
  ];
  for (const candidate of candidates) {
    try {
      return new Uint8Array(readFileSync(candidate));
    } catch {
      continue;
    }
  }
  throw new Error("kintal-logo.png missing");
}

export function kintalLogoDataUrl() {
  return `data:image/png;base64,${Buffer.from(kintalLogoBuffer()).toString("base64")}`;
}
