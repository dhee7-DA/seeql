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

/* ================= registry ================= */

export const FIGURES_3D: Partial<Record<FigureId, () => JSX.Element>> = {
  "j2-join-space-3d": J2JoinSpace,
};
