"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import { deleteDogAction } from "@/app/actions/dogs";
import {
  createTutorAction,
  deleteTutorAction,
  updateTutorAction,
} from "@/app/actions/tutors";
import { DogsTable } from "@/app/components/dogs-table";
import { formatCpf, formatMobile } from "@/lib/br";
import {
  btnOutline,
  btnPrimary,
  cardClass,
  inputClass,
  linkClass,
  pageSubtitle,
  pageTitle,
  tableHeadClass,
} from "@/lib/ui";
import type { Dog, SanitaryItem, TutorListRow } from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  cpf: "",
  name: "",
  email: "",
  mobile: "",
};

export function TutorsCrud({
  tutors,
  dogsByTutor,
  itemsByDog,
}: {
  tutors: TutorListRow[];
  dogsByTutor: Record<number, Dog[]>;
  itemsByDog: Record<number, SanitaryItem[]>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedTutorId, setExpandedTutorId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors([]);
    setFormMode("create");
  }

  function openEdit(tutor: TutorListRow) {
    setForm({
      cpf: formatCpf(tutor.cpf),
      name: tutor.name,
      email: tutor.email,
      mobile: formatMobile(tutor.mobile),
    });
    setEditingId(tutor.tutor_id);
    setErrors([]);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setErrors([]);
  }

  function toggleTutorDogs(tutorId: number) {
    setExpandedTutorId((current) => (current === tutorId ? null : tutorId));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result =
        formMode === "edit" && editingId !== null
          ? await updateTutorAction(editingId, formData)
          : await createTutorAction(formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  function handleDelete(tutorId: number) {
    if (!confirm("Excluir este tutor?")) return;

    startTransition(async () => {
      const result = await deleteTutorAction(tutorId);
      if (!result.success) {
        alert(result.errors.join("\n"));
        return;
      }
      if (expandedTutorId === tutorId) setExpandedTutorId(null);
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

  if (formMode) {
    return (
      <section className="w-full space-y-6">
        <button type="button" onClick={closeForm} className={linkClass}>
          ← Voltar à lista
        </button>

        <div className={`${cardClass} p-6`}>
          <h1 className={`mb-4 ${pageTitle}`}>
            {formMode === "create" ? "Novo tutor" : "Editar tutor"}
          </h1>

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
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Tutores</h1>
          <p className={`mt-1 ${pageSubtitle}`}>
            {tutors.length} {tutors.length === 1 ? "tutor" : "tutores"}
          </p>
        </div>
        <button type="button" onClick={openCreate} className={btnPrimary}>
          + Novo tutor
        </button>
      </header>

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
            {tutors.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhum tutor. Clique em &quot;Novo tutor&quot;.
                </td>
              </tr>
            ) : (
              tutors.map((tutor) => {
                const dogs = dogsByTutor[tutor.tutor_id] ?? [];
                const expanded = expandedTutorId === tutor.tutor_id;

                return (
                  <Fragment key={tutor.tutor_id}>
                    <tr className="transition-colors hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                        {formatCpf(tutor.cpf)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {tutor.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tutor.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatMobile(tutor.mobile)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tutor.dogCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleTutorDogs(tutor.tutor_id)}
                            aria-expanded={expanded}
                            className="font-medium text-foreground hover:underline"
                          >
                            {tutor.dogCount}
                          </button>
                        ) : (
                          tutor.dogCount
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(tutor)}
                          className="mr-2 text-sm font-medium text-foreground hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tutor.tutor_id)}
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
                            onEdit={(dog) =>
                              router.push(`/caes?dog=${dog.dog_id}`)
                            }
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
