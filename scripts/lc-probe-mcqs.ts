// Print the audit-flagged thin MCQs for review.
import { LESSONS } from "../src/lib/curriculum/lessons";

const flagged: Record<string, "prompt" | "why"> = {
  "l29-q3": "prompt", "l29-q21": "prompt", "l30-q5": "prompt",
  "l59-q1": "prompt", "l59-q13": "prompt", "l59-q31": "why",
  "l60-q3": "prompt", "l61-q32": "why", "l61-q46": "prompt",
  "l61-q47": "prompt", "l61-q49": "prompt", "l62-q14": "prompt",
  "l62-q15": "prompt", "l63-q5": "prompt", "l63-q22": "why",
  "l63-q26": "prompt", "l63-q38": "why", "l63-q51": "prompt",
};

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

for (const lesson of LESSONS) {
  for (const q of lesson.mcqs) {
    const kind = flagged[q.id];
    if (!kind) continue;
    if (kind === "prompt") {
      console.log(`${q.id} [prompt ${words(q.prompt)}w] ${q.prompt}`);
      console.log(`   choices: ${q.choices.map((c) => JSON.stringify(c)).join(" | ")}`);
      console.log(`   answer: ${q.choices[q.answer]}`);
    } else {
      console.log(`${q.id} [why ${words(q.why)}w] prompt: ${q.prompt}`);
      console.log(`   why: ${q.why}`);
    }
    console.log("");
  }
}
