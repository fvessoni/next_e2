import { readFileSync } from "fs";
import path from "path";

export function kintalLogoDataUrl() {
  const candidates = [
    path.join(process.cwd(), "lib/kintal-logo.png"),
    path.join(process.cwd(), "public/kintal-logo.png"),
  ];
  for (const candidate of candidates) {
    try {
      return `data:image/png;base64,${readFileSync(candidate).toString("base64")}`;
    } catch {
      continue;
    }
  }
  throw new Error("kintal-logo.png missing");
}
