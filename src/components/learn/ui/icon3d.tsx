// Icon3D — glossy clay-render 3D icons with real alpha transparency, used as
// the platform's expressive accent layer. Assets are generated and matted with
// the technique from github.com/samyost1/3dicon (MIT): render on a known
// mid-grey backing, alpha via a matting model, foreground colour solved
// exactly, framed at ~74% of a square canvas. See scripts/3dicon-ref/.
//
// Use at >= 16px (the renders read poorly below that). Motion presets are
// decoration only and switch off under prefers-reduced-motion.

import Image from "next/image";
import { cn } from "@/lib/utils";

export const ICON_3D = {
  db: "/icons3d/db.png",
  bolt: "/icons3d/bolt.png",
  trophy: "/icons3d/trophy.png",
  cap: "/icons3d/cap.png",
  fire: "/icons3d/fire.png",
  brain: "/icons3d/brain.png",
  search: "/icons3d/search.png",
  rocket: "/icons3d/rocket.png",
  star: "/icons3d/star.png",
  chat: "/icons3d/chat.png",
  book: "/icons3d/book.png",
  puzzle: "/icons3d/puzzle.png",
  target: "/icons3d/target.png",
  shield: "/icons3d/shield.png",
  gem: "/icons3d/gem.png",
  table: "/icons3d/table.png",
  golf: "/icons3d/golf.png",
  eye: "/icons3d/eye.png",
  folder: "/icons3d/folder.png",
  /** The one looping animated WebP straight from the 3dicon repo examples. */
  timer: "/icons3d/timer-3d.webp",
} as const;

export type Icon3DName = keyof typeof ICON_3D;

type Anim = "none" | "float" | "bob" | "wiggle";

const ANIM_CLASS: Record<Anim, string> = {
  none: "",
  float: "icon3d-float",
  bob: "icon3d-bob",
  wiggle: "icon3d-wiggle",
};

export function Icon3D({
  name,
  size = 40,
  anim = "none",
  className,
  title,
}: {
  name: Icon3DName;
  /** Rendered edge in px. The 512px master downscales cleanly. */
  size?: number;
  anim?: Anim;
  className?: string;
  /** Set to make it meaningful to assistive tech; decorative by default. */
  title?: string;
}) {
  return (
    <Image
      src={ICON_3D[name]}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      title={title}
      width={size}
      height={size}
      draggable={false}
      className={cn("icon3d shrink-0 select-none", ANIM_CLASS[anim], className)}
    />
  );
}
