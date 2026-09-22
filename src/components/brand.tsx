// SeeQL brand — the Active Builders treatment: a monochrome ink glyph that
// flips with the theme (ink on paper / paper on ink). The lens-over-rows
// mark stays; it just loses the colored square so the wordmark reads like
// AB's logo block: glyph + name, nothing else.

import { cn } from "@/lib/utils";

export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="7" className="fill-foreground" />
      {/* data rows */}
      <rect x="7" y="8" width="12" height="2.4" rx="1.2" className="fill-background opacity-45" />
      <rect x="7" y="13" width="16" height="2.4" rx="1.2" className="fill-background opacity-70" />
      <rect x="7" y="18" width="9" height="2.4" rx="1.2" className="fill-background opacity-45" />
      {/* lens */}
      <circle
        cx="20"
        cy="17"
        r="6"
        className="stroke-background"
        strokeWidth="2.4"
      />
      <line
        x1="24.6"
        y1="21.6"
        x2="27.4"
        y2="24.4"
        className="stroke-background"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-foreground", className)}>
      See<span className="text-emerald-400">QL</span>
    </span>
  );
}

export function LogoFull({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <Wordmark className="text-[15px]" />
    </span>
  );
}
