import { TELECONSULT_BUTTON_LABEL } from "@/lib/passport";

export function AppleWalletPreview({
  dogName,
  statusLine,
  breed,
  tutorName,
  nextDose,
  vaccines,
  videocallUrl,
}: {
  dogName: string;
  statusLine: string;
  breed: string;
  tutorName: string;
  nextDose: string;
  vaccines: string[];
  videocallUrl: string;
}) {
  const lines = vaccines.length === 0 ? ["Nenhum item sanitário"] : vaccines;

  return (
    <main id="apple" className="min-h-screen bg-[#0e0e10] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Prévia da Apple Wallet
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            A frente só mostra o nome, a raça e o tutor. A lista inteira e o
            botão ficam abaixo do QR, que é onde a Apple desenha.
          </p>
        </div>

        <article className="overflow-hidden rounded-[1.75rem] bg-[#1a1a1a]">
          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kintal-logo.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-md object-cover"
              />
              <p className="text-sm font-medium">Kintal Vax</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Status
              </p>
              <p className="text-sm">{statusLine}</p>
            </div>
          </div>

          <div className="px-5 pt-6">
            <p className="text-[10px] uppercase tracking-wide text-white/45">
              Cão
            </p>
            <p className="text-[28px] font-semibold leading-tight">{dogName}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 px-5">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Raça
              </p>
              <p className="text-[15px]">{breed}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Tutor
              </p>
              <p className="text-[15px]">{tutorName}</p>
            </div>
          </div>

          <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-lg bg-white text-xs font-medium text-black">
            QR
          </div>

          <div className="mt-6 space-y-4 border-t border-white/10 px-5 py-5">
            <div>
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
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Próxima dose
              </p>
              <p className="mt-0.5 text-[15px]">{nextDose}</p>
            </div>
            <a
              href={videocallUrl}
              className="flex min-h-12 items-center justify-center rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-black"
            >
              {TELECONSULT_BUTTON_LABEL}
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}
