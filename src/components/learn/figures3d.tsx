"use client";

// 3D flagship figures — react-three-fiber scenes layered on the same visual
// language as the SVG kit (zinc panels, teal/amber accents, seed-verified
// numbers). Heavy three.js chunk is only reached through figure-3d.tsx,
// which itself is dynamically imported by diagrams.tsx Figure().

import { Suspense, useEffect, useMemo, useRef, useState, type JSX, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import type { FigureId } from "@/lib/curriculum/types";

const FONT = "/fonts/Carlito-Regular.ttf";

/* ================= j2-join-space-3d — the INNER JOIN, in space =================
 * Real seed facts (db/custom.db, verified via scripts probe):
 *   customers 16 · orders 103 · Alice Chen 24 orders (7262.35) ·
 *   Bruno Silva 2 (852.44) · Chloe Dubois 5 (2667.93) · Dmitri Volkov 2 (599.26)
 * 33 of 103 order rows are drawn; every bar draws a smooth glowing ribbon to
 * its customer row — the mismatched stack heights ARE the lesson.           */

const CUSTOMERS = [
  { id: 1, name: "Alice Chen", n: 24 },
  { id: 2, name: "Bruno Silva", n: 2 },
  { id: 3, name: "Chloe Dubois", n: 5 },
  { id: 4, name: "Dmitri Volkov", n: 2 },
] as const;

const COLORS = ["#2dd4bf", "#a78bfa", "#fbbf24", "#fb7185"] as const;

const CUST_X = -5.6;
const ROW_PITCH = 0.62;
const ROW_TOP = 2.3;
const STACK_X = [3.9, 5.05, 6.2, 7.35] as const;
const STACK_BASE = -0.5;
const BAR_PITCH = 0.155;

const rowY = (ci: number) => ROW_TOP - ci * ROW_PITCH;

type Flight = {
  ci: number;
  delay: number;
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
};

// Farther customers get a higher lane, so the four fans layer in depth
// instead of crossing through each other.
const LANE_LIFT = [0.95, 1.2, 1.45, 1.7] as const;
const DUR = 1.5;
const LAUNCH_STEP = 0.085;
const TUBE_SEGS = 44;
const TRAIL_R = 0.021;

// Round-robin launch (1st order of every customer, then 2nd, …) so the four
// colors stream as parallel lanes instead of one monochrome swarm.
const FLIGHTS: Flight[] = (() => {
  const out: Flight[] = [];
  const maxN = Math.max(...CUSTOMERS.map((c) => c.n));
  for (let i = 0; i < maxN; i++) {
    CUSTOMERS.forEach((c, ci) => {
      if (i >= c.n) return;
      const from = new THREE.Vector3(STACK_X[ci] - 0.5, STACK_BASE + i * BAR_PITCH + 0.06, 0);
      // Land fanned along the customer row's right edge — heads slot in
      // side by side instead of piling onto one point.
      const k = i % 5;
      const to = new THREE.Vector3(CUST_X + 1.38, rowY(ci) + (k - 2) * 0.062, 0.3);
      const ctrl = new THREE.Vector3(
        (from.x + to.x) / 2,
        (from.y + to.y) / 2 + LANE_LIFT[ci],
        0.16,
      );
      out.push({ ci, delay: out.length * LAUNCH_STEP, from, ctrl, to });
    });
  }
  return out;
})();

function JoinScene({ replayRef }: { replayRef?: { current: (() => void) | null } }) {
  const [matched, setMatched] = useState(0);
  const countRef = useRef(0);
  const arrivedRef = useRef<boolean[]>(new Array(FLIGHTS.length).fill(false));
  const arrivalAtRef = useRef<number[]>(new Array(FLIGHTS.length).fill(-1));
  const startRef = useRef(0);
  const clockRef = useRef(0);
  const flashRef = useRef<number[]>([0, 0, 0, 0]);
  const groupRef = useRef<THREE.Group>(null);
  const trailRefs = useRef<Array<THREE.Mesh | null>>([]);
  const headRefs = useRef<Array<THREE.Mesh | null>>([]);
  const rowMats = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  const flights = useMemo(() => FLIGHTS, []);
  const curves = useMemo(
    () => flights.map((f) => new THREE.QuadraticBezierCurve3(f.from, f.ctrl, f.to)),
    [flights],
  );
  const tubeGeoms = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, TUBE_SEGS, TRAIL_R, 6, false)),
    [curves],
  );
  useEffect(() => () => tubeGeoms.forEach((g) => g.dispose()), [tubeGeoms]);

  useFrame((state, dt) => {
    clockRef.current = state.clock.elapsedTime;
    const e = clockRef.current - startRef.current;

    // idle drift — the whole model breathes
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(e * 0.18) * 0.05;
      groupRef.current.position.y = Math.sin(e * 0.6) * 0.04;
    }

    // draw the projection ribbons
    let count = countRef.current;
    flights.forEach((f, i) => {
      const trail = trailRefs.current[i];
      const head = headRefs.current[i];
      if (!trail || !head) return;
      const t = (e - f.delay) / DUR;

      if (t < 0) {
        trail.visible = false;
        head.visible = false;
        return;
      }

      if (t >= 1) {
        if (!arrivedRef.current[i]) {
          arrivedRef.current[i] = true;
          arrivalAtRef.current[i] = e;
          flashRef.current[f.ci] = 1;
          count += 1;
        }
        head.visible = false;
        // ribbon lingers briefly after arrival, then dissolves — the rest
        // state of the scene stays clean
        const age = e - arrivalAtRef.current[i];
        const mat = trail.material as THREE.MeshBasicMaterial;
        const op = 0.5 * Math.exp(-age * 2.4);
        if (op < 0.02) {
          trail.visible = false;
        } else {
          trail.visible = true;
          mat.opacity = op;
        }
        return;
      }

      // smoothstep easing — slow in, glide, slow out (no abrupt launches)
      const p = t * t * (3 - 2 * t);
      const mat = trail.material as THREE.MeshBasicMaterial;
      trail.visible = true;
      mat.opacity = Math.min(1, 0.25 + p * 10) * 0.5;
      trail.geometry.setDrawRange(0, Math.max(1, Math.floor(p * TUBE_SEGS)) * 36);
      head.visible = true;
      curves[i].getPointAt(p, head.position);
      head.scale.setScalar(1 + 0.22 * Math.sin(p * Math.PI));
    });
    if (count !== countRef.current) {
      countRef.current = count;
      setMatched(count);
    }

    // arrival glow decay
    flashRef.current = flashRef.current.map((f) => f * Math.exp(-dt * 2.4));
    rowMats.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 0.1 + (flashRef.current[i] ?? 0) * 1.7;
    });
  });

  const replay = () => {
    startRef.current = clockRef.current;
    arrivedRef.current = new Array(FLIGHTS.length).fill(false);
    arrivalAtRef.current = new Array(FLIGHTS.length).fill(-1);
    countRef.current = 0;
    flashRef.current = [0, 0, 0, 0];
    setMatched(0);
  };

  // publish replay so the host can auto-replay when the figure scrolls into view
  useEffect(() => {
    if (replayRef) replayRef.current = replay;
  });

  const done = matched >= flights.length;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <fog attach="fog" args={["#09090b", 15, 32]} />

      <group ref={groupRef}>
        {/* ---- customers table (left) ---- */}
        <Text font={FONT} fontSize={0.22} color="#a1a1aa" position={[CUST_X, 2.92, 0]} anchorX="center">
          customers
        </Text>
        <Text font={FONT} fontSize={0.13} color="#52525b" position={[CUST_X, 2.68, 0]} anchorX="center">
          16 rows · 4 shown
        </Text>
        {CUSTOMERS.map((c, ci) => (
          <group key={c.id} position={[CUST_X, rowY(ci), 0]}>
            <RoundedBox args={[2.7, 0.46, 0.44]} radius={0.06} smoothness={3}>
              <meshStandardMaterial
                ref={(m) => {
                  rowMats.current[ci] = m as THREE.MeshStandardMaterial | null;
                }}
                color="#27272a"
                emissive={COLORS[ci]}
                emissiveIntensity={0.1}
                roughness={0.55}
              />
            </RoundedBox>
            <RoundedBox args={[0.36, 0.36, 0.36]} radius={0.05} smoothness={2} position={[-1.02, 0, 0.06]}>
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.35} roughness={0.4} />
            </RoundedBox>
            <Text font={FONT} fontSize={0.17} color="#78350f" position={[-1.02, 0, 0.26]} anchorX="center" anchorY="middle">
              {String(c.id)}
            </Text>
            <Text font={FONT} fontSize={0.2} color="#e4e4e7" position={[-0.72, 0, 0.24]} anchorX="left" anchorY="middle">
              {c.name}
            </Text>
            <Text font={FONT} fontSize={0.13} color="#71717a" position={[1.28, 0, 0.24]} anchorX="right" anchorY="middle">
              {c.n} orders
            </Text>
          </group>
        ))}
        {/* ghost row */}
        <group position={[CUST_X, rowY(4), 0]}>
          <RoundedBox args={[2.7, 0.46, 0.44]} radius={0.06} smoothness={3}>
            <meshStandardMaterial color="#18181b" transparent opacity={0.55} roughness={0.7} />
          </RoundedBox>
          <Text font={FONT} fontSize={0.15} color="#52525b" position={[0, 0, 0.24]} anchorX="center" anchorY="middle">
            + 12 more customers
          </Text>
        </group>

        {/* ---- orders stacks (right) ---- */}
        <Text font={FONT} fontSize={0.22} color="#a1a1aa" position={[5.6, 3.6, 0]} anchorX="center">
          orders
        </Text>
        <Text font={FONT} fontSize={0.13} color="#52525b" position={[5.6, 3.36, 0]} anchorX="center">
          103 rows · 33 drawn
        </Text>
        {CUSTOMERS.map((c, ci) => (
          <group key={`stack-${c.id}`}>
            {Array.from({ length: c.n }).map((_, i) => (
              <RoundedBox
                key={i}
                args={[0.8, 0.12, 0.12]}
                radius={0.03}
                smoothness={2}
                position={[STACK_X[ci], STACK_BASE + i * BAR_PITCH, 0]}
              >
                <meshStandardMaterial
                  color={COLORS[ci]}
                  emissive={COLORS[ci]}
                  emissiveIntensity={0.55}
                  roughness={0.45}
                />
              </RoundedBox>
            ))}
          </group>
        ))}
        <Text font={FONT} fontSize={0.14} color="#71717a" position={[STACK_X[3], STACK_BASE + 8 * BAR_PITCH, 0]} anchorX="center">
          + 70 more rows
        </Text>

        {/* ---- result slab ---- */}
        <RoundedBox args={[4.4, 0.52, 0.4]} radius={0.08} smoothness={3} position={[0, -1.15, 0]}>
          <meshStandardMaterial color="#18181b" emissive="#2dd4bf" emissiveIntensity={0.14} roughness={0.5} />
        </RoundedBox>
        <Text font={FONT} fontSize={0.2} color="#5eead4" position={[0, -1.15, 0.22]} anchorX="center" anchorY="middle">
          INNER JOIN result · 103 rows
        </Text>

        {/* ---- projection streams: self-drawing ribbon + glowing head ---- */}
        {flights.map((f, i) => (
          <group key={i}>
            <mesh
              visible={false}
              geometry={tubeGeoms[i]}
              ref={(m) => {
                trailRefs.current[i] = m as THREE.Mesh | null;
              }}
            >
              <meshBasicMaterial
                color={COLORS[f.ci]}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh
              visible={false}
              ref={(m) => {
                headRefs.current[i] = m as THREE.Mesh | null;
              }}
            >
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial
                color={COLORS[f.ci]}
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
              <mesh scale={2.6}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshBasicMaterial
                  color={COLORS[f.ci]}
                  transparent
                  opacity={0.22}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- HUD ---- */}
      <Html position={[0, 4.15, 0]} center>
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg">
          {done
            ? "Every order found its customer — 103 joined rows, none dropped."
            : `${matched} / ${flights.length} drawn orders matched — full result: 103 rows.`}
        </div>
      </Html>
      <Html position={[0, -1.85, 0]} center>
        <button
          onClick={replay}
          className="pointer-events-auto whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 shadow transition-colors hover:bg-zinc-800"
        >
          ↻ replay the join
        </button>
      </Html>

      <gridHelper args={[30, 30, "#27272a", "#18181b"]} position={[0, -2.1, 0]} />
      <OrbitControls
        target={[0, 0.6, 0]}
        enablePan={false}
        minDistance={7}
        maxDistance={18}
        maxPolarAngle={1.48}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function J2JoinSpace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const lastAutoRef = useRef(0);

  // Auto-replay whenever the figure scrolls into view — the scene never sits
  // frozen at a finished state. Cooldown keeps fast scrolling from strobing.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const now = performance.now();
            if (now - lastAutoRef.current > 7000) {
              lastAutoRef.current = now;
              replayRef.current?.();
            }
          }
        }
      },
      { threshold: [0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full"
      role="img"
      aria-label="Interactive 3D scene: a customers table and an orders table float in space. Each of 33 drawn order rows draws a glowing ribbon to its customer row; the full INNER JOIN result is 103 rows. Alice Chen's stack of 24 towers over Bruno Silva's 2 — the table shapes themselves show who buys most. Drag to orbit."
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2.4, 12.8], fov: 40 }}
      >
        <SuspenseBoundary>
          <JoinScene replayRef={replayRef} />
        </SuspenseBoundary>
      </Canvas>
    </div>
  );
}

function SuspenseBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

/* ================= j12-left-space-3d — the LEFT JOIN, in space =================
 * Real seed facts (db/custom.db, verified via scripts/leftjoin3d-facts.ts):
 *   customers 16 · orders 103 (52 delivered / 30 shipped / 14 pending / 7 cancelled)
 *   shipped arm: LEFT JOIN … AND o.status='shipped' → 36 rows = 30 matches + 6
 *   NULL-filled gaps (Bruno, Chloe, Dmitri, Farid, Keiko, Olivia — 0 shipped).
 *   Moving the status filter into WHERE collapses the result to 30 rows.
 * All 16 customer rows are drawn: 30 teal ribbons carry shipped orders to their
 * buyers, then 6 amber NULL plaques pop beside the customers nothing arrived
 * for — the preserved rows ARE the lesson. Teal = matched, amber = NULL fill. */

type L12Cust = { id: number; name: string; shipped: number };

const L12_CUSTOMERS: L12Cust[] = [
  { id: 1, name: "Alice Chen", shipped: 6 },
  { id: 2, name: "Bruno Silva", shipped: 0 },
  { id: 3, name: "Chloe Dubois", shipped: 0 },
  { id: 4, name: "Dmitri Volkov", shipped: 0 },
  { id: 5, name: "Emma Wilson", shipped: 9 },
  { id: 6, name: "Farid Nasser", shipped: 0 },
  { id: 7, name: "Grace Kim", shipped: 3 },
  { id: 8, name: "Hiro Tanaka", shipped: 1 },
  { id: 9, name: "Isabella Rossi", shipped: 2 },
  { id: 10, name: "Jamal Wright", shipped: 1 },
  { id: 11, name: "Keiko Sato", shipped: 0 },
  { id: 12, name: "Liam O'Brien", shipped: 1 },
  { id: 13, name: "Maya Patel", shipped: 4 },
  { id: 14, name: "Noah Meyer", shipped: 2 },
  { id: 15, name: "Olivia Brown", shipped: 0 },
  { id: 16, name: "Pedro Alvarez", shipped: 1 },
];

const L12_TEAL = "#2dd4bf";
const L12_AMBER = "#fbbf24";

const L12_CUST_X = -4.7;
const L12_PITCH = 0.42;
const L12_TOP = 2.55;
const L12_STACK_X = 4.9;
const L12_STACK_BASE = -0.6;
const L12_BAR_PITCH = 0.14;

const l12RowY = (ci: number) => L12_TOP - ci * L12_PITCH;

type L12Flight = {
  ci: number;
  delay: number;
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
};

// Launch order round-robins across customers so arrivals interleave; each
// flight drains the shipped-orders stack bottom-up (bar j launches j-th).
const L12_FLIGHTS: L12Flight[] = (() => {
  const out: L12Flight[] = [];
  const maxS = Math.max(...L12_CUSTOMERS.map((c) => c.shipped));
  for (let i = 0; i < maxS; i++) {
    L12_CUSTOMERS.forEach((c, ci) => {
      if (i >= c.shipped) return;
      const j = out.length;
      const from = new THREE.Vector3(L12_STACK_X - 0.55, L12_STACK_BASE + j * L12_BAR_PITCH + 0.05, 0);
      const k = i % 4;
      const to = new THREE.Vector3(L12_CUST_X + 1.52, l12RowY(ci) + (k - 1.5) * 0.055, 0.3);
      const ctrl = new THREE.Vector3(
        (from.x + to.x) / 2,
        (from.y + to.y) / 2 + 0.9 + (ci % 4) * 0.22,
        0.18,
      );
      out.push({ ci, delay: j * 0.085, from, ctrl, to });
    });
  }
  return out;
})();

const L12_DUR = 1.5;
const L12_TUBE_SEGS = 44;
const L12_TRAIL_R = 0.021;
const L12_GAP_NAMES = L12_CUSTOMERS.filter((c) => c.shipped === 0).map((c) => c.name);

// easeOutBack — pops slightly past 1 then settles (shared by the 3D scenes)
const popEase = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const q = Math.min(1, Math.max(0, p)) - 1;
  return 1 + c3 * q * q * q + c1 * q * q;
};

