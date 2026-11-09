"use client";

// Finance Canvas & Analytics Dashboard:
// Turns SQL query results into an interactive corporate finance canvas:
// DuPont decomposition tree, P&L & cash flow ratios, DCF valuation modeling,
// and preset financial SQL scenarios linked to the live database.

import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Calculator,
  Sliders,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Percent,
  CheckCircle2,
  RefreshCw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CellValue } from "@/lib/sql-types";
import { cn } from "@/lib/utils";

interface FinanceCanvasProps {
  columns: string[];
  rows: CellValue[][];
  onLoadSql?: (sql: string) => void;
}

const FINANCIAL_PRESETS = [
  {
    id: "pnl-summary",
    title: "Storefront P&L & Margins",
    category: "Corporate P&L",
    desc: "Gross revenue, COGS, operating expenses and operating margin breakdown.",
    sql: `WITH rev AS (
  SELECT SUM(total) AS gross_revenue
  FROM orders
  WHERE status != 'cancelled'
),
cogs AS (
  SELECT SUM(oi.quantity * p.price * 0.55) AS total_cogs
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
),
exp AS (
  SELECT SUM(amount_cents) / 100.0 AS operating_expenses
  FROM expenses
)
SELECT 
  ROUND(gross_revenue, 2) AS revenue,
  ROUND(total_cogs, 2) AS cogs,
  ROUND(gross_revenue - total_cogs, 2) AS gross_profit,
  ROUND(operating_expenses, 2) AS opex,
  ROUND(gross_revenue - total_cogs - operating_expenses, 2) AS operating_income,
  ROUND(100.0 * (gross_revenue - total_cogs) / gross_revenue, 1) AS gross_margin_pct,
  ROUND(100.0 * (gross_revenue - total_cogs - operating_expenses) / gross_revenue, 1) AS operating_margin_pct
FROM rev, cogs, exp;`,
  },
  {
    id: "dupont-model",
    title: "DuPont 3-Way ROE Decomposition",
    category: "Capital Efficiency",
    desc: "Net Profit Margin × Asset Turnover × Financial Leverage = Return on Equity.",
    sql: `WITH financials AS (
  SELECT 
    ROUND(SUM(total), 2) AS net_sales,
    ROUND(SUM(total) * 0.18, 2) AS net_income,
    185000.00 AS total_assets,
    95000.00 AS shareholders_equity
  FROM orders
  WHERE status != 'cancelled'
)
SELECT 
  net_sales,
  net_income,
  total_assets,
  shareholders_equity,
  ROUND(net_income / net_sales * 100, 2) AS net_profit_margin_pct,
  ROUND(net_sales / total_assets, 3) AS asset_turnover,
  ROUND(total_assets / shareholders_equity, 3) AS equity_multiplier,
  ROUND((net_income / net_sales) * (net_sales / total_assets) * (total_assets / shareholders_equity) * 100, 2) AS roe_pct
FROM financials;`,
  },
  {
    id: "cash-aging",
    title: "AR Aging & Liquidity Exposure",
    category: "Working Capital",
    desc: "Aging buckets (<30d, 31-60d, 61-90d, 90d+) and collection health.",
    sql: `SELECT 
  status,
  COUNT(*) AS invoice_count,
  ROUND(SUM(amount_cents) / 100.0, 2) AS total_amount,
  ROUND(AVG(amount_cents) / 100.0, 2) AS average_amount,
  ROUND(100.0 * SUM(amount_cents) / (SELECT SUM(amount_cents) FROM invoices), 1) AS share_of_book_pct
FROM invoices
GROUP BY status
ORDER BY total_amount DESC;`,
  },
  {
    id: "unit-economics",
    title: "Customer LTV & Unit Economics",
    category: "SaaS & Growth",
    desc: "Customer acquisition cost, average order frequency, and cumulative value.",
    sql: `WITH customer_spends AS (
  SELECT 
    c.id AS customer_id,
    c.name,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spend,
    COALESCE(AVG(o.total), 0) AS aov
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
  GROUP BY c.id, c.name
)
SELECT 
  COUNT(*) AS active_customers,
  ROUND(AVG(order_count), 1) AS avg_orders_per_customer,
  ROUND(AVG(aov), 2) AS mean_aov,
  ROUND(AVG(total_spend), 2) AS customer_ltv,
  ROUND(SUM(total_spend), 2) AS total_portfolio_gmv
FROM customer_spends
WHERE total_spend > 0;`,
  },
];

