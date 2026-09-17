"use client";

// Host for 3D figures — dynamically imported by diagrams.tsx so the heavy
// three.js/fiber/drei chunk never enters the main lesson bundle. Only loaded
// when a lesson actually renders a 3D figure id. Includes an error boundary
// so devices without WebGL fall back to a graceful note instead of crashing.

import { Component, type ReactNode } from "react";
import { FIGURES_3D } from "./figures3d";
import type { FigureId } from "@/lib/curriculum/types";

class Fig3DBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-[400px] items-center justify-center rounded-lg bg-zinc-950 text-xs text-zinc-500">
          3D view unavailable on this device — the flat diagram above carries the same lesson.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Figure3DHost({ id }: { id: FigureId }) {
  const Cmp = FIGURES_3D[id];
  if (!Cmp) return null;
  return (
    <Fig3DBoundary>
      <Cmp />
    </Fig3DBoundary>
  );
}
