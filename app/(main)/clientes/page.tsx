import { ClientsCrud } from "@/app/components/clients-crud";
import { getClients } from "@/lib/clients";
import { getDogs } from "@/lib/dogs";
import { getSanitaryItens } from "@/lib/sanitary-itens";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Dog, SanitaryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const [clients, dogs, items] = await Promise.all([
    getClients(),
    getDogs(),
    getSanitaryItens(),
  ]);
  const dogsByClient = dogs.reduce<Record<number, Dog[]>>((acc, dog) => {
    acc[dog.client_id] ??= [];
    acc[dog.client_id].push(dog);
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
        <ClientsCrud
          clients={clients}
          dogsByClient={dogsByClient}
          itemsByDog={itemsByDog}
        />
      </div>
    </main>
  );
}