function LeftJoinScene({ replayRef }: { replayRef?: { current: (() => void) | null } }) {
  const [matched, setMatched] = useState(0);
  const [gaps, setGaps] = useState(0);
  const countRef = useRef(0);
  const gapsRef = useRef(0);
  const arrivedRef = useRef<boolean[]>(new Array(L12_FLIGHTS.length).fill(false));
  const arrivalAtRef = useRef<number[]>(new Array(L12_FLIGHTS.length).fill(-1));
  const gapsStartRef = useRef(-1);
  const poppedRef = useRef<boolean[]>(new Array(L12_CUSTOMERS.length).fill(false));
  const startRef = useRef(0);
  const clockRef = useRef(0);
  const flashRef = useRef<number[]>(new Array(L12_CUSTOMERS.length).fill(0));
  const groupRef = useRef<THREE.Group>(null);
  const trailRefs = useRef<Array<THREE.Mesh | null>>([]);
  const headRefs = useRef<Array<THREE.Mesh | null>>([]);
  const plaqueRefs = useRef<Array<THREE.Group | null>>([]);
  const rowMats = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  const flights = useMemo(() => L12_FLIGHTS, []);
  const curves = useMemo(
    () => flights.map((f) => new THREE.QuadraticBezierCurve3(f.from, f.ctrl, f.to)),
    [flights],
  );
  const tubeGeoms = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, L12_TUBE_SEGS, L12_TRAIL_R, 6, false)),
    [curves],
  );
  useEffect(() => () => tubeGeoms.forEach((g) => g.dispose()), [tubeGeoms]);

  useFrame((state, dt) => {
    clockRef.current = state.clock.elapsedTime;
    const e = clockRef.current - startRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(e * 0.16) * 0.045;
      groupRef.current.position.y = Math.sin(e * 0.55) * 0.035;
    }

    // phase A — projection ribbons for the 30 matched pairs
    let count = countRef.current;
    flights.forEach((f, i) => {
      const trail = trailRefs.current[i];
      const head = headRefs.current[i];
      if (!trail || !head) return;
      const t = (e - f.delay) / L12_DUR;

      if (t < 0) {
        trail.visible = false;
        head.visible = false;
        return;
      }

      if (t >= 1) {
        if (!arrivedRef.current[i]) {
          arrivedRef.current[i] = true;
          arrivalAtRef.current[i] = e;
          flashRef.current[f.ci] = 1;
          count += 1;
        }
        head.visible = false;
        const age = e - arrivalAtRef.current[i];
        const mat = trail.material as THREE.MeshBasicMaterial;
        const op = 0.5 * Math.exp(-age * 2.4);
        if (op < 0.02) {
          trail.visible = false;
        } else {
          trail.visible = true;
          mat.opacity = op;
        }
        return;
      }

      const p = t * t * (3 - 2 * t);
      const mat = trail.material as THREE.MeshBasicMaterial;
      trail.visible = true;
      mat.opacity = Math.min(1, 0.25 + p * 10) * 0.5;
      trail.geometry.setDrawRange(0, Math.max(1, Math.floor(p * L12_TUBE_SEGS)) * 36);
      head.visible = true;
      curves[i].getPointAt(p, head.position);
      head.scale.setScalar(1 + 0.22 * Math.sin(p * Math.PI));
    });
    if (count !== countRef.current) {
      countRef.current = count;
      setMatched(count);
    }

    // phase B — after every order landed, the 6 gap customers get their
    // NULL plaques: the rows a WHERE clause would have deleted
    if (countRef.current >= flights.length) {
      if (gapsStartRef.current < 0) gapsStartRef.current = e + 0.45;
      const ge = e - gapsStartRef.current;
      if (ge >= 0) {
        L12_CUSTOMERS.forEach((c, ci) => {
          if (c.shipped > 0) return;
          const gi = L12_GAP_NAMES.indexOf(c.name);
          const age = ge - 0.35 - gi * 0.22;
          const plaque = plaqueRefs.current[ci];
          if (!plaque) return;
          if (age <= 0) {
            plaque.visible = false;
            return;
          }
          if (!poppedRef.current[ci]) {
            poppedRef.current[ci] = true;
            flashRef.current[ci] = 1;
            gapsRef.current += 1;
            setGaps(gapsRef.current);
          }
          plaque.visible = true;
          const p = age / 0.28;
          const s = popEase(p);
          plaque.scale.setScalar(s);
          plaque.traverse((o) => {
            const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
            if (m && "opacity" in m) m.opacity = Math.min(1, p * 1.6);
          });
        });
      }
    }

    // arrival / pop glow decay
    flashRef.current = flashRef.current.map((f) => f * Math.exp(-dt * 2.2));
    rowMats.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 0.07 + (flashRef.current[i] ?? 0) * 1.6;
    });
  });

  const replay = () => {
    startRef.current = clockRef.current;
    arrivedRef.current = new Array(L12_FLIGHTS.length).fill(false);
    arrivalAtRef.current = new Array(L12_FLIGHTS.length).fill(-1);
    gapsStartRef.current = -1;
    poppedRef.current = new Array(L12_CUSTOMERS.length).fill(false);
    countRef.current = 0;
    gapsRef.current = 0;
    flashRef.current = new Array(L12_CUSTOMERS.length).fill(0);
    plaqueRefs.current.forEach((p) => {
      if (p) p.visible = false;
    });
    setMatched(0);
    setGaps(0);
  };

  useEffect(() => {
    if (replayRef) replayRef.current = replay;
  });

  const done = gaps >= L12_GAP_NAMES.length;
  const allMatched = matched >= flights.length;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <fog attach="fog" args={["#09090b", 15, 32]} />

      <group ref={groupRef}>
        {/* ---- customers table (left, every row survives) ---- */}
        <Text font={FONT} fontSize={0.22} color="#a1a1aa" position={[L12_CUST_X, 3.0, 0]} anchorX="center">
          customers
        </Text>
        <Text font={FONT} fontSize={0.13} color="#52525b" position={[L12_CUST_X, 2.78, 0]} anchorX="center">
          16 rows · all preserved
        </Text>
        {L12_CUSTOMERS.map((c, ci) => (
          <group key={c.id} position={[L12_CUST_X, l12RowY(ci), 0]}>
            <RoundedBox args={[2.9, 0.36, 0.3]} radius={0.05} smoothness={3}>
              <meshStandardMaterial
                ref={(m) => {
                  rowMats.current[ci] = m as THREE.MeshStandardMaterial | null;
                }}
                color="#27272a"
                emissive={c.shipped === 0 ? L12_AMBER : L12_TEAL}
                emissiveIntensity={0.07}
                roughness={0.55}
              />
            </RoundedBox>
            <RoundedBox args={[0.3, 0.28, 0.28]} radius={0.04} smoothness={2} position={[-1.16, 0, 0.05]}>
              <meshStandardMaterial color="#3f3f46" roughness={0.5} />
            </RoundedBox>
            <Text font={FONT} fontSize={0.13} color="#d4d4d8" position={[-1.16, 0, 0.22]} anchorX="center" anchorY="middle">
              {String(c.id)}
            </Text>
            <Text font={FONT} fontSize={0.145} color="#e4e4e7" position={[-0.88, 0, 0.2]} anchorX="left" anchorY="middle">
              {c.name}
            </Text>
            <Text
              font={FONT}
              fontSize={0.125}
              color={c.shipped === 0 ? "#fbbf24" : "#5eead4"}
              position={[1.32, 0, 0.2]}
              anchorX="right"
              anchorY="middle"
            >
              {`${c.shipped} shipped`}
            </Text>
            {/* NULL plaque — pops in phase B for the gap customers */}
            <group
              ref={(g) => {
                plaqueRefs.current[ci] = g;
              }}
              visible={false}
              position={[2.32, 0, 0.12]}
            >
              <RoundedBox args={[0.74, 0.28, 0.06]} radius={0.04} smoothness={2}>
                <meshBasicMaterial color={L12_AMBER} transparent opacity={0} />
              </RoundedBox>
              <Text font={FONT} fontSize={0.12} color="#78350f" position={[0, 0, 0.05]} anchorX="center" anchorY="middle">
                NULL
              </Text>
            </group>
          </group>
        ))}

        {/* ---- shipped orders stack (right) ---- */}
        <Text font={FONT} fontSize={0.22} color="#a1a1aa" position={[L12_STACK_X, 3.9, 0]} anchorX="center">
          orders · shipped
        </Text>
        <Text font={FONT} fontSize={0.13} color="#52525b" position={[L12_STACK_X, 3.66, 0]} anchorX="center">
          103 rows · 30 shipped drawn
        </Text>
        {Array.from({ length: 30 }).map((_, i) => (
          <RoundedBox
            key={i}
            args={[0.9, 0.11, 0.11]}
            radius={0.03}
            smoothness={2}
            position={[L12_STACK_X, L12_STACK_BASE + i * L12_BAR_PITCH, 0]}
          >
            <meshStandardMaterial color={L12_TEAL} emissive={L12_TEAL} emissiveIntensity={0.55} roughness={0.45} />
          </RoundedBox>
        ))}
        <Text font={FONT} fontSize={0.125} color="#71717a" position={[L12_STACK_X, L12_STACK_BASE - 0.24, 0]} anchorX="center">
          + 73 not shipped (52 delivered · 14 pending · 7 cancelled)
        </Text>

        {/* ---- result slabs ---- */}
        <RoundedBox args={[4.5, 0.5, 0.36]} radius={0.08} smoothness={3} position={[-2.5, -4.7, 0]}>
          <meshStandardMaterial color="#18181b" emissive={L12_TEAL} emissiveIntensity={0.16} roughness={0.5} />
        </RoundedBox>
        <Text font={FONT} fontSize={0.155} color="#5eead4" position={[-2.5, -4.7, 0.2]} anchorX="center" anchorY="middle">
          LEFT JOIN · 36 rows = 30 + 6 NULL
        </Text>
        <RoundedBox args={[3.6, 0.5, 0.36]} radius={0.08} smoothness={3} position={[2.3, -4.7, 0]}>
          <meshStandardMaterial color="#18181b" emissive="#fb7185" emissiveIntensity={0.14} roughness={0.5} />
        </RoundedBox>
        <Text font={FONT} fontSize={0.15} color="#fda4af" position={[2.3, -4.7, 0.2]} anchorX="center" anchorY="middle">
          status in WHERE → 30 rows
        </Text>

        {/* ---- projection streams ---- */}
        {flights.map((f, i) => (
          <group key={i}>
            <mesh
              visible={false}
              geometry={tubeGeoms[i]}
              ref={(m) => {
                trailRefs.current[i] = m as THREE.Mesh | null;
              }}
            >
              <meshBasicMaterial
                color={L12_TEAL}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh
              visible={false}
              ref={(m) => {
                headRefs.current[i] = m as THREE.Mesh | null;
              }}
            >
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial
                color={L12_TEAL}
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
              <mesh scale={2.6}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshBasicMaterial
                  color={L12_TEAL}
                  transparent
                  opacity={0.22}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- legend ---- */}
      <Html position={[L12_CUST_X - 1.3, -4.35, 0]} center>
        <div className="pointer-events-none flex items-center gap-3 whitespace-nowrap text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> matched pair ×30
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> NULL fill ×6
          </span>
        </div>
      </Html>

      {/* ---- HUD ---- */}
      <Html position={[0, 4.25, 0]} center>
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg">
          {done
            ? "36 result rows = 30 matches + 6 NULL-filled gaps — a WHERE would have deleted those 6."
            : allMatched
              ? "6 customers have no shipped order — LEFT JOIN keeps them, NULL-filled."
              : `${matched} / ${flights.length} shipped orders matched…`}
        </div>
      </Html>
      <Html position={[0, -5.45, 0]} center>
        <button
          onClick={replay}
          className="pointer-events-auto whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 shadow transition-colors hover:bg-zinc-800"
        >
          ↻ replay the LEFT JOIN
        </button>
      </Html>

      <gridHelper args={[30, 30, "#27272a", "#18181b"]} position={[0, -5.75, 0]} />
      <OrbitControls
        target={[0, -0.4, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={1.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function L12LeftJoinSpace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const lastAutoRef = useRef(0);

  // Auto-replay on scroll-into-view, same contract as the INNER JOIN scene.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const now = performance.now();
            if (now - lastAutoRef.current > 7000) {
              lastAutoRef.current = now;
              replayRef.current?.();
            }
          }
        }
      },
      { threshold: [0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full"
      role="img"
      aria-label="Interactive 3D scene of a LEFT JOIN. All 16 customer rows stand on the left; 30 teal order bars stack on the right. Each shipped order flies a glowing ribbon to its customer, then six amber NULL plaques pop beside the customers nothing arrived for — Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato and Olivia Brown — because the shipped-status condition sits in ON. The result keeps 36 rows: 30 matches plus 6 NULL-filled gaps; moving the condition into WHERE would collapse the result to 30. Drag to orbit."
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.4, 14.4], fov: 38 }}
      >
        <SuspenseBoundary>
          <LeftJoinScene replayRef={replayRef} />
        </SuspenseBoundary>
      </Canvas>
    </div>
  );
}

/* ================= l8-bins-space-3d — GROUP BY: buckets and gates ==========
 * Real seed facts (db/custom.db, verified via scripts/groupby3d-facts.ts):
 *   orders 103 · GROUP BY status → 4 buckets: delivered 52 / shipped 30 /
 *   pending 14 / cancelled 7 · HAVING COUNT(*) > 10 keeps 3 buckets and
 *   drops cancelled (7 ≤ 10) · GROUP BY customer_id would make 16 buckets.
 * All 103 rows are drawn. Phase A — every row lifts out of the unordered
 * stream and arcs into its status bucket while counters tick. Phase B —
 * each bucket pops its result row: one row per bucket. Phase C — the HAVING
 * gate scans the result and cancelled sinks below the line. */

