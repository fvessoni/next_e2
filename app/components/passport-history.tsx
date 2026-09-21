"use client";

import { useState } from "react";
import styles from "@/app/components/vaccination-passport.module.css";

export function PassportHistory({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.history} data-open={open ? "true" : undefined}>
      <button
        type="button"
        className={styles.historySummary}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {summary}
      </button>
      {open ? children : null}
    </div>
  );
}
