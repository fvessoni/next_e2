export function AddToGoogleWalletButton({ dogId }: { dogId: number }) {
  return (
    <a
      href={`/api/certificado/${dogId}/wallet`}
      className="inline-flex h-12 shrink-0 items-center print:hidden"
      aria-label="Adicionar à Carteira do Google"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/add-to-google-wallet.svg"
        alt="Add to Google Wallet"
        height={48}
        width={258}
      />
    </a>
  );
}
