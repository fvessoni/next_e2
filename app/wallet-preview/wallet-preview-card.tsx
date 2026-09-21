"use client";

import { useState } from "react";

type Vaccine = { name: string; detail: string };

export function WalletPreviewCard({
  title,
  dogName,
  statusLine,
  nextDose,
  heroUrl,
  certificateUrl,
  videocallUrl,
  vaccines,
}: {
  title: string;
  dogName: string;
  statusLine: string;
  nextDose: string;
  heroUrl: string;
  certificateUrl: string;
  videocallUrl: string;
  vaccines: Vaccine[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#1c1c1e] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-white/50">
          Prévia da Carteira do Google
        </p>

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
              <p className="truncate text-sm text-[#F2B705]">{statusLine}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-white/60">
            Cartão aberto
          </h2>
          <article className="overflow-hidden rounded-3xl bg-black shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="" className="h-auto w-full bg-[#F9F7F1]" />
            <div className="px-5 pb-6 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                {title}
              </p>
              <p className="mt-1 text-2xl font-semibold">{dogName}</p>
              <p className="mt-1 text-sm text-[#F2B705]">{statusLine}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href={certificateUrl}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
                >
                  Ver certificado
                </a>
                <a
                  href={videocallUrl}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#F2B705] text-sm font-semibold text-black"
                >
                  Tele-consulta
                </a>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Próxima dose
                </p>
                <p className="mt-1 text-base font-medium">{nextDose}</p>
              </div>

              <button
                type="button"
                className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="text-sm font-semibold">Vacinas</span>
                <span className="text-xs text-white/60">
                  {open ? "Recolher" : `${vaccines.length} itens`}
                </span>
              </button>
              {open ? (
                <ul className="mt-2 space-y-3 rounded-2xl bg-white/5 p-4">
                  {vaccines.length === 0 ? (
                    <li className="text-sm text-white/60">Nenhum item sanitário</li>
                  ) : (
                    vaccines.map((vaccine) => (
                      <li key={vaccine.name + vaccine.detail}>
                        <p className="text-sm font-semibold uppercase">
                          {vaccine.name}
                        </p>
                        <p className="text-xs text-white/60">{vaccine.detail}</p>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
