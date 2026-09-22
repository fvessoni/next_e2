import { SignJWT } from "jose";
import { getVaccinationCertificate } from "@/lib/certificate";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  passportNextDoseLabel,
  passportOverview,
  passportStatusLine,
  sanitaryItemStatus,
  sanitaryItemStatusLabel,
} from "@/lib/passport";
import { DOG_SIZE_LABELS } from "@/lib/types";

const PRODUCTION_ORIGIN = "https://next-e2.vercel.app";

type PassTemplate = {
  id: string;
  description?: string;
  organizationName?: string;
  colors?: {
    backgroundColor?: string;
    labelColor?: string;
    textColor?: string;
  };
  barcode?: {
    format?: string;
    payload?: string;
    altText?: string;
  };
  data?: {
    dataFields?: Array<{
      uniqueName?: string;
      label?: string;
      appleWalletFieldRenderOptions?: {
        positionSettings?: { section?: string; priority?: number };
      };
    }>;
  };
};

type MemberRecord = {
  id: string;
  externalId?: string;
  programId?: string;
  tierId?: string;
};

let readyTemplate: Promise<void> | null = null;

export function isPasskitConfigured() {
  return Boolean(
    process.env.PASSKIT_API_KEY &&
      process.env.PASSKIT_API_SECRET &&
      process.env.PASSKIT_API_PREFIX,
  );
}

function clip(value: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function passHost() {
  const prefix = process.env.PASSKIT_API_PREFIX ?? "";
  return prefix.includes("pub1")
    ? "https://pub1.pskt.io"
    : "https://pub2.pskt.io";
}

async function authToken() {
  const key = process.env.PASSKIT_API_KEY;
  const secret = process.env.PASSKIT_API_SECRET;
  if (!key || !secret) throw new Error("PassKit is not configured");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ uid: key })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(new TextEncoder().encode(secret));
}

