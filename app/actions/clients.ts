"use server";

import { revalidatePath } from "next/cache";
import { digitsOnly, isValidCpf, isValidMobile } from "@/lib/br";
import {
  createClient,
  deleteClient,
  getClientByCpf,
  getClientById,
  updateClient,
} from "@/lib/clients";
import { getSession } from "@/lib/session";

async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, errors: ["Faça login para continuar."] };
  }
  return { ok: true as const, session };
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const cpf = digitsOnly(String(formData.get("cpf") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const mobile = digitsOnly(String(formData.get("mobile") ?? ""));

  const errors: string[] = [];
  if (!name) errors.push("Nome é obrigatório.");
  if (!cpf) errors.push("CPF é obrigatório.");
  else if (!isValidCpf(cpf)) errors.push("CPF inválido.");
  if (!email) errors.push("E-mail é obrigatório.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("E-mail inválido.");
  }
  if (!mobile) errors.push("Celular é obrigatório.");
  else if (!isValidMobile(mobile)) {
    errors.push("Celular deve ter 10 ou 11 dígitos.");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: { name, cpf, email, mobile },
  };
}

async function cpfInUse(cpf: string, excludeClientId?: number) {
  const existing = await getClientByCpf(cpf);
  if (!existing) return false;
  if (excludeClientId !== undefined && existing.client_id === excludeClientId) {
    return false;
  }
  return true;
}

export async function createClientAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await cpfInUse(parsed.data.cpf)) {
    return { success: false as const, errors: ["Este CPF já está cadastrado."] };
  }

  const client = await createClient(parsed.data);
  revalidatePath("/clientes");
  return { success: true as const, clientId: client.client_id };
}

export async function updateClientAction(clientId: number, formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await cpfInUse(parsed.data.cpf, clientId)) {
    return { success: false as const, errors: ["Este CPF já está cadastrado."] };
  }

  const updated = await updateClient(clientId, parsed.data);
  if (!updated) {
    return { success: false as const, errors: ["Cliente não encontrado."] };
  }

  revalidatePath("/clientes");
  return { success: true as const };
}

export async function deleteClientAction(clientId: number) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const client = await getClientById(clientId);
  if (!client) {
    return { success: false as const, errors: ["Cliente não encontrado."] };
  }

  const deleted = await deleteClient(clientId);
  if (!deleted) {
    return {
      success: false as const,
      errors: ["Não foi possível excluir o cliente."],
    };
  }

  revalidatePath("/clientes");
  return { success: true as const };
}
