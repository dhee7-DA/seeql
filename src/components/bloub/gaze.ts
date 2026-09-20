/**
 * Ported from bloub (https://github.com/jeremy-prt/bloub), MIT © 2026 Jérémy Perret.
 * Where the bot looks when something outside drives it — the pointer, today.
 *
 * Yaw/pitch are ABSOLUTE directions that replace the pose's own as `mix` rises;
 * the engine does the blending because only it knows the pose at time t.
 *
 * SeeQL tuning note: bloub's own table rests the head 26° to the LEFT (their
 * settings layout puts the bot beside a right-hand panel) and lets the cursor
 * sway it only ±16°, over 1.1 s. Here the buddy sits in a CORNER while the
 * cursor roams the whole page, so a fixed rest direction reads as "looking
 * away". The rest is therefore 0 and the cursor owns the full travel — a
 * wider range and a faster turn, tuned so the follow reads clearly at
 * 128 px, while staying under 90° of yaw so no eye ever slips behind the
 * limb of the sphere.
 */

import type { Look } from './engine'
import { clamp, easings } from './math'

/**
 * Head orientation angles, in degrees. CHOSEN, not measured (same spirit as
 * the upstream table): wide enough that the follow is unmistakable at buddy
 * size, restrained enough that the capsules never cross the limb.
 */
export const YAW_MAX = 34
export const PITCH_MAX = 18

/**
 * Height at which the gaze rests when the cursor sits level with the bot.
 * Slightly above the equator — an attentive bot rather than an absent one.
 * ABSOLUTE on purpose: in relative mode the eye height followed each
 * expression's own.
 */
export const PITCH = 8

/**
 * A full turn travelled EN ROUTE: the eyes don't slide across the face, they
 * go around the ball before landing. Free because the eyes live on a sphere —
 * past 90° of yaw they cross the limb, vanish, and reappear on the other side.
 * And it LANDS exactly: -360° is the same angle as 0.
 */
export const SPIN = 360

/**
 * Duration of the turn-in, and of the release back. About half the reference
 * value: at buddy size a slow landing reads as lag, not as grace.
 */
export const TURN_TIME = 0.55

export interface Aim {
  /** horizontal offset of the pointer from the bot's centre, -1..1 (right positive) */
  nx: number
  /** vertical offset, -1..1, screen sense (down positive) */
  ny: number
  /** arrival progress, 0..1 */
  tour: number
  /** false = no pointer known: the gaze rests, but keeps living */
  pointer: boolean
}

/**
 * Gaze target. `tour` leads everything: it raises the hold on the pose (`mix`)
 * and melts the travelled spin (`spin`) at the same time. Nothing here
 * compensates for the displayed expression — the engine blends, because it
 * alone knows the pose at time t.
 */
export function lookTarget({ nx, ny, tour, pointer }: Aim): Look {
  return {
    // no fixed head turn: the cursor IS the direction
    yaw: nx * YAW_MAX,
    // positive pitch = looks up, while screen y goes down
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: SPIN * (1 - tour),
    // Without a pointer the gaze rests but the drift survives.
    wander: pointer ? 0 : 1
  }
}
