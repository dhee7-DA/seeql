"use client";

// Module 9 · SQL for Finance — six figures on the store's own books.
// Same flat visual language as every module: 720-wide viewBox, Panel/Label/
// Arrow from diagrams-kit, Tailwind palette classes for theme re-skinning,
// framer-motion reveals. Every number shown is real (verified against the
// seeded books by scripts/finance-facts.ts).

import { motion } from "framer-motion";
import { Arrow, Label, MONO, Panel, fade } from "./diagrams-kit";

/* ---------------- shared bits ---------------- */

function Chip({ x, y, text, cls = "fill-emerald-400/15 stroke-emerald-400/60", txt = "fill-emerald-300" }: { x: number; y: number; text: string; cls?: string; txt?: string }) {
  const w = Math.max(58, text.length * 7.2 + 18);
  return (
    <motion.g {...fade(0)}>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={7} className={cls} strokeWidth={1} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} className={txt} fontFamily={MONO}>
        {text}
      </text>
    </motion.g>
  );
}

/* ---------------- figures ---------------- */

/** fin1 — the four book tables and how money flows between them. */
function Fin1BooksMap() {
  return (
    <svg viewBox="0 0 720 320" className="w-full" role="img" aria-label="The four finance tables: invoices, payments, expenses, ledger_entries">
      <motion.g {...fade(0)}>
        {/* invoices */}
        <Panel x={40} y={40} w={190} h={120} />
        <Label x={52} y={62} cls="fill-emerald-300">invoices</Label>
        {["number · INV-2024-001", "issued_on / due_on", "amount_cents · 486000", "status · paid|open|void"].map((t, i) => (
          <Label key={t} x={52} y={84 + i * 18} cls={i === 2 ? "fill-zinc-200" : "fill-zinc-400"} size={10}>{t}</Label>
        ))}
        {/* payments */}
        <Panel x={40} y={200} w={190} h={92} />
        <Label x={52} y={222} cls="fill-teal-300">payments</Label>
        {["invoice_id → invoices", "paid_on · amount_cents", "method · card|wire"].map((t, i) => (
          <Label key={t} x={52} y={244 + i * 18} cls="fill-zinc-400" size={10}>{t}</Label>
        ))}
        {/* expenses */}
        <Panel x={490} y={40} w={190} h={92} />
        <Label x={502} y={62} cls="fill-rose-300">expenses</Label>
        {["category · Rent/Ads/…", "spent_on · vendor", "amount_cents"].map((t, i) => (
          <Label key={t} x={502} y={84 + i * 18} cls="fill-zinc-400" size={10}>{t}</Label>
        ))}
        {/* ledger */}
        <Panel x={490} y={186} w={190} h={106} />
        <Label x={502} y={208} cls="fill-amber-300">ledger_entries</Label>
        {["entry_date · account", "debit_cents | credit_cents", "memo", "the story about the other three"].map((t, i) => (
          <Label key={t} x={502} y={230 + i * 18} cls={i === 3 ? "fill-zinc-300" : "fill-zinc-400"} size={10}>{t}</Label>
        ))}
        {/* arrows: invoices <- payments (money settles), both -> ledger */}
        <g className="stroke-teal-400" strokeWidth={1.5} fill="none">
          <line x1={135} y1={200} x2={135} y2={162} />
          <polygon points="135,160 131,170 139,170" className="fill-teal-400" stroke="none" />
        </g>
        <Label x={148} y={184} cls="fill-teal-300" size={10}>settles ↓ owes</Label>
        <g className="stroke-amber-400" strokeWidth={1.5} fill="none" strokeDasharray="4 3">
          <path d="M 232 100 C 360 100, 380 210, 488 226" />
          <polygon points="490,226 479,221 481,230" className="fill-amber-400" stroke="none" />
          <path d="M 232 250 C 330 250, 380 246, 488 242" />
          <polygon points="490,242 479,237 480,247" className="fill-amber-400" stroke="none" />
          <path d="M 585 132 C 585 150, 585 160, 585 184" />
          <polygon points="585,186 581,176 589,176" className="fill-amber-400" stroke="none" />
        </g>
        <Label x={360} y={92} anchor="middle" cls="fill-amber-300/80" size={10}>mirrored into the double-entry story</Label>
        {/* customers anchor */}
        <Chip x={360} y={300} text="same customers table as ever — now with balances" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" />
      </motion.g>
    </svg>
  );
}

