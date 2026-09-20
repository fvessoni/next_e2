import { readFileSync } from "fs";
import path from "path";
import { importPKCS8, SignJWT } from "jose";
import { getCertificateUrl, getPublicOrigin, getVaccinationCertificate } from "@/lib/certificate";
import { formatDate, isSanitaryItemCurrent, todayIsoDate } from "@/lib/format";
import { DOG_SIZE_LABELS } from "@/lib/types";
import type { Dog, SanitaryItem, Tutor } from "@/lib/types";

const CLASS_SUFFIX = "kintalvax_certificate";
const PASS_TITLE = "KintalVax";
const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";
const PRODUCTION_ORIGIN = "https://next-e2.vercel.app";

type WalletCredentials = {
  issuerId: string;
  clientEmail: string;
  privateKey: string;
};

type GenericPass = {
  id: string;
  classId: string;
  genericType: "GENERIC_OTHER";
  hexBackgroundColor: string;
  state: "ACTIVE";
  cardTitle: LocalizedString;
  header: LocalizedString;
  subheader: LocalizedString;
  barcode: { type: "QR_CODE"; value: string; alternateText: string };
  textModulesData: { id: string; header: string; body: string }[];
  linksModuleData: { uris: { uri: string; description: string; id: string }[] };
  appLinkData: {
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

function nextExpiry(items: SanitaryItem[]) {
  if (items.length === 0) return null;
  return [...items].sort((a, b) => a.valid_to.localeCompare(b.valid_to))[0]
    .valid_to;
}

function sanitarySummary(items: SanitaryItem[], today: string) {
  if (items.length === 0) return "Nenhum item sanitário";
  return items
    .slice(0, 4)
    .map((item) => {
      const status = isSanitaryItemCurrent(item, today) ? "vigente" : "vencido";
      return `${item.item} (${status} até ${formatDate(item.valid_to)})`;
    })
    .join(" · ");
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
  const validityLabel = expiry
    ? items.every((item) => isSanitaryItemCurrent(item, today))
      ? formatDate(expiry)
      : `Vencido · ${formatDate(expiry)}`
    : "Sem itens";

  const object: GenericPass = {
    id: objectIdFor(issuerId, dog.dog_id),
    classId: classIdFor(issuerId),
    genericType: "GENERIC_OTHER",
    hexBackgroundColor: "#171717",
    state: "ACTIVE",
    cardTitle: loc(PASS_TITLE),
    header: loc(clip(dog.name, 40)),
    subheader: loc("Certificado de vacinação"),
    barcode: {
      type: "QR_CODE",
      value: certificateUrl,
      alternateText: certificateUrl,
    },
    textModulesData: [
      { id: "tutor", header: "Tutor", body: clip(tutor.name, 40) },
      {
        id: "dog",
        header: "Cão",
        body: clip(`${dog.breed} · ${DOG_SIZE_LABELS[dog.size]}`, 60),
      },
      {
        id: "sanitary",
        header: "Sanitário",
        body: clip(sanitarySummary(items, today), 120),
      },
      { id: "validade", header: "Validade", body: clip(validityLabel, 40) },
      {
        id: "web",
        header: "Certificado web",
        body: clip(certificateUrl, 80),
      },
    ],
    linksModuleData: {
      uris: [
        {
          id: "certificate",
          uri: certificateUrl,
          description: "Abrir certificado na web",
        },
      ],
    },
    appLinkData: {
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
  });
  const text = await response.text();
  return { response, text };
}

async function ensureClass(token: string, issuerId: string) {
  const id = classIdFor(issuerId);
  const get = await walletFetch(token, "GET", `${WALLET_API}/genericClass/${id}`);
  if (get.response.ok) return id;
  if (get.response.status !== 404) {
    throw new Error(`Wallet class lookup failed (${get.response.status}): ${get.text}`);
  }

  const insert = await walletFetch(token, "POST", `${WALLET_API}/genericClass`, {
    id,
  });
  if (!insert.response.ok && insert.response.status !== 409) {
    throw new Error(
      `Wallet class create failed (${insert.response.status}): ${insert.text}`,
    );
  }
  return id;
}

async function upsertObject(token: string, object: GenericPass) {
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

function walletOrigins(currentOrigin: string) {
  return [...new Set([currentOrigin, PRODUCTION_ORIGIN])];
}

export async function createGoogleWalletSaveUrl(
  dogId: number,
): Promise<string | null> {
  const credentials = getGoogleWalletCredentials();
  if (!credentials) return null;

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) return null;

  const origin = await getPublicOrigin();
  const certificateUrl = await getCertificateUrl(dogId);
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

  const key = await signingKey(credentials.privateKey);
  const jwt = await new SignJWT({
    iss: credentials.clientEmail,
    aud: "google",
    typ: "savetowallet",
    origins: walletOrigins(origin),
    payload: {
      genericObjects: [{ id: object.id }],
    },
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .sign(key);

  return `https://pay.google.com/gp/v/save/${jwt}`;
}
