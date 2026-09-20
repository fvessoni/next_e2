import { btnOutline } from "@/lib/ui";

function ColorfulWalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="3.2" rx="1" fill="#ea4335" />
      <rect x="3.5" y="6.6" width="17" height="2.4" rx="0.8" fill="#fbbc04" />
      <rect x="2.5" y="8" width="19" height="12" rx="2.2" fill="#1a73e8" />
      <rect x="2.5" y="11.2" width="19" height="3" fill="#34a853" />
      <rect x="14" y="12.4" width="6.2" height="4.4" rx="1.1" fill="#fff" />
      <circle cx="17.1" cy="14.6" r="1" fill="#fbbc04" />
    </svg>
  );
}

export function AddToGoogleWalletButton({ dogId }: { dogId: number }) {
  return (
    <a
      href={`/api/certificado/${dogId}/wallet`}
      className={`${btnOutline} gap-2 print:hidden`}
      aria-label="Adicionar à Carteira do Google"
    >
      <ColorfulWalletIcon />
      Carteira
    </a>
  );
}