type G8Bucket = { key: string; color: string; n: number };

const G8_BUCKETS: G8Bucket[] = [
  { key: "delivered", color: "#2dd4bf", n: 52 },
  { key: "shipped", color: "#a78bfa", n: 30 },
  { key: "pending", color: "#fbbf24", n: 14 },
  { key: "cancelled", color: "#fb7185", n: 7 },
];

const G8_BIN_X = [-5.55, -1.85, 1.85, 5.55] as const;
const G8_STREAM_COLS = 14;
const G8_STREAM_TOP = 3.3;
const G8_STREAM_PITCH = 0.92;
const G8_STREAM_ROW_PITCH = 0.34;
const G8_BIN_FLOOR = -1.55;
const G8_GATE_Y = -2.45;
const G8_CARD_Y = -3.05;
const G8_DUR = 1.15;
const G8_STEP = 0.042;
const G8_SLOTS_PER_LAYER = 12; // 6 across × 2 deep inside each bin
const G8_TOTAL = 103;

type G8Bar = {
  b: number;
  delay: number;
  tilt: number;
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
};

// Bucket assignment round-robins across the four statuses so every bin fills
// layer by layer, then a deterministic LCG shuffle scatters the waiting
// stream — the raw table should look unordered, because that is exactly the
// problem GROUP BY solves.
const G8_BARS: G8Bar[] = (() => {
  const seq: number[] = [];
  const left = G8_BUCKETS.map((bk) => bk.n);
  let remaining = G8_TOTAL;
  while (remaining > 0) {
    for (let b = 0; b < 4; b++) {
      if (left[b] > 0) {
        seq.push(b);
        left[b] -= 1;
        remaining -= 1;
      }
    }
  }
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }
  const landedPerBucket = [0, 0, 0, 0];
  return seq.map((b, g) => {
    const col = g % G8_STREAM_COLS;
    const row = Math.floor(g / G8_STREAM_COLS);
    const from = new THREE.Vector3(
      (col - (G8_STREAM_COLS - 1) / 2) * G8_STREAM_PITCH,
      G8_STREAM_TOP - row * G8_STREAM_ROW_PITCH,
      col % 2 === 0 ? -0.18 : 0.18,
    );
    const i = landedPerBucket[b]++;
    const layer = Math.floor(i / G8_SLOTS_PER_LAYER);
    const inLayer = i % G8_SLOTS_PER_LAYER;
    const to = new THREE.Vector3(
      G8_BIN_X[b] + ((inLayer % 6) - 2.5) * 0.46,
      G8_BIN_FLOOR + 0.09 + layer * 0.14,
      (Math.floor(inLayer / 6) - 0.5) * 0.3,
    );
    const ctrl = new THREE.Vector3(
      (from.x + to.x) / 2,
      (from.y + to.y) / 2 + 0.55 + (g % 5) * 0.07,
      (from.z + to.z) / 2 + 0.5,
    );
    return { b, delay: g * G8_STEP, tilt: ((g % 3) - 1) * 0.07, from, ctrl, to };
  });
})();

const G8_CURVES = G8_BARS.map((f) => new THREE.QuadraticBezierCurve3(f.from, f.ctrl, f.to));

function BinsScene({ replayRef }: { replayRef?: { current: (() => void) | null } }) {
  const [counts, setCounts] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [gated, setGated] = useState(0);
  const landedRef = useRef(0);
  const countsRef = useRef([0, 0, 0, 0]);
  const arrivedRef = useRef<boolean[]>(new Array(G8_TOTAL).fill(false));
  const startRef = useRef(0);
  const clockRef = useRef(0);
  const flashRef = useRef<number[]>([0, 0, 0, 0]);
  const cardsAtRef = useRef(-1);
  const gateAtRef = useRef(-1);
  const gatedRef = useRef<boolean[]>([false, false, false, false]);
  const gatedCountRef = useRef(0);
  const sinkAtRef = useRef<number[]>([-1, -1, -1, -1]);
  const flushAtRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<Array<THREE.Mesh | null>>([]);
  const cardRefs = useRef<Array<THREE.Group | null>>([]);
  const cardMats = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const wallMats = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const scannerRef = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    clockRef.current = state.clock.elapsedTime;
    const e = clockRef.current - startRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(e * 0.15) * 0.04;
      groupRef.current.position.y = Math.sin(e * 0.55) * 0.035;
    }

    // phase A — rows lift from the stream and arc into their bucket
    let dirty = false;
    G8_BARS.forEach((bar, i) => {
      const mesh = barRefs.current[i];
      if (!mesh) return;
      const t = (e - bar.delay) / G8_DUR;
      if (t <= 0) {
        mesh.position.copy(bar.from);
        mesh.rotation.z = bar.tilt;
        return;
      }
      if (t >= 1) {
        mesh.position.copy(bar.to);
        mesh.rotation.z = bar.tilt * 0.4;
        if (!arrivedRef.current[i]) {
          arrivedRef.current[i] = true;
          countsRef.current[bar.b] += 1;
          landedRef.current += 1;
          flashRef.current[bar.b] = 1;
          dirty = true;
        }
        return;
      }
      const p = t * t * (3 - 2 * t);
      G8_CURVES[i].getPointAt(p, mesh.position);
      mesh.rotation.z = Math.sin(p * Math.PI) * 0.35 * (i % 2 ? 1 : -1);
    });
    // flush counter chips at ~8Hz — 103 per-arrival re-renders would jank
    if (dirty) {
      const now = state.clock.elapsedTime;
      if (now - flushAtRef.current > 0.12 || landedRef.current >= G8_TOTAL) {
        flushAtRef.current = now;
        setCounts([...countsRef.current] as [number, number, number, number]);
      }
    }

    // phase B — one row per bucket: result rows pop once the split completes
    const allLanded = landedRef.current >= G8_TOTAL;
    if (allLanded && cardsAtRef.current < 0) cardsAtRef.current = e + 0.5;
    if (allLanded && gateAtRef.current < 0) gateAtRef.current = cardsAtRef.current + 1.5;

    G8_BUCKETS.forEach((bk, b) => {
      const card = cardRefs.current[b];
      if (!card) return;
      if (cardsAtRef.current < 0) {
        card.visible = false;
        return;
      }
      const age = e - cardsAtRef.current - b * 0.16;
      if (age <= 0) {
        card.visible = false;
        return;
      }
      card.visible = true;
      card.scale.setScalar(popEase(Math.min(1, age / 0.3)));
      const mat = cardMats.current[b];
      const sunk = sinkAtRef.current[b] >= 0;
      if (mat) {
        mat.emissiveIntensity = sunk ? 0.02 : 0.16 + (flashRef.current[b] ?? 0) * 1.5;
        mat.opacity = sunk
          ? Math.max(0.45, 0.95 * Math.exp(-(e - sinkAtRef.current[b]) * 0.9))
          : Math.min(1, age * 4);
      }
      if (sunk) {
        card.position.y = G8_CARD_Y - Math.min(0.55, (e - sinkAtRef.current[b]) * 1.3);
      }
    });

    // phase C — the HAVING gate scans the result row, left to right
    if (scannerRef.current) {
      const ge = gateAtRef.current >= 0 ? e - gateAtRef.current : -1;
      if (ge >= 0 && ge <= 1.7) {
        scannerRef.current.visible = true;
        const x = -7.4 + (ge / 1.7) * 14.8;
        scannerRef.current.position.x = x;
        G8_BUCKETS.forEach((bk, b) => {
          if (!gatedRef.current[b] && x >= G8_BIN_X[b]) {
            gatedRef.current[b] = true;
            gatedCountRef.current += 1;
            flashRef.current[b] = 1;
            if (bk.n <= 10) sinkAtRef.current[b] = e;
            setGated(gatedCountRef.current);
          }
        });
      } else {
        scannerRef.current.visible = false;
      }
    }

    // glow decay + bin wall pulse
    flashRef.current = flashRef.current.map((f) => f * Math.exp(-dt * 2.2));
    wallMats.current.forEach((mat, b) => {
      if (!mat) return;
      mat.emissiveIntensity =
        sinkAtRef.current[b] >= 0 ? 0.02 : 0.05 + (flashRef.current[b] ?? 0) * 1.1;
    });
  });

  const replay = () => {
    startRef.current = clockRef.current;
    arrivedRef.current = new Array(G8_TOTAL).fill(false);
    countsRef.current = [0, 0, 0, 0];
    landedRef.current = 0;
    flashRef.current = [0, 0, 0, 0];
    cardsAtRef.current = -1;
    gateAtRef.current = -1;
    gatedRef.current = [false, false, false, false];
    gatedCountRef.current = 0;
    sinkAtRef.current = [-1, -1, -1, -1];
    G8_BARS.forEach((bar, i) => {
      const mesh = barRefs.current[i];
      if (mesh) {
        mesh.position.copy(bar.from);
        mesh.rotation.z = bar.tilt;
      }
    });
    cardRefs.current.forEach((c) => {
      if (c) {
        c.visible = false;
        c.position.y = G8_CARD_Y;
        c.scale.setScalar(1);
      }
    });
    setCounts([0, 0, 0, 0]);
    setGated(0);
  };

  useEffect(() => {
    if (replayRef) replayRef.current = replay;
  });

  const landed = counts[0] + counts[1] + counts[2] + counts[3];
  const done = gated >= 4;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <fog attach="fog" args={["#09090b", 15, 32]} />

      <group ref={groupRef}>
        {/* ---- the raw table: 103 unordered rows ---- */}
        <Text font={FONT} fontSize={0.22} color="#a1a1aa" position={[0, 3.85, 0]} anchorX="center">
          orders
        </Text>
        <Text font={FONT} fontSize={0.13} color="#52525b" position={[0, 3.62, 0]} anchorX="center">
          103 rows · every row drawn
        </Text>
        {G8_BARS.map((bar, i) => (
          <mesh
            key={i}
            ref={(m) => {
              barRefs.current[i] = m as THREE.Mesh | null;
            }}
            position={bar.from}
            rotation={[0, 0, bar.tilt]}
          >
            <boxGeometry args={[0.4, 0.12, 0.22]} />
            <meshStandardMaterial
              color={G8_BUCKETS[bar.b].color}
              emissive={G8_BUCKETS[bar.b].color}
              emissiveIntensity={0.4}
              roughness={0.45}
            />
          </mesh>
        ))}

        <Text font={FONT} fontSize={0.2} color="#a1a1aa" position={[0, 0.45, 0]} anchorX="center">
          GROUP BY status
        </Text>

        {/* ---- the four buckets ---- */}
        {G8_BUCKETS.map((bk, b) => (
          <group key={bk.key} position={[G8_BIN_X[b], 0, 0]}>
            <RoundedBox args={[3.0, 0.08, 0.95]} radius={0.03} smoothness={2} position={[0, G8_BIN_FLOOR - 0.04, 0]}>
              <meshStandardMaterial color="#27272a" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[3.0, 0.85, 0.07]} radius={0.03} smoothness={2} position={[0, G8_BIN_FLOOR + 0.38, -0.44]}>
              <meshStandardMaterial
                ref={(m) => {
                  wallMats.current[b] = m as THREE.MeshStandardMaterial | null;
                }}
                color="#27272a"
                emissive={bk.color}
                emissiveIntensity={0.05}
                roughness={0.6}
              />
            </RoundedBox>
            <RoundedBox args={[0.07, 0.85, 0.95]} radius={0.03} smoothness={2} position={[-1.5, G8_BIN_FLOOR + 0.38, 0]}>
              <meshStandardMaterial color="#27272a" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.07, 0.85, 0.95]} radius={0.03} smoothness={2} position={[1.5, G8_BIN_FLOOR + 0.38, 0]}>
              <meshStandardMaterial color="#27272a" roughness={0.6} />
            </RoundedBox>
            <Text font={FONT} fontSize={0.19} color={bk.color} position={[0, G8_BIN_FLOOR + 1.02, 0]} anchorX="center">
              {bk.key}
            </Text>
            <Html position={[0, G8_BIN_FLOOR + 1.3, 0]} center>
              <div className="pointer-events-none whitespace-nowrap rounded border border-zinc-700 bg-zinc-950/90 px-1.5 py-0.5 text-[10px] text-zinc-200">
                {counts[b]} / {bk.n}
              </div>
            </Html>
          </group>
        ))}

        {/* ---- the HAVING gate ---- */}
        <mesh position={[0, G8_GATE_Y, 0.3]}>
          <boxGeometry args={[13.8, 0.035, 0.035]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
        </mesh>
        <Text font={FONT} fontSize={0.15} color="#fbbf24" position={[0, G8_GATE_Y + 0.22, 0.3]} anchorX="center">
          HAVING COUNT(*) &gt; 10
        </Text>
        <mesh ref={scannerRef} visible={false} position={[0, G8_GATE_Y, 0.3]}>
          <boxGeometry args={[0.07, 0.55, 0.07]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>

        {/* ---- result rows: one per bucket, popped after the split ---- */}
        {G8_BUCKETS.map((bk, b) => (
          <group
            key={`card-${bk.key}`}
            ref={(g) => {
              cardRefs.current[b] = g;
            }}
            visible={false}
            position={[G8_BIN_X[b], G8_CARD_Y, 0.35]}
          >
            <RoundedBox args={[2.35, 0.46, 0.12]} radius={0.05} smoothness={2}>
              <meshStandardMaterial
                ref={(m) => {
                  cardMats.current[b] = m as THREE.MeshStandardMaterial | null;
                }}
                color="#18181b"
                emissive={bk.color}
                emissiveIntensity={0.16}
                roughness={0.5}
                transparent
              />
            </RoundedBox>
            <Text font={FONT} fontSize={0.17} color={bk.color} position={[0, 0, 0.09]} anchorX="center" anchorY="middle">
              {`${bk.key} · ${bk.n}`}
            </Text>
          </group>
        ))}

        {/* ---- result slab ---- */}
        <RoundedBox args={[5.6, 0.5, 0.36]} radius={0.08} smoothness={3} position={[0, -4.2, 0]}>
          <meshStandardMaterial color="#18181b" emissive="#2dd4bf" emissiveIntensity={0.14} roughness={0.5} />
        </RoundedBox>
        <Text font={FONT} fontSize={0.16} color="#5eead4" position={[0, -4.2, 0.2]} anchorX="center" anchorY="middle">
          GROUP BY → 4 rows · after HAVING → 3 rows
        </Text>
      </group>

      {/* ---- legend ---- */}
      <Html position={[-5.4, -4.2, 0]} center>
        <div className="pointer-events-none flex items-center gap-2 whitespace-nowrap text-[10px] text-zinc-400">
          {G8_BUCKETS.map((bk) => (
            <span key={bk.key} className="inline-flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: bk.color }}
              />
              {bk.key}
            </span>
          ))}
        </div>
      </Html>

      {/* ---- HUD ---- */}
      <Html position={[0, 4.3, 0]} center>
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg">
          {done
            ? "3 of 4 buckets pass HAVING COUNT(*) > 10 — cancelled (7) is filtered out."
            : gated > 0
              ? `HAVING gate checked ${gated} of 4 buckets…`
              : landed >= G8_TOTAL
                ? "One row per bucket — GROUP BY returns 4 result rows."
                : `${landed} / ${G8_TOTAL} rows bucketed — split by status, counted per bucket.`}
        </div>
      </Html>
      <Html position={[0, -4.95, 0]} center>
        <button
          onClick={replay}
          className="pointer-events-auto whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 shadow transition-colors hover:bg-zinc-800"
        >
          ↻ replay the buckets
        </button>
      </Html>

      <gridHelper args={[30, 30, "#27272a", "#18181b"]} position={[0, -5.25, 0]} />
      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={1.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function L8BinsSpace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const lastAutoRef = useRef(0);

  // Auto-replay on scroll-into-view, same contract as the join scenes.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const now = performance.now();
            if (now - lastAutoRef.current > 7000) {
              lastAutoRef.current = now;
              replayRef.current?.();
            }
          }
        }
      },
      { threshold: [0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full"
      role="img"
      aria-label="Interactive 3D scene of GROUP BY and HAVING. All 103 order rows wait in an unordered stream, then fly one by one into four status buckets — delivered fills to 52, shipped to 30, pending to 14, cancelled to 7 — while counters tick. Each bucket then pops its result row: one row per bucket. Finally the HAVING COUNT(*) > 10 gate scans the result and the cancelled bucket (7, below the gate) sinks out, leaving 3 of 4 rows. Drag to orbit."
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.9, 14.2], fov: 38 }}
      >
        <SuspenseBoundary>
          <BinsScene replayRef={replayRef} />
        </SuspenseBoundary>
      </Canvas>
    </div>
  );
}

