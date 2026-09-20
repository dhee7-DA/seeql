// SeeQ skin — the buddy's three customizer axes, straight from bloub's
// customizer: shape, colour, resting expression. One tiny external store,
// read with useSyncExternalStore; written by the "Meet SeeQ" gallery tiles
// and consumed by both the corner buddy and the gallery hero.

import { EXPRESSION_BY_ID } from "@/components/bloub/expressions";
import { COLOR_BY_ID, SHAPE_BY_ID } from "@/components/bloub/skins";
import type { ExpressionId } from "@/components/bloub/expressions";
import type { ColorId, ShapeId } from "@/components/bloub/skins";

export interface SeeqSkin {
  shape: ShapeId;
  color: ColorId;
  expression: ExpressionId;
}

export const DEFAULT_SKIN: SeeqSkin = {
  shape: "cercle",
  color: "encre",
  expression: "neutre",
};

const KEY = "seeql.buddy.skin.v2";

function load(): SeeqSkin {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SKIN;
    const parsed = JSON.parse(raw) as Partial<SeeqSkin>;
    const shape =
      parsed.shape && SHAPE_BY_ID.has(parsed.shape) ? parsed.shape : DEFAULT_SKIN.shape;
    const color =
      parsed.color && COLOR_BY_ID.has(parsed.color) ? parsed.color : DEFAULT_SKIN.color;
    const expression =
      parsed.expression && EXPRESSION_BY_ID.has(parsed.expression)
        ? parsed.expression
        : DEFAULT_SKIN.expression;
    return { shape, color, expression } as SeeqSkin;
  } catch {
    return DEFAULT_SKIN;
  }
}

let skin: SeeqSkin = DEFAULT_SKIN;
const listeners = new Set<() => void>();

/** Client-only snapshot: reads localStorage once, on first subscription. */
export function getSkin(): SeeqSkin {
  return skin;
}

/** Server snapshot: always the default, so SSR and hydration agree. */
export function getServerSkin(): SeeqSkin {
  return DEFAULT_SKIN;
}

export function subscribeSkin(listener: () => void): () => void {
  // Lazy hydration: the first subscriber on the client picks up the stored
  // skin and notifies everyone if it differs from the default.
  if (skin === DEFAULT_SKIN) {
    const stored = load();
    if (
      stored.shape !== skin.shape ||
      stored.color !== skin.color ||
      stored.expression !== skin.expression
    ) {
      skin = stored;
      queueMicrotask(listener);
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSkin(patch: Partial<SeeqSkin>) {
  skin = { ...skin, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(skin));
  } catch {
    /* private mode — the choice just won't persist */
  }
  listeners.forEach((l) => l());
}
