"use client";

import { btnOutline } from "@/lib/ui";

export function CertificatePrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className ?? `${btnOutline} print:hidden`}
    >
      Imprimir
    </button>
  );
}
