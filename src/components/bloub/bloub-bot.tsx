"use client";

// React port of bloub's BloubBot.vue (https://github.com/jeremy-prt/bloub,
// MIT © 2026 Jérémy Perret) — the exact renderer, on the exact engine ported
// 1:1 into this folder. The body is a closed Catmull-Rom profile of 64 radii;
// the eyes are capsule-shaped HOLES punched through the body with a mask (the
// x.ai trick), so they clip themselves on the silhouette. There is no mouth:
// the face is two capsules, that is the whole character.
//
// Two modes, like the original:
// - frozen (frozenAt set): one pure `engine.sample(t)`, no loop — used by the
//   gallery tiles. Deterministic, so it even server-renders identically.
// - live: one requestAnimationFrame per instance. Each frame reconciles the
//   shape/expression/command props into the engine (dated setters, never
//   sampled mid-frame), aims at the pointer when `follow`, then samples.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { NOTIF_BLUE, type DotRender } from "./decor";
import { BotEngine, type BotFrame } from "./engine";
import { clamp, easings } from "./math";
import { EXPRESSION_BY_ID } from "./expressions";
import { COLOR_BY_ID, mixHex } from "./skins";
import { lookTarget, TURN_TIME } from "./gaze";
import { DEMI_VIEWBOX, RAYON } from "./repere";
import { SHAPE_BY_ID } from "./skins";
import { STATE_BY_ID, type StateId } from "./states";

const R = RAYON;
const VB = DEMI_VIEWBOX;

export interface BloubCommand {
  state: StateId;
  nonce: number;
}

