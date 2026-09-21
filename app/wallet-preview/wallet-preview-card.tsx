import {
  PASSPORT_BACKGROUND,
  PASSPORT_TITLE,
  WALLET_BUTTON_DISPLAY,
} from "@/lib/passport";

type Vaccine = { name: string; detail: string };

export function WalletPreviewCard({
  dogName,
  statusLine,
  nextDose,
  heroUrl,
  certificateUrl,
  videocallUrl,
  vaccines,
}: {
  dogName: string;
  statusLine: string;
  nextDose: string;
  heroUrl: string;
  certificateUrl: string;
  videocallUrl: string;
  vaccines: Vaccine[];
}) {
  const vaccineBody =
    vaccines.length === 0
      ? "Nenhum item sanitário"
      : vaccines
          .map((vaccine) => `${vaccine.name} — ${vaccine.detail}`)
          .join("\n");

  return (
    <main className="min-h-screen bg-[#0e0e10] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Prévia da Carteira do Google
          </p>
          <p className="mt-2 text-xs text-white/45">
            O que a Carteira do Google realmente desenha. Cores e tamanho
            de texto do app não dá para mudar.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Lista (cartão miniaturizado)
          </h2>
          <div
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: PASSPORT_BACKGROUND }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kintal-logo.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium leading-tight">
                {dogName}
              </p>
              <p className="truncate text-[13px] leading-tight text-white/70">
                {statusLine}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Cartão aberto
          </h2>
          <article
            className="overflow-hidden rounded-[1.75rem]"
            style={{ backgroundColor: PASSPORT_BACKGROUND }}
          >
            <div className="flex flex-col items-center px-6 pt-10 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kintal-logo.png"
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
              <p className="mt-5 text-lg font-medium">{PASSPORT_TITLE}</p>
              <p className="mt-1 text-sm text-white/70">{statusLine}</p>
              <p className="mt-1 text-[28px] font-semibold leading-tight">
                {dogName}
              </p>
            </div>

            <div className="mt-8 space-y-5 px-6 text-left">
              <div>
                <p className="text-[11px] font-medium text-white/55">
                  Próxima dose
                </p>
                <p className="mt-0.5 text-[15px]">{nextDose}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/55">Vacinas</p>
                <p className="mt-0.5 whitespace-pre-line text-[15px] leading-snug">
                  {vaccineBody}
                </p>
              </div>
            </div>

            <div className="px-6 pt-6">
              <a
                href={videocallUrl}
                className="flex min-h-12 items-center justify-center rounded-full bg-white px-4 py-3 text-center text-sm font-medium text-black"
              >
                {WALLET_BUTTON_DISPLAY}
              </a>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroUrl}
              alt=""
              className="mt-6 h-auto w-full"
              style={{ backgroundColor: PASSPORT_BACKGROUND }}
            />

            <div className="px-6 py-5">
              <a
                href={certificateUrl}
                className="text-[15px] text-[#8ab4f8]"
              >
                Ver certificado
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
