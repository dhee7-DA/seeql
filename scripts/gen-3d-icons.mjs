// Generate glossy 3D icon stills for the SeeQL platform, following the
// technique from github.com/samyost1/3dicon (MIT): render on a KNOWN flat
// mid-grey backing so the background can later be matted with exact color
// solving instead of guessed edges.
//
// Usage:
//   node scripts/gen-3d-icons.mjs test     # only the first icon (pipeline check)
//   node scripts/gen-3d-icons.mjs all      # everything that isn't generated yet
//
// Stills land in scripts/3dicon-ref/stills/<name>.png (intermediate files,
// never shipped — the matted RGBA masters go to public/icons3d/).

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT_DIR = "scripts/3dicon-ref/stills";

// The backing colour is load-bearing (their words): mid-grey sits far enough
// from the icon palette to matte cleanly, and any spill it leaves is
// colourless rather than a green or magenta fringe.
const BACKING = "#9E9E9E";

const STYLE =
  "glossy 3D clay render icon, chunky rounded soft shapes, smooth bevels, " +
  "soft studio lighting, subtle glossy highlights, playful toy-like proportions, " +
  "perfectly flat solid uniform mid grey background, " +
  `the entire background is exactly one flat colour ${BACKING}, ` +
  "no gradient, no vignette, no floor, no contact shadow, no drop shadow, " +
  "the object appears to float, single object centered filling most of the frame, " +
  "nothing else in the frame, no text, no watermark, clean product render, high quality";

// name -> subject prompt. Colours are kept inside the SeeQL palette family:
// emerald (brand), amber/gold, coral, teal, cream, charcoal.
const ICONS = [
  ["db",     "a 3D database made of three stacked rounded cylinders, emerald green and cream with a charcoal band"],
  ["bolt",   "a 3D lightning bolt, golden yellow with a warm orange core"],
  ["trophy", "a 3D trophy cup, polished gold with a charcoal black base"],
  ["cap",    "a 3D graduation cap, charcoal black with an emerald green tassel"],
  ["fire",   "a 3D flame, vivid orange and amber with a cream inner glow"],
  ["brain",  "a 3D brain, soft pink and coral with rounded folds"],
  ["search", "a 3D magnifying glass, teal handle with a polished silver rim"],
  ["rocket", "a 3D rocket, cream white body with coral red fins and a round window"],
  ["star",   "a 3D star, warm polished gold with rounded points"],
  ["chat",   "a 3D round chat bubble, emerald green with a cream highlight and a small tail"],
  ["book",   "a 3D stack of three closed books, emerald green, charcoal and cream"],
  ["puzzle", "a 3D puzzle piece, emerald green with a glossy finish"],
  ["target", "a 3D archery target with a dart in the bullseye, coral red, cream and teal rings"],
  ["shield", "a 3D shield with a cream checkmark on the front, teal and charcoal"],
  ["gem",    "a 3D cut gemstone, teal emerald facets with glossy reflections"],
  ["table",  "a 3D data table tile, charcoal black frame with emerald green cells"],
  ["golf",   "a 3D retro arcade joystick, coral red ball stick on a charcoal base with one emerald button"],
  ["eye",    "a 3D eyeball, cream white with an emerald green iris and a charcoal pupil"],
  ["folder", "a 3D file folder with cream papers peeking out, emerald green folder with a charcoal label tab"],
];

async function main() {
  const mode = process.argv[2] ?? "test";
  const list = mode === "test" ? ICONS.slice(0, 1) : ICONS;
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const zai = await ZAI.create();
  let made = 0;
  for (const [name, subject] of list) {
    const outPath = path.join(OUT_DIR, `${name}.png`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10_000) {
      console.log(`= skip ${name} (already generated)`);
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt: `${subject}, ${STYLE}`,
          size: "1024x1024",
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error("empty response");
        fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
        console.log(`+ ${name} -> ${outPath}`);
        ok = true;
        made++;
      } catch (err) {
        console.error(`! ${name} attempt ${attempt}: ${err.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (!ok) console.error(`x FAILED ${name}`);
  }
  console.log(`done — generated ${made} new still(s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
