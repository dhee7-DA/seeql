# SeeQL 🔍 📊

> **Interactive SQL Visualization, Vectorized OLAP Analytics, and Financial Engineering Platform**

SeeQL is an interactive, full-stack SQL learning and analytical platform designed for software engineers, data scientists, and quantitative finance practitioners. It bridges the gap between raw query syntax, abstract relational algebra, physical database execution engines, and real-world domain mastery.

---

## ⚡ Key Capabilities

### 1. 📈 Interactive Financial Canvas & Valuation Modeler
Built-in financial intelligence dashboard for corporate finance and equity research:
- **DuPont 3-Way ROE Decomposition Tree**: Interactive cascade breaking down $\text{ROE} = \text{Profit Margin} \times \text{Asset Turnover} \times \text{Financial Leverage}$, calculating Net Margin, Asset Utilization, and Equity Multipliers in real-time.
- **Dynamic DCF Valuation Sensitivity Modeler**: Interactive sensitivity modeling with sliders for **WACC (Discount Rate)**, **Terminal Growth Rate ($g$)**, and **Projection Horizon** with automated calculation of Enterprise Value, Equity Value, and implied per-share intrinsic value.
- **Corporate Financial Ratio Cards**: Live KPI metrics for Gross Margin, Operating Margin, Current Ratio, Quick Ratio, Debt-to-Equity, and Cash Flow Yield.
- **Preloaded Financial SQL Blueprints**: Instant templates for Cash-to-Cash Cycle analysis, Aging Accounts Receivable, Gross Margin Waterfalls, and Capital Structure diagnostics.

### 2. 🦆 DuckDB In-Process Vectorized OLAP Engine
High-performance analytical computing environment embedded directly into the visualizer:
- **Zero-ETL Columnar Execution**: Executes vectorized, SIMD-accelerated queries directly over SQLite databases using DuckDB's in-process engine.
- **ASCII Physical Plan Inspector**: Visualizes physical execution pipelines (`ORDER_BY`, `HASH_GROUP_BY`, `HASH_JOIN`, `SQLITE_SCAN`) with intermediate cardinality estimates.
- **Head-to-Head Performance Benchmarking**: Side-by-side execution timer measuring SQLite's row-at-a-time B-Tree against DuckDB's vectorized columnar engine with speedup ratios.
- **Built-in OLAP Presets**: Preloaded with multi-table aggregations, window rolling moving averages, and predicate filter pushdown benchmarks.

### 3. 🎯 Domain Mastery Curriculum (10 Industry Worlds · 1,800+ Items)
Every domain pack features a dedicated deterministic schema, seed data, 60 queries (20 Easy / 20 Medium / 20 Hard), 60 MCQs with 4-way distinct outputs, and 60 multi-step real-world investigative cases:
1. **Retail & E-Commerce (RFM)** — Customer segmentation, basket size, and churn analytics.
2. **Core Corporate Finance** — Double-entry ledgers, trial balances, and reconciliation audits.
3. **Fraud Detection & AML** — Smurfing rings, structuring ceilings, and SAR dossiers.
4. **SaaS & Subscription Analytics** — MRR/ARR waterfalls, expansion revenue, and logo churn.
5. **Healthcare & Clinical Operations** — EHR encounters, diagnosis pathways, and bed capacity.
6. **Logistics & Freight Spine** — Dynamic routing, carrier SLAs, and shipment claims.
7. **Marketing & Multi-Touch Attribution** — First-touch, last-touch, linear models, and CAC/LTV.
8. **Insurance Claims Operations** — Loss ratio tracking, SIU fraud rings, and subrogation.
9. **Energy & Smart Grid Operations** — Outage restoration, telemetry sessions, and tariff drift.
10. **DeFi & AMM Analytics** *(New)* — Constant product invariants, concentrated liquidity ticks, impermanent loss, MEV sandwich detection, flash loan arbitrage, and oracle heartbeats.

### 4. 🧠 Interactive Visualizer & Curriculum Sandbox
- **AST Parsing & Visual Tree**: Live SQL abstract syntax tree generation and relational algebra flowcharts.
- **Stage-by-Stage Query Execution**: Step-through breakdown showing row filtering, join grouping, and projection stages.
- **Interview Prep Universe**: 208 company-specific kits across 8 domains with 6,656 LeetCode-style challenges, theory modules, and mock gauntlets.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components & Route Handlers)
- **Runtime**: [Bun](https://bun.sh/) (v1.4+)
- **Analytical Engine**: [DuckDB](https://duckdb.org/) (In-Process C++ Vectorized Engine via Node bindings)
- **Database / ORM**: SQLite (`db/custom.db`) with [Prisma ORM](https://www.prisma.io/)
- **UI & Styling**: Tailwind CSS, Shadcn UI, Radix Primitives, Lucide Icons
- **Editor**: Monaco Editor with custom SQL language server & autocomplete
- **Verification Engine**: Deterministic in-memory test runner (`scripts/dm-verify.ts`)

---

## 🚀 Quickstart

### Prerequisites
- [Bun](https://bun.sh/) installed globally:
  ```bash
  npm install -g bun
  ```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dhee7-DA/seeql.git
   cd seeql
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Initialize database & generate Prisma client:
   ```bash
   bun run db:health
   bun run db:generate
   ```
4. Verify domain pack integrity:
   ```bash
   bun scripts/dm-verify.ts
   ```

### Running Locally
To launch the optimized standalone server on port 3000:
```bash
# Build standalone bundle
bun run build

# Start server
PORT=3000 bun .next/standalone/server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Verification & Health Checks

- `bun scripts/dm-verify.ts`: Verifies all 10 domain packs (1,800 items) and generates `dm-expected.ts`.
- `bun run check:strip`: Validates universe problem counts across all 208 company kits.
- `bun scripts/db-health.ts`: Audits SQLite table integrity, foreign keys, and seed record volumes.

---

## 📄 License
MIT License. Created by [dhee7-DA](https://github.com/dhee7-DA).