export interface BloubBotProps {
  /** rendered pixel size (square) */
  size?: number;
  /** customizer shape id — cercle, galet, squircle, capsule, triangle, hexagone, nuage, goutte */
  shape?: string;
  /** customizer colour id — encre, creme, brun, rouge, orange, ambre, vert, turquoise, bleu, violet, rose, gris */
  color?: string;
  /** resting expression id — neutre, attentif, surpris, excite, heureux, hilare, colere, triste, effraye, mefiant, confus, curieux, fier, timide, blase, somnolent */
  expression?: string;
  /** page colour behind the bot; eye holes read through to it */
  paper?: string;
  /** freeze at this time (seconds into the state) — renders once, no loop */
  frozenAt?: number;
  /** initial / held state of a live bot */
  state?: StateId;
  /** dated state change for a live bot: apply when nonce differs */
  command?: BloubCommand | null;
  /** pointer follow (live bots only) */
  follow?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Resolve a skin id against a catalog, falling back on the default. */
const shapeRadiiOf = (shape: string | undefined) =>
  SHAPE_BY_ID.get(shape ?? "cercle")?.radii ?? null;
const inkOf = (color: string | undefined) =>
  COLOR_BY_ID.get(color ?? "encre")?.hex ?? "#0a0a0c";
const exprOf = (expression: string | undefined) =>
  EXPRESSION_BY_ID.get(expression ?? "neutre") ?? null;

/* ------------------------------------------------------------------ dots */

function DotDot({ dot, ink, paper }: { dot: DotRender; ink: string; paper: string }) {
  const fill = dot.color ?? (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));
  return dot.d ? (
    <path
      d={dot.d}
      fill={fill}
      opacity={dot.opacity}
      transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${R})`}
    />
  ) : (
    <circle cx={dot.x} cy={dot.y} r={dot.r} fill={fill} opacity={dot.opacity} />
  );
}

function Dots({ dots, ink, paper }: { dots: DotRender[]; ink: string; paper: string }) {
  return (
    <g>
      {dots.map((dot, i) => (
        <DotDot key={i} dot={dot} ink={ink} paper={paper} />
      ))}
    </g>
  );
}

/* -------------------------------------------------------------- template */

function BotSvg({
  frame,
  ink,
  paper,
  size,
  uid,
  className,
  ariaLabel,
  svgRef,
}: {
  frame: BotFrame;
  ink: string;
  paper: string;
  size: number;
  uid: string;
  className?: string;
  ariaLabel: string;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  const maskId = `bot-mask-${uid}`;
  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        {/* The eyes are real holes punched through the body (like on x.ai),
            not white shapes laid on top: they stay clipped by the silhouette
            on their own as they slide towards the edge. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-VB} y={-VB} width={VB * 2} height={VB * 2}>
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path key={i} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000" />
          ))}
          {frame.notch && (
            <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000" />
          )}
        </mask>
        {frame.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((c, i) => (
              <stop key={i} offset={i / (arc.grad.stops.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
      </defs>

      {/* back half of the orbits: drawn before the body, so occulted by it */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {/* burst particles pass behind the core */}
      {frame.dotsBehind && <Dots dots={frame.dots} ink={ink} paper={paper} />}

      <g opacity={frame.bodyAlpha}>
        {/* Opaque underlay in the exact body shape, under the body itself:
            without it, a ring passing behind the ball would reappear INSIDE
            the eye holes. Filled with `paper`, exactly what the holes show. */}
        <path d={frame.bodyPath} fill={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind && <Dots dots={frame.dots} ink={ink} paper={paper} />}

      {frame.notif && (
        <circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE} />
      )}

      {/* front half of the orbits */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path
            key={`f${arc.id}`}
            d={arc.front}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- frozen */

function FrozenBot(props: BloubBotProps & { frozenAt: number; uid: string }) {
  const {
    size = 320,
    shape,
    color,
    expression,
    paper = "#f9f9f9",
    frozenAt,
    state = "idle",
    uid,
    className,
    ariaLabel,
  } = props;
  const ink = inkOf(color);
  const frame = useMemo(() => {
    const engine = new BotEngine(R, state, shapeRadiiOf(shape), exprOf(expression));
    return engine.sample(frozenAt);
  }, [state, shape, expression, frozenAt]);
  return (
    <BotSvg
      frame={frame}
      ink={ink}
      paper={paper}
      size={size}
      uid={uid}
      className={className}
      ariaLabel={ariaLabel ?? "SeeQ mascot"}
    />
  );
}

/* ------------------------------------------------------------------ live */

function LiveBot(props: BloubBotProps & { uid: string }) {
  const {
    size = 320,
    color,
    paper = "#f9f9f9",
    className,
    ariaLabel,
    uid,
  } = props;

  const svgRef = useRef<SVGSVGElement | null>(null);
  // Props reach the loop through a ref: the loop is mounted once and reads
  // the latest values every frame, so prop changes never re-subscribe it.
  // The ref is written in an effect, never during render (react-hooks/refs).
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  // First frame arrives with the first rAF tick; live bots mount client-side
  // only, so the one-blink null is never visible.
  const [frame, setFrame] = useState<BotFrame | null>(null);

  useEffect(() => {
    const p0 = propsRef.current;
    const engine = new BotEngine(R, p0.state ?? "idle", shapeRadiiOf(p0.shape), exprOf(p0.expression));

    let raf = 0;
    let last = 0;
    let clock = 0;
    let turnSince = 0;
    let aiming = false;
    let pointer: { x: number; y: number } | null = null;
    let appliedShape: number[] | null | undefined;
    let appliedExpr: unknown = Symbol("unset");
    let appliedNonce = p0.command ? p0.command.nonce : -1;

    // Touch pointers are ignored: a lifted finger would freeze the gaze on
    // its last spot, which reads as a bug.
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      pointer = { x: ev.clientX, y: ev.clientY };
    };
    const onLeave = () => {
      pointer = null;
    };

    const release = () => {
      if (!aiming) return;
      // same duration as the way in: the head returns while the ball lands
      engine.setLook(null, clock, TURN_TIME);
      aiming = false;
    };

    const aim = () => {
      // The gaze is only driven on states that carry the resting face;
      // elsewhere the pose IS the measured animation.
      if (!STATE_BY_ID.get(engine.state)?.baseFace) {
        release();
        return;
      }
      const box = svgRef.current?.getBoundingClientRect();
      // A zero-surface box (hidden tab) would make the normalisation 0/0,
      // and the engine KEEPS a NaN target forever. Guard it here.
      if (!box || box.width === 0 || box.height === 0) return;
      if (!aiming) turnSince = clock;
      const halfW = Math.max(1, window.innerWidth / 2);
      const halfH = Math.max(1, window.innerHeight / 2);
      engine.setLook(
        lookTarget({
          nx: pointer ? clamp((pointer.x - (box.left + box.width / 2)) / halfW, -1, 1) : 0,
          ny: pointer ? clamp((pointer.y - (box.top + box.height / 2)) / halfH, -1, 1) : 0,
          tour: easings.easeOutQuint(clamp((clock - turnSince) / TURN_TIME)),
          pointer: pointer !== null,
        }),
        clock,
      );
      aiming = true;
    };

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      // Stage clock with a bounded delta: a hidden tab then re-shown resumes
      // without jumping ahead (rAF is suspended while hidden).
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;

      // Reconcile props into the engine with dated setters.
      const p = propsRef.current;
      const radii = shapeRadiiOf(p.shape);
      if (radii !== appliedShape) {
        engine.setShape(radii, clock);
        appliedShape = radii;
      }
      const expr = exprOf(p.expression);
      if (expr !== appliedExpr) {
        engine.setExpression(expr, clock);
        appliedExpr = expr;
      }
      const cmd = p.command;
      if (cmd && cmd.nonce !== appliedNonce) {
        appliedNonce = cmd.nonce;
        engine.setState(cmd.state, clock);
      }

      if (p.follow) aim();
      setFrame(engine.sample(clock));
    };

    if (p0.follow) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // One static frame, still exact — drawn on the next frame so the
      // render stays pure.
      raf = requestAnimationFrame(() => {
        setFrame(engine.sample(1.3));
      });
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (p0.follow) {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      }
    };
    // The loop is mounted once; props flow through propsRef.
  }, []);

  if (frame === null) return null;

  return (
    <BotSvg
      frame={frame}
      ink={inkOf(color)}
      paper={paper}
      size={size}
      uid={uid}
      className={className}
      ariaLabel={ariaLabel ?? "SeeQ mascot"}
      svgRef={svgRef}
    />
  );
}

export function BloubBot(props: BloubBotProps) {
  // Hooks stay unconditional: the frozen/live split happens below them.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { frozenAt, ...rest } = props;
  if (frozenAt !== undefined) {
    return <FrozenBot {...rest} frozenAt={frozenAt} uid={uid} />;
  }
  return <LiveBot {...rest} uid={uid} />;
}
