"use client";

// Data & Finance art library — lookups for the per-problem PRIMER diagrams
// (860 × 210, one per Data & Finance problem that carries a primer) and the
// per-section STUDY flows (860 × 300, the real-life pipeline each section
// lives inside). Framed like PatternDiagram: label bar over the SVG.

import type { ComponentType } from "react";
import {
  ArtCreditUtilizationBands, ArtDelinquencyRollRates, ArtExpectedCreditLoss,
  ArtPrepaymentDetection, ArtRiskBasedPricing, ArtStudyLoanLife,
  ArtVintageDefaultCurves,
} from "./lc-df-art-bank";
import {
  ArtAmountAnomalyZscore, ArtChargebackRateRanking, ArtCircularTransfers,
  ArtDormantReactivation, ArtStudyPaymentsPipeline, ArtStructuringDetection,
  ArtTransactionVelocity,
} from "./lc-df-art-fraud";
import {
  ArtArAgingSchedule, ArtBalanceRollforward, ArtDeferredRevenue,
  ArtFifoInventoryCogs, ArtJournalGapDetection, ArtStudyMonthClose,
  ArtTrialBalanceCheck,
} from "./lc-df-art-acct";
import {
  ArtBetaBenchmark, ArtSharpeRatio, ArtSplitAdjustedPosition,
  ArtStudyTradesToRisk, ArtTimeWeightedReturn, ArtValueAtRisk,
  ArtWashTradeDetection,
} from "./lc-df-art-quant";
import {
  ArtAbTestConversionLift, ArtCohortRetentionMatrix, ArtDauWauStickiness,
  ArtFunnelStepConversion, ArtGrowthAccounting, ArtSessionizeEvents,
  ArtStudyProductLoop,
} from "./lc-df-art-product";
import {
  ArtDelinquencyBuckets, ArtGlReconciliation, ArtLoanAmortizationSchedule,
  ArtPortfolioWeights, ArtRealizedPnlAverageCost, ArtSettlementFailsAging,
  ArtStudyMoneyPipeline,
} from "./lc-df-art-finance";
import {
  ArtAbSampleRatioMismatch, ArtFeatureAdoptionWindows, ArtMedianTimeToConvert,
  ArtRolling7dActives, ArtStudyExperimentLife, ArtUsageTierPercentiles,
  ArtWeekOverWeekChurn,
} from "./lc-df-art-growth";
import {
  ArtDailyBalanceInterest, ArtDividendIncomeCalendar, ArtDuplicateChargePairs,
  ArtFxExposureReport, ArtMaxDrawdown, ArtPortfolioConcentrationHhi,
  ArtStudyMarketDesk,
} from "./lc-df-art-mkts";

const PRIMER_ART: Record<string, ComponentType> = {
  // Banking & Credit Risk
  "vintage-default-curves": ArtVintageDefaultCurves,
  "delinquency-roll-rates": ArtDelinquencyRollRates,
  "credit-utilization-bands": ArtCreditUtilizationBands,
  "expected-credit-loss": ArtExpectedCreditLoss,
  "risk-based-pricing": ArtRiskBasedPricing,
  "prepayment-detection": ArtPrepaymentDetection,
  // Fraud & AML
  "structuring-detection": ArtStructuringDetection,
  "transaction-velocity": ArtTransactionVelocity,
  "circular-transfers": ArtCircularTransfers,
  "amount-anomaly-zscore": ArtAmountAnomalyZscore,
  "chargeback-rate-ranking": ArtChargebackRateRanking,
  "dormant-reactivation": ArtDormantReactivation,
  // Accounting & Close
  "trial-balance-check": ArtTrialBalanceCheck,
  "ar-aging-schedule": ArtArAgingSchedule,
  "balance-rollforward": ArtBalanceRollforward,
  "fifo-inventory-cogs": ArtFifoInventoryCogs,
  "deferred-revenue": ArtDeferredRevenue,
  "journal-gap-detection": ArtJournalGapDetection,
  // Quant Desk
  "time-weighted-return": ArtTimeWeightedReturn,
  "sharpe-ratio": ArtSharpeRatio,
  "value-at-risk": ArtValueAtRisk,
  "beta-benchmark": ArtBetaBenchmark,
  "split-adjusted-position": ArtSplitAdjustedPosition,
  "wash-trade-detection": ArtWashTradeDetection,
  // Product Analytics
  "dau-wau-stickiness": ArtDauWauStickiness,
  "growth-accounting": ArtGrowthAccounting,
  "funnel-step-conversion": ArtFunnelStepConversion,
  "cohort-retention-matrix": ArtCohortRetentionMatrix,
  "sessionize-events": ArtSessionizeEvents,
  "ab-test-conversion-lift": ArtAbTestConversionLift,
  // Finance Core
  "loan-amortization-schedule": ArtLoanAmortizationSchedule,
  "delinquency-buckets": ArtDelinquencyBuckets,
  "portfolio-weights": ArtPortfolioWeights,
  "settlement-fails-aging": ArtSettlementFailsAging,
  "realized-pnl-average-cost": ArtRealizedPnlAverageCost,
  "gl-reconciliation": ArtGlReconciliation,
  // Growth & Experiments
  "week-over-week-churn": ArtWeekOverWeekChurn,
  "median-time-to-convert": ArtMedianTimeToConvert,
  "rolling-7d-actives": ArtRolling7dActives,
  "usage-tier-percentiles": ArtUsageTierPercentiles,
  "ab-sample-ratio-mismatch": ArtAbSampleRatioMismatch,
  "feature-adoption-windows": ArtFeatureAdoptionWindows,
  // Markets & Risk
  "fx-exposure-report": ArtFxExposureReport,
  "portfolio-concentration-hhi": ArtPortfolioConcentrationHhi,
  "daily-balance-interest": ArtDailyBalanceInterest,
  "dividend-income-calendar": ArtDividendIncomeCalendar,
  "max-drawdown": ArtMaxDrawdown,
  "duplicate-charge-pairs": ArtDuplicateChargePairs,
};

const STUDY_FLOW: Record<string, ComponentType> = {
  "loan-life": ArtStudyLoanLife,
  "payments-pipeline": ArtStudyPaymentsPipeline,
  "month-close": ArtStudyMonthClose,
  "trades-to-risk": ArtStudyTradesToRisk,
  "product-loop": ArtStudyProductLoop,
  "money-pipeline": ArtStudyMoneyPipeline,
  "experiment-life": ArtStudyExperimentLife,
  "market-desk": ArtStudyMarketDesk,
};

/** One concept diagram, framed — keyed by problem slug. */
export function PrimerArt({ slug, label }: { slug: string; label: string }) {
  const Art = PRIMER_ART[slug];
  if (!Art) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/60">
      <p className="border-b border-zinc-800/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <svg viewBox="0 0 860 210" className="h-auto w-full" role="img" aria-label={label}>
        <Art />
      </svg>
    </div>
  );
}

/** One study flow, framed — keyed by the section study's flow id. */
export function StudyFlowArt({ flow, label }: { flow: string; label: string }) {
  const Art = STUDY_FLOW[flow];
  if (!Art) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/60">
      <p className="border-b border-zinc-800/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <svg viewBox="0 0 860 300" className="h-auto w-full" role="img" aria-label={label}>
        <Art />
      </svg>
    </div>
  );
}
