export function formatDate(isoDate: string): string {
  if (!isoDate?.trim()) return "—";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSanitaryItemCurrent(
  item: { valid_from: string; valid_to: string },
  today = todayIsoDate(),
): boolean {
  return item.valid_from <= today && today <= item.valid_to;
}

export function sanitaryItemsValidity(
  items: { valid_from: string; valid_to: string }[],
  today = todayIsoDate(),
): "none" | "valid" | "invalid" {
  if (items.length === 0) return "none";
  return items.every((item) => isSanitaryItemCurrent(item, today))
    ? "valid"
    : "invalid";
}