/** fin2 — Alice's account statement as a staircase walk. */
function Fin2StatementWalk() {
  const steps: Array<[string, string, number, number]> = [
    // date, kind, amount dollars, balance dollars
    ["02-05", "inv", 4860, 4860],
    ["02-20", "pay", -2430, 2430],
    ["03-05", "pay", -2430, 0],
    ["04-09", "inv", 5284, 5284],
    ["04-22", "pay", -2642, 2642],
    ["05-07", "pay", -2642, 0],
    ["08-07", "inv", 4723, 4723],
    ["08-25", "pay", -2361.5, 2361.5],
    ["09-04", "pay", -2361.5, 0],
    ["11-06", "inv", 5614, 5614],
    ["11-25", "pay", -2807, 2807],
    ["12-05", "pay", -2807, 0],
    ["01-22", "inv", 6148, 6148],
    ["02-10", "pay", -4000, 2148],
  ];
  const x0 = 60, y0 = 40, w = 600, h = 200;
  const maxB = 6500;
  const px = (i: number) => x0 + (i / (steps.length - 1)) * w;
  const py = (b: number) => y0 + h - (b / maxB) * h;
  return (
    <svg viewBox="0 0 720 320" className="w-full" role="img" aria-label="Alice's balance walk: invoices step up, payments step down, ending at 2148 dollars">
      <motion.g {...fade(0)}>
        <Panel x={30} y={24} w={660} h={248} />
        <Label x={44} y={44} cls="fill-zinc-300">Alice Chen — the walk (SUM(amt) OVER (ORDER BY d))</Label>
        <line x1={x0} y1={y0 + h} x2={x0 + w} y2={y0 + h} className="stroke-zinc-700" />
        <path
          d={steps.map((s, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(s[3])}`).join(" ")}
          className="stroke-emerald-400" strokeWidth={2} fill="none"
        />
        {steps.map((s, i) => (
          <motion.g key={i} {...fade(Math.min(0.9, i * 0.05))}>
            <circle cx={px(i)} cy={py(s[3])} r={3.2} className={s[1] === "inv" ? "fill-emerald-300" : "fill-teal-300"} />
            <Label x={px(i)} y={y0 + h + 16} anchor="middle" cls="fill-zinc-500" size={9}>{s[0]}</Label>
          </motion.g>
        ))}
        {/* final balance flag */}
        <motion.g {...fade(0.8)}>
          <rect x={px(13) - 74} y={py(2148) - 34} width={148} height={22} rx={6} className="fill-emerald-400" />
          <text x={px(13)} y={py(2148) - 19} textAnchor="middle" fontSize={11} fontFamily={MONO} className="fill-[var(--brand-ink)]">
            balance 2148.00
          </text>
        </motion.g>
        <Label x={44} y={292} cls="fill-zinc-500" size={10}>▲ invoices step up · payments step down — last row = the live balance</Label>
      </motion.g>
    </svg>
  );
}

/** fin3 — the AR aging ladder with the real bucket totals. */
function Fin3AgingLadder() {
  const buckets: Array<[string, number, number, string]> = [
    // label, total dollars, count, tint class
    ["current", 2794, 1, "stroke-emerald-400/60 fill-emerald-400/10"],
    ["1-30", 5710, 2, "stroke-lime-400/60 fill-lime-400/10"],
    ["31-60", 4937, 1, "stroke-amber-400/60 fill-amber-400/10"],
    ["61-90", 1295, 1, "stroke-orange-400/60 fill-orange-400/10"],
    ["90+", 873, 1, "stroke-rose-400/60 fill-rose-400/10"],
  ];
  const maxD = 6000;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="AR aging ladder: five buckets from current to 90-plus, total 15609 dollars">
      <motion.g {...fade(0)}>
        <Panel x={30} y={24} w={660} h={236} />
        <Label x={44} y={44} cls="fill-zinc-300">AR aging · AS OF 2025-03-15 · $15,609.00 open</Label>
        {buckets.map(([label, total, n, tint], i) => {
          const bh = (total / maxD) * 150;
          const x = 70 + i * 120;
          return (
            <motion.g key={label} {...fade(0.15 + i * 0.12)}>
              <rect x={x} y={230 - bh} width={86} height={bh} rx={6} className={tint} strokeWidth={1} />
              <Label x={x + 43} y={230 - bh - 8} anchor="middle" cls="fill-zinc-200" size={11}>{total.toLocaleString()}</Label>
              <Label x={x + 43} y={248} anchor="middle" cls="fill-zinc-300" size={11}>{label}</Label>
              <Label x={x + 43} y={264} anchor="middle" cls="fill-zinc-500" size={10}>{n} invoice{n === 1 ? "" : "s"}</Label>
            </motion.g>
          );
        })}
        <Arrow x1={110} y1={278} x2={560} y2={278} cls="stroke-zinc-600" />
        <Label x={584} y={282} cls="fill-rose-300" size={10}>risk →</Label>
      </motion.g>
    </svg>
  );
}

/** fin4 — MoM bridge: raw revenue vs its 3-month moving average. */
function Fin4MomBridge() {
  const mons = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const rev = [7003, 5009, 5284, 4318, 5888, 2968, 7270, 5801, 6187, 8297, 8830, 11085, 8112];
  const ma3 = [null, null, 5765.33, 4870.33, 5163.33, 4391.33, 5375.33, 5346.33, 6419.33, 6761.67, 7771.33, 9404.0, 9342.33];
  const x0 = 56, w = 610, y0 = 34, h = 180, maxV = 12000;
  const px = (i: number) => x0 + (i / (mons.length - 1)) * w;
  const py = (v: number) => y0 + h - (v / maxV) * h;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Monthly invoiced revenue whipsaws while the 3-month moving average climbs steadily">
      <motion.g {...fade(0)}>
        <Panel x={30} y={20} w={660} h={244} />
        <Label x={44} y={38} cls="fill-zinc-300">invoiced revenue · raw vs ma3 (non-void)</Label>
        {/* raw line */}
        <path d={rev.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(v)}`).join(" ")} className="stroke-zinc-500" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
        {rev.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r={2.4} className="fill-zinc-400" />)}
        {/* ma3 line */}
        <path
          d={ma3.map((v, i) => (v === null ? "" : `${i === 2 ? "M" : "L"} ${px(i)} ${py(v)}`)).join(" ")}
          className="stroke-emerald-400" strokeWidth={2.2} fill="none"
        />
        {ma3.map((v, i) => v === null ? null : <circle key={i} cx={px(i)} cy={py(v)} r={2.8} className="fill-emerald-300" />)}
        {/* annotations */}
        <motion.g {...fade(0.6)}>
          <Label x={px(5)} y={py(2968) + 16} anchor="middle" cls="fill-amber-300" size={10}>July trough 2968</Label>
          <Label x={px(11)} y={py(11085) - 10} anchor="middle" cls="fill-emerald-300" size={10}>Jan peak 11085 · ma3 9404</Label>
        </motion.g>
        {mons.map((m, i) => (
          <Label key={i} x={px(i)} y={y0 + h + 16} anchor="middle" cls="fill-zinc-500" size={9}>{m}</Label>
        ))}
        <g>
          <line x1={44} y1={266} x2={64} y2={266} className="stroke-zinc-500" strokeWidth={1.5} strokeDasharray="3 3" />
          <Label x={70} y={270} cls="fill-zinc-400" size={10}>raw</Label>
          <line x1={110} y1={266} x2={130} y2={266} className="stroke-emerald-400" strokeWidth={2.2} />
          <Label x={136} y={270} cls="fill-emerald-300" size={10}>3-month moving average — the trend under the noise</Label>
        </g>
      </motion.g>
    </svg>
  );
}

