"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { verifyUserPassword } from "@/lib/users";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await verifyUserPassword(email, password);
  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession(user);
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/auth/login");
}
