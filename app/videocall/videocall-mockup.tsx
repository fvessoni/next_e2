"use client";

import { useEffect, useState } from "react";

function IconMic({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      {off ? (
        <>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V8a3 3 0 0 0-5.94-.6" />
          <path d="M5 12a7 7 0 0 0 11 5.74M19 12a7 7 0 0 0-1.2-3.9" />
          <path d="M12 19v3M8 22h8M4 4l16 16" />
        </>
      ) : (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 22h8" />
        </>
      )}
    </svg>
  );
}

function IconCam({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      {off ? (
        <>
          <path d="M16 16H4a2 2 0 0 1-2-2V8" />
          <path d="M22 8l-6 4v-2a2 2 0 0 0-2-2H9" />
          <path d="M4 4l16 16" />
        </>
      ) : (
        <>
          <rect x="2" y="6" width="14" height="12" rx="2" />
          <path d="M16 10l6-3v10l-6-3z" />
        </>
      )}
    </svg>
  );
}

export function VideocallMockup() {
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <main className="min-h-screen bg-black" />;
  }

  if (ended) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kintal-logo.png"
          alt="Kintal Vax"
          width={88}
          height={88}
          className="h-20 w-20 rounded-full"
        />
        <h1 className="mt-6 text-2xl font-semibold">Chamada encerrada</h1>
        <p className="mt-2 max-w-sm text-center text-sm text-white/70">
          Esta é uma prévia da tele-consulta. Nenhuma ligação real foi feita.
        </p>
        <button
          type="button"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#F2B705] px-6 text-sm font-semibold text-black"
          onClick={() => setEnded(false)}
        >
          Entrar de novo
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kintal-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold">Kintal Vax</p>
            <p className="text-xs uppercase tracking-wider text-white/60">
              Tele-consulta · mockup
            </p>
          </div>
        </div>
        <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#F2B705]">
          Em andamento
        </p>
      </header>

      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-black pt-20 pb-36">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold tracking-wide text-[#F2B705]">
            DRA
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">Dra. Kintal</p>
            <p className="text-sm text-white/60">Veterinária · câmera ligada</p>
          </div>
        </div>
      </section>

      <aside className="absolute right-4 bottom-36 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl sm:right-6">
        <div
          className={`flex h-36 w-28 flex-col items-center justify-center sm:h-44 sm:w-32 ${
            cameraOff ? "bg-zinc-950" : "bg-zinc-800"
          }`}
        >
          {cameraOff ? (
            <p className="px-2 text-center text-xs text-white/50">Câmera off</p>
          ) : (
            <>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-[#F2B705]">
                VOCÊ
              </span>
              <p className="mt-2 text-xs font-medium">Tutor</p>
            </>
          )}
        </div>
      </aside>

      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-8">
        <p className="text-xs text-white/50">
          {muted ? "Microfone desligado" : "Microfone ligado"} · prévia sem áudio
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-pressed={muted}
            aria-label={muted ? "Ligar microfone" : "Desligar microfone"}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              muted ? "bg-white text-black" : "bg-white/15"
            }`}
            onClick={() => setMuted((value) => !value)}
          >
            <IconMic off={muted} />
          </button>
          <button
            type="button"
            aria-pressed={cameraOff}
            aria-label={cameraOff ? "Ligar câmera" : "Desligar câmera"}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              cameraOff ? "bg-white text-black" : "bg-white/15"
            }`}
            onClick={() => setCameraOff((value) => !value)}
          >
            <IconCam off={cameraOff} />
          </button>
          <button
            type="button"
            aria-label="Encerrar chamada"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E40014] text-lg font-semibold"
            onClick={() => setEnded(true)}
          >
            X
          </button>
        </div>
      </footer>
    </main>
  );
}