/** fin5 — the trial balance as a two-pan scale, balanced at 181080. */
function Fin5TrialBalance() {
  const rows: Array<[string, number, number]> = [
    // account, debits, credits (dollars)
    ["accounts_receivable", 86052, 69612],
    ["cash", 69612, 25416],
    ["operating_expenses", 25416, 0],
    ["sales_revenue", 0, 86052],
  ];
  return (
    <svg viewBox="0 0 720 320" className="w-full" role="img" aria-label="Trial balance: every account's debits and credits, grand totals balanced at 181080 dollars">
      <motion.g {...fade(0)}>
        <Panel x={30} y={24} w={660} h={256} />
        <Label x={44} y={44} cls="fill-zinc-300">trial balance — GROUP BY account</Label>
        <Label x={370} y={44} anchor="end" cls="fill-zinc-500" size={10}>debits · credits</Label>
        {rows.map(([acc, d, c], i) => {
          const y = 66 + i * 40;
          const scale = (v: number) => (v / 86052) * 240;
          return (
            <motion.g key={acc} {...fade(0.15 + i * 0.12)}>
              <Label x={48} y={y + 14} cls="fill-zinc-300" size={11}>{acc}</Label>
              <rect x={300} y={y + 2} width={scale(d)} height={14} rx={4} className="fill-emerald-400/20 stroke-emerald-400/50" strokeWidth={1} />
              <Label x={300 + scale(d) + 6} y={y + 13} cls="fill-emerald-300" size={10}>{d.toLocaleString()}</Label>
              <rect x={300} y={y + 20} width={scale(c)} height={10} rx={4} className="fill-teal-400/20 stroke-teal-400/50" strokeWidth={1} />
              <Label x={300 + scale(c) + 6} y={y + 28} cls="fill-teal-300" size={10}>{c.toLocaleString()}</Label>
            </motion.g>
          );
        })}
        <motion.g {...fade(0.7)}>
          <rect x={300} y={236} width={180} height={26} rx={7} className="fill-emerald-400" />
          <text x={390} y={253} textAnchor="middle" fontSize={11} fontFamily={MONO} className="fill-[var(--brand-ink)]">
            181080 = 181080 ✓
          </text>
          <Label x={494} y={253} cls="fill-zinc-400" size={10}>is it TRUE? lesson 56 decides</Label>
        </motion.g>
      </motion.g>
    </svg>
  );
}