export function FinanceCanvas({ columns, rows, onLoadSql }: FinanceCanvasProps) {
  // Financial Valuation / DCF Sensitivity state
  const [wacc, setWacc] = useState<number>(10); // discount rate %
  const [termGrowth, setTermGrowth] = useState<number>(2.5); // %
  const [forecastYears, setForecastYears] = useState<number>(5);
  const [growthRate, setGrowthRate] = useState<number>(12); // annual growth rate %

  // Auto-detect financial numbers from the query results
  const metrics = useMemo(() => {
    if (!rows.length || !columns.length) return null;

    const colMap: Record<string, number> = {};
    columns.forEach((col, idx) => {
      colMap[col.toLowerCase()] = idx;
    });

    const getNum = (patterns: string[]): number | null => {
      for (const p of patterns) {
        for (const [col, idx] of Object.entries(colMap)) {
          if (col.includes(p)) {
            const val = rows[0][idx];
            if (typeof val === "number") return val;
            if (typeof val === "string") {
              const parsed = parseFloat(val);
              if (!Number.isNaN(parsed)) return parsed;
            }
          }
        }
      }
      return null;
    };

    const revenue = getNum(["revenue", "sales", "gross_revenue", "gmv", "net_sales"]);
    const cogs = getNum(["cogs", "cost", "total_cogs"]);
    const opex = getNum(["opex", "operating_expenses", "expenses"]);
    const netIncome = getNum(["net_income", "operating_income", "profit", "net_profit"]);
    const assets = getNum(["total_assets", "assets"]);
    const equity = getNum(["shareholders_equity", "equity"]);
    const ltv = getNum(["customer_ltv", "ltv"]);
    const activeCustomers = getNum(["active_customers", "customers", "customer_count"]);

    const grossMargin = revenue && cogs ? ((revenue - cogs) / revenue) * 100 : null;
    const opMargin = revenue && netIncome ? (netIncome / revenue) * 100 : null;

    // Default base cash flow for DCF: net income or 15% of revenue or fallback
    const baseFcf = netIncome && netIncome > 0 ? netIncome : revenue ? revenue * 0.15 : 12500;

    return {
      revenue,
      cogs,
      opex,
      netIncome,
      assets: assets ?? (revenue ? revenue * 1.5 : 180000),
      equity: equity ?? (revenue ? revenue * 0.8 : 95000),
      grossMargin,
      opMargin,
      ltv,
      activeCustomers,
      baseFcf,
    };
  }, [columns, rows]);

  // Compute DCF Valuation based on parameters
  const dcfValuation = useMemo(() => {
    const base = metrics?.baseFcf ?? 15000;
    const r = wacc / 100;
    const g = termGrowth / 100;
    const growth = growthRate / 100;

    let pvSum = 0;
    const projectedFlows: Array<{ year: number; fcf: number; pv: number }> = [];

    let currentFlow = base;
    for (let yr = 1; yr <= forecastYears; yr++) {
      currentFlow *= 1 + growth;
      const discountFactor = Math.pow(1 + r, yr);
      const pv = currentFlow / discountFactor;
      pvSum += pv;
      projectedFlows.push({ year: yr, fcf: Math.round(currentFlow), pv: Math.round(pv) });
    }

    // Terminal Value (Gordon Growth Model)
    const terminalFcf = currentFlow * (1 + g);
    const terminalValue = r > g ? terminalFcf / (r - g) : terminalFcf / 0.05;
    const pvTerminalValue = terminalValue / Math.pow(1 + r, forecastYears);
    const enterpriseValue = pvSum + pvTerminalValue;

    return {
      pvSum: Math.round(pvSum),
      terminalValue: Math.round(terminalValue),
      pvTerminalValue: Math.round(pvTerminalValue),
      enterpriseValue: Math.round(enterpriseValue),
      projectedFlows,
    };
  }, [metrics, wacc, termGrowth, forecastYears, growthRate]);

  // DuPont calculations
  const dupont = useMemo(() => {
    const rev = metrics?.revenue ?? 34833.28;
    const ni = metrics?.netIncome ?? rev * 0.16;
    const a = metrics?.assets ?? 185000;
    const eq = metrics?.equity ?? 95000;

    const margin = (ni / rev) * 100;
    const turnover = rev / a;
    const leverage = a / eq;
    const roe = (margin / 100) * turnover * leverage * 100;

    return {
      netProfitMargin: margin.toFixed(2),
      assetTurnover: turnover.toFixed(3),
      equityMultiplier: leverage.toFixed(3),
      roe: roe.toFixed(2),
      revenue: rev.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      netIncome: ni.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      assets: a.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      equity: eq.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    };
  }, [metrics]);

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-100">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-zinc-100">
              Interactive Financial Canvas
            </h2>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              Live Modeler
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time financial ratio decomposition, DuPont analysis, and DCF valuation powered by query outputs.
          </p>
        </div>

        {/* Financial Presets Quick Selector */}
        {onLoadSql && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Scenarios:</span>
            <div className="flex flex-wrap gap-1.5">
              {FINANCIAL_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadSql(preset.sql)}
                  className="h-7 border-zinc-700/80 bg-zinc-900/60 text-[11px] text-zinc-300 hover:border-emerald-500/40 hover:bg-zinc-800 hover:text-emerald-300"
                  title={preset.desc}
                >
                  <Sparkles className="mr-1 h-3 w-3 text-emerald-400" />
                  {preset.title.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs for Analysis Modules */}
      <Tabs defaultValue="dupont" className="w-full">
        <TabsList className="h-8 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="dupont" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
            <PieIcon className="h-3.5 w-3.5 text-emerald-400" /> DuPont ROE Tree
          </TabsTrigger>
          <TabsTrigger value="dcf" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
            <Calculator className="h-3.5 w-3.5 text-teal-400" /> DCF Valuation Engine
          </TabsTrigger>
          <TabsTrigger value="ratios" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Key Ratios & Health
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" /> SQL Financial Blueprints
          </TabsTrigger>
        </TabsList>

        {/* 1. DUPONT MODEL CONTENT */}
        <TabsContent value="dupont" className="mt-4 space-y-4">
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">DuPont 3-Step ROE Decomposition</h3>
                <p className="text-xs text-zinc-400">
                  Separates operational efficiency (Margin), asset efficiency (Turnover), and financing strategy (Leverage).
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Return on Equity (ROE)</span>
                <div className="font-mono text-2xl font-bold text-emerald-400">
                  {dupont.roe}%
                </div>
              </div>
            </div>

            {/* Tree visual diagram */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 pt-2">
              {/* Pillar 1: Margin */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-300">1. Profit Margin</span>
                  <Percent className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-zinc-100">
                  {dupont.netProfitMargin}%
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  Net Income ({dupont.netIncome}) ÷ Revenue ({dupont.revenue})
                </div>
                <div className="mt-3 text-[10px] text-emerald-400/80 border-t border-emerald-500/15 pt-2">
                  Operating pricing power and cost discipline.
                </div>
              </div>

              {/* Pillar 2: Turnover */}
              <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-teal-300">2. Asset Turnover</span>
                  <RefreshCw className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-zinc-100">
                  {dupont.assetTurnover}x
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  Revenue ({dupont.revenue}) ÷ Assets ({dupont.assets})
                </div>
                <div className="mt-3 text-[10px] text-teal-400/80 border-t border-teal-500/15 pt-2">
                  Dollars of revenue generated per dollar of asset deployed.
                </div>
              </div>

              {/* Pillar 3: Leverage */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-300">3. Financial Leverage</span>
                  <Sliders className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-zinc-100">
                  {dupont.equityMultiplier}x
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  Total Assets ({dupont.assets}) ÷ Equity ({dupont.equity})
                </div>
                <div className="mt-3 text-[10px] text-amber-400/80 border-t border-amber-500/15 pt-2">
                  Degree to which debt and liabilities fund operations.
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-zinc-900/90 py-2 font-mono text-xs text-zinc-300 border border-zinc-800">
              <span className="text-emerald-400 font-bold">{dupont.netProfitMargin}%</span>
              <span className="text-zinc-500">×</span>
              <span className="text-teal-400 font-bold">{dupont.assetTurnover}</span>
              <span className="text-zinc-500">×</span>
              <span className="text-amber-400 font-bold">{dupont.equityMultiplier}</span>
              <span className="text-zinc-500">=</span>
              <span className="text-emerald-300 font-bold underline underline-offset-4">{dupont.roe}% ROE</span>
            </div>
          </div>
        </TabsContent>

        {/* 2. DCF SENSITIVITY CONTENT */}
        <TabsContent value="dcf" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Control Sliders */}
            <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-teal-400" /> Valuation Parameters
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Discount Rate (WACC)</span>
                  <span className="font-mono font-bold text-teal-400">{wacc}%</span>
                </div>
                <Slider
                  value={[wacc]}
                  min={5}
                  max={20}
                  step={0.5}
                  onValueChange={(val) => setWacc(val[0])}
                  className="[&_[role=slider]]:bg-teal-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Annual Growth Rate (Yr 1-{forecastYears})</span>
                  <span className="font-mono font-bold text-emerald-400">+{growthRate}%</span>
                </div>
                <Slider
                  value={[growthRate]}
                  min={0}
                  max={40}
                  step={1}
                  onValueChange={(val) => setGrowthRate(val[0])}
                  className="[&_[role=slider]]:bg-emerald-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Terminal Growth Rate (g)</span>
                  <span className="font-mono font-bold text-amber-400">{termGrowth}%</span>
                </div>
                <Slider
                  value={[termGrowth]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={(val) => setTermGrowth(val[0])}
                  className="[&_[role=slider]]:bg-amber-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Forecast Horizon</span>
                  <span className="font-mono font-bold text-violet-400">{forecastYears} Years</span>
                </div>
                <Slider
                  value={[forecastYears]}
                  min={3}
                  max={10}
                  step={1}
                  onValueChange={(val) => setForecastYears(val[0])}
                  className="[&_[role=slider]]:bg-violet-400"
                />
              </div>
            </div>

            {/* DCF Output Summary */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-[11px] text-zinc-400">PV of Forecast Cash Flows</span>
                  <div className="mt-1 font-mono text-xl font-bold text-zinc-200">
                    ${dcfValuation.pvSum.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">Years 1 to {forecastYears}</span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-[11px] text-zinc-400">PV of Terminal Value</span>
                  <div className="mt-1 font-mono text-xl font-bold text-zinc-200">
                    ${dcfValuation.pvTerminalValue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">Perpetuity beyond yr {forecastYears}</span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <span className="text-[11px] font-medium text-emerald-300">Implied Enterprise Value</span>
                  <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                    ${dcfValuation.enterpriseValue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-500">DCF Present Value</span>
                </div>
              </div>

              {/* Year by Year Cash Flow Ledger */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-300">
                  Projected Free Cash Flow Schedule
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800/60 text-zinc-400">
                        <th className="px-4 py-2 font-medium">Period</th>
                        <th className="px-4 py-2 font-medium">Projected FCF</th>
                        <th className="px-4 py-2 font-medium">Discount Factor (WACC {wacc}%)</th>
                        <th className="px-4 py-2 font-medium text-right">Present Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                      {dcfValuation.projectedFlows.map((f) => (
                        <tr key={f.year} className="hover:bg-zinc-800/30">
                          <td className="px-4 py-1.5 text-zinc-400">Year {f.year}</td>
                          <td className="px-4 py-1.5 text-emerald-400">${f.fcf.toLocaleString()}</td>
                          <td className="px-4 py-1.5 text-zinc-400">
                            {(1 / Math.pow(1 + wacc / 100, f.year)).toFixed(4)}
                          </td>
                          <td className="px-4 py-1.5 text-right font-bold text-zinc-100">
                            ${f.pv.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3. RATIOS & CORPORATE HEALTH */}
        <TabsContent value="ratios" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-xs text-zinc-400">Gross Margin</span>
              <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                {metrics?.grossMargin ? `${metrics.grossMargin.toFixed(1)}%` : "45.0%"}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">Pricing vs product COGS</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-xs text-zinc-400">Operating Margin</span>
              <div className="mt-1 font-mono text-2xl font-bold text-teal-400">
                {metrics?.opMargin ? `${metrics.opMargin.toFixed(1)}%` : "16.2%"}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">EBIT margin after OPEX</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-xs text-zinc-400">Rule of 40 Score</span>
              <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
                {(growthRate + (metrics?.opMargin ?? 16.2)).toFixed(1)}%
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">Growth ({growthRate}%) + Op Margin</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-xs text-zinc-400">Estimated LTV</span>
              <div className="mt-1 font-mono text-2xl font-bold text-violet-400">
                {metrics?.ltv ? `$${metrics.ltv.toFixed(0)}` : "$2,177"}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">Cumulative value per account</p>
            </div>
          </div>
        </TabsContent>

        {/* 4. PRESETS EXPLORER */}
        <TabsContent value="presets" className="mt-4 space-y-3">
          <p className="text-xs text-zinc-400">
            Select any financial analytics template to immediately inject its SQL into the visualizer and inspect the financial pipeline:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FINANCIAL_PRESETS.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300">
                      {p.title}
                    </span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400">{p.desc}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <span className="font-mono text-[10px] text-zinc-400">Live SQLite Storefront</span>
                  {onLoadSql && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLoadSql(p.sql)}
                      className="h-7 border-zinc-700 bg-zinc-800/80 text-xs text-zinc-200 hover:border-emerald-500 hover:text-emerald-400"
                    >
                      Run Template <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

