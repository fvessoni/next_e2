import { getPool } from "./pg";
import type { CreateSanitaryItemInput, SanitaryItem } from "./types";

type SanitaryItemRow = {
  sanitary_item_id: number;
  dog_id: number;
  item: string;
  valid_from: string;
  valid_to: string;
  updated: string;
  observations: string;
};

function rowToItem(row: SanitaryItemRow): SanitaryItem {
  return {
    sanitary_item_id: row.sanitary_item_id,
    dog_id: row.dog_id,
    item: row.item,
    valid_from: row.valid_from,
    valid_to: row.valid_to,
    updated: row.updated,
    observations: row.observations,
  };
}

export async function getSanitaryItens(): Promise<SanitaryItem[]> {
  const { rows } = await getPool().query<SanitaryItemRow>(
    `SELECT sanitary_item_id, dog_id, item,
            valid_from::text, valid_to::text, updated::text, observations
     FROM sanitary_itens
     ORDER BY valid_to DESC, item ASC`,
  );
  return rows.map(rowToItem);
}

export async function getSanitaryItensByDogId(
  dogId: number,
): Promise<SanitaryItem[]> {
  const { rows } = await getPool().query<SanitaryItemRow>(
    `SELECT sanitary_item_id, dog_id, item,
            valid_from::text, valid_to::text, updated::text, observations
     FROM sanitary_itens
     WHERE dog_id = $1
     ORDER BY valid_to DESC, item ASC`,
    [dogId],
  );
  return rows.map(rowToItem);
}

export async function getSanitaryItemById(
  sanitaryItemId: number,
): Promise<SanitaryItem | undefined> {
  const { rows } = await getPool().query<SanitaryItemRow>(
    `SELECT sanitary_item_id, dog_id, item,
            valid_from::text, valid_to::text, updated::text, observations
     FROM sanitary_itens
     WHERE sanitary_item_id = $1`,
    [sanitaryItemId],
  );
  return rows[0] ? rowToItem(rows[0]) : undefined;
}

export async function createSanitaryItem(
  input: CreateSanitaryItemInput,
): Promise<SanitaryItem> {
  const { rows } = await getPool().query<SanitaryItemRow>(
    `INSERT INTO sanitary_itens
       (dog_id, item, valid_from, valid_to, updated, observations)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING sanitary_item_id, dog_id, item,
               valid_from::text, valid_to::text, updated::text, observations`,
    [
      input.dog_id,
      input.item.trim(),
      input.valid_from,
      input.valid_to,
      input.updated,
      input.observations.trim(),
    ],
  );
  return rowToItem(rows[0]);
}

export async function updateSanitaryItem(
  sanitaryItemId: number,
  input: Omit<CreateSanitaryItemInput, "dog_id">,
): Promise<SanitaryItem | null> {
  const { rows } = await getPool().query<SanitaryItemRow>(
    `UPDATE sanitary_itens
     SET item = $2, valid_from = $3, valid_to = $4, updated = $5, observations = $6
     WHERE sanitary_item_id = $1
     RETURNING sanitary_item_id, dog_id, item,
               valid_from::text, valid_to::text, updated::text, observations`,
    [
      sanitaryItemId,
      input.item.trim(),
      input.valid_from,
      input.valid_to,
      input.updated,
      input.observations.trim(),
    ],
  );
  return rows[0] ? rowToItem(rows[0]) : null;
}

export async function deleteSanitaryItem(
  sanitaryItemId: number,
): Promise<boolean> {
  const result = await getPool().query(
    `DELETE FROM sanitary_itens WHERE sanitary_item_id = $1`,
    [sanitaryItemId],
  );
  return (result.rowCount ?? 0) > 0;
}
