import {
  APPLE_FEATURED_ACTION_LABEL,
  TELECONSULT_BUTTON_LABEL,
  TELECONSULT_URL,
} from "@/lib/passport";

export function AppleWalletPreview({
  statusLine,
  stripUrl,
  videocallUrl,
  qrSrc,
}: {
  statusLine: string;
  stripUrl: string;
  videocallUrl: string;
  qrSrc: string;
}) {
  return (
    <main id="apple" className="bg-[#0e0e10] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Prévia da Apple Wallet
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            O cartão fica igual. No iOS 26 o link abre no verso, pelo ⓘ. No
            iOS 27 a Apple também desenha o botão embaixo.
          </p>
        </div>

        <article className="overflow-hidden rounded-[1.6rem] bg-[#1a1a1a] pb-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stripUrl} alt="" className="block w-full" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-[4%] pt-[3%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kintal-logo.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div className="max-w-[58%] text-right">
                <p className="text-[10px] uppercase tracking-wide text-[#A3A3A3]">
                  Status
                </p>
                <p className="text-[13px] leading-tight text-white">{statusLine}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 flex w-36 flex-col items-center rounded-lg bg-white px-2 pb-2 pt-2 text-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="" width={128} height={128} className="h-32 w-32" />
            <span className="text-[11px]">Certificado</span>
          </div>
        </article>

        <a href={videocallUrl} className="mx-auto flex w-20 flex-col items-center gap-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-[1.15rem] bg-[#2c2c2e] text-[28px] leading-none">
            📅
          </span>
          <span className="text-center text-[11px] leading-tight text-white/90">
            {APPLE_FEATURED_ACTION_LABEL}
          </span>
        </a>

        <article className="overflow-hidden rounded-[1.6rem] bg-[#f4f1ea] px-5 py-5 text-[#1a1a1a]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#6b6560]">
            Verso · iOS 26
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-wide text-[#6b6560]">
            {TELECONSULT_BUTTON_LABEL}
          </p>
          <a
            href={videocallUrl}
            className="mt-1 block text-[15px] leading-snug text-[#0b57d0] underline"
          >
            {TELECONSULT_URL}
          </a>
        </article>
      </div>
    </main>
  );
}
