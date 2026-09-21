import QRCode from "qrcode";
import { headers } from "next/headers";
import { getDogById } from "./dogs";
import { getSanitaryItensByDogId } from "./sanitary-itens";
import { getTutorById } from "./tutors";
import type { Dog, SanitaryItem, Tutor } from "./types";

export function certificatePath(dogId: number) {
  return `/certificado/${dogId}`;
}

export async function getPublicOrigin(): Promise<string> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3001";
  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getCertificateUrl(dogId: number): Promise<string> {
  const origin = await getPublicOrigin();
  return `${origin}${certificatePath(dogId)}`;
}

export async function getVaccinationCertificate(dogId: number): Promise<{
  dog: Dog;
  tutor: Tutor;
  items: SanitaryItem[];
} | null> {
  const dog = await getDogById(dogId);
  if (!dog) return null;
  const [tutor, items] = await Promise.all([
    getTutorById(dog.tutor_id),
    getSanitaryItensByDogId(dogId),
  ]);
  if (!tutor) return null;
  return { dog, tutor, items };
}

export async function certificateQrSvg(url: string): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
  return svg.replace(/<\?xml[^>]*>/, "").trim();
}