/* ================= t32-running-space-3d — the running total, in space ======
 * Real seed facts (db/custom.db, verified via scripts/window3d-facts.ts):
 *   14 month buckets 2024-01 → 2025-02 · monthly rev 3731.97 / 3609.64 / … /
 *   2390.53 · SUM(rev) OVER (ORDER BY mon) walks 3731.97 → 7341.61 → … →
 *   34833.28, and the last running value equals the plain SUM (34833.28).
 * The default frame (everything from the first row to the current row) is
 * drawn literally: a translucent panel pinned at 2024-01 whose leading edge
 * sweeps right; monthly bars rise and the teal running line reveals as the
 * edge passes each month. The pinned trailing edge IS UNBOUNDED PRECEDING. */

const T32_MONS = [
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07",
  "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02",
] as const;
const T32_REV = [3731.97, 3609.64, 2617.08, 2468.91, 2910.31, 2047.43, 1193.86, 2352.07, 3116.04, 2975.67, 1648.8, 2101.47, 1669.5, 2390.53];
const T32_RUNNING = [3731.97, 7341.61, 9958.69, 12427.6, 15337.91, 17385.34, 18579.2, 20931.27, 24047.31, 27022.98, 28671.78, 30773.25, 32442.75, 34833.28];
const T32_N = 14;
const T32_LIFETIME = 34833.28;

const T32_X0 = -6.1;
const T32_PITCH = 0.94;
const T32_BASE = -0.9;
const T32_REV_H = 2.2; // tallest bar (3731.97)
const T32_LINE_H = 3.1; // running line scale (34833.28)
const T32_BAR_W = 0.5;
const T32_SWEEP = 0.5; // seconds per month
const T32_TUBE_SEGS = 120;
const T32_VIOLET = "#a78bfa";
const T32_TEAL = "#2dd4bf";
const T32_AMBER = "#fbbf24";

const t32X = (m: number) => T32_X0 + m * T32_PITCH;
const t32RevH = (m: number) => (T32_REV[m] / 3731.97) * T32_REV_H;
const t32LineY = (m: number) => T32_BASE + (T32_RUNNING[m] / T32_LIFETIME) * T32_LINE_H;
const t32Clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const T32_LINE_PTS = T32_MONS.map((_, m) => new THREE.Vector3(t32X(m), t32LineY(m), 0.45));
const T32_LINE_CURVE = new THREE.CatmullRomCurve3(T32_LINE_PTS, false, "catmullrom", 0.2);

