import { readFileSync } from "fs";
import path from "path";
import { importPKCS8, SignJWT } from "jose";
import {
  certificatePath,
  getCertificateUrl,
  getPublicOrigin,
  getVaccinationCertificate,
} from "@/lib/certificate";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  PASSPORT_LOGO_PATH,
  PASSPORT_SUBTITLE,
  PASSPORT_TITLE,
  TELECONSULT_URL,
  passportAppliedLabel,
  passportDueLabel,
  passportNextDoseLabel,
  passportOverview,
  sanitaryItemStatusLabel,
  sanitaryItemStatus,
} from "@/lib/passport";
import type { Dog, SanitaryItem, Tutor } from "@/lib/types";
import passLayout from "@/lib/wallet-pass-layout.json";

const CLASS_SUFFIX = "kintalvax_certificate";
const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";
const PRODUCTION_ORIGIN = "https://next-e2.vercel.app";
const PASS_BACKGROUND = "#3A2C24";

type WalletCredentials = {
  issuerId: string;
  clientEmail: string;
  privateKey: string;
};

type WalletImage = {
  sourceUri: { uri: string };
  contentDescription?: LocalizedString;
};

type GenericPass = {
  id: string;
  classId: string;
  genericType: "GENERIC_OTHER";
  hexBackgroundColor: string;
  state: "ACTIVE";
  notifyPreference?: "NOTIFY_ON_UPDATE";
  cardTitle: LocalizedString;
  header: LocalizedString;
  subheader: LocalizedString;
  logo?: WalletImage;
  heroImage?: WalletImage;
  barcode: { type: "QR_CODE"; value: string; alternateText: string };
  textModulesData: { id: string; header: string; body: string }[];
  linksModuleData: {
    uris: {
      uri: string;
      description: string;
      id: string;
      localizedDescription: LocalizedString;
    }[];
  };
  appLinkData: {
    androidAppLinkInfo: {
      appTarget: { targetUri: { uri: string; description: string } };
    };
    webAppLinkInfo: {
      appTarget: { targetUri: { uri: string; description: string } };
    };
    displayText: LocalizedString;
  };
  validTimeInterval?: { end: { date: string } };
};

type LocalizedString = {
  defaultValue: { language: string; value: string };
};

let tokenCache: { token: string; expiresAt: number } | null = null;

function loc(value: string): LocalizedString {
  return { defaultValue: { language: "pt-BR", value } };
}

function clip(value: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function readJsonFile(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf-8")) as {
    client_email?: string;
    private_key?: string;
  };
}

function credentialsFromJson(data: {
  client_email?: string;
  private_key?: string;
}): Omit<WalletCredentials, "issuerId"> | null {
  const clientEmail = data.client_email?.trim();
  const privateKey = data.private_key?.replace(/\\n/g, "\n").trim();
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}

export function getGoogleWalletCredentials(): WalletCredentials | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID?.trim();
  if (!issuerId) return null;

  const rawJson = process.env.GOOGLE_WALLET_CREDENTIALS?.trim();
  if (rawJson) {
    try {
      const parsed = credentialsFromJson(JSON.parse(rawJson));
      if (parsed) return { issuerId, ...parsed };
    } catch {
      // Fall through to file / discrete env vars.
    }
  }

  const filePath =
    process.env.GOOGLE_WALLET_CREDENTIALS_FILE?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    path.join(process.cwd(), "google-wallet.json");
  try {
    const parsed = credentialsFromJson(readJsonFile(filePath));
    if (parsed) return { issuerId, ...parsed };
  } catch {
    // File is optional when email + private key are set.
  }

  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  ).trim();
  if (clientEmail && privateKey) {
    return { issuerId, clientEmail, privateKey };
  }

  return null;
}

export function isGoogleWalletConfigured() {
  return getGoogleWalletCredentials() != null;
}

function classIdFor(issuerId: string) {
  return `${issuerId}.${CLASS_SUFFIX}`;
}

function objectIdFor(issuerId: string, dogId: number) {
  return `${issuerId}.dog-${dogId}`;
}

