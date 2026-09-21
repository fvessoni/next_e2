import { PASSPORT_TITLE, TELECONSULT_BUTTON_LABEL } from "@/lib/passport";

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
  return (
    <main className="min-h-screen bg-[#1c1c1e] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Prévia da Carteira do Google
          </p>
          <p className="mt-2 text-xs text-white/45">
            A Carteira desenha o hero embaixo do botão. Isso não dá para
            mudar.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Cartão miniaturizado
          </h2>
          <div className="flex items-center gap-3 rounded-2xl bg-black p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kintal-logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{dogName}</p>
              <p className="truncate text-lg font-extrabold text-[#F2B705]">
                {statusLine}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Cartão aberto
          </h2>
          <article className="overflow-hidden rounded-3xl bg-black shadow-2xl">
            <div className="flex items-start gap-3 px-5 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kintal-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                  {PASSPORT_TITLE}
                </p>
                <p className="mt-0.5 text-2xl font-semibold">{dogName}</p>
                <p className="mt-1 text-lg font-extrabold text-[#F2B705]">
                  {statusLine}
                </p>
              </div>
            </div>

            <div className="px-5 pt-5">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Próxima dose
              </p>
              <p className="mt-1 text-base font-medium">{nextDose}</p>
            </div>

            <div className="mt-5 border-t border-white/10 px-5 pt-4">
              {vaccines.length === 0 ? (
                <p className="text-sm text-white/80">Nenhum item sanitário</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {vaccines.map((vaccine, index) => (
                    <li key={`${vaccine.name}-${index}`}>
                      <p className="text-sm font-medium">{vaccine.name}</p>
                      <p className="text-sm text-white/70">{vaccine.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-5 pt-5">
              <a
                href={videocallUrl}
                className="flex min-h-11 items-center justify-center rounded-full bg-[#F2B705] px-4 py-3 text-center text-sm font-semibold leading-snug text-black"
              >
                {TELECONSULT_BUTTON_LABEL}
              </a>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="" className="mt-5 h-auto w-full bg-black" />

            <div className="px-5 pb-6 pt-4">
              <a
                href={certificateUrl}
                className="inline-block text-sm text-[#8ab4f8] underline"
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
