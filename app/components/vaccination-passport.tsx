import { PassportHistory } from "@/app/components/passport-history";
import { PassportToolbar } from "@/app/components/passport-toolbar";
import styles from "@/app/components/vaccination-passport.module.css";
import { formatDate } from "@/lib/format";
import {
  PASSPORT_SUBTITLE,
  PASSPORT_TITLE,
  TELECONSULT_URL,
  passportAppliedLabel,
  passportDueLabel,
  passportNextDoseLabel,
  passportOverview,
  sanitaryItemStatus,
  sanitaryItemStatusLabel,
} from "@/lib/passport";
import { DOG_SIZE_LABELS, type Dog, type SanitaryItem, type Tutor } from "@/lib/types";

function BrandGlyph() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M6 5h5.2v9.15L20.15 5H26L15.35 16 26 27h-5.85L11.2 17.85V27H6V5Z" />
    </svg>
  );
}

export function VaccinationPassport({
  dog,
  tutor,
  items,
  today,
  publicUrl,
  qrSvg,
  showWalletButton,
}: {
  dog: Dog;
  tutor: Tutor;
  items: SanitaryItem[];
  today: string;
  publicUrl: string;
  qrSvg: string;
  showWalletButton: boolean;
}) {
  const overview = passportOverview(items, today);

  return (
    <main className={styles.page}>
      <PassportToolbar
        dogId={dog.dog_id}
        showWalletButton={showWalletButton}
      />

      <article className={styles.walletCard}>
        <header className={styles.cardHeader}>
          <div className={styles.logo}>
            <BrandGlyph />
          </div>
          <div className={styles.headerText}>
            <h1>{PASSPORT_TITLE}</h1>
            <p>{PASSPORT_SUBTITLE}</p>
          </div>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.petHeaderRow}>
            <h2 className={styles.petName}>{dog.name}</h2>
            <div
              className={`${styles.passportStatus} ${
                overview.allGood ? styles.statusAllGood : styles.statusAttention
              }`}
            >
              {overview.statusLabel}
            </div>
          </div>
          <p className={styles.petMeta}>
            {dog.breed} · {DOG_SIZE_LABELS[dog.size]} · Tutor {tutor.name}
          </p>

          <div className={styles.primaryVaccineBox}>
            <div className={styles.primaryVaccineLabel}>
              <span>Próxima Dose</span>
              {overview.nextBadge ? (
                <span className={overview.urgent ? styles.urgent : undefined}>
                  {overview.nextBadge}
                </span>
              ) : null}
            </div>
            <p className={styles.primaryVaccineName}>
              {passportNextDoseLabel(overview.next)}
            </p>
            <div className={styles.primaryVaccineDates}>
              <div className={styles.dateItem}>
                <span>Aplicada em</span>
                {passportAppliedLabel(overview.next)}
              </div>
              <div className={styles.dateItem}>
                <span>Próxima Dose</span>
                {passportDueLabel(overview.next)}
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <PassportHistory summary="Ver Histórico Completo de Vacinas">
            {items.length === 0 ? (
              <p className={styles.emptyHistory}>
                Nenhum item sanitário cadastrado.
              </p>
            ) : (
              <ul className={styles.vaccineList}>
                {items.map((item) => {
                  const status = sanitaryItemStatus(item, today);
                  return (
                    <li key={item.sanitary_item_id} className={styles.vaccineItem}>
                      <div className={styles.vaxInfo}>
                        <h4>{item.item}</h4>
                        <p>Aplicada em: {formatDate(item.valid_from)}</p>
                      </div>
                      <div
                        className={`${styles.vaxStatus} ${
                          status === "valid" ? styles.statusValid : styles.statusDue
                        }`}
                      >
                        {sanitaryItemStatusLabel(status)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </PassportHistory>

          <div className={styles.bottomActionArea}>
            <a
              className={styles.videoConference}
              href={TELECONSULT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.videoBtn}>
                <svg
                  className={styles.videoIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" />
                </svg>
              </div>
              <span className={styles.videoLabel}>
                Agende sua
                <br />
                tele-consulta
              </span>
            </a>

            <div className={styles.qrSection}>
              <div
                className={styles.qrPlaceholder}
                aria-hidden
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className={styles.qrText}>
                Escaneie para verificar este certificado
              </p>
            </div>
          </div>

          <div className={styles.watermark} />
        </div>
      </article>

      <p className={styles.auth}>
        Documento público. Consulte a autenticidade em
        <br />
        <a href={publicUrl}>{publicUrl}</a>
      </p>
    </main>
  );
}