function walletAssetUrl(pathname: string, version: string) {
  const url = new URL(pathname, PRODUCTION_ORIGIN);
  const safe = version
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (safe) url.searchParams.set("v", safe);
  return url.toString();
}

function classTemplateInfo() {
  return passLayout.genericClasses[0].classTemplateInfo;
}

function nextExpiry(items: SanitaryItem[]) {
  if (items.length === 0) return null;
  return [...items].sort((a, b) => a.valid_to.localeCompare(b.valid_to))[0]
    .valid_to;
}

function sanitaryModules(items: SanitaryItem[], today: string, skipId?: number) {
  return items
    .filter((item) => item.sanitary_item_id !== skipId)
    .slice(0, 6)
    .map((item) => ({
      id: `sanitary-${item.sanitary_item_id}`,
      header: clip(item.item, 40),
      body: clip(
        `${sanitaryItemStatusLabel(sanitaryItemStatus(item, today))} até ${formatDate(item.valid_to)}`,
        60,
      ),
    }));
}

function buildGenericObject(
  issuerId: string,
  dog: Dog,
  tutor: Tutor,
  items: SanitaryItem[],
  certificateUrl: string,
): GenericPass {
  const today = todayIsoDate();
  const expiry = nextExpiry(items);
  const overview = passportOverview(items, today);
  const assetVersion = [
    overview.statusLabel,
    overview.next?.item ?? "",
    overview.next?.valid_to ?? "",
    String(items.length),
  ].join("-");
  const history =
    items.length === 0
      ? "Nenhum item sanitário"
      : items
          .map((item) => {
            const status = sanitaryItemStatusLabel(
              sanitaryItemStatus(item, today),
            );
            return `${item.item} (${status} até ${formatDate(item.valid_to)})`;
          })
          .join(" · ");

  const object: GenericPass = {
    id: objectIdFor(issuerId, dog.dog_id),
    classId: classIdFor(issuerId),
    genericType: "GENERIC_OTHER",
    hexBackgroundColor: PASS_BACKGROUND,
    state: "ACTIVE",
    notifyPreference: "NOTIFY_ON_UPDATE",
    cardTitle: loc(PASSPORT_TITLE),
    header: loc(clip(dog.name, 40)),
    subheader: loc(PASSPORT_SUBTITLE),
    logo: {
      sourceUri: {
        uri: walletAssetUrl(PASSPORT_LOGO_PATH, "black"),
      },
      contentDescription: loc(PASSPORT_TITLE),
    },
    heroImage: {
      sourceUri: {
        uri: walletAssetUrl(
          `/api/certificado/${dog.dog_id}/pass`,
          assetVersion,
        ),
      },
      contentDescription: loc(PASSPORT_SUBTITLE),
    },
    barcode: {
      type: "QR_CODE",
      value: certificateUrl,
      alternateText: certificateUrl,
    },
    textModulesData: [
      {
        id: "status",
        header: "Passaporte",
        body: clip(overview.statusLabel, 40),
      },
      { id: "tutor", header: "Tutor", body: clip(tutor.name, 40) },
      {
        id: "next",
        header: "Próxima dose",
        body: clip(passportNextDoseLabel(overview.next), 40),
      },
      {
        id: "applied",
        header: "Aplicada em",
        body: passportAppliedLabel(overview.next),
      },
      {
        id: "due",
        header: "Validade",
        body: passportDueLabel(overview.next),
      },
      {
        id: "history",
        header: "Histórico de vacinas",
        body: clip(history, 200),
      },
      ...sanitaryModules(items, today, overview.next?.sanitary_item_id),
    ],
    linksModuleData: {
      uris: [
        {
          id: "certificate",
          uri: certificateUrl,
          description: certificateUrl,
          localizedDescription: loc("Abrir certificado na web"),
        },
        {
          id: "teleconsult",
          uri: TELECONSULT_URL,
          description: TELECONSULT_URL,
          localizedDescription: loc("Agende sua tele-consulta"),
        },
      ],
    },
    appLinkData: {
      androidAppLinkInfo: {
        appTarget: {
          targetUri: {
            uri: certificateUrl,
            description: "Certificado de vacinação na web",
          },
        },
      },
      webAppLinkInfo: {
        appTarget: {
          targetUri: {
            uri: certificateUrl,
            description: "Certificado de vacinação na web",
          },
        },
      },
      displayText: loc("Ver certificado"),
    },
  };

  if (expiry) {
    object.validTimeInterval = { end: { date: `${expiry}T23:59:59-03:00` } };
  }

  return object;
}

