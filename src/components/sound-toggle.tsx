"use client";

// Sound toggle — one button, mounted in all three headers (landing,
// playground, learn). Opt-in: first render is always "off" to match SSR
// HTML, then the effect syncs the persisted preference. Turning it on
// plays a cue immediately so the learner hears exactly what they signed
// up for — and that click doubles as the user gesture that unlocks the
// AudioContext.

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundOn, setSoundOn, playCue, subscribeSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  // Hydration-safe by contract: server + first client render use the server
  // snapshot (always off); React re-checks the store snapshot after hydration
  // and re-renders the icon if the persisted preference says otherwise.
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setSoundOn(next);
        if (next) playCue("correct");
      }}
      aria-pressed={on}
      aria-label={on ? "Mute cue sounds" : "Unmute cue sounds"}
      title={on ? "Cue sounds on — click to mute" : "Cue sounds off — click to enable"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200",
        className,
      )}
    >
      {on ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
