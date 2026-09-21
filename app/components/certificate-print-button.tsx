"use client";

import { btnOutline } from "@/lib/ui";

export function CertificatePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${btnOutline} print:hidden`}
    >
      Imprimir
    </button>
  );
}
