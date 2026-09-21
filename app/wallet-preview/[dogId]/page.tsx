import { getVaccinationCertificate } from "@/lib/certificate";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  PASSPORT_TITLE,
  passportOverview,
  passportStatusLine,
  sanitaryItemStatus,
  sanitaryItemStatusLabel,
} from "@/lib/passport";
import { notFound } from "next/navigation";
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
  const { dog, items } = certificate;
  const overview = passportOverview(items, today);
  const vaccines = items.map((item) => ({
    name: item.item,
    detail: `Aplicada em ${formatDate(item.valid_from)} — ${sanitaryItemStatusLabel(
      sanitaryItemStatus(item, today),
    )}`,
  }));

  return (
    <WalletPreviewCard
      title={PASSPORT_TITLE}
      dogName={dog.name}
      statusLine={passportStatusLine(items, today)}
      nextDose={
        overview.next
          ? `${overview.next.item} — ${formatDate(overview.next.valid_to)}`
          : "Nenhum item sanitário"
      }
      heroUrl={`/api/certificado/${dog.dog_id}/pass`}
      certificateUrl={`/certificado/${dog.dog_id}`}
      videocallUrl="/videocall"
      vaccines={vaccines}
    />
  );
}
