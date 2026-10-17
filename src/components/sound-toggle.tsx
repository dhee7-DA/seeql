"use client";

// Sound toggle — mounted in all three headers (landing, playground, learn).
// Opt-in: first render is always "off" to match SSR HTML, then the effect
// syncs the persisted preference. Turning it on plays a cue immediately so
// the learner hears exactly what they signed up for — and that click doubles
// as the user gesture that unlocks the AudioContext.
//
// The control itself is EasyUI's LiquidToggle (adapted to next-themes +
// zinc tokens): the blob morphs and stretches organically as it travels
// between off and on, replacing the old static icon button. The external
// contract is unchanged — callers just render <SoundToggle />.

import { useSyncExternalStore } from "react";
import { isSoundOn, setSoundOn, playCue, subscribeSound } from "@/lib/sound";
import { LiquidToggle } from "@/components/ui/liquid-toggle";

export function SoundToggle({ className }: { className?: string }) {
  // Hydration-safe by contract: server + first client render use the server
  // snapshot (always off); React re-checks the store snapshot after hydration
  // and re-renders the toggle if the persisted preference says otherwise.
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);

  return (
    <LiquidToggle
      value={on}
      onChange={(next) => {
        setSoundOn(next);
        if (next) playCue("correct");
      }}
      onLabel="Cue sounds on"
      offLabel="Cue sounds off"
      accentColor="#34d399"
      className={className}
    />
  );
}
