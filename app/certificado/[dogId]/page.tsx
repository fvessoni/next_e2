import { VaccinationPassport } from "@/app/components/vaccination-passport";
import { APP_NAME } from "@/app/components/brand-logo";
import { isGoogleWalletConfigured } from "@/lib/google-wallet";
import {
  certificateQrSvg,
  getCertificateUrl,
  getVaccinationCertificate,
} from "@/lib/certificate";
import { todayIsoDate } from "@/lib/format";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function parseDogId(value: string) {
  const dogId = Number(value);
  return Number.isInteger(dogId) ? dogId : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dogId: string }>;
}): Promise<Metadata> {
  const dogId = parseDogId((await params).dogId);
  if (dogId == null) {
    return { title: `Passaporte de vacinação | ${APP_NAME}` };
  }
  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) {
    return { title: `Passaporte de vacinação | ${APP_NAME}` };
  }
  return {
    title: `Passaporte de vacinação · ${certificate.dog.name} | ${APP_NAME}`,
    description: `Passaporte público de vacinação de ${certificate.dog.name}.`,
  };
}

export default async function VaccinationCertificatePage({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const dogId = parseDogId((await params).dogId);
  if (dogId == null) notFound();

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) notFound();

  const { dog, tutor, items } = certificate;
  const publicUrl = await getCertificateUrl(dog.dog_id);
  const qrSvg = await certificateQrSvg(publicUrl);

  return (
    <VaccinationPassport
      dog={dog}
      tutor={tutor}
      items={items}
      today={todayIsoDate()}
      publicUrl={publicUrl}
      qrSvg={qrSvg}
      showWalletButton={isGoogleWalletConfigured()}
    />
  );
}
