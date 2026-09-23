import { getVaccinationCertificate } from "@/lib/certificate";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  passportOverview,
  passportStatusLine,
  sanitaryItemStatus,
  sanitaryItemStatusLabel,
} from "@/lib/passport";
import { DOG_SIZE_LABELS } from "@/lib/types";
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
        dogName={dog.name}
        statusLine={passportStatusLine(items, today)}
        breed={`${dog.breed} · ${DOG_SIZE_LABELS[dog.size]}`}
        tutorName={tutor.name}
        vaccines={vaccines.map(
          (vaccine) => `${vaccine.name} — ${vaccine.detail}`,
        )}
        videocallUrl="/videocall"
      />
    </>
  );
}
