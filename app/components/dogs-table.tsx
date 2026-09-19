"use client";

import { formatDate, sanitaryItemsValidity } from "@/lib/format";
import { tableHeadClass } from "@/lib/ui";
import { DOG_SIZE_LABELS, type Dog, type SanitaryItem } from "@/lib/types";

export function DogsTable({
  dogs,
  itemsByDog,
  isPending = false,
  onEdit,
  onDelete,
}: {
  dogs: Dog[];
  itemsByDog: Record<number, SanitaryItem[]>;
  isPending?: boolean;
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className={tableHeadClass}>Nome</th>
            <th className={tableHeadClass}>Raça</th>
            <th className={tableHeadClass}>Porte</th>
            <th className={tableHeadClass}>Cadastro</th>
            <th className={`${tableHeadClass} text-center`}>Válido</th>
            <th className={`${tableHeadClass} text-right`}>Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {dogs.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Nenhum cão cadastrado para este cliente.
              </td>
            </tr>
          ) : (
            dogs.map((dog) => (
              <tr
                key={dog.dog_id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {dog.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{dog.breed}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {DOG_SIZE_LABELS[dog.size]}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(dog.registration_date)}
                </td>
                <td className="px-4 py-3 text-center">
                  <SanitaryValidityMark
                    status={sanitaryItemsValidity(
                      itemsByDog[dog.dog_id] ?? [],
                    )}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(dog)}
                    className="mr-2 text-sm font-medium text-foreground hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(dog.dog_id)}
                    disabled={isPending}
                    className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SanitaryValidityMark({
  status,
}: {
  status: ReturnType<typeof sanitaryItemsValidity>;
}) {
  if (status === "none") {
    return (
      <span className="text-muted-foreground" title="Sem itens sanitários">
        —
      </span>
    );
  }

  if (status === "valid") {
    return (
      <span
        className="text-base font-semibold text-emerald-600"
        title="Itens sanitários válidos"
        aria-label="Itens sanitários válidos"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      className="text-base font-semibold text-destructive"
      title="Itens sanitários vencidos"
      aria-label="Itens sanitários vencidos"
    >
      ✕
    </span>
  );
}
