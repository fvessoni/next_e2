import { AddToAppleWalletButton } from "@/app/components/add-to-apple-wallet-button";
import { AddToGoogleWalletButton } from "@/app/components/add-to-google-wallet-button";
import { CertificatePrintButton } from "@/app/components/certificate-print-button";
import { APP_NAME, BrandMark } from "@/app/components/brand-logo";
import { isGoogleWalletConfigured } from "@/lib/google-wallet";
import { isPasskitConfigured } from "@/lib/passkit";
import { formatCpf, formatMobile } from "@/lib/br";
import {
  certificateQrSvg,
  getCertificateUrl,
  getVaccinationCertificate,
} from "@/lib/certificate";
import {
  formatDate,
  isSanitaryItemCurrent,
  todayIsoDate,
} from "@/lib/format";
import { btnOutline, cardClass, pageSubtitle, tableHeadClass } from "@/lib/ui";
import { DOG_SIZE_LABELS, type SanitaryItem } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function parseDogId(value: string) {
  const dogId = Number(value);
  return Number.isInteger(dogId) ? dogId : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dogId: string }>;
}): Promise<Metadata> {
  const dogId = parseDogId((await params).dogId);
  if (dogId == null) {
    return { title: `Certificado de vacinação | ${APP_NAME}` };
  }
  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) {
    return { title: `Certificado de vacinação | ${APP_NAME}` };
  }
  return {
    title: `Certificado de vacinação · ${certificate.dog.name} | ${APP_NAME}`,
    description: `Certificado público de vacinação de ${certificate.dog.name}.`,
  };
}

function sanitaryStatus(item: SanitaryItem, today: string) {
  if (today < item.valid_from) return "Agendado";
  if (!isSanitaryItemCurrent(item, today)) return "Vencido";
  return "Vigente";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default async function VaccinationCertificatePage({
  params,
}: {
  params: Promise<{ dogId: string }>;
}) {
  const dogId = parseDogId((await params).dogId);
  if (dogId == null) notFound();

  const certificate = await getVaccinationCertificate(dogId);
  if (!certificate) notFound();

  const { dog, tutor, items } = certificate;
  const today = todayIsoDate();
  const publicUrl = await getCertificateUrl(dog.dog_id);
  const qrSvg = await certificateQrSvg(publicUrl);
  const showWalletButton = isGoogleWalletConfigured();
  const showAppleWalletButton = isPasskitConfigured();

  return (
    <main className="min-h-screen bg-muted/50 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
          {showAppleWalletButton ? (
            <AddToAppleWalletButton dogId={dog.dog_id} />
          ) : null}
          <a
            href={`/wallet-preview/${dog.dog_id}#apple`}
            className={`${btnOutline} print:hidden`}
          >
            Prévia Apple
          </a>
          {showWalletButton ? (
            <AddToGoogleWalletButton dogId={dog.dog_id} />
          ) : null}
          <CertificatePrintButton />
        </div>

        <article className={`${cardClass} p-6 sm:p-8 print:border-0 print:shadow-none`}>
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
            <div className="flex items-start gap-3">
              <BrandMark className="h-12 w-12" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {APP_NAME}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Certificado de vacinação
                </h1>
                <p className={`mt-1 ${pageSubtitle}`}>
                  Emitido em {formatDate(today)}
                </p>
              </div>
            </div>
            <figure className="mx-auto text-center sm:mx-0">
              <div
                className="mx-auto h-32 w-32 text-foreground [&_svg]:h-full [&_svg]:w-full"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <figcaption className="mt-2 max-w-[10rem] text-xs text-muted-foreground">
                Escaneie para verificar este certificado
              </figcaption>
            </figure>
          </header>

          <section className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr]">
            {dog.has_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/certificado/${dog.dog_id}/photo`}
                alt={`Foto de ${dog.name}`}
                className="h-32 w-32 rounded-md border border-border object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                Sem foto
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">Cão</h2>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Nome" value={dog.name} />
                <Field label="Raça" value={dog.breed} />
                <Field label="Porte" value={DOG_SIZE_LABELS[dog.size]} />
                <Field
                  label="Cadastro"
                  value={formatDate(dog.registration_date)}
                />
              </dl>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Tutor</h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Nome" value={tutor.name} />
              <Field label="CPF" value={formatCpf(tutor.cpf)} />
              <Field label="E-mail" value={tutor.email} />
              <Field label="Celular" value={formatMobile(tutor.mobile)} />
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Itens sanitários
            </h2>
            <div className="mt-3 overflow-hidden rounded-md border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className={tableHeadClass}>Item</th>
                    <th className={tableHeadClass}>Válido de</th>
                    <th className={tableHeadClass}>Válido até</th>
                    <th className={tableHeadClass}>Atualizado</th>
                    <th className={tableHeadClass}>Situação</th>
                    <th className={tableHeadClass}>Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Nenhum item sanitário cadastrado.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const status = sanitaryStatus(item, today);
                      return (
                        <tr key={item.sanitary_item_id}>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {item.item}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {formatDate(item.valid_from)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {formatDate(item.valid_to)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {formatDate(item.updated)}
                          </td>
                          <td
                            className={`px-4 py-3 font-medium ${
                              status === "Vigente"
                                ? "text-emerald-600"
                                : status === "Vencido"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {status}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {item.observations.trim() || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
            <p>Documento público. Consulte a autenticidade em</p>
            <p className="mt-1">
              <a
                href={publicUrl}
                className="relative z-10 break-all font-mono text-foreground underline underline-offset-2 hover:text-primary"
              >
                {publicUrl}
              </a>
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
