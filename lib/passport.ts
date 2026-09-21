import { formatDate } from "@/lib/format";
import type { SanitaryItem } from "@/lib/types";

export const PASSPORT_TITLE = "Kintal Vax";
export const PASSPORT_SUBTITLE = "Passaporte de Vacinação";
export const TELECONSULT_URL = "https://next-e2.vercel.app/videocall";
export const TELECONSULT_BUTTON_LABEL = "Tele-consulta veterinária";
export const WALLET_BUTTON_DISPLAY = TELECONSULT_BUTTON_LABEL;
export const PASSPORT_LOGO_PATH = "/kintal-logo.png";
export const PASSPORT_BACKGROUND = "#1a1a1a";

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
): "valid" | "due" | "expired" | "scheduled" {
  if (today < item.valid_from) return "scheduled";
  if (today > item.valid_to) return "expired";
  if (daysUntil(item.valid_to, today) <= 15) return "due";
  return "valid";
}

export function sanitaryItemStatusLabel(
  status: ReturnType<typeof sanitaryItemStatus>,
) {
  if (status === "scheduled") return "Agendado";
  if (status === "expired") return "Vencida";
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

function countLabel(count: number, singular: string, plural: string) {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural}`;
}

export function passportStatusLine(items: SanitaryItem[], today: string) {
  const overview = passportOverview(items, today);
  if (items.length === 0) return "Sem itens";
  if (overview.allGood) return "Em dia";
  const expiredCount = items.filter(
    (item) => sanitaryItemStatus(item, today) === "expired",
  ).length;
  const dueCount = items.filter(
    (item) => sanitaryItemStatus(item, today) === "due",
  ).length;
  const parts: string[] = [];
  if (expiredCount > 0) {
    parts.push(countLabel(expiredCount, "vacina vencida", "vacinas vencidas"));
  }
  if (dueCount > 0) {
    parts.push(countLabel(dueCount, "vacina vencendo", "vacinas vencendo"));
  }
  if (parts.length === 0) return "Atenção";
  return `Atenção — ${parts.join(", ")}`;
}

export function passportStatusColor(statusLine: string) {
  if (statusLine === "Em dia") return "#4ADE80";
  if (statusLine.includes("vencida")) return "#F04438";
  if (statusLine.startsWith("Atenção")) return "#F2B705";
  return "#F2EDE6";
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
