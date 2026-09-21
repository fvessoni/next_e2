"use server";

import { revalidatePath } from "next/cache";
import { digitsOnly, isValidCpf, isValidMobile } from "@/lib/br";
import { getDogsByTutorId } from "@/lib/dogs";
import {
  scheduleGoogleWalletExpireForDogs,
  scheduleGoogleWalletSyncForDogs,
} from "@/lib/google-wallet";
import { getSession } from "@/lib/session";
import {
  createTutor,
  deleteTutor,
  getTutorByCpf,
  getTutorById,
  updateTutor,
} from "@/lib/tutors";

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

async function cpfInUse(cpf: string, excludeTutorId?: number) {
  const existing = await getTutorByCpf(cpf);
  if (!existing) return false;
  if (excludeTutorId !== undefined && existing.tutor_id === excludeTutorId) {
    return false;
  }
  return true;
}

export async function createTutorAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await cpfInUse(parsed.data.cpf)) {
    return { success: false as const, errors: ["Este CPF já está cadastrado."] };
  }

  const tutor = await createTutor(parsed.data);
  revalidatePath("/tutores");
  return { success: true as const, tutorId: tutor.tutor_id };
}

export async function updateTutorAction(tutorId: number, formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await cpfInUse(parsed.data.cpf, tutorId)) {
    return { success: false as const, errors: ["Este CPF já está cadastrado."] };
  }

  const updated = await updateTutor(tutorId, parsed.data);
  if (!updated) {
    return { success: false as const, errors: ["Tutor não encontrado."] };
  }

  const dogs = await getDogsByTutorId(tutorId);
  revalidatePath("/tutores");
  await scheduleGoogleWalletSyncForDogs(dogs.map((dog) => dog.dog_id));
  return { success: true as const };
}

export async function deleteTutorAction(tutorId: number) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const tutor = await getTutorById(tutorId);
  if (!tutor) {
    return { success: false as const, errors: ["Tutor não encontrado."] };
  }

  const dogs = await getDogsByTutorId(tutorId);
  const deleted = await deleteTutor(tutorId);
  if (!deleted) {
    return {
      success: false as const,
      errors: ["Não foi possível excluir o tutor."],
    };
  }

  revalidatePath("/tutores");
  await scheduleGoogleWalletExpireForDogs(dogs.map((dog) => dog.dog_id));
  return { success: true as const };
}