/** fin6 — the sliding 3-row frame over monthly expense totals, flagging August. */
function Fin6FrameSlide() {
  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const spend = [1719, 1440, 1917, 1749, 1480, 1510, 1794, 3210, 1545, 1859, 1974, 1610, 1959, 1650];
  const x0 = 56, w = 610, y0 = 40, h = 150, maxV = 3600;
  const px = (i: number) => x0 + (i / (mons.length - 1)) * w;
  const py = (v: number) => y0 + h - (v / maxV) * h;
  const augI = 7;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Monthly expenses with a sliding 3-row window; August spikes to 3210, breaching 1.5 times the mean">
      <motion.g {...fade(0)}>
        <Panel x={30} y={20} w={660} h={244} />
        <Label x={44} y={38} cls="fill-zinc-300">expenses by month · mean 1815.43 · sd 423.12</Label>
        {/* bars */}
        {spend.map((v, i) => (
          <motion.rect
            key={i} {...fade(Math.min(0.8, i * 0.04))}
            x={px(i) - 8} y={py(v)} width={16} height={y0 + h - py(v)} rx={3}
            className={i === augI ? "fill-rose-400/40 stroke-rose-400" : "fill-zinc-800 stroke-zinc-700"} strokeWidth={1}
          />
        ))}
        {/* mean line */}
        <line x1={x0} y1={py(1815.43)} x2={x0 + w} y2={py(1815.43)} className="stroke-zinc-500" strokeDasharray="4 4" strokeWidth={1.2} />
        <Label x={x0 + w} y={py(1815.43) - 6} anchor="end" cls="fill-zinc-400" size={10}>mean</Label>
        {/* sliding frame highlight around Aug's trailing 3 */}
        <motion.rect {...fade(0.7)} x={px(augI - 2) - 14} y={y0 + 2} width={px(augI) - px(augI - 2) + 28} height={h + 6} rx={8} className="fill-amber-400/10 stroke-amber-400/60" strokeWidth={1.2} />
        <Label x={44} y={y0 + h + 32} cls="fill-amber-300" size={10}>trailing 3 → Aug ma3 2171.33 · 1.5× mean breached at 3210 (z 3.30)</Label>
        {mons.map((m, i) => (
          <Label key={i} x={px(i)} y={y0 + h + 16} anchor="middle" cls={i === augI ? "fill-rose-300" : "fill-zinc-500"} size={9}>{m}</Label>
        ))}
        <Label x={44} y={284} cls="fill-zinc-500" size={10}>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — the window slides, August can't hide</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M9: Record<string, React.ComponentType> = {
  "fin1-books-map": Fin1BooksMap,
  "fin2-statement-walk": Fin2StatementWalk,
  "fin3-aging-ladder": Fin3AgingLadder,
  "fin4-mom-bridge": Fin4MomBridge,
  "fin5-trial-balance": Fin5TrialBalance,
  "fin6-frame-slide": Fin6FrameSlide,
};
