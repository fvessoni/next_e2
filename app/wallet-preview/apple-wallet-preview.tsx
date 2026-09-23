import { TELECONSULT_BUTTON_LABEL, TELECONSULT_URL } from "@/lib/passport";

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
            A faixa é o arquivo do cartão. A Wallet desenha o logo, o status e
            o link por cima.
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

          <a href={videocallUrl} className="mt-4 block px-[4%]">
            <p className="text-[10px] uppercase tracking-wide text-[#A3A3A3]">
              {TELECONSULT_BUTTON_LABEL}
            </p>
            <p className="text-[13px] leading-tight text-white">{TELECONSULT_URL}</p>
          </a>

          <div className="mx-auto mt-5 flex w-36 flex-col items-center rounded-lg bg-white px-2 pb-2 pt-2 text-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="" width={128} height={128} className="h-32 w-32" />
            <span className="text-[11px]">Certificado</span>
          </div>
        </article>
      </div>
    </main>
  );
}
