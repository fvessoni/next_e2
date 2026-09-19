import { redirect } from "next/navigation";
import { UsersCrud } from "@/app/components/users-crud";
import { isAdmin } from "@/lib/auth-helpers";
import { getSession } from "@/lib/session";
import { getUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!isAdmin(session)) {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <main className="min-h-full px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <UsersCrud users={users} />
      </div>
    </main>
  );
}
