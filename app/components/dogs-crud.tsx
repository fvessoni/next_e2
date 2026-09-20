"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  createDogAction,
  deleteDogAction,
  updateDogAction,
} from "@/app/actions/dogs";
import { DogsTable } from "@/app/components/dogs-table";
import { SanitaryItensCrud } from "@/app/components/sanitary-itens-crud";
import { todayIsoDate } from "@/lib/format";
import {
  btnOutline,
  btnPrimary,
  cardClass,
  inputClass,
  linkClass,
  pageSubtitle,
  pageTitle,
  selectClass,
} from "@/lib/ui";
import {
  DOG_SIZE_LABELS,
  DOG_SIZES,
  type Dog,
  type DogSize,
  type SanitaryItem,
  type Tutor,
} from "@/lib/types";

type FormMode = "create" | "edit" | null;

const emptyForm = {
  tutor_id: 0,
  name: "",
  breed: "",
  size: "Medium" as DogSize,
  registration_date: "",
};

export function DogsCrud({
  dogs,
  tutors,
  itemsByDog,
  startEditingDogId = null,
  startTutorId = null,
}: {
  dogs: Dog[];
  tutors: Tutor[];
  itemsByDog: Record<number, SanitaryItem[]>;
  startEditingDogId?: number | null;
  startTutorId?: number | null;
}) {
  const router = useRouter();
  const tutorNameById = Object.fromEntries(
    tutors.map((tutor) => [tutor.tutor_id, tutor.name]),
  );
  const initialDog =
    startEditingDogId != null
      ? (dogs.find((row) => row.dog_id === startEditingDogId) ?? null)
      : null;

  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>(
    initialDog ? "edit" : null,
  );
  const [editingId, setEditingId] = useState<number | null>(
    initialDog?.dog_id ?? null,
  );
  const [form, setForm] = useState(
    initialDog
      ? {
          tutor_id: initialDog.tutor_id,
          name: initialDog.name,
          breed: initialDog.breed,
          size: initialDog.size,
          registration_date: initialDog.registration_date,
        }
      : emptyForm,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialDog?.has_photo ? `/api/dogs/${initialDog.dog_id}/photo` : null,
  );
  const [hasStoredPhoto, setHasStoredPhoto] = useState(
    Boolean(initialDog?.has_photo),
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function clearPhotoPreview() {
    setPhotoPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return null;
    });
  }

  function resetPhotoInput() {
    if (photoInputRef.current) photoInputRef.current.value = "";
    setRemovePhoto(false);
    setHasStoredPhoto(false);
    clearPhotoPreview();
  }

  function defaultTutorId() {
    if (startTutorId && tutors.some((tutor) => tutor.tutor_id === startTutorId)) {
      return startTutorId;
    }
    return tutors[0]?.tutor_id ?? 0;
  }

  function openCreate() {
    setForm({
      ...emptyForm,
      tutor_id: defaultTutorId(),
      registration_date: todayIsoDate(),
    });
    setEditingId(null);
    setErrors([]);
    resetPhotoInput();
    setFormMode("create");
  }

  function openEdit(dog: Dog) {
    setForm({
      tutor_id: dog.tutor_id,
      name: dog.name,
      breed: dog.breed,
      size: dog.size,
      registration_date: dog.registration_date,
    });
    setEditingId(dog.dog_id);
    setErrors([]);
    if (photoInputRef.current) photoInputRef.current.value = "";
    setRemovePhoto(false);
    setHasStoredPhoto(dog.has_photo);
    clearPhotoPreview();
    setPhotoPreview(
      dog.has_photo ? `/api/dogs/${dog.dog_id}/photo` : null,
    );
    setFormMode("edit");
  }

  useEffect(() => {
    if (startEditingDogId == null) return;
    const dog = dogs.find((row) => row.dog_id === startEditingDogId);
    if (dog) openEdit(dog);
  }, [startEditingDogId]); // eslint-disable-line react-hooks/exhaustive-deps

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setErrors([]);
    resetPhotoInput();
    if (startEditingDogId != null) router.replace("/caes");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result =
        formMode === "edit" && editingId !== null
          ? await updateDogAction(editingId, formData)
          : await createDogAction(formData);

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      if (
        formMode === "create" &&
        "dogId" in result &&
        typeof result.dogId === "number"
      ) {
        setFormMode("edit");
        setEditingId(result.dogId);
        setHasStoredPhoto(Boolean(photoInputRef.current?.files?.length));
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
      if (editingId === dogId) closeForm();
      router.refresh();
    });
  }

  if (formMode) {
    return (
      <section className="w-full space-y-6">
        <button type="button" onClick={closeForm} className={linkClass}>
          ← Voltar à lista
        </button>

        <div className={`${cardClass} p-6 space-y-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className={pageTitle}>
              {formMode === "create" ? "Novo cão" : "Editar cão"}
            </h1>
            {formMode === "edit" && editingId !== null && (
              <a
                href={`/certificado/${editingId}`}
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                Ver certificado
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            {errors.length > 0 && (
              <ul className="list-inside list-disc rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Tutor</span>
              <select
                name="tutor_id"
                required
                disabled={formMode === "edit"}
                value={form.tutor_id || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tutor_id: Number(e.target.value) }))
                }
                className={selectClass}
              >
                <option value="" disabled>
                  Selecione o tutor
                </option>
                {tutors.map((tutor) => (
                  <option key={tutor.tutor_id} value={tutor.tutor_id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
              {formMode === "edit" && (
                <input type="hidden" name="tutor_id" value={form.tutor_id} />
              )}
            </label>

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
                onChange={(e) =>
                  setForm((f) => ({ ...f, breed: e.target.value }))
                }
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
              <span className="font-medium text-foreground">
                Data de cadastro
              </span>
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

            <label className="flex flex-col gap-2 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Foto</span>
              {photoPreview && !removePhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Foto do cão"
                  className="h-28 w-28 rounded-md border border-border object-cover"
                />
              )}
              <input
                ref={photoInputRef}
                name="photo"
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setRemovePhoto(false);
                  setPhotoPreview((current) => {
                    if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
                    return file ? URL.createObjectURL(file) : hasStoredPhoto && editingId
                      ? `/api/dogs/${editingId}/photo`
                      : null;
                  });
                }}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              />
              {formMode === "edit" && hasStoredPhoto && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    name="remove_photo"
                    value="1"
                    checked={removePhoto}
                    onChange={(e) => {
                      setRemovePhoto(e.target.checked);
                      if (e.target.checked && photoInputRef.current) {
                        photoInputRef.current.value = "";
                      }
                    }}
                  />
                  Remover foto
                </label>
              )}
              <span className="text-xs text-muted-foreground">
                JPEG ou PNG, até 2 MB.
              </span>
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

          {formMode === "edit" && editingId !== null && (
            <SanitaryItensCrud
              dogId={editingId}
              items={itemsByDog[editingId] ?? []}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Cães</h1>
          <p className={`mt-1 ${pageSubtitle}`}>
            {dogs.length} {dogs.length === 1 ? "cão" : "cães"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={tutors.length === 0}
          className={btnPrimary}
        >
          + Novo cão
        </button>
      </header>

      {tutors.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Cadastre um tutor antes de adicionar cães.
        </p>
      )}

      <DogsTable
        dogs={dogs}
        itemsByDog={itemsByDog}
        tutorNameById={tutorNameById}
        isPending={isPending}
        emptyMessage='Nenhum cão cadastrado. Clique em "Novo cão".'
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </section>
  );
}
