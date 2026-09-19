"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  createDogAction,
  deleteDogAction,
  updateDogAction,
} from "@/app/actions/dogs";
import { DogsTable } from "@/app/components/dogs-table";
import { SanitaryItensCrud } from "@/app/components/sanitary-itens-crud";
import { todayIsoDate } from "@/lib/format";
import { btnOutline, btnPrimary, inputClass, selectClass } from "@/lib/ui";
import {
  DOG_SIZE_LABELS,
  DOG_SIZES,
  type Dog,
  type DogSize,
  type SanitaryItem,
} from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  name: "",
  breed: "",
  size: "Medium" as DogSize,
  registration_date: "",
};

export function DogsCrud({
  clientId,
  dogs,
  itemsByDog,
  startEditingDogId = null,
}: {
  clientId: number;
  dogs: Dog[];
  itemsByDog: Record<number, SanitaryItem[]>;
  startEditingDogId?: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  function openCreate() {
    setForm({ ...emptyForm, registration_date: todayIsoDate() });
    setEditingId(null);
    setErrors([]);
    setFormMode("create");
  }

  function openEdit(dog: Dog) {
    setForm({
      name: dog.name,
      breed: dog.breed,
      size: dog.size,
      registration_date: dog.registration_date,
    });
    setEditingId(dog.dog_id);
    setErrors([]);
    setFormMode("edit");
  }

  useEffect(() => {
    if (startEditingDogId == null) return;
    const dog = dogs.find((row) => row.dog_id === startEditingDogId);
    if (!dog) return;
    setForm({
      name: dog.name,
      breed: dog.breed,
      size: dog.size,
      registration_date: dog.registration_date,
    });
    setEditingId(dog.dog_id);
    setErrors([]);
    setFormMode("edit");
  }, [startEditingDogId]); // eslint-disable-line react-hooks/exhaustive-deps -- open only when the grid asks to edit a dog

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
          ? await updateDogAction(editingId, formData)
          : await createDogAction(clientId, formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      if (formMode === "create" && "dogId" in result) {
        setFormMode("edit");
        setEditingId(result.dogId);
        setErrors([]);
      } else {
        closeForm();
      }
      router.refresh();
    });
  }

  function handleDelete(dogId: number) {
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
    <div className="space-y-4 border-t border-border pt-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Cães</h3>
        <button type="button" onClick={openCreate} className={btnOutline}>
          + Novo cão
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

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Nome</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Raça</span>
            <input
              name="breed"
              required
              value={form.breed}
              onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Porte</span>
            <select
              name="size"
              required
              value={form.size}
              onChange={(e) =>
                setForm((f) => ({ ...f, size: e.target.value as DogSize }))
              }
              className={selectClass}
            >
              {DOG_SIZES.map((size) => (
                <option key={size} value={size}>
                  {DOG_SIZE_LABELS[size]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Data de cadastro</span>
            <input
              name="registration_date"
              type="date"
              required
              value={form.registration_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, registration_date: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={isPending} className={btnPrimary}>
              {isPending ? "Salvando…" : "Salvar cão"}
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

      {formMode === "edit" && editingId !== null && (
        <SanitaryItensCrud
          dogId={editingId}
          items={itemsByDog[editingId] ?? []}
        />
      )}

      <DogsTable
        dogs={dogs}
        itemsByDog={itemsByDog}
        isPending={isPending}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
