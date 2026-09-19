/** Shared UI classes aligned with KintalVax / shadcn tokens (see globals.css). */

export const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const textareaClass =
  "flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const selectClass = inputClass;

export const btnPrimary =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50";

export const btnPrimaryFull = `${btnPrimary} w-full`;

export const btnOutline =
  "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50";

export const cardClass = "rounded-lg border border-border bg-card shadow-sm";

export const pageTitle =
  "text-2xl font-semibold tracking-tight text-foreground";

export const pageSubtitle = "text-sm text-muted-foreground";

export const tableHeadClass =
  "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export const tableFilterClass =
  "h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export const linkClass =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline";