function RunningTotalScene({ replayRef }: { replayRef?: { current: (() => void) | null } }) {
  const [covered, setCovered] = useState(0);
  const coveredRef = useRef(0);
  const startRef = useRef(0);
  const clockRef = useRef(0);
  const doneAtRef = useRef(-1);
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<Array<THREE.Mesh | null>>([]);
  const edgeRef = useRef<THREE.Mesh>(null);
  const panelRef = useRef<THREE.Mesh>(null);
  const tubeRef = useRef<THREE.Mesh>(null);
  const slabRef = useRef<THREE.Group>(null);

  const tubeGeom = useMemo(
    () => new THREE.TubeGeometry(T32_LINE_CURVE, T32_TUBE_SEGS, 0.022, 6, false),
    [],
  );
  useEffect(() => () => tubeGeom.dispose(), [tubeGeom]);

  useFrame((state, dt) => {
    clockRef.current = state.clock.elapsedTime;
    const e = clockRef.current - startRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(e * 0.14) * 0.035;
      groupRef.current.position.y = Math.sin(e * 0.5) * 0.03;
    }

    // the default frame's leading edge sweeps right, one month per step —
    // overshoot to N so the edge clears the LAST bar instead of stalling at
    // its center (coveredF capped at N-1 left 2025-02 half-risen forever)
    const coveredF = t32Clamp01((e - 0.6) / T32_SWEEP) * T32_N;
    const leadX = T32_X0 - 0.45 + (coveredF + 1) * T32_PITCH - T32_PITCH * 0.45;

    // monthly bars rise as the edge passes them
    let cov = 0;
    T32_MONS.forEach((_, m) => {
      const mesh = barRefs.current[m];
      if (!mesh) return;
      const t = t32Clamp01((leadX - (t32X(m) - T32_BAR_W / 2)) / 0.7);
      const s = t >= 1 ? 1 : popEase(t);
      mesh.scale.y = Math.max(0.001, s);
      mesh.position.y = T32_BASE + (t32RevH(m) * s) / 2;
      if (t >= 1) cov += 1;
    });
    if (cov !== coveredRef.current) {
      coveredRef.current = cov;
      setCovered(cov);
    }

    // frame panel + leading edge follow the sweep
    const leftX = T32_X0 - 0.45;
    const width = Math.max(0.2, leadX - leftX);
    if (panelRef.current) {
      panelRef.current.scale.x = width;
      panelRef.current.position.x = leftX + width / 2;
    }
    if (edgeRef.current) edgeRef.current.position.x = leadX;

    // the running line reveals behind the edge
    if (tubeRef.current) {
      const p = t32Clamp01((leadX - t32X(0)) / (t32X(T32_N - 1) - t32X(0)));
      tubeRef.current.visible = p > 0.02;
      tubeRef.current.geometry.setDrawRange(0, Math.max(1, Math.floor(p * T32_TUBE_SEGS)) * 42);
    }

    // lifetime slab pops once every month is covered
    if (cov >= T32_N && doneAtRef.current < 0) doneAtRef.current = e + 0.4;
    if (slabRef.current) {
      const age = doneAtRef.current < 0 ? 0 : e - doneAtRef.current;
      slabRef.current.visible = age > 0;
      if (age > 0) slabRef.current.scale.setScalar(popEase(Math.min(1, age / 0.35)));
    }
  });

  const replay = () => {
    startRef.current = clockRef.current;
    coveredRef.current = 0;
    doneAtRef.current = -1;
    barRefs.current.forEach((mesh, m) => {
      if (!mesh) return;
      mesh.scale.y = 0.001;
      mesh.position.y = T32_BASE;
    });
    if (tubeRef.current) tubeRef.current.visible = false;
    if (slabRef.current) slabRef.current.visible = false;
    setCovered(0);
  };

  useEffect(() => {
    if (replayRef) replayRef.current = replay;
  });

  const done = covered >= T32_N;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <fog attach="fog" args={["#09090b", 15, 32]} />

      <group ref={groupRef}>
        <Text font={FONT} fontSize={0.2} color="#a1a1aa" position={[-4.6, 3.05, 0]} anchorX="center">
          monthly revenue
        </Text>
        <Text font={FONT} fontSize={0.2} color="#5eead4" position={[4.35, 3.05, 0]} anchorX="center">
          running total
        </Text>
        <Text font={FONT} fontSize={0.115} color="#52525b" position={[0, 2.78, 0]} anchorX="center">
          SUM(rev) OVER (ORDER BY mon) · default frame: first row → current row
        </Text>

        {/* the default frame: trailing edge pinned at 2024-01, edge sweeps right */}
        <mesh ref={panelRef} position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 3.5, 0.5]} />
          <meshBasicMaterial color={T32_TEAL} transparent opacity={0.09} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[T32_X0 - 0.45, 0.75, 0.2]}>
          <boxGeometry args={[0.045, 3.5, 0.045]} />
          <meshBasicMaterial color={T32_TEAL} transparent opacity={0.75} />
        </mesh>
        <mesh ref={edgeRef} position={[T32_X0 - 0.45, 0.75, 0.2]}>
          <boxGeometry args={[0.06, 3.5, 0.06]} />
          <meshBasicMaterial color={T32_AMBER} />
        </mesh>

        {/* monthly revenue bars */}
        {T32_MONS.map((mon, m) => (
          <group key={mon}>
            <mesh
              ref={(mesh) => {
                barRefs.current[m] = mesh as THREE.Mesh | null;
              }}
              position={[t32X(m), T32_BASE, -0.55]}
              scale={[1, 0.001, 1]}
            >
              <boxGeometry args={[T32_BAR_W, t32RevH(m), 0.5]} />
              <meshStandardMaterial color={T32_VIOLET} emissive={T32_VIOLET} emissiveIntensity={0.35} roughness={0.45} />
            </mesh>
            <Text font={FONT} fontSize={0.072} color="#a1a1aa" position={[t32X(m), T32_BASE + t32RevH(m) + 0.14, -0.55]} anchorX="center">
              {T32_REV[m].toFixed(2)}
            </Text>
            <Text font={FONT} fontSize={0.088} color="#71717a" position={[t32X(m), T32_BASE - 0.26, 0]} anchorX="center">
              {mon}
            </Text>
            {/* running chip pops once the edge has passed this month */}
            <Html position={[t32X(m), t32LineY(m) + 0.26, 0.45]} center>
              <div
                className="pointer-events-none whitespace-nowrap rounded border border-teal-800 bg-zinc-950/90 px-1 py-0.5 text-[9px] text-teal-300 transition-opacity duration-300"
                style={{ opacity: m < covered ? 1 : 0 }}
              >
                {T32_RUNNING[m].toFixed(2)}
              </div>
            </Html>
          </group>
        ))}

        {/* the running line — revealed behind the sweeping edge */}
        <mesh ref={tubeRef} visible={false} geometry={tubeGeom}>
          <meshBasicMaterial color={T32_TEAL} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* lifetime slab — last running = plain SUM */}
        <group ref={slabRef} visible={false} position={[0, -1.95, 0]}>
          <RoundedBox args={[6.2, 0.5, 0.36]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#18181b" emissive={T32_TEAL} emissiveIntensity={0.16} roughness={0.5} />
          </RoundedBox>
          <Text font={FONT} fontSize={0.16} color="#5eead4" position={[0, 0, 0.2]} anchorX="center" anchorY="middle">
            last running = plain SUM → 34833.28
          </Text>
        </group>
      </group>

      {/* ---- HUD ---- */}
      <Html position={[0, 3.55, 0]} center>
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg">
          {done
            ? "The frame kept everything from 2024-01 — the last step equals the plain SUM: 34833.28."
            : covered === 0
              ? "The window frame is pinned at 2024-01 (UNBOUNDED PRECEDING)…"
              : `Running total after ${T32_MONS[Math.min(covered, T32_N) - 1]}: ${T32_RUNNING[Math.min(covered, T32_N) - 1].toFixed(2)} — every step preserved.`}
        </div>
      </Html>
      <Html position={[0, -2.55, 0]} center>
        <button
          onClick={replay}
          className="pointer-events-auto whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 shadow transition-colors hover:bg-zinc-800"
        >
          ↻ replay the running total
        </button>
      </Html>

      <gridHelper args={[30, 30, "#27272a", "#18181b"]} position={[0, -2.9, 0]} />
      <OrbitControls
        target={[0, 0.4, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={18}
        maxPolarAngle={1.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function T32RunningSpace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const lastAutoRef = useRef(0);

  // Auto-replay on scroll-into-view, same contract as the other 3D scenes.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const now = performance.now();
            if (now - lastAutoRef.current > 7000) {
              lastAutoRef.current = now;
              replayRef.current?.();
            }
          }
        }
      },
      { threshold: [0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full"
      role="img"
      aria-label="Interactive 3D scene of a window-function running total. Fourteen violet monthly revenue bars (2024-01 to 2025-02) rise as an amber window edge sweeps right, with the teal frame panel pinned at 2024-01 — the default frame UNBOUNDED PRECEDING to CURRENT ROW. A teal running-total line reveals behind the edge, walking 3731.97, 7341.61, 9958.69 up to 34833.28, and the final slab reminds that the last running value equals the plain SUM of 34833.28. Drag to orbit."
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.8, 12.6], fov: 40 }}
      >
        <SuspenseBoundary>
          <RunningTotalScene replayRef={replayRef} />
        </SuspenseBoundary>
      </Canvas>
    </div>
  );
}

/* ================= d48-index-space-3d — the index descent, in space ========
 * Real seed facts (db/custom.db, verified via scripts/indextree3d-facts.ts):
 *   orders 103 rows · customers 16 · customer_id=1 (Alice Chen) owns 24 of
 *   them, occupying rowid positions 1–24 (contiguous — the seed inserts her
 *   orders first) · sqlite_master holds ZERO indexes on orders before this
 *   lesson · EQP pre-index prints exactly "SCAN orders"; after
 *   CREATE INDEX idx_orders_customer it prints exactly
 *   "SEARCH orders USING INDEX idx_orders_customer (customer_id=?)".
 *   Per-key leaf counts 1·24 2·2 3·5 4·2 5·17 6·3 7·14 8·3 9·4 10·2 11·4
 *   12·1 13·13 14·4 15·1 16·4 (sum = 103).
 * The scene plays the lesson's whole arc: a full SCAN sweep (every row read,
 * the 24 matches found early, 79 reads wasted), the CREATE INDEX build (16
 * sorted keys settle into a stylized B-tree — root + 6 leaves), then the
 * SEARCH descent (probe drops to the root, one beam to leaf 1, 24 row
 * pointers fly back to the same 24 rows they found before). */

const D48_COLS = 14;
const D48_ROWS = 8;
const D48_N = 103;
const D48_MATCH_N = 24; // customer_id = 1 → rowid positions 1..24 (0-based 0..23)
const D48_KEYS = [
  { k: 1, n: 24 }, { k: 2, n: 2 }, { k: 3, n: 5 }, { k: 4, n: 2 },
  { k: 5, n: 17 }, { k: 6, n: 3 }, { k: 7, n: 14 }, { k: 8, n: 3 },
  { k: 9, n: 4 }, { k: 10, n: 2 }, { k: 11, n: 4 }, { k: 12, n: 1 },
  { k: 13, n: 13 }, { k: 14, n: 4 }, { k: 15, n: 1 }, { k: 16, n: 4 },
] as const;
// leaves hold 3 keys each; root separators are the first key of leaves 2..6
const D48_LEAVES: Array<Array<{ k: number; n: number }>> = [
  D48_KEYS.slice(0, 3), D48_KEYS.slice(3, 6), D48_KEYS.slice(6, 9),
  D48_KEYS.slice(9, 12), D48_KEYS.slice(12, 15), D48_KEYS.slice(15, 16),
];
const D48_ROOT_SEPS = "4 · 7 · 10 · 13 · 16";

const D48_PITCH = 0.31;
const D48_TABLE_X = -2.6; // grid center x
const D48_TABLE_Y = 1.5;  // top row y
const D48_TABLE_Z = -1.0;
const D48_LEAF_Y = 0.55;
const D48_LEAF_X0 = 0.55;
const D48_LEAF_PITCH = 0.92;
const D48_ROOT_X = 2.85;
const D48_ROOT_Y = 2.05;
const D48_TREE_Z = 0.3;

