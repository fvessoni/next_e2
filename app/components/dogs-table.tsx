"use client";

import { formatDate, sanitaryItemsValidity } from "@/lib/format";
import { tableHeadClass } from "@/lib/ui";
import { DOG_SIZE_LABELS, type Dog, type SanitaryItem } from "@/lib/types";

export function DogsTable({
  dogs,
  itemsByDog,
  tutorNameById,
  isPending = false,
  emptyMessage = "Nenhum cão cadastrado para este tutor.",
  onEdit,
  onDelete,
}: {
  dogs: Dog[];
  itemsByDog: Record<number, SanitaryItem[]>;
  tutorNameById?: Record<number, string>;
  isPending?: boolean;
  emptyMessage?: string;
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: number) => void;
}) {
  const showTutor = Boolean(tutorNameById);
  const colSpan = showTutor ? 8 : 7;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className={tableHeadClass}>Foto</th>
            <th className={tableHeadClass}>Nome</th>
            {showTutor && <th className={tableHeadClass}>Tutor</th>}
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
                colSpan={colSpan}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            dogs.map((dog) => (
              <tr
                key={dog.dog_id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  {dog.has_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/dogs/${dog.dog_id}/photo`}
                      alt={`Foto de ${dog.name}`}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {dog.name}
                </td>
                {showTutor && (
                  <td className="px-4 py-3 text-muted-foreground">
                    {tutorNameById?.[dog.tutor_id] ?? "—"}
                  </td>
                )}
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
                  <a
                    href={`/certificado/${dog.dog_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mr-2 text-sm font-medium text-foreground hover:underline"
                  >
                    Certificado
                  </a>
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
