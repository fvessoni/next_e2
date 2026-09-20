import type { DogPhoto, DogPhotoType } from "./types";

export const MAX_DOG_PHOTO_BYTES = 2 * 1024 * 1024;

function sniffPhotoType(bytes: Buffer): DogPhotoType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  return null;
}

export async function parseDogPhoto(
  value: FormDataEntryValue | null,
): Promise<
  { ok: true; photo: DogPhoto | null } | { ok: false; error: string }
> {
  if (!(value instanceof File) || value.size === 0) {
    return { ok: true, photo: null };
  }
  if (value.size > MAX_DOG_PHOTO_BYTES) {
    return { ok: false, error: "A foto deve ter no máximo 2 MB." };
  }

  const bytes = Buffer.from(await value.arrayBuffer());
  const type = sniffPhotoType(bytes);
  if (!type) {
    return { ok: false, error: "A foto deve ser JPEG ou PNG." };
  }

  return { ok: true, photo: { bytes, type } };
}