async function signingKey(privateKey: string) {
  return importPKCS8(privateKey, "RS256");
}

async function getAccessToken(credentials: WalletCredentials) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  const key = await signingKey(credentials.privateKey);
  const assertion = await new SignJWT({
    iss: credentials.clientEmail,
    scope: WALLET_SCOPE,
    aud: TOKEN_URL,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(12_000),
  });
  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description || json.error || "Google OAuth token request failed",
    );
  }

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return json.access_token;
}

async function walletFetch(
  token: string,
  method: string,
  url: string,
  payload?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: payload == null ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });
  const text = await response.text();
  return { response, text };
}

async function ensureClass(token: string, issuerId: string) {
  const id = classIdFor(issuerId);
  const payload = { id, classTemplateInfo: classTemplateInfo() };
  const get = await walletFetch(token, "GET", `${WALLET_API}/genericClass/${id}`);
  if (get.response.status === 404) {
    const insert = await walletFetch(token, "POST", `${WALLET_API}/genericClass`, payload);
    if (!insert.response.ok && insert.response.status !== 409) {
      throw new Error(
        `Wallet class create failed (${insert.response.status}): ${insert.text}`,
      );
    }
    return id;
  }
  if (!get.response.ok) {
    throw new Error(`Wallet class lookup failed (${get.response.status}): ${get.text}`);
  }

  const existing = JSON.parse(get.text) as Record<string, unknown>;
  delete existing.kind;
  const update = await walletFetch(
    token,
    "PUT",
    `${WALLET_API}/genericClass/${id}`,
    { ...existing, ...payload },
  );
  if (!update.response.ok) {
    console.error(
      "Wallet class update failed",
      update.response.status,
      update.text,
    );
  }
  return id;
}

function isUnreadableWalletImage(message: string) {
  return (
    message.includes("Image cannot be loaded") ||
    message.includes("Invalid image URL")
  );
}

async function putOrInsertObject(token: string, object: GenericPass) {
  const encodedId = encodeURIComponent(object.id);
  const get = await walletFetch(
    token,
    "GET",
    `${WALLET_API}/genericObject/${encodedId}`,
  );
  if (get.response.status === 404) {
    const insert = await walletFetch(
      token,
      "POST",
      `${WALLET_API}/genericObject`,
      object,
    );
    if (!insert.response.ok) {
      throw new Error(
        `Wallet object create failed (${insert.response.status}): ${insert.text}`,
      );
    }
    return;
  }
  if (!get.response.ok) {
    throw new Error(
      `Wallet object lookup failed (${get.response.status}): ${get.text}`,
    );
  }

  const update = await walletFetch(
    token,
    "PUT",
    `${WALLET_API}/genericObject/${encodedId}`,
    object,
  );
  if (!update.response.ok) {
    throw new Error(
      `Wallet object update failed (${update.response.status}): ${update.text}`,
    );
  }
}

async function upsertObject(token: string, object: GenericPass) {
  try {
    await putOrInsertObject(token, object);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isUnreadableWalletImage(message)) throw error;
    console.error("Wallet image rejected, retrying without hero", object.id);
  }

  const withoutHero: GenericPass = { ...object };
  delete withoutHero.heroImage;
  try {
    await putOrInsertObject(token, withoutHero);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isUnreadableWalletImage(message)) throw error;
    console.error("Wallet image rejected, retrying without logo", object.id);
  }

  const withoutImages: GenericPass = { ...object };
  delete withoutImages.heroImage;
  delete withoutImages.logo;
  await putOrInsertObject(token, withoutImages);
}