async function passkitFetch(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; text: string }> {
  const prefix = process.env.PASSKIT_API_PREFIX?.replace(/\/$/, "");
  if (!prefix) throw new Error("PassKit is not configured");
  const token = await authToken();
  const response = await fetch(`${prefix}${path}`, {
    method,
    headers: {
      Authorization: token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  return { status: response.status, text };
}

function parseJson<T>(text: string): T {
  return JSON.parse(text) as T;
}

async function programId() {
  if (process.env.PASSKIT_PROGRAM_ID) return process.env.PASSKIT_PROGRAM_ID;
  const listed = await passkitFetch("GET", "/members/programs");
  if (listed.status !== 200) {
    throw new Error(`PassKit programs failed (${listed.status})`);
  }
  const payload = parseJson<{ result?: { id?: string } }>(listed.text);
  const id = payload.result?.id;
  if (!id) throw new Error("PassKit program was not found");
  return id;
}

function tierId() {
  return process.env.PASSKIT_TIER_ID || "base";
}

function textField(
  uniqueName: string,
  label: string,
  section: string,
  priority: number,
) {
  return {
    uniqueName,
    templateId: "",
    fieldType: "META",
    isRequired: false,
    label,
    localizedLabel: null,
    dataType: "TEXT",
    defaultValue: "",
    localizedDefaultValue: null,
    validation: "",
    userCanSetValue: true,
    currencyCode: "",
    appleWalletFieldRenderOptions: {
      textAlignment: "LEFT",
      positionSettings: { section, priority },
      changeMessage: "",
      localizedChangeMessage: null,
      dateStyle: "DATE_TIME_STYLE_DO_NOT_USE",
      timeStyle: "DATE_TIME_STYLE_DO_NOT_USE",
      numberStyle: "NUMBER_STYLE_DO_NOT_USE",
      suppressLinkDetection: [],
      ignoreTimezone: false,
      isRelativeDate: false,
    },
    dataCollectionFieldRenderOptions: {
      helpText: "",
      localizedHelpText: null,
      displayOrder: 0,
      placeholder: "",
      selectOptions: [],
      localizedPlaceholder: null,
      autocomplete: false,
      addressRenderOptions: null,
      localizedYearPlaceholder: "",
      localizedMonthPlaceholder: "",
      localizedDayPlaceholder: "",
      collectionDataType: "DATA_TYPE_NONE",
    },
    usage: ["USAGE_APPLE_WALLET", "USAGE_GOOGLE_PAY"],
    googlePayFieldRenderOptions: {
      googlePayPosition: "GOOGLE_PAY_TEXT_MODULE",
      textModulePriority: priority,
    },
    defaultTelCountryCode: "",
  };
}

function hideField(template: PassTemplate, uniqueName: string) {
  const field = template.data?.dataFields?.find(
    (item) => item.uniqueName === uniqueName,
  );
  const position = field?.appleWalletFieldRenderOptions?.positionSettings;
  if (position) position.section = "FIELD_SECTION_DO_NOT_USE";
}

async function loadTemplate(id: string) {
  const listed = await passkitFetch("GET", "/templates");
  if (listed.status !== 200) {
    throw new Error(`PassKit template failed (${listed.status})`);
  }
  const payload = parseJson<{ result?: { template?: PassTemplate } }>(
    listed.text,
  );
  const template = payload.result?.template;
  if (!template || template.id !== id) {
    throw new Error("PassKit template was not found");
  }
  return template;
}

async function ensureTemplate(templateId: string) {
  if (!readyTemplate) {
    readyTemplate = shapeTemplate(templateId).catch((error) => {
      readyTemplate = null;
      throw error;
    });
  }
  await readyTemplate;
}

async function shapeTemplate(templateId: string) {
  const template = await loadTemplate(templateId);
  const fields = template.data?.dataFields ?? [];
  const already =
    template.description === "Passaporte de vacinação" &&
    fields.some((field) => field.uniqueName === "meta.status");
  if (already) return;

  hideField(template, "members.member.points");
  hideField(template, "members.tier.name");
  const name = fields.find((field) => field.uniqueName === "person.displayName");
  if (name) {
    name.label = "Cão";
    const position = name.appleWalletFieldRenderOptions?.positionSettings;
    if (position) {
      position.section = "PRIMARY_FIELDS";
      position.priority = 0;
    }
  }
  template.data = template.data ?? {};
  template.data.dataFields = fields.filter(
    (field) =>
      field.uniqueName !== "universal.info" &&
      !field.uniqueName?.startsWith("meta."),
  );
  template.data.dataFields.push(
    textField("meta.status", "Status", "HEADER_FIELDS", 0),
    textField("meta.breed", "Raça", "SECONDARY_FIELDS", 0),
    textField("meta.tutor", "Tutor", "SECONDARY_FIELDS", 1),
    textField("meta.proxima", "Próxima dose", "AUXILIARY_FIELDS", 0),
    textField("meta.vacinas", "Vacinas", "BACK_FIELDS", 0),
    textField("meta.certUrl", "Certificado", "BACK_FIELDS", 1),
  );
  template.description = "Passaporte de vacinação";
  template.organizationName = "Kintal Vax";
  template.colors = {
    ...template.colors,
    backgroundColor: "#1a1a1a",
    labelColor: "#A3A3A3",
    textColor: "#ffffff",
  };
  template.barcode = {
    ...template.barcode,
    format: "QR",
    payload: "${meta.certUrl}",
    altText: "Certificado",
  };
  const updated = await passkitFetch("PUT", "/template", template);
  if (updated.status !== 200) {
    throw new Error(`PassKit template update failed (${updated.status})`);
  }
}

async function findMember(program: string, externalId: string) {
  const found = await passkitFetch(
    "GET",
    `/members/member/externalId/${program}/${encodeURIComponent(externalId)}`,
  );
  if (found.status === 404) return null;
  if (found.status !== 200) {
    throw new Error(`PassKit member lookup failed (${found.status})`);
  }
  return parseJson<MemberRecord>(found.text);
}

export async function createAppleWalletPassUrl(dogId: number) {
  if (!isPasskitConfigured()) return null;
  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) return null;

  const { dog, tutor, items } = certificate;
  const today = todayIsoDate();
  const overview = passportOverview(items, today);
  const next = overview.next;
  const vaccineLines =
    items.length === 0
      ? "Nenhum item sanitário"
      : items
          .slice(0, 8)
          .map(
            (item) =>
              `${item.item} — ${formatDate(item.valid_to)} · ${sanitaryItemStatusLabel(
                sanitaryItemStatus(item, today),
              )}`,
          )
          .join("\n");
  const certificateUrl = `${PRODUCTION_ORIGIN}/certificado/${dog.dog_id}`;
  const program = await programId();
  const tier = tierId();
  const tierRecord = await passkitFetch(
    "GET",
    `/members/tier/${program}/${encodeURIComponent(tier)}`,
  );
  if (tierRecord.status !== 200) {
    throw new Error(`PassKit tier failed (${tierRecord.status})`);
  }
  const templateId = parseJson<{ passTemplateId?: string }>(tierRecord.text)
    .passTemplateId;
  if (!templateId) throw new Error("PassKit tier has no template");
  await ensureTemplate(templateId);

  const externalId = `dog-${dog.dog_id}`;
  const memberBody = {
    programId: program,
    tierId: tier,
    externalId,
    person: { displayName: clip(dog.name, 40) },
    metaData: {
      status: clip(passportStatusLine(items, today), 40),
      breed: clip(`${dog.breed} · ${DOG_SIZE_LABELS[dog.size]}`, 40),
      tutor: clip(tutor.name, 40),
      proxima: clip(
        next
          ? `${passportNextDoseLabel(next)} — ${formatDate(next.valid_to)}`
          : "Nenhum item sanitário",
        40,
      ),
      vacinas: clip(vaccineLines, 800),
      certUrl: certificateUrl,
    },
  };

  const existing = await findMember(program, externalId);
  const saved = existing
    ? await passkitFetch("PUT", "/members/member", {
        ...memberBody,
        id: existing.id,
      })
    : await passkitFetch("POST", "/members/member", memberBody);
  if (saved.status !== 200) {
    throw new Error(`PassKit pass failed (${saved.status})`);
  }
  const memberId = parseJson<{ id?: string }>(saved.text).id ?? existing?.id;
  if (!memberId) throw new Error("PassKit did not return a pass id");
  return `${passHost()}/${memberId}.pkpass`;
}
