export const APP_NAME = "KintalVax";

function BrandGlyph({ className = "h-1/2 w-1/2" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M6 5h5.2v9.15L20.15 5H26L15.35 16 26 27h-5.85L11.2 17.85V27H6V5Z" />
    </svg>
  );
}

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ${className}`}
      aria-hidden
    >
      <BrandGlyph />
    </div>
  );
}

export function SidebarBrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return <BrandGlyph className={className} />;
}
