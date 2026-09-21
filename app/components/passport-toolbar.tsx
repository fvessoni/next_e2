"use client";

import { CertificatePrintButton } from "@/app/components/certificate-print-button";
import styles from "@/app/components/vaccination-passport.module.css";

export function PassportToolbar({
  dogId,
  showWalletButton,
}: {
  dogId: number;
  showWalletButton: boolean;
}) {
  return (
    <div className={styles.toolbar}>
      {showWalletButton ? (
        <a
          href={`/api/certificado/${dogId}/wallet`}
          className={styles.toolBtn}
          aria-label="Adicionar à Carteira do Google"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wallet-icon.svg" alt="" width={18} height={18} />
          Carteira
        </a>
      ) : null}
      <CertificatePrintButton className={styles.toolBtn} />
    </div>
  );
}
