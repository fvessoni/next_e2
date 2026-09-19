"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/app/actions/clients";
import { deleteDogAction } from "@/app/actions/dogs";
import { DogsCrud } from "@/app/components/dogs-crud";
import { DogsTable } from "@/app/components/dogs-table";
import { formatCpf, formatMobile } from "@/lib/br";
import {
  btnOutline,
  btnPrimary,
  cardClass,
  inputClass,
  pageSubtitle,
  pageTitle,
  tableHeadClass,
} from "@/lib/ui";
import type { ClientListRow, Dog, SanitaryItem } from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  cpf: "",
  name: "",
  email: "",
  mobile: "",
};

export function ClientsCrud({
  clients,
  dogsByClient,
  itemsByDog,
}: {
  clients: ClientListRow[];
  dogsByClient: Record<number, Dog[]>;
  itemsByDog: Record<number, SanitaryItem[]>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [startEditingDogId, setStartEditingDogId] = useState<number | null>(
    null,
  );
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setStartEditingDogId(null);
    setErrors([]);
    setFormMode("create");
  }

  function openEdit(client: ClientListRow, dogId: number | null = null) {
    setForm({
      cpf: formatCpf(client.cpf),
      name: client.name,
      email: client.email,
      mobile: formatMobile(client.mobile),
    });
    setEditingId(client.client_id);
    setStartEditingDogId(dogId);
    setErrors([]);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setStartEditingDogId(null);
    setErrors([]);
  }

  function toggleClientDogs(clientId: number) {
    setExpandedClientId((current) =>
      current === clientId ? null : clientId,
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result =
        formMode === "edit" && editingId !== null
          ? await updateClientAction(editingId, formData)
          : await createClientAction(formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      if (formMode === "create" && "clientId" in result) {
        setFormMode("edit");
        setEditingId(result.clientId);
        setErrors([]);
      } else {
        closeForm();
      }
      router.refresh();
    });
  }

  function handleDelete(clientId: number) {
    if (!confirm("Excluir este cliente?")) return;

    startTransition(async () => {
      const result = await deleteClientAction(clientId);
      if (!result.success) {
        alert(result.errors.join("\n"));
        return;
      }
      if (expandedClientId === clientId) setExpandedClientId(null);
      router.refresh();
    });
  }

  function handleDeleteDog(dogId: number) {
    if (!confirm("Excluir este cão?")) return;

    startTransition(async () => {
      const result = await deleteDogAction(dogId);
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
          <h1 className={pageTitle}>Clientes</h1>
          <p className={`mt-1 ${pageSubtitle}`}>
            {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
          </p>
        </div>
        <button type="button" onClick={openCreate} className={btnPrimary}>
          + Novo cliente
        </button>
      </header>

      {formMode && (
        <div className={`${cardClass} p-6`}>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {formMode === "create" ? "Novo cliente" : "Editar cliente"}
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

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">CPF</span>
              <input
                name="cpf"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))
                }
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Celular</span>
              <input
                name="mobile"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mobile: formatMobile(e.target.value),
                  }))
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
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputClass}
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

          {formMode === "edit" && editingId !== null && (
            <div className="mt-6">
              <DogsCrud
                clientId={editingId}
                dogs={dogsByClient[editingId] ?? []}
                itemsByDog={itemsByDog}
                startEditingDogId={startEditingDogId}
              />
            </div>
          )}
        </div>
      )}

      <div className={`overflow-hidden ${cardClass}`}>
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={tableHeadClass}>CPF</th>
              <th className={tableHeadClass}>Nome</th>
              <th className={tableHeadClass}>E-mail</th>
              <th className={tableHeadClass}>Celular</th>
              <th className={tableHeadClass}>Cães</th>
              <th className={`${tableHeadClass} text-right`}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhum cliente. Clique em &quot;Novo cliente&quot;.
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const dogs = dogsByClient[client.client_id] ?? [];
                const expanded = expandedClientId === client.client_id;

                return (
                  <Fragment key={client.client_id}>
                    <tr className="transition-colors hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                        {formatCpf(client.cpf)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {client.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatMobile(client.mobile)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {client.dogCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleClientDogs(client.client_id)}
                            aria-expanded={expanded}
                            className="font-medium text-foreground hover:underline"
                          >
                            {client.dogCount}
                          </button>
                        ) : (
                          client.dogCount
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          className="mr-2 text-sm font-medium text-foreground hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client.client_id)}
                          disabled={isPending}
                          className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="px-4 py-3">
                          <DogsTable
                            dogs={dogs}
                            itemsByDog={itemsByDog}
                            isPending={isPending}
                            onEdit={(dog) => openEdit(client, dog.dog_id)}
                            onDelete={handleDeleteDog}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
