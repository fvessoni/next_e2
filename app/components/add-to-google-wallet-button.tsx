import { btnOutline } from "@/lib/ui";

export function AddToGoogleWalletButton({ dogId }: { dogId: number }) {
  return (
    <a
      href={`/api/certificado/${dogId}/wallet`}
      className={`${btnOutline} gap-2 print:hidden`}
      aria-label="Adicionar ao Google Wallet"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/wallet-icon.svg" alt="" width={20} height={20} className="h-5 w-5" />
      Google Wallet
    </a>
  );
}
