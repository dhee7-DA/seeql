// One-shot codemod: add the Icon3D import + 3D header icon to tool views.
// Idempotent — skips files already carrying the import.

import fs from "fs";

const EDITS = [
  ["blitz-mode.tsx", 34, "bolt", `<h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Blitz mode</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="bolt" size={34} />Blitz mode</h1>`],
  ["daily-puzzle.tsx", 40, "timer", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Daily puzzle</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="timer" size={40} />Daily puzzle</h1>`],
  ["mixed-quiz.tsx", 34, "puzzle", `<h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">Mixed quiz</h1>`, `<h1 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="puzzle" size={34} />Mixed quiz</h1>`],
  ["drill-yard.tsx", 34, "target", `<h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">{active.label} drill</h1>`, `<h1 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="target" size={34} />{active.label} drill</h1>`],
  ["error-clinic.tsx", 40, "shield", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">The error clinic</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="shield" size={40} />The error clinic</h1>`],
  ["query-golf.tsx", 40, "golf", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Query golf</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="golf" size={40} />Query golf</h1>`],
  ["schema-studio.tsx", 40, "table", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Schema studio</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="table" size={40} />Schema studio</h1>`],
  ["mastery-map.tsx", 40, "brain", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Mastery map</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="brain" size={40} />Mastery map</h1>`],
  ["perf-lab.tsx", 40, "search", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Performance lab</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="search" size={40} />Performance lab</h1>`],
  ["cheat-sheet.tsx", 40, "book", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Your cheat sheet</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="book" size={40} />Your cheat sheet</h1>`],
  ["mentor-chat.tsx", 26, "chat", `<h1 className="font-display text-lg font-semibold tracking-[-0.02em] text-zinc-50">AI Mentor</h1>`, `<h1 className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="chat" size={26} />AI Mentor</h1>`],
  ["data-explorer.tsx", 34, "db", `<h1 className="font-display mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Data explorer</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight text-zinc-50"><Icon3D name="db" size={34} />Data explorer</h1>`],
  ["predict-view.tsx", 40, "eye", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Predict the output</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="eye" size={40} />Predict the output</h1>`],
  ["explain-back.tsx", 40, "chat", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Explain back</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="chat" size={40} />Explain back</h1>`],
  ["case-files.tsx", 40, "folder", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">The case file drawer</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="folder" size={40} />The case file drawer</h1>`],
  ["interview-track.tsx", 40, "rocket", `<h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Interview prep</h1>`, `<h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-0.02em] text-zinc-50"><Icon3D name="rocket" size={40} />Interview prep</h1>`],
];

const DIR = "src/components/learn";
let ok = 0;
for (const [file, , , oldH1, newH1] of EDITS) {
  const path = `${DIR}/${file}`;
  let src = fs.readFileSync(path, "utf8");

  if (!src.includes(oldH1)) {
    console.error(`x ${file}: h1 pattern not found`);
    continue;
  }

  if (!src.includes('from "./ui/icon3d"')) {
    const anchor = src.indexOf('from "lucide-react";');
    if (anchor !== -1) {
      const at = anchor + 'from "lucide-react";'.length;
      src = src.slice(0, at) + '\nimport { Icon3D } from "./ui/icon3d";' + src.slice(at);
    } else {
      const at = src.indexOf('"use client";') + '"use client";'.length;
      src = src.slice(0, at) + '\n\nimport { Icon3D } from "./ui/icon3d";' + src.slice(at);
    }
  }

  src = src.replace(oldH1, newH1);
  fs.writeFileSync(path, src);
  console.log(`+ ${file}`);
  ok++;
}
console.log(`done — ${ok}/${EDITS.length} files updated`);
