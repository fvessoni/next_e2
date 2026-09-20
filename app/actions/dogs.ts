"use server";

import { revalidatePath } from "next/cache";
import { parseDogPhoto } from "@/lib/dog-photo";
import { createDog, deleteDog, getDogById, updateDog } from "@/lib/dogs";
import { getSession } from "@/lib/session";
import { getTutorById } from "@/lib/tutors";
import { DOG_SIZES, type DogPhoto, type DogSize } from "@/lib/types";

async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, errors: ["Faça login para continuar."] };
  }
  return { ok: true as const, session };
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const breed = String(formData.get("breed") ?? "").trim();
  const size = String(formData.get("size") ?? "") as DogSize;
  const registration_date = String(
    formData.get("registration_date") ?? "",
  ).trim();

  const errors: string[] = [];
  if (!name) errors.push("Nome do cão é obrigatório.");
  if (!breed) errors.push("Raça é obrigatória.");
  if (!DOG_SIZES.includes(size)) errors.push("Porte inválido.");
  if (!registration_date) errors.push("Data de cadastro é obrigatória.");
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(registration_date)) {
    errors.push("Data de cadastro inválida.");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: { name, breed, size, registration_date },
  };
}

async function photoFromForm(
  formData: FormData,
  { allowRemove }: { allowRemove: boolean },
): Promise<
  | { ok: true; photo?: DogPhoto | null }
  | { ok: false; errors: string[] }
> {
  if (allowRemove && String(formData.get("remove_photo") ?? "") === "1") {
    return { ok: true, photo: null };
  }
  const parsed = await parseDogPhoto(formData.get("photo"));
  if (!parsed.ok) return { ok: false, errors: [parsed.error] };
  return { ok: true, photo: parsed.photo ?? undefined };
}

export async function createDogAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const tutorId = Number(formData.get("tutor_id"));
  const tutor = Number.isInteger(tutorId)
    ? await getTutorById(tutorId)
    : undefined;
  if (!tutor) {
    return { success: false as const, errors: ["Tutor não encontrado."] };
  }

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  const photo = await photoFromForm(formData, { allowRemove: false });
  if (!photo.ok) return { success: false as const, errors: photo.errors };

  const dog = await createDog({
    tutor_id: tutorId,
    ...parsed.data,
    photo: photo.photo ?? null,
  });
  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const, dogId: dog.dog_id };
}

export async function updateDogAction(dogId: number, formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { success: false as const, errors: parsed.errors };

  const photo = await photoFromForm(formData, { allowRemove: true });
  if (!photo.ok) return { success: false as const, errors: photo.errors };

  const updated = await updateDog(dogId, { ...parsed.data, photo: photo.photo });
  if (!updated) {
    return { success: false as const, errors: ["Cão não encontrado."] };
  }

  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const };
}

export async function deleteDogAction(dogId: number) {
  const auth = await requireUser();
  if (!auth.ok) return { success: false as const, errors: auth.errors };

  const dog = await getDogById(dogId);
  if (!dog) {
    return { success: false as const, errors: ["Cão não encontrado."] };
  }

  const deleted = await deleteDog(dogId);
  if (!deleted) {
    return {
      success: false as const,
      errors: ["Não foi possível excluir o cão."],
    };
  }

  revalidatePath("/caes");
  revalidatePath("/tutores");
  return { success: true as const };
}
