import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-full px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bem-vindo{session?.name ? `, ${session.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use o menu para acessar as áreas disponíveis.
        </p>
      </div>
    </main>
  );
}
