import { TELECONSULT_BUTTON_LABEL, TELECONSULT_URL } from "@/lib/passport";

export function AppleWalletPreview({
  dogName,
  statusLine,
  breed,
  tutorName,
  vaccines,
  videocallUrl,
}: {
  dogName: string;
  statusLine: string;
  breed: string;
  tutorName: string;
  vaccines: string[];
  videocallUrl: string;
}) {
  const lines = vaccines.length === 0 ? ["Nenhum item sanitário"] : vaccines;

  return (
    <main id="apple" className="bg-[#0e0e10] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Prévia da Apple Wallet
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            O cartão termina no QR. As vacinas ficam na faixa de cima, e a
            tele-consulta é o link logo acima do código.
          </p>
        </div>

        <article className="overflow-hidden rounded-[1.6rem] bg-[#1c1c1e] px-4 pb-6 pt-4">
          <div className="flex items-start justify-between gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kintal-logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Status
              </p>
              <p className="text-[13px] leading-tight">{statusLine}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wide text-white/45">
              Vacinas
            </p>
            <div className="mt-1 space-y-1">
              {lines.map((line) => (
                <p key={line} className="text-[15px] leading-snug">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-3 text-right text-[13px] text-white/80">
              {breed} · {tutorName}
            </p>
          </div>

          <p className="mt-2 text-[32px] font-semibold leading-none">{dogName}</p>

          <a href={videocallUrl} className="mt-5 block">
            <p className="text-[10px] uppercase tracking-wide text-white/45">
              {TELECONSULT_BUTTON_LABEL}
            </p>
            <p className="text-[15px] leading-tight text-[#8ab4f8]">
              {TELECONSULT_URL.replace("https://", "")}
            </p>
          </a>

          <div className="mx-auto mt-5 flex h-36 w-36 flex-col items-center justify-center rounded-lg bg-white text-black">
            <span className="text-xs font-medium">QR</span>
            <span className="mt-1 text-[11px]">Certificado</span>
          </div>
        </article>
      </div>
    </main>
  );
}
