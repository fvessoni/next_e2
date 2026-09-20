"use server";

import { revalidatePath } from "next/cache";
import { getDogById } from "@/lib/dogs";
import {
  createSanitaryItem,
  deleteSanitaryItem,
  getSanitaryItemById,
  updateSanitaryItem,
} from "@/lib/sanitary-itens";
import { getSession } from "@/lib/session";

async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, errors: ["Faça login para continuar."] };
  }
  return { ok: true as const, session };
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseForm(formData: FormData) {
  const item = String(formData.get("item") ?? "").trim();
  const valid_from = String(formData.get("valid_from") ?? "").trim();
  const valid_to = String(formData.get("valid_to") ?? "").trim();
  const updated = String(formData.get("updated") ?? "").trim();
  const observations = String(formData.get("observations") ?? "").trim();

  const errors: string[] = [];
  if (!item) errors.push("Item é obrigatório.");
  if (!valid_from) errors.push("Data inicial é obrigatória.");
  else if (!isIsoDate(valid_from)) errors.push("Data inicial inválida.");
  if (!valid_to) errors.push("Data final é obrigatória.");
  else if (!isIsoDate(valid_to)) errors.push("Data final inválida.");
  if (valid_from && valid_to && valid_to < valid_from) {
    errors.push("Data final deve ser igual ou posterior à data inicial.");
  }
  if (!updated) errors.push("Data de atualização é obrigatória.");
  else if (!isIsoDate(updated)) errors.push("Data de atualização inválida.");

  return {
    ok: errors.length === 0,
    errors,
    data: { item, valid_from, valid_to, updated, observations },
  };
}

export async function createSanitaryItemAction(
  dogId: number,
  formData: FormData,
) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const dog = await getDogById(dogId);
  if (!dog) {
    return { success: false as const, errors: ["Cão não encontrado."] };
  }

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  await createSanitaryItem({ dog_id: dogId, ...parsed.data });
  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const };
}

export async function updateSanitaryItemAction(
  sanitaryItemId: number,
  formData: FormData,
) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  const updated = await updateSanitaryItem(sanitaryItemId, parsed.data);
  if (!updated) {
    return { success: false as const, errors: ["Item sanitário não encontrado."] };
  }

  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const };
}

export async function deleteSanitaryItemAction(sanitaryItemId: number) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const item = await getSanitaryItemById(sanitaryItemId);
  if (!item) {
    return { success: false as const, errors: ["Item sanitário não encontrado."] };
  }

  const deleted = await deleteSanitaryItem(sanitaryItemId);
  if (!deleted) {
    return {
      success: false as const,
      errors: ["Não foi possível excluir o item sanitário."],
    };
  }

  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const };
}
