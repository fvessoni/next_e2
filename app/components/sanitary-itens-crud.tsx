"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createSanitaryItemAction,
  deleteSanitaryItemAction,
  updateSanitaryItemAction,
} from "@/app/actions/sanitary-itens";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  btnOutline,
  btnPrimary,
  inputClass,
  tableHeadClass,
  textareaClass,
} from "@/lib/ui";
import type { SanitaryItem } from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  item: "",
  valid_from: "",
  valid_to: "",
  updated: "",
  observations: "",
};

export function SanitaryItensCrud({
  dogId,
  items,
}: {
  dogId: number;
  items: SanitaryItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    const today = todayIsoDate();
    setForm({
      ...emptyForm,
      valid_from: today,
      valid_to: today,
      updated: today,
    });
    setEditingId(null);
    setErrors([]);
    setFormMode("create");
  }

  function openEdit(row: SanitaryItem) {
    setForm({
      item: row.item,
      valid_from: row.valid_from,
      valid_to: row.valid_to,
      updated: row.updated,
      observations: row.observations,
    });
    setEditingId(row.sanitary_item_id);
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
          ? await updateSanitaryItemAction(editingId, formData)
          : await createSanitaryItemAction(dogId, formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  function handleDelete(sanitaryItemId: number) {
    if (!confirm("Excluir este item sanitário?")) return;

    startTransition(async () => {
      const result = await deleteSanitaryItemAction(sanitaryItemId);
      if (!result.success) {
        alert(result.errors.join("\n"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">
          Itens sanitários
        </h4>
        <button type="button" onClick={openCreate} className={btnOutline}>
          + Novo item
        </button>
      </div>

      {formMode && (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {errors.length > 0 && (
            <ul className="list-inside list-disc rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Item</span>
            <input
              name="item"
              required
              value={form.item}
              onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Válido de</span>
            <input
              name="valid_from"
              type="date"
              required
              value={form.valid_from}
              onChange={(e) =>
                setForm((f) => ({ ...f, valid_from: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Válido até</span>
            <input
              name="valid_to"
              type="date"
              required
              value={form.valid_to}
              onChange={(e) =>
                setForm((f) => ({ ...f, valid_to: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Atualizado</span>
            <input
              name="updated"
              type="date"
              required
              value={form.updated}
              onChange={(e) =>
                setForm((f) => ({ ...f, updated: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Observações</span>
            <textarea
              name="observations"
              value={form.observations}
              onChange={(e) =>
                setForm((f) => ({ ...f, observations: e.target.value }))
              }
              className={textareaClass}
            />
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={isPending} className={btnPrimary}>
              {isPending ? "Salvando…" : "Salvar item"}
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
      )}

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={tableHeadClass}>Item</th>
              <th className={tableHeadClass}>Válido de</th>
              <th className={tableHeadClass}>Válido até</th>
              <th className={tableHeadClass}>Atualizado</th>
              <th className={tableHeadClass}>Observações</th>
              <th className={`${tableHeadClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum item sanitário para este cão.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.sanitary_item_id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.item}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(row.valid_from)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(row.valid_to)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(row.updated)}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                    {row.observations || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="mr-2 text-sm font-medium text-foreground hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.sanitary_item_id)}
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
    </div>
  );
}
