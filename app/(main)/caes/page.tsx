import { DogsCrud } from "@/app/components/dogs-crud";
import { getDogs } from "@/lib/dogs";
import { getSanitaryItens } from "@/lib/sanitary-itens";
import { getSession } from "@/lib/session";
import { getTutors } from "@/lib/tutors";
import { redirect } from "next/navigation";
import type { SanitaryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CaesPage({
  searchParams,
}: {
  searchParams: Promise<{ dog?: string; tutor?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const startEditingDogId = Number.parseInt(params.dog ?? "", 10);
  const startTutorId = Number.parseInt(params.tutor ?? "", 10);

  const [tutors, dogs, items] = await Promise.all([
    getTutors(),
    getDogs(),
    getSanitaryItens(),
  ]);
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
        <DogsCrud
          dogs={dogs}
          tutors={tutors}
          itemsByDog={itemsByDog}
          startEditingDogId={
            Number.isInteger(startEditingDogId) ? startEditingDogId : null
          }
          startTutorId={Number.isInteger(startTutorId) ? startTutorId : null}
        />
      </div>
    </main>
  );
}
