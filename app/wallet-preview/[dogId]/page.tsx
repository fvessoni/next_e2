import { getVaccinationCertificate } from "@/lib/certificate";
import QRCode from "qrcode";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  passportOverview,
  passportStatusLine,
  sanitaryItemStatus,
  sanitaryItemStatusLabel,
} from "@/lib/passport";
import { notFound } from "next/navigation";
import { AppleWalletPreview } from "../apple-wallet-preview";
import { WalletPreviewCard } from "../wallet-preview-card";

export const dynamic = "force-dynamic";

function parseDogId(value: string) {
  const dogId = Number(value);
  return Number.isInteger(dogId) ? dogId : null;
}

export default async function WalletPreviewPage({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const dogId = parseDogId((await params).dogId);
  if (dogId == null) notFound();

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) notFound();

  const today = todayIsoDate();
  const { dog, tutor, items } = certificate;
  const overview = passportOverview(items, today);
  const vaccines = items.map((item) => ({
    name: item.item,
    detail: `${formatDate(item.valid_to)} · ${sanitaryItemStatusLabel(
      sanitaryItemStatus(item, today),
    )}`,
  }));
  const nextDose = overview.next
    ? `${overview.next.item} — ${formatDate(overview.next.valid_to)}`
    : "Nenhum item sanitário";
  const certificateUrl = `https://next-e2.vercel.app/certificado/${dog.dog_id}`;
  const qrSrc = await QRCode.toDataURL(certificateUrl, {
    margin: 0,
    width: 256,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#ffffff" },
  });

  return (
    <>
      <WalletPreviewCard
        dogName={dog.name}
        statusLine={passportStatusLine(items, today)}
        nextDose={nextDose}
        heroUrl={`/api/certificado/${dog.dog_id}/pass?v=qrspace`}
        certificateUrl={`/certificado/${dog.dog_id}`}
        videocallUrl="/videocall"
        vaccines={vaccines}
      />
      <AppleWalletPreview
        statusLine={passportStatusLine(items, today)}
        stripUrl={`/api/certificado/${dog.dog_id}/apple-strip`}
        videocallUrl="/videocall"
        qrSrc={qrSrc}
      />
    </>
  );
}
