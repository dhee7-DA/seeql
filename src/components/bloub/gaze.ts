/**
 * Ported from bloub (https://github.com/jeremy-prt/bloub), MIT © 2026 Jérémy Perret.
 * Where the bot looks when something outside drives it — the pointer, today.
 *
 * Yaw/pitch are ABSOLUTE directions that replace the pose's own as `mix` rises;
 * the engine does the blending because only it knows the pose at time t.
 */

import type { Look } from './engine'
import { clamp, easings } from './math'

/**
 * Head orientation angles, in degrees. CHOSEN, not measured: the reference
 * video shows no pointer following. Wide enough to stand out from idle drift,
 * restrained enough that no eye ever slips behind the limb of the sphere.
 */
export const YAW_MAX = 16
export const PITCH_MAX = 13

/**
 * Height at which the gaze rests when the cursor sits at centre. Slightly
 * above the equator — an attentive bot rather than an absent one. ABSOLUTE on
 * purpose: in relative mode the eye height followed each expression's own.
 */
export const PITCH = 10

/**
 * Direction the head settles to in the settings view: the bot stops looking
 * up-right and looks LEFT instead. The eyes really do travel around the
 * sphere, keeping their `\\` tilt and depth compression.
 */
export const TURN = 26

/**
 * A full turn travelled EN ROUTE: the eyes don't slide across the face, they
 * go around the ball before landing. Free because the eyes live on a sphere —
 * past 90° of yaw they cross the limb, vanish, and reappear on the other side.
 * And it LANDS exactly: -360° is the same angle as 0.
 */
export const SPIN = 360

/** Duration of the turn. Slightly shorter than the `swirl` entry block. */
export const TURN_TIME = 1.1

export interface Aim {
  /** horizontal offset of the pointer from the bot's centre, -1..1 (right positive) */
  nx: number
  /** vertical offset, -1..1, screen sense (down positive) */
  ny: number
  /** arrival progress, 0..1 */
  tour: number
  /** false = no pointer known: the head stays turned, but keeps living */
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
    yaw: -TURN + nx * YAW_MAX,
    // positive pitch = looks up, while screen y goes down
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: SPIN * (1 - tour),
    // Without a pointer the head stays turned but gets its drift back.
    wander: pointer ? 0 : 1
  }
}
