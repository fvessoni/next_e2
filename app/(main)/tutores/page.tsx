import { TutorsCrud } from "@/app/components/tutors-crud";
import { getDogs } from "@/lib/dogs";
import { getSanitaryItens } from "@/lib/sanitary-itens";
import { getSession } from "@/lib/session";
import { getTutors } from "@/lib/tutors";
import { redirect } from "next/navigation";
import type { Dog, SanitaryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TutoresPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const [tutors, dogs, items] = await Promise.all([
    getTutors(),
    getDogs(),
    getSanitaryItens(),
  ]);
  const dogsByTutor = dogs.reduce<Record<number, Dog[]>>((acc, dog) => {
    acc[dog.tutor_id] ??= [];
    acc[dog.tutor_id].push(dog);
    return acc;
  }, {});
  const itemsByDog = items.reduce<Record<number, SanitaryItem[]>>(
    (acc, item) => {
      acc[item.dog_id] ??= [];
      acc[item.dog_id].push(item);
      return acc;
    },
    {},
  );

  return (
    <main className="min-h-full px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <TutorsCrud
          tutors={tutors}
          dogsByTutor={dogsByTutor}
          itemsByDog={itemsByDog}
        />
      </div>
    </main>
  );
}