const D48_TEAL = "#2dd4bf";
const D48_AMBER = "#fbbf24";
const D48_ROSE = "#fb7185";
const D48_IDLE = "#27272a";
const D48_READ = "#4c2a35";
const D48_MATCH_FILL = "#0f3d38";

const D48_T0 = 0.8;                  // scan start
const D48_SCAN = 6.2;                // full sweep duration
const D48_T1 = D48_T0 + D48_SCAN + 0.35;   // build start (7.35)
const D48_BUILD = 1.5;
const D48_T2 = D48_T1 + D48_BUILD + 0.45;  // search start (9.3)
const D48_DROP = 0.55;               // probe falls onto the root
const D48_BEAM = 0.55;               // root → leaf beam
const D48_T3 = D48_T2 + D48_DROP + D48_BEAM + 0.25; // pointers start (10.65)
const D48_RIB_DUR = 0.95;
const D48_RIB_STEP = 0.055;
const D48_T4 = D48_T3 + D48_MATCH_N * D48_RIB_STEP + D48_RIB_DUR + 0.35;

const d48ChipX = (i: number) => D48_TABLE_X + (i % D48_COLS - (D48_COLS - 1) / 2) * D48_PITCH;
const d48ChipY = (i: number) => D48_TABLE_Y - Math.floor(i / D48_COLS) * D48_PITCH;
const d48Clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// 24 pointer ribbons: leaf 1's front face → each matched table chip
type D48Pointer = { delay: number; from: THREE.Vector3; ctrl: THREE.Vector3; to: THREE.Vector3 };
const D48_POINTERS: D48Pointer[] = (() => {
  const from = new THREE.Vector3(D48_LEAF_X0, D48_LEAF_Y, D48_TREE_Z + 0.25);
  const out: D48Pointer[] = [];
  for (let i = 0; i < D48_MATCH_N; i++) {
    const to = new THREE.Vector3(d48ChipX(i), d48ChipY(i), D48_TABLE_Z + 0.1);
    const ctrl = new THREE.Vector3((from.x + to.x) / 2, (from.y + to.y) / 2 + 0.5, 0.45);
    out.push({ delay: i * D48_RIB_STEP, from, ctrl, to });
  }
  return out;
})();