function walletOrigins(currentOrigin: string) {
  return [...new Set([currentOrigin, PRODUCTION_ORIGIN])];
}

async function passCertificateUrl(dogId: number) {
  try {
    const origin = await getPublicOrigin();
    if (!origin.includes("localhost")) {
      return `${origin}${certificatePath(dogId)}`;
    }
  } catch {
    // No request scope (or headers unavailable).
  }
  return `${PRODUCTION_ORIGIN}${certificatePath(dogId)}`;
}

async function walletObjectExists(token: string, objectId: string) {
  const encodedId = encodeURIComponent(objectId);
  const get = await walletFetch(
    token,
    "GET",
    `${WALLET_API}/genericObject/${encodedId}`,
  );
  if (get.response.status === 404) return false;
  if (!get.response.ok) {
    throw new Error(
      `Wallet object lookup failed (${get.response.status}): ${get.text}`,
    );
  }
  return true;
}

async function writeWalletPass(dogId: number, certificateUrl: string) {
  const credentials = getGoogleWalletCredentials();
  if (!credentials) return null;

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) return null;

  const object = buildGenericObject(
    credentials.issuerId,
    certificate.dog,
    certificate.tutor,
    certificate.items,
    certificateUrl,
  );
  const token = await getAccessToken(credentials);
  await ensureClass(token, credentials.issuerId);
  await upsertObject(token, object);
  return { credentials, object };
}

export async function syncGoogleWalletPass(dogId: number) {
  const credentials = getGoogleWalletCredentials();
  if (!credentials) return;

  try {
    const token = await getAccessToken(credentials);
    const objectId = objectIdFor(credentials.issuerId, dogId);
    if (!(await walletObjectExists(token, objectId))) return;
    await writeWalletPass(dogId, await passCertificateUrl(dogId));
    console.info("Google Wallet sync ok", dogId);
  } catch (error) {
    console.error("Google Wallet sync failed", dogId, error);
  }
}

export async function expireGoogleWalletPass(dogId: number) {
  const credentials = getGoogleWalletCredentials();
  if (!credentials) return;

  try {
    const token = await getAccessToken(credentials);
    const objectId = objectIdFor(credentials.issuerId, dogId);
    if (!(await walletObjectExists(token, objectId))) return;
    const encodedId = encodeURIComponent(objectId);
    const patch = await walletFetch(
      token,
      "PATCH",
      `${WALLET_API}/genericObject/${encodedId}`,
      { state: "EXPIRED" },
    );
    if (!patch.response.ok) {
      throw new Error(
        `Wallet object expire failed (${patch.response.status}): ${patch.text}`,
      );
    }
  } catch (error) {
    console.error("Google Wallet expire failed", dogId, error);
  }
}

export async function scheduleGoogleWalletSync(dogId: number) {
  await syncGoogleWalletPass(dogId);
}

export async function scheduleGoogleWalletSyncForDogs(dogIds: number[]) {
  if (dogIds.length === 0) return;
  await Promise.all(dogIds.map((id) => syncGoogleWalletPass(id)));
}

export async function scheduleGoogleWalletExpire(dogId: number) {
  await expireGoogleWalletPass(dogId);
}

export async function scheduleGoogleWalletExpireForDogs(dogIds: number[]) {
  if (dogIds.length === 0) return;
  await Promise.all(dogIds.map((id) => expireGoogleWalletPass(id)));
}

export async function createGoogleWalletSaveUrl(
  dogId: number,
): Promise<string | null> {
  const origin = await getPublicOrigin();
  const certificateUrl = await getCertificateUrl(dogId);
  const written = await writeWalletPass(dogId, certificateUrl);
  if (!written) return null;

  const key = await signingKey(written.credentials.privateKey);
  const jwt = await new SignJWT({
    iss: written.credentials.clientEmail,
    aud: "google",
    typ: "savetowallet",
    origins: walletOrigins(origin),
    payload: {
      genericObjects: [{ id: written.object.id }],
    },
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .sign(key);

  return `https://pay.google.com/gp/v/save/${jwt}`;
}
