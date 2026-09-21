import { formatDate, isSanitaryItemCurrent } from "@/lib/format";
import type { SanitaryItem } from "@/lib/types";

export const PASSPORT_TITLE = "Kintal Vax";
export const PASSPORT_SUBTITLE = "Passaporte de Vacinação";
export const TELECONSULT_URL = "https://kintalcoffedog.com.br";
export const PASSPORT_LOGO_PATH = "/api/certificado/wallet-logo";

function daysUntil(isoDate: string, today: string) {
  const [y1, m1, d1] = today.split("-").map(Number);
  const [y2, m2, d2] = isoDate.split("-").map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
  const start = Date.UTC(y1, m1 - 1, d1);
  const end = Date.UTC(y2, m2 - 1, d2);
  return Math.round((end - start) / 86_400_000);
}

export function sanitaryItemStatus(
  item: SanitaryItem,
  today: string,
): "valid" | "due" | "scheduled" {
  if (today < item.valid_from) return "scheduled";
  if (!isSanitaryItemCurrent(item, today)) return "due";
  if (daysUntil(item.valid_to, today) <= 14) return "due";
  return "valid";
}

export function sanitaryItemStatusLabel(
  status: ReturnType<typeof sanitaryItemStatus>,
) {
  if (status === "scheduled") return "Agendado";
  if (status === "due") return "Vencendo";
  return "Válida";
}

export function passportOverview(items: SanitaryItem[], today: string) {
  const sorted = [...items].sort((a, b) => a.valid_to.localeCompare(b.valid_to));
  const next = sorted[0] ?? null;
  const allGood =
    items.length > 0 &&
    items.every((item) => sanitaryItemStatus(item, today) === "valid");
  const nextStatus = next ? sanitaryItemStatus(next, today) : null;
  const urgent = nextStatus != null && nextStatus !== "valid";

  return {
    allGood,
    statusLabel:
      items.length === 0 ? "Sem itens" : allGood ? "Em dia" : "Atenção",
    next,
    urgent,
    nextBadge: urgent ? "URGENTE" : next ? "EM DIA" : null,
  };
}

export function passportNextDoseLabel(item: SanitaryItem | null) {
  if (!item) return "Nenhum item sanitário";
  return item.item;
}

export function passportAppliedLabel(item: SanitaryItem | null) {
  if (!item) return "—";
  return formatDate(item.valid_from);
}

export function passportDueLabel(item: SanitaryItem | null) {
  if (!item) return "—";
  return formatDate(item.valid_to);
}
