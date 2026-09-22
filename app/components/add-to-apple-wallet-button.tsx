import { btnOutline } from "@/lib/ui";

export function AddToAppleWalletButton({ dogId }: { dogId: number }) {
  return (
    <a
      href={`/api/certificado/${dogId}/apple`}
      className={`${btnOutline} gap-2 print:hidden`}
      aria-label="Adicionar à Apple Wallet"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apple-wallet-icon.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5"
      />
      Apple Wallet
    </a>
  );
}
