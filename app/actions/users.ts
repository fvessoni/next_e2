"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-helpers";
import { getSession } from "@/lib/session";
import { USER_TYPES, type UserType } from "@/lib/types";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from "@/lib/users";

async function requireAdmin(): Promise<
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; errors: string[] }
> {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return { ok: false, errors: ["Acesso restrito a administradores."] };
  }
  return { ok: true, session };
}

function parseForm(formData: FormData, requirePassword: boolean) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user_type = String(formData.get("user_type") ?? "") as UserType;

  const errors: string[] = [];
  if (!name) errors.push("Nome é obrigatório.");
  if (!email) errors.push("E-mail é obrigatório.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("E-mail inválido.");
  }
  if (!USER_TYPES.includes(user_type)) errors.push("Tipo de usuário inválido.");
  if (requirePassword && password.length < 6) {
    errors.push("Senha deve ter pelo menos 6 caracteres.");
  }
  if (!requirePassword && password && password.length < 6) {
    errors.push("Nova senha deve ter pelo menos 6 caracteres.");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: { name, email, password: password || undefined, user_type },
  };
}

async function emailInUse(email: string, excludeUserId?: number) {
  const existing = await getUserByEmail(email);
  if (!existing) return false;
  if (excludeUserId !== undefined && existing.user_id === excludeUserId) {
    return false;
  }
  return true;
}

export async function createUserAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData, true);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await emailInUse(parsed.data.email)) {
    return { success: false as const, errors: ["Este e-mail já está em uso."] };
  }

  await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password!,
    user_type: parsed.data.user_type,
  });

  revalidatePath("/users");
  return { success: true as const };
}

export async function updateUserAction(userId: number, formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData, false);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  if (await emailInUse(parsed.data.email, userId)) {
    return { success: false as const, errors: ["Este e-mail já está em uso."] };
  }

  const updated = await updateUser(userId, {
    name: parsed.data.name,
    email: parsed.data.email,
    user_type: parsed.data.user_type,
    password: parsed.data.password,
  });

  if (!updated) {
    return { success: false as const, errors: ["Usuário não encontrado."] };
  }

  revalidatePath("/users");
  return { success: true as const };
}

export async function deleteUserAction(userId: number) {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  if (auth.session.user_id === userId) {
    return {
      success: false as const,
      errors: ["Você não pode excluir o próprio usuário."],
    };
  }

  const user = await getUserById(userId);
  if (!user) {
    return { success: false as const, errors: ["Usuário não encontrado."] };
  }

  const deleted = await deleteUser(userId);
  if (!deleted) {
    return { success: false as const, errors: ["Não foi possível excluir o usuário."] };
  }

  revalidatePath("/users");
  return { success: true as const };
}
