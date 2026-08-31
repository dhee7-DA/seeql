// SeeQL brand — a solid, flat mark: a rounded square in the theme accent
// with a lens (magnifier) sweeping over three data rows. One color, no
// gradients — reads at 16px favicon and at hero size.

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
      <rect width="32" height="32" rx="7" className="fill-emerald-400" />
      {/* data rows */}
      <rect x="7" y="8" width="12" height="2.4" rx="1.2" className="fill-[var(--brand-ink)] opacity-45" />
      <rect x="7" y="13" width="16" height="2.4" rx="1.2" className="fill-[var(--brand-ink)] opacity-70" />
      <rect x="7" y="18" width="9" height="2.4" rx="1.2" className="fill-[var(--brand-ink)] opacity-45" />
      {/* lens */}
      <circle
        cx="20"
        cy="17"
        r="6"
        className="stroke-[var(--brand-ink)]"
        strokeWidth="2.4"
      />
      <line
        x1="24.6"
        y1="21.6"
        x2="27.4"
        y2="24.4"
        className="stroke-[var(--brand-ink)]"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-zinc-100", className)}>
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
