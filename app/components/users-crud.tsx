"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/app/actions/users";
import { PasswordInput } from "@/app/components/password-input";
import {
  btnOutline,
  btnPrimary,
  cardClass,
  inputClass,
  pageSubtitle,
  pageTitle,
  selectClass,
  tableHeadClass,
} from "@/lib/ui";
import { USER_TYPES, type User, type UserType } from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  user_type: "User" as UserType,
};

export function UsersCrud({ users }: { users: User[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors([]);
    setFormMode("create");
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      user_type: user.user_type,
    });
    setEditingId(user.user_id);
    setErrors([]);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setErrors([]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result =
        formMode === "edit" && editingId !== null
          ? await updateUserAction(editingId, formData)
          : await createUserAction(formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  function handleDelete(userId: number) {
    if (!confirm("Excluir este usuário?")) return;

    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        alert(result.errors.join("\n"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Usuários</h1>
          <p className={`mt-1 ${pageSubtitle}`}>
            {users.length} {users.length === 1 ? "usuário" : "usuários"}
          </p>
        </div>
        <button type="button" onClick={openCreate} className={btnPrimary}>
          + Novo usuário
        </button>
      </header>

      {formMode && (
        <div className={`${cardClass} p-6`}>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {formMode === "create" ? "Novo usuário" : "Editar usuário"}
          </h2>

          {errors.length > 0 && (
            <ul className="mb-4 list-inside list-disc rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Nome</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">E-mail</span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Tipo</span>
              <select
                name="user_type"
                required
                value={form.user_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    user_type: e.target.value as UserType,
                  }))
                }
                className={selectClass}
              >
                {USER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">
                Senha
                {formMode === "edit" && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    (deixe em branco para manter a atual)
                  </span>
                )}
              </span>
              <PasswordInput
                id="user-password"
                name="password"
                required={formMode === "create"}
                minLength={formMode === "create" ? 6 : undefined}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder={formMode === "edit" ? "••••••••" : ""}
              />
            </label>

            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={isPending} className={btnPrimary}>
                {isPending ? "Salvando…" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className={btnOutline}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`overflow-hidden ${cardClass}`}>
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={tableHeadClass}>ID</th>
              <th className={tableHeadClass}>Nome</th>
              <th className={tableHeadClass}>E-mail</th>
              <th className={tableHeadClass}>Tipo</th>
              <th className={`${tableHeadClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhum usuário. Clique em &quot;Novo usuário&quot;.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.user_id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {user.user_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.user_type === "Admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.user_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="mr-2 text-sm font-medium text-foreground hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.user_id)}
                      disabled={isPending}
                      className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