function IndexTreeScene({ replayRef }: { replayRef?: { current: (() => void) | null } }) {
  const [read, setRead] = useState(0);
  const [stage, setStage] = useState<"idle" | "scan" | "build" | "descend" | "fetch" | "done">("idle");
  const startRef = useRef(0);
  const clockRef = useRef(0);
  const stageRef = useRef<string>("idle");
  const sweptRef = useRef(0); // fully swept columns so far
  const doneAtRef = useRef(-1);
  const groupRef = useRef<THREE.Group>(null);
  const chipRefs = useRef<Array<THREE.Mesh | null>>(new Array(D48_N).fill(null));
  const scanBarRef = useRef<THREE.Mesh>(null);
  const scanPanelRef = useRef<THREE.Mesh>(null);
  const treeRef = useRef<THREE.Group>(null);
  const leafRefs = useRef<Array<THREE.Group | null>>(new Array(6).fill(null));
  const rootRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const ribRefs = useRef<Array<THREE.Mesh | null>>([]);
  const ribMatRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const arrivedRef = useRef<boolean[]>(new Array(D48_MATCH_N).fill(false));
  const flashRef = useRef<number[]>(new Array(D48_MATCH_N).fill(0));
  const slabRef = useRef<THREE.Group>(null);

  const setStageSafe = (s: typeof stage) => {
    if (stageRef.current !== s) {
      stageRef.current = s;
      setStage(s);
    }
  };

  const ribCurves = useMemo(
    () => D48_POINTERS.map((p) => new THREE.QuadraticBezierCurve3(p.from, p.ctrl, p.to)),
    [],
  );
  const ribGeoms = useMemo(
    () => ribCurves.map((c) => new THREE.TubeGeometry(c, 36, 0.016, 5, false)),
    [ribCurves],
  );
  useEffect(() => () => ribGeoms.forEach((g) => g.dispose()), [ribGeoms]);

  // root → leaf-1 beam (2-point curve → tube)
  const beamCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(D48_ROOT_X, D48_ROOT_Y - 0.22, D48_TREE_Z),
        new THREE.Vector3(D48_LEAF_X0, D48_LEAF_Y + 0.26, D48_TREE_Z),
      ]),
    [],
  );
  const beamGeom = useMemo(() => new THREE.TubeGeometry(beamCurve, 16, 0.02, 5, false), [beamCurve]);
  useEffect(() => () => beamGeom.dispose(), [beamGeom]);

  // paint one chip's three states
  const paintChip = (i: number, mode: "idle" | "read" | "match") => {
    const mesh = chipRefs.current[i];
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mode === "idle") {
      mat.color.set(D48_IDLE);
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    } else if (mode === "read") {
      mat.color.set(D48_READ);
      mat.emissive.set(D48_ROSE);
      mat.emissiveIntensity = 0.08;
    } else {
      mat.color.set(D48_MATCH_FILL);
      mat.emissive.set(D48_TEAL);
      mat.emissiveIntensity = 0.5;
    }
  };

  useFrame((state, dt) => {
    clockRef.current = state.clock.elapsedTime;
    const e = clockRef.current - startRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(e * 0.13) * 0.03;
      groupRef.current.position.y = Math.sin(e * 0.5) * 0.03;
    }

    // ---- phase A: SCAN sweep, column-major ----
    const colF = d48Clamp01((e - D48_T0) / D48_SCAN) * D48_COLS;
    const swept = Math.min(D48_COLS, Math.floor(colF));
    if (swept > sweptRef.current && e >= D48_T0) {
      for (let c = sweptRef.current; c < swept; c++) {
        for (let r = 0; r < D48_ROWS; r++) {
          const i = r * D48_COLS + c;
          if (i >= D48_N) break;
          paintChip(i, i < D48_MATCH_N ? "match" : "read");
        }
      }
      sweptRef.current = swept;
      setRead(Math.min(D48_N, swept * D48_ROWS));
    }
    // scanner bar + swept panel
    const scanActive = e >= D48_T0 && colF < D48_COLS;
    if (scanBarRef.current) {
      scanBarRef.current.visible = scanActive;
      const c = Math.min(D48_COLS, colF);
      scanBarRef.current.position.x =
        D48_TABLE_X + (c - (D48_COLS - 1) / 2) * D48_PITCH - D48_PITCH / 2;
    }
    if (scanPanelRef.current) {
      scanPanelRef.current.visible = e >= D48_T0;
      const w = Math.max(0.05, Math.min(D48_COLS, colF) * D48_PITCH);
      const rightX = D48_TABLE_X + (Math.min(D48_COLS, colF) - (D48_COLS - 1) / 2) * D48_PITCH - D48_PITCH / 2;
      scanPanelRef.current.scale.x = w;
      scanPanelRef.current.position.x = rightX - w / 2;
    }
    if (scanActive) setStageSafe("scan");
    else if (e >= D48_T2 + D48_DROP + D48_BEAM) setStageSafe(e >= D48_T4 ? "done" : "fetch");
    else if (e >= D48_T2) setStageSafe("descend");
    else if (e >= D48_T1) setStageSafe("build");

    // ---- phase B: the tree rises, leaves staggered ----
    if (treeRef.current) {
      const buildT = d48Clamp01((e - D48_T1) / D48_BUILD);
      treeRef.current.visible = buildT > 0;
    }
    leafRefs.current.forEach((leaf, li) => {
      if (!leaf) return;
      const t = d48Clamp01((e - D48_T1 - li * 0.13) / 0.45);
      leaf.scale.setScalar(t >= 1 ? 1 : t <= 0 ? 0.001 : popEase(t));
    });
    if (rootRef.current) {
      const t = d48Clamp01((e - D48_T1 - 0.85) / 0.45);
      rootRef.current.scale.setScalar(t >= 1 ? 1 : t <= 0 ? 0.001 : popEase(t));
    }

    // ---- phase C: probe drop → beam → 24 pointers ----
    if (probeRef.current) {
      if (e < D48_T2) probeRef.current.visible = false;
      else if (e < D48_T2 + D48_DROP) {
        probeRef.current.visible = true;
        const t = (e - D48_T2) / D48_DROP;
        probeRef.current.position.set(D48_ROOT_X, 3.3 + (D48_ROOT_Y + 0.15 - 3.3) * t, D48_TREE_Z);
      } else if (e < D48_T2 + D48_DROP + D48_BEAM) {
        probeRef.current.visible = true;
        beamCurve.getPointAt((e - D48_T2 - D48_DROP) / D48_BEAM, probeRef.current.position);
      } else if (e < D48_T3 + 0.6) {
        probeRef.current.visible = true;
        beamCurve.getPointAt(1, probeRef.current.position);
      } else probeRef.current.visible = false;
    }
    if (beamRef.current) {
      const t = d48Clamp01((e - D48_T2 - D48_DROP) / D48_BEAM);
      beamRef.current.visible = t > 0 && e < D48_T3 + 1.2;
      beamRef.current.geometry.setDrawRange(0, Math.max(1, Math.floor(t * 16)) * 30);
    }

    D48_POINTERS.forEach((_, i) => {
      const rib = ribRefs.current[i];
      const mat = ribMatRefs.current[i];
      if (!rib || !mat) return;
      const t = (e - D48_T3 - D48_POINTERS[i].delay) / D48_RIB_DUR;
      if (t <= 0) {
        rib.visible = false;
        return;
      }
      if (t >= 1) {
        if (!arrivedRef.current[i]) {
          arrivedRef.current[i] = true;
          flashRef.current[i] = 1;
        }
        rib.visible = true;
        rib.geometry.setDrawRange(0, Infinity);
        mat.opacity = 0.55;
        return;
      }
      const p = t * t * (3 - 2 * t);
      rib.visible = true;
      mat.opacity = 0.15 + p * 0.45;
      rib.geometry.setDrawRange(0, Math.max(1, Math.floor(p * 36)) * 30);
    });
    flashRef.current = flashRef.current.map((f) => f * Math.exp(-dt * 2.6));
    arrivedRef.current.forEach((a, i) => {
      if (!a) return;
      const mesh = chipRefs.current[i];
      if (!mesh) return;
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + flashRef.current[i] * 1.4;
    });

    // punchline slab
    if (e >= D48_T4 && doneAtRef.current < 0) doneAtRef.current = e;
    if (slabRef.current) {
      const age = doneAtRef.current < 0 ? 0 : e - doneAtRef.current;
      slabRef.current.visible = age > 0;
      if (age > 0) slabRef.current.scale.setScalar(popEase(Math.min(1, age / 0.35)));
    }
  });

  const replay = () => {
    startRef.current = clockRef.current;
    stageRef.current = "idle";
    sweptRef.current = 0;
    doneAtRef.current = -1;
    arrivedRef.current = new Array(D48_MATCH_N).fill(false);
    flashRef.current = new Array(D48_MATCH_N).fill(0);
    for (let i = 0; i < D48_N; i++) paintChip(i, "idle");
    if (treeRef.current) treeRef.current.visible = false;
    leafRefs.current.forEach((leaf) => leaf?.scale.setScalar(0.001));
    rootRef.current?.scale.setScalar(0.001);
    if (probeRef.current) probeRef.current.visible = false;
    if (beamRef.current) beamRef.current.visible = false;
    ribRefs.current.forEach((rib) => {
      if (rib) rib.visible = false;
    });
    if (slabRef.current) slabRef.current.visible = false;
    setRead(0);
    setStage("idle");
  };

  useEffect(() => {
    if (replayRef) replayRef.current = replay;
  });

  const hud =
    stage === "done"
      ? "SCAN read 103 · SEARCH visited 2 nodes and fetched the same 24 — writes pay rent on the tree."
      : stage === "fetch"
        ? "SEARCH USING INDEX — 24 row pointers fly to their rows; the other 79 are never touched."
        : stage === "descend"
          ? "CREATE INDEX — 16 keys sort into a B-tree; the probe descends root → leaf."
          : stage === "build"
            ? "CREATE INDEX idx_orders_customer — 16 keys sort into a B-tree…"
            : stage === "scan"
              ? `SCAN orders — ${Math.min(read, D48_N)} / 103 rows read · 24 matched (customer_id = 1)`
              : "SELECT * FROM orders WHERE customer_id = 1 — orders has 0 indexes…";

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <fog attach="fog" args={["#09090b", 15, 32]} />

      <group ref={groupRef}>
        {/* ---- the orders table: 103 chips in rowid order ---- */}
        <Text font={FONT} fontSize={0.16} color="#a1a1aa" position={[D48_TABLE_X, 1.98, D48_TABLE_Z]} anchorX="center">
          orders — 103 rows · 0 indexes
        </Text>
        <Text font={FONT} fontSize={0.1} color="#52525b" position={[D48_TABLE_X, 1.78, D48_TABLE_Z]} anchorX="center">
          WHERE customer_id = 1 → 24 rows
        </Text>
        {Array.from({ length: D48_N }, (_, i) => (
          <mesh
            key={i}
            ref={(mesh) => {
              chipRefs.current[i] = mesh as THREE.Mesh | null;
            }}
            position={[d48ChipX(i), d48ChipY(i), D48_TABLE_Z]}
          >
            <boxGeometry args={[0.22, 0.17, 0.14]} />
            <meshStandardMaterial color={D48_IDLE} roughness={0.6} />
          </mesh>
        ))}

        {/* scanner: amber leading bar + translucent swept panel */}
        <mesh ref={scanPanelRef} position={[D48_TABLE_X, 0.45, D48_TABLE_Z + 0.18]} visible={false}>
          <boxGeometry args={[1, 2.85, 0.04]} />
          <meshBasicMaterial color={D48_ROSE} transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={scanBarRef} position={[D48_TABLE_X, 0.45, D48_TABLE_Z + 0.2]} visible={false}>
          <boxGeometry args={[0.05, 2.85, 0.05]} />
          <meshBasicMaterial color={D48_AMBER} />
        </mesh>

        {/* ---- idx_orders_customer: root + 6 leaves ---- */}
        <group ref={treeRef} visible={false}>
          <Text font={FONT} fontSize={0.16} color="#5eead4" position={[D48_ROOT_X, 2.62, D48_TREE_Z]} anchorX="center">
            idx_orders_customer
          </Text>
          <Text font={FONT} fontSize={0.1} color="#52525b" position={[D48_ROOT_X, 2.44, D48_TREE_Z]} anchorX="center">
            16 keys · sorted for descent
          </Text>
          <group ref={rootRef} position={[D48_ROOT_X, D48_ROOT_Y, D48_TREE_Z]} scale={0.001}>
            <RoundedBox args={[2.5, 0.4, 0.24]} radius={0.05} smoothness={3}>
              <meshStandardMaterial color="#18181b" emissive={D48_TEAL} emissiveIntensity={0.22} roughness={0.5} />
            </RoundedBox>
            <Text font={FONT} fontSize={0.105} color="#5eead4" position={[0, 0, 0.14]} anchorX="center" anchorY="middle">
              root {D48_ROOT_SEPS}
            </Text>
          </group>
          {D48_LEAVES.map((leaf, li) => (
            <group
              key={li}
              ref={(g) => {
                leafRefs.current[li] = g as THREE.Group | null;
              }}
              position={[D48_LEAF_X0 + li * D48_LEAF_PITCH, D48_LEAF_Y, D48_TREE_Z]}
              scale={0.001}
            >
              <RoundedBox args={[0.84, 0.44, 0.22]} radius={0.05} smoothness={3}>
                <meshStandardMaterial color="#18181b" emissive={D48_TEAL} emissiveIntensity={0.1} roughness={0.55} />
              </RoundedBox>
              {leaf.map((entry, ki) => (
                <Text
                  key={entry.k}
                  font={FONT}
                  fontSize={0.078}
                  color={entry.k === 1 ? "#5eead4" : "#a1a1aa"}
                  position={[(ki - (leaf.length - 1) / 2) * 0.27, 0, 0.13]}
                  anchorX="center"
                  anchorY="middle"
                >
                  {`${entry.k}·${entry.n}`}
                </Text>
              ))}
              <Text
                font={FONT}
                fontSize={0.07}
                color="#52525b"
                position={[0, -0.32, 0]}
                anchorX="center"
              >
                {`keys ${leaf[0].k}-${leaf[leaf.length - 1].k}`}
              </Text>
            </group>
          ))}
          <Text font={FONT} fontSize={0.09} color="#3f3f46" position={[D48_ROOT_X, -0.12, D48_TREE_Z]} anchorX="center">
            leaves hold sorted keys + row pointers — real trees add levels, not width
          </Text>
        </group>

        {/* probe sphere + root→leaf beam */}
        <mesh ref={probeRef} visible={false}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={D48_AMBER} emissive={D48_AMBER} emissiveIntensity={0.9} roughness={0.3} />
        </mesh>
        <mesh ref={beamRef} visible={false} geometry={beamGeom}>
          <meshBasicMaterial color={D48_TEAL} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* 24 row pointers */}
        {D48_POINTERS.map((_, i) => (
          <mesh key={i} visible={false} geometry={ribGeoms[i]} ref={(mesh) => {
            ribRefs.current[i] = mesh as THREE.Mesh | null;
          }}>
            <meshBasicMaterial
              ref={(mat) => {
                ribMatRefs.current[i] = mat as THREE.MeshBasicMaterial | null;
              }}
              color={D48_TEAL}
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* punchline slab */}
        <group ref={slabRef} visible={false} position={[D48_ROOT_X, -1.35, 0.3]}>
          <RoundedBox args={[5.9, 0.5, 0.34]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color="#18181b" emissive={D48_AMBER} emissiveIntensity={0.14} roughness={0.5} />
          </RoundedBox>
          <Text font={FONT} fontSize={0.145} color="#fbbf24" position={[0, 0, 0.2]} anchorX="center" anchorY="middle">
            SCAN reads 103 · SEARCH reads 24 — writes pay rent on the tree
          </Text>
        </group>
      </group>

      {/* ---- HUD ---- */}
      <Html position={[0, 3.35, 0]} center>
        <div className="pointer-events-none max-w-[560px] whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-950/90 px-3 py-1.5 text-[11px] text-zinc-300 shadow-lg">
          {hud}
        </div>
      </Html>
      <Html position={[-4.6, -1.9, 0]} center>
        <div className="pointer-events-none flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-[9px] text-zinc-400">
          <span className="inline-block size-2 rounded-sm" style={{ background: D48_AMBER }} /> scan / probe
          <span className="inline-block size-2 rounded-sm" style={{ background: D48_TEAL }} /> match · pointer
          <span className="inline-block size-2 rounded-sm" style={{ background: D48_ROSE }} /> read, discarded
        </div>
      </Html>
      <Html position={[0, -2.55, 0]} center>
        <button
          onClick={replay}
          className="pointer-events-auto whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 shadow transition-colors hover:bg-zinc-800"
        >
          ↻ replay SCAN vs SEARCH
        </button>
      </Html>

      <gridHelper args={[30, 30, "#27272a", "#18181b"]} position={[0, -2.9, 0]} />
      <OrbitControls
        target={[0, 0.4, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={18}
        maxPolarAngle={1.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function D48IndexSpace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const lastAutoRef = useRef(0);

  // Auto-replay on scroll-into-view, same contract as the other 3D scenes.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            const now = performance.now();
            if (now - lastAutoRef.current > 7000) {
              lastAutoRef.current = now;
              replayRef.current?.();
            }
          }
        }
      },
      { threshold: [0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full"
      role="img"
      aria-label="Interactive 3D scene of how an index changes a query plan. All 103 order rows sit as a grid of chips; an amber scanner sweeps every column — SCAN orders — reading all 103 rows, the 24 rows for customer_id = 1 lighting teal early and 79 reads landing rose as wasted. The tree idx_orders_customer then rises: a root holding separators 4, 7, 10, 13, 16 over six leaves of sorted keys with row pointers (key 1 carries 24 rows). An amber probe descends root to leaf — SEARCH orders USING INDEX — and 24 teal pointer ribbons fly back to exactly the same 24 rows, leaving the other 79 untouched. Punchline: SCAN reads 103, SEARCH reads 24, and every write pays rent on the tree. Drag to orbit."
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0.3, 0.5, 12.9], fov: 40 }}
      >
        <SuspenseBoundary>
          <IndexTreeScene replayRef={replayRef} />
        </SuspenseBoundary>
      </Canvas>
    </div>
  );
}

/* ================= registry ================= */

export const FIGURES_3D: Partial<Record<FigureId, () => JSX.Element>> = {
  "j2-join-space-3d": J2JoinSpace,
  "j12-left-space-3d": L12LeftJoinSpace,
  "l8-bins-space-3d": L8BinsSpace,
  "t32-running-space-3d": T32RunningSpace,
  "d48-index-space-3d": D48IndexSpace,
};
