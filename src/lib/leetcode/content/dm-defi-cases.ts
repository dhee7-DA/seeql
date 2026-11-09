// Domain Mastery — pack #10 "DeFi & AMM Analytics" · 60 case studies (20 Easy / 20 Medium / 20 Hard).
// Each case = a work scenario + TWO engine-graded steps.
// Expected outputs are verified and written into dm-expected.ts by scripts/dm-verify.ts.

import type { DmCase } from "../domain-packs";

export const DM_DEFI_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy (20)
  {
    id: "c01",
    difficulty: "Easy",
    company: "Uniswap",
    title: "Morning DEX pulse",
    scenario: "Protocol analytics team opens Monday reviewing active trading pools and total volume.",
    steps: [
      { prompt: "Count active pools in the pools table. Single column: active_pools.", code: `SELECT COUNT(*) AS active_pools\nFROM pools\nWHERE status = 'active';`, order: "exact" },
      { prompt: "Calculate sum of amount_in_cents and total swap fees across all swaps. Columns: total_volume_cents, total_fees_cents.", code: `SELECT SUM(amount_in_cents) AS total_volume_cents, SUM(fee_cents) AS total_fees_cents\nFROM swaps;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "Aave",
    title: "Protocol chain census",
    scenario: "Risk dashboard needs a breakdown of protocol deployment across Layer 1 and Layer 2 chains.",
    steps: [
      { prompt: "List distinct chain names ordered alphabetically. Single column: chain.", code: `SELECT DISTINCT chain\nFROM protocols\nORDER BY chain ASC;`, order: "exact" },
      { prompt: "Count protocols per chain, ordered by count DESC, chain ASC. Columns: chain, protocol_count.", code: `SELECT chain, COUNT(*) AS protocol_count\nFROM protocols\nGROUP BY chain\nORDER BY protocol_count DESC, chain ASC;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "Curve",
    title: "Stableswap pair audit",
    scenario: "Auditing low-fee stablecoin and pegged pools across the protocol.",
    steps: [
      { prompt: "List pair, token0, token1, fee_tier_bps for pools with fee_tier_bps = 1, ordered by pair ASC.", code: `SELECT pair, token0, token1, fee_tier_bps\nFROM pools\nWHERE fee_tier_bps = 1\nORDER BY pair ASC;`, order: "exact" },
      { prompt: "Calculate total combined reserves for fee_tier_bps = 1 pools. Single column: total_stable_reserves.", code: `SELECT SUM(reserve0_cents + reserve1_cents) AS total_stable_reserves\nFROM pools\nWHERE fee_tier_bps = 1;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "MakerDAO",
    title: "Liquidation collateral triage",
    scenario: "Reviewing collateral seized during market volatility events.",
    steps: [
      { prompt: "List distinct collateral_asset symbols from liquidations, ordered alphabetically. Single column: collateral_asset.", code: `SELECT DISTINCT collateral_asset\nFROM liquidations\nORDER BY collateral_asset ASC;`, order: "exact" },
      { prompt: "Count liquidations per collateral_asset, ordered by count DESC, asset ASC. Columns: collateral_asset, liquidation_count.", code: `SELECT collateral_asset, COUNT(*) AS liquidation_count\nFROM liquidations\nGROUP BY collateral_asset\nORDER BY liquidation_count DESC, collateral_asset ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Chainlink",
    title: "Oracle heartbeat check",
    scenario: "Monitoring oracle price feeds for standard 1-hour updates.",
    steps: [
      { prompt: "Count oracles with heartbeat_sec = 3600. Single column: hourly_oracles.", code: `SELECT COUNT(*) AS hourly_oracles\nFROM oracles\nWHERE heartbeat_sec = 3600;`, order: "exact" },
      { prompt: "List pair and price_cents for oracles with heartbeat_sec = 3600, ordered by price_cents DESC.", code: `SELECT pair, price_cents\nFROM oracles\nWHERE heartbeat_sec = 3600\nORDER BY price_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Nexus AMM",
    title: "Flash loan protocol inspection",
    scenario: "Verifying flash loan activity across lending protocols.",
    steps: [
      { prompt: "Count total flash loans executed. Single column: total_loans.", code: `SELECT COUNT(*) AS total_loans\nFROM flash_loans;`, order: "exact" },
      { prompt: "Count flash loans where is_arbitrage = 1. Single column: arb_loans.", code: `SELECT COUNT(*) AS arb_loans\nFROM flash_loans\nWHERE is_arbitrage = 1;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "Uniswap",
    title: "MEV transaction count",
    scenario: "Identifying searcher and sandwich transactions on the DEX.",
    steps: [
      { prompt: "Count swaps where is_mev = 1. Single column: mev_swaps.", code: `SELECT COUNT(*) AS mev_swaps\nFROM swaps\nWHERE is_mev = 1;`, order: "exact" },
      { prompt: "Calculate sum of fee_cents generated strictly from MEV swaps. Single column: mev_fees_cents.", code: `SELECT SUM(fee_cents) AS mev_fees_cents\nFROM swaps\nWHERE is_mev = 1;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "Aave",
    title: "Borrower debt overview",
    scenario: "Aggregating total debt repaid during liquidations.",
    steps: [
      { prompt: "Calculate total debt_cents repaid across all liquidations. Single column: total_debt_repaid.", code: `SELECT SUM(debt_cents) AS total_debt_repaid\nFROM liquidations;`, order: "exact" },
      { prompt: "Calculate average debt_cents per liquidation event. Single column: avg_debt_repaid.", code: `SELECT ROUND(AVG(debt_cents), 2) AS avg_debt_repaid\nFROM liquidations;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "Curve",
    title: "Active LP position liquidity",
    scenario: "Checking aggregate liquidity deployed in active LP positions.",
    steps: [
      { prompt: "Sum liquidity_cents for active positions. Single column: active_liquidity.", code: `SELECT SUM(liquidity_cents) AS active_liquidity\nFROM lp_positions\nWHERE status = 'active';`, order: "exact" },
      { prompt: "Calculate average liquidity_cents per active position. Single column: avg_active_liquidity.", code: `SELECT ROUND(AVG(liquidity_cents), 2) AS avg_active_liquidity\nFROM lp_positions\nWHERE status = 'active';`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Chainlink",
    title: "Highest deviation feed",
    scenario: "Spotting oracle feeds experiencing maximum price fluctuation.",
    steps: [
      { prompt: "Find maximum deviation_bps in oracles. Single column: max_dev.", code: `SELECT MAX(deviation_bps) AS max_dev\nFROM oracles;`, order: "exact" },
      { prompt: "List pair, deviation_bps, price_cents for oracle with the highest deviation_bps. Order by deviation_bps DESC LIMIT 1.", code: `SELECT pair, deviation_bps, price_cents\nFROM oracles\nORDER BY deviation_bps DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Uniswap",
    title: "Pool 1 volume check",
    scenario: "Inspecting trades specifically executed on ETH/USDC 0.05% (pool 1).",
    steps: [
      { prompt: "Count total swaps on pool_id = 1. Single column: pool1_swaps.", code: `SELECT COUNT(*) AS pool1_swaps\nFROM swaps\nWHERE pool_id = 1;`, order: "exact" },
      { prompt: "Calculate total amount_in_cents swapped on pool_id = 1. Single column: pool1_volume.", code: `SELECT SUM(amount_in_cents) AS pool1_volume\nFROM swaps\nWHERE pool_id = 1;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Aave",
    title: "Flash loan asset roster",
    scenario: "Identifying all assets borrowed through flash loans.",
    steps: [
      { prompt: "List distinct asset names in flash_loans, ordered alphabetically. Single column: asset.", code: `SELECT DISTINCT asset\nFROM flash_loans\nORDER BY asset ASC;`, order: "exact" },
      { prompt: "Count loans per asset, ordered by count DESC, asset ASC. Columns: asset, loan_count.", code: `SELECT asset, COUNT(*) AS loan_count\nFROM flash_loans\nGROUP BY asset\nORDER BY loan_count DESC, asset ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "MakerDAO",
    title: "Vault bonus totals",
    scenario: "Tracking liquidation incentives paid out to keepers.",
    steps: [
      { prompt: "Calculate minimum and maximum bonus_cents in liquidations. Columns: min_bonus, max_bonus.", code: `SELECT MIN(bonus_cents) AS min_bonus, MAX(bonus_cents) AS max_bonus\nFROM liquidations;`, order: "exact" },
      { prompt: "Sum bonus_cents for liquidations on protocol_id = 4. Single column: maker_bonuses.", code: `SELECT SUM(bonus_cents) AS maker_bonuses\nFROM liquidations\nWHERE protocol_id = 4;`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "Nexus AMM",
    title: "Arbitrum protocol status",
    scenario: "Querying protocols deployed on the Arbitrum network.",
    steps: [
      { prompt: "List name and tvl_cents for protocols on 'Arbitrum'. Columns: name, tvl_cents.", code: `SELECT name, tvl_cents\nFROM protocols\nWHERE chain = 'Arbitrum';`, order: "exact" },
      { prompt: "Count active pools on protocol_id = 5. Single column: nexus_pools.", code: `SELECT COUNT(*) AS nexus_pools\nFROM pools\nWHERE protocol_id = 5 AND status = 'active';`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "Uniswap",
    title: "High fee swap tally",
    scenario: "Filtering trades that contributed substantial protocol revenue.",
    steps: [
      { prompt: "Count swaps where fee_cents >= 10000. Single column: high_fee_swaps.", code: `SELECT COUNT(*) AS high_fee_swaps\nFROM swaps\nWHERE fee_cents >= 10000;`, order: "exact" },
      { prompt: "Sum fee_cents for swaps where fee_cents >= 10000. Single column: total_high_fees.", code: `SELECT SUM(fee_cents) AS total_high_fees\nFROM swaps\nWHERE fee_cents >= 10000;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Curve",
    title: "Withdrawn position count",
    scenario: "Reviewing LP capital withdrawals.",
    steps: [
      { prompt: "Count positions with status 'withdrawn'. Single column: withdrawn_count.", code: `SELECT COUNT(*) AS withdrawn_count\nFROM lp_positions\nWHERE status = 'withdrawn';`, order: "exact" },
      { prompt: "Sum liquidity_cents for withdrawn positions. Single column: withdrawn_liquidity.", code: `SELECT SUM(liquidity_cents) AS withdrawn_liquidity\nFROM lp_positions\nWHERE status = 'withdrawn';`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Chainlink",
    title: "Oracle price ranking",
    scenario: "Displaying the top oracle asset prices in US dollar terms.",
    steps: [
      { prompt: "List pair and price_cents for the top 3 priced feeds. Order by price_cents DESC LIMIT 3.", code: `SELECT pair, price_cents\nFROM oracles\nORDER BY price_cents DESC\nLIMIT 3;`, order: "exact" },
      { prompt: "Count oracles with price_cents < 10000. Single column: sub_100_usd_feeds.", code: `SELECT COUNT(*) AS sub_100_usd_feeds\nFROM oracles\nWHERE price_cents < 10000;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Aave",
    title: "Zero-fee flash loan volume",
    scenario: "Checking how much principal was borrowed at 0% protocol fee.",
    steps: [
      { prompt: "Sum principal_cents where fee_cents = 0 in flash_loans. Single column: zero_fee_principal.", code: `SELECT SUM(principal_cents) AS zero_fee_principal\nFROM flash_loans\nWHERE fee_cents = 0;`, order: "exact" },
      { prompt: "List borrower and principal_cents for zero-fee loans, ordered by principal_cents DESC.", code: `SELECT borrower, principal_cents\nFROM flash_loans\nWHERE fee_cents = 0\nORDER BY principal_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "Uniswap",
    title: "Slippage under 10 bps",
    scenario: "Auditing low-slippage trade execution.",
    steps: [
      { prompt: "Count swaps where slippage_bps <= 10. Single column: low_slip_swaps.", code: `SELECT COUNT(*) AS low_slip_swaps\nFROM swaps\nWHERE slippage_bps <= 10;`, order: "exact" },
      { prompt: "Sum amount_in_cents for swaps where slippage_bps <= 10. Single column: low_slip_volume.", code: `SELECT SUM(amount_in_cents) AS low_slip_volume\nFROM swaps\nWHERE slippage_bps <= 10;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "MakerDAO",
    title: "Debt assets in liquidations",
    scenario: "Listing distinct assets repaid to cover underwater vaults.",
    steps: [
      { prompt: "List distinct debt_asset symbols, ordered alphabetically. Single column: debt_asset.", code: `SELECT DISTINCT debt_asset\nFROM liquidations\nORDER BY debt_asset ASC;`, order: "exact" },
      { prompt: "Count liquidations per debt_asset, ordered by count DESC, asset ASC. Columns: debt_asset, liquidation_count.", code: `SELECT debt_asset, COUNT(*) AS liquidation_count\nFROM liquidations\nGROUP BY debt_asset\nORDER BY liquidation_count DESC, debt_asset ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Medium (20)
  {
    id: "c21",
    difficulty: "Medium",
    company: "Uniswap",
    title: "Pool volume vs reserves",
    scenario: "Measuring pool turnover by comparing total swap volume against pooled reserves.",
    steps: [
      { prompt: "Calculate swap volume per pool: pool_id, SUM(amount_in_cents) AS vol, ordered by vol DESC.", code: `SELECT pool_id, SUM(amount_in_cents) AS vol\nFROM swaps\nGROUP BY pool_id\nORDER BY vol DESC;`, order: "exact" },
      { prompt: "Join pools with swap volume: p.pair, (p.reserve0_cents + p.reserve1_cents) AS reserves, COALESCE(SUM(s.amount_in_cents), 0) AS total_vol, ordered by total_vol DESC.", code: `SELECT p.pair, (p.reserve0_cents + p.reserve1_cents) AS reserves, COALESCE(SUM(s.amount_in_cents), 0) AS total_vol\nFROM pools p\nLEFT JOIN swaps s ON p.pool_id = s.pool_id\nGROUP BY p.pool_id, p.pair, p.reserve0_cents, p.reserve1_cents\nORDER BY total_vol DESC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "Aave",
    title: "Flash loan fee realization",
    scenario: "Evaluating fee revenue yield across lending protocols offering flash liquidity.",
    steps: [
      { prompt: "Sum principal_cents and fee_cents per protocol_id: protocol_id, SUM(principal_cents) AS total_principal, SUM(fee_cents) AS total_fees, ordered by total_fees DESC.", code: `SELECT protocol_id, SUM(principal_cents) AS total_principal, SUM(fee_cents) AS total_fees\nFROM flash_loans\nGROUP BY protocol_id\nORDER BY total_fees DESC;`, order: "exact" },
      { prompt: "Calculate fee basis points: protocol_id, ROUND(10000.0 * SUM(fee_cents) / SUM(principal_cents), 2) AS fee_bps, ordered by fee_bps DESC.", code: `SELECT protocol_id, ROUND(10000.0 * SUM(fee_cents) / SUM(principal_cents), 2) AS fee_bps\nFROM flash_loans\nGROUP BY protocol_id\nORDER BY fee_bps DESC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "Curve",
    title: "Net LP earnings profile",
    scenario: "Calculating net yields after deducting impermanent loss from fee revenues.",
    steps: [
      { prompt: "Calculate net earnings per active position: position_id, owner, (fees_earned_cents - impermanent_loss_cents) AS net_cents, ordered by net_cents DESC.", code: `SELECT position_id, owner, (fees_earned_cents - impermanent_loss_cents) AS net_cents\nFROM lp_positions\nWHERE status = 'active'\nORDER BY net_cents DESC;`, order: "exact" },
      { prompt: "Group active positions by owner: owner, SUM(fees_earned_cents - impermanent_loss_cents) AS total_net, ordered by total_net DESC.", code: `SELECT owner, SUM(fees_earned_cents - impermanent_loss_cents) AS total_net\nFROM lp_positions\nWHERE status = 'active'\nGROUP BY owner\nORDER BY total_net DESC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "MakerDAO",
    title: "Collateral recovery ratio",
    scenario: "Examining collateral seized relative to the debt obligation cleared.",
    steps: [
      { prompt: "Calculate collateral recovery ratio: liquidation_id, borrower, ROUND(100.0 * collateral_cents / debt_cents, 2) AS recovery_pct, ordered by recovery_pct DESC.", code: `SELECT liquidation_id, borrower, ROUND(100.0 * collateral_cents / debt_cents, 2) AS recovery_pct\nFROM liquidations\nORDER BY recovery_pct DESC;`, order: "exact" },
      { prompt: "Calculate average recovery percentage grouped by collateral_asset: collateral_asset, ROUND(AVG(100.0 * collateral_cents / debt_cents), 2) AS avg_recovery, ordered by avg_recovery DESC.", code: `SELECT collateral_asset, ROUND(AVG(100.0 * collateral_cents / debt_cents), 2) AS avg_recovery\nFROM liquidations\nGROUP BY collateral_asset\nORDER BY avg_recovery DESC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Nexus AMM",
    title: "Sender trade frequency",
    scenario: "Analyzing user trading distribution on the exchange.",
    steps: [
      { prompt: "Count swaps and sum volume per sender: sender, COUNT(*) AS swaps, SUM(amount_in_cents) AS volume, ordered by swaps DESC, volume DESC LIMIT 5.", code: `SELECT sender, COUNT(*) AS swaps, SUM(amount_in_cents) AS volume\nFROM swaps\nGROUP BY sender\nORDER BY swaps DESC, volume DESC\nLIMIT 5;`, order: "exact" },
      { prompt: "Count unique senders who executed more than 1 trade. Single column: repeat_traders.", code: `SELECT COUNT(*) AS repeat_traders\nFROM (SELECT sender FROM swaps GROUP BY sender HAVING COUNT(*) > 1);`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Uniswap",
    title: "MEV fee impact",
    scenario: "Determining how much trading fee revenue originates from MEV arbitrage bots.",
    steps: [
      { prompt: "Calculate total fee_cents grouped by is_mev: is_mev, SUM(fee_cents) AS fees, ordered by is_mev ASC.", code: `SELECT is_mev, SUM(fee_cents) AS fees\nFROM swaps\nGROUP BY is_mev\nORDER BY is_mev ASC;`, order: "exact" },
      { prompt: "Calculate MEV fee percentage of all fees: ROUND(100.0 * (SELECT SUM(fee_cents) FROM swaps WHERE is_mev = 1) / (SELECT SUM(fee_cents) FROM swaps), 2) AS mev_fee_share_pct.", code: `SELECT ROUND(100.0 * (SELECT SUM(fee_cents) FROM swaps WHERE is_mev = 1) / (SELECT SUM(fee_cents) FROM swaps), 2) AS mev_fee_share_pct;`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "Chainlink",
    title: "Oracle price deviation audit",
    scenario: "Identifying feeds deviating over baseline threshold.",
    steps: [
      { prompt: "List pair, deviation_bps, price_cents where deviation_bps > 20, ordered by deviation_bps DESC.", code: `SELECT pair, deviation_bps, price_cents\nFROM oracles\nWHERE deviation_bps > 20\nORDER BY deviation_bps DESC;`, order: "exact" },
      { prompt: "Calculate average deviation_bps across all oracle feeds. Single column: avg_deviation.", code: `SELECT ROUND(AVG(deviation_bps), 1) AS avg_deviation\nFROM oracles;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "Aave",
    title: "Multi-liquidation accounts",
    scenario: "Investigating repeat insolvencies during liquidation spikes.",
    steps: [
      { prompt: "Find borrowers with more than 1 liquidation: borrower, COUNT(*) AS count, ordered by count DESC.", code: `SELECT borrower, COUNT(*) AS count\nFROM liquidations\nGROUP BY borrower\nHAVING COUNT(*) > 1\nORDER BY count DESC;`, order: "exact" },
      { prompt: "Sum total debt_cents repaid by repeat liquidated borrowers: Single column: total_repeat_debt.", code: `SELECT SUM(debt_cents) AS total_repeat_debt\nFROM liquidations\nWHERE borrower IN (SELECT borrower FROM liquidations GROUP BY borrower HAVING COUNT(*) > 1);`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "Curve",
    title: "Pool liquidity depth",
    scenario: "Comparing total reserves deployed across active pools.",
    steps: [
      { prompt: "List pair, (reserve0_cents + reserve1_cents) AS pool_depth for active pools, ordered by pool_depth DESC.", code: `SELECT pair, (reserve0_cents + reserve1_cents) AS pool_depth\nFROM pools\nWHERE status = 'active'\nORDER BY pool_depth DESC;`, order: "exact" },
      { prompt: "Calculate sum of all reserves in active pools. Single column: total_active_reserves.", code: `SELECT SUM(reserve0_cents + reserve1_cents) AS total_active_reserves\nFROM pools\nWHERE status = 'active';`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "MakerDAO",
    title: "Keeper bonus payouts",
    scenario: "Evaluating liquidator compensation across debt asset types.",
    steps: [
      { prompt: "Sum bonus_cents by debt_asset: debt_asset, SUM(bonus_cents) AS total_bonuses, ordered by total_bonuses DESC.", code: `SELECT debt_asset, SUM(bonus_cents) AS total_bonuses\nFROM liquidations\nGROUP BY debt_asset\nORDER BY total_bonuses DESC;`, order: "exact" },
      { prompt: "Calculate average bonus_cents per liquidation event. Single column: mean_bonus.", code: `SELECT ROUND(AVG(bonus_cents), 2) AS mean_bonus\nFROM liquidations;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Nexus AMM",
    title: "Daily trading timeline",
    scenario: "Aggregating daily volume and swap transactions.",
    steps: [
      { prompt: "Group swaps by date: SUBSTR(timestamp, 1, 10) AS date, COUNT(*) AS count, ordered by date ASC.", code: `SELECT SUBSTR(timestamp, 1, 10) AS date, COUNT(*) AS count\nFROM swaps\nGROUP BY SUBSTR(timestamp, 1, 10)\nORDER BY date ASC;`, order: "exact" },
      { prompt: "Calculate total volume per day: SUBSTR(timestamp, 1, 10) AS date, SUM(amount_in_cents) AS volume, ordered by date ASC.", code: `SELECT SUBSTR(timestamp, 1, 10) AS date, SUM(amount_in_cents) AS volume\nFROM swaps\nGROUP BY SUBSTR(timestamp, 1, 10)\nORDER BY date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Uniswap",
    title: "High slippage triage",
    scenario: "Isolating trades that experienced severe slippage.",
    steps: [
      { prompt: "Count swaps where slippage_bps >= 30. Single column: high_slip_count.", code: `SELECT COUNT(*) AS high_slip_count\nFROM swaps\nWHERE slippage_bps >= 30;`, order: "exact" },
      { prompt: "List swap_id, pool_id, amount_in_cents, slippage_bps for slippage_bps >= 30, ordered by slippage_bps DESC, swap_id ASC.", code: `SELECT swap_id, pool_id, amount_in_cents, slippage_bps\nFROM swaps\nWHERE slippage_bps >= 30\nORDER BY slippage_bps DESC, swap_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "Aave",
    title: "Asset flash loan demand",
    scenario: "Evaluating principal volume borrowed per asset.",
    steps: [
      { prompt: "Sum principal_cents by asset: asset, SUM(principal_cents) AS volume, ordered by volume DESC.", code: `SELECT asset, SUM(principal_cents) AS volume\nFROM flash_loans\nGROUP BY asset\nORDER BY volume DESC;`, order: "exact" },
      { prompt: "Find asset with the single highest total principal borrowed. Output asset, SUM(principal_cents) AS volume ORDER BY volume DESC LIMIT 1.", code: `SELECT asset, SUM(principal_cents) AS volume\nFROM flash_loans\nGROUP BY asset\nORDER BY volume DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "Curve",
    title: "LP loss severity",
    scenario: "Comparing impermanent loss against active liquidity.",
    steps: [
      { prompt: "For active positions, calculate IL percentage of liquidity: position_id, owner, ROUND(100.0 * impermanent_loss_cents / liquidity_cents, 3) AS il_pct, ordered by il_pct DESC.", code: `SELECT position_id, owner, ROUND(100.0 * impermanent_loss_cents / liquidity_cents, 3) AS il_pct\nFROM lp_positions\nWHERE status = 'active'\nORDER BY il_pct DESC;`, order: "exact" },
      { prompt: "Find maximum impermanent_loss_cents among active positions. Single column: max_active_il.", code: `SELECT MAX(impermanent_loss_cents) AS max_active_il\nFROM lp_positions\nWHERE status = 'active';`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "MakerDAO",
    title: "Chain TVL distribution",
    scenario: "Analyzing capital allocation across supported blockchains.",
    steps: [
      { prompt: "Sum tvl_cents per chain: chain, SUM(tvl_cents) AS total_tvl, ordered by total_tvl DESC.", code: `SELECT chain, SUM(tvl_cents) AS total_tvl\nFROM protocols\nGROUP BY chain\nORDER BY total_tvl DESC;`, order: "exact" },
      { prompt: "Calculate Ethereum's share of total TVL: ROUND(100.0 * (SELECT SUM(tvl_cents) FROM protocols WHERE chain = 'Ethereum') / (SELECT SUM(tvl_cents) FROM protocols), 2) AS eth_tvl_share.", code: `SELECT ROUND(100.0 * (SELECT SUM(tvl_cents) FROM protocols WHERE chain = 'Ethereum') / (SELECT SUM(tvl_cents) FROM protocols), 2) AS eth_tvl_share;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Nexus AMM",
    title: "Arbitrage vs non-arbitrage flash loans",
    scenario: "Classifying flash loans by intended use case.",
    steps: [
      { prompt: "Group flash loans by is_arbitrage: is_arbitrage, COUNT(*) AS count, SUM(principal_cents) AS volume, ordered by is_arbitrage DESC.", code: `SELECT is_arbitrage, COUNT(*) AS count, SUM(principal_cents) AS volume\nFROM flash_loans\nGROUP BY is_arbitrage\nORDER BY is_arbitrage DESC;`, order: "exact" },
      { prompt: "Calculate average fee_cents for arbitrage flash loans. Single column: avg_arb_fee.", code: `SELECT ROUND(AVG(fee_cents), 2) AS avg_arb_fee\nFROM flash_loans\nWHERE is_arbitrage = 1;`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Uniswap",
    title: "Top pools by fee generation",
    scenario: "Identifying liquidity pools generating the highest protocol revenue.",
    steps: [
      { prompt: "Sum fee_cents per pool_id: pool_id, SUM(fee_cents) AS fees, ordered by fees DESC.", code: `SELECT pool_id, SUM(fee_cents) AS fees\nFROM swaps\nGROUP BY pool_id\nORDER BY fees DESC;`, order: "exact" },
      { prompt: "Join pools with total fees: p.pair, SUM(s.fee_cents) AS total_fees, ordered by total_fees DESC LIMIT 3.", code: `SELECT p.pair, SUM(s.fee_cents) AS total_fees\nFROM pools p\nJOIN swaps s ON p.pool_id = s.pool_id\nGROUP BY p.pool_id, p.pair\nORDER BY total_fees DESC\nLIMIT 3;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Chainlink",
    title: "Price ratio cross-check",
    scenario: "Comparing ETH and BTC oracle feed prices.",
    steps: [
      { prompt: "List price_cents for ETH/USD and BTC/USD: pair, price_cents, ordered by price_cents DESC.", code: `SELECT pair, price_cents\nFROM oracles\nWHERE pair IN ('ETH/USD', 'BTC/USD')\nORDER BY price_cents DESC;`, order: "exact" },
      { prompt: "Compute ETH price as percentage of BTC price: ROUND(100.0 * (SELECT price_cents FROM oracles WHERE pair = 'ETH/USD') / (SELECT price_cents FROM oracles WHERE pair = 'BTC/USD'), 2) AS eth_pct_of_btc.", code: `SELECT ROUND(100.0 * (SELECT price_cents FROM oracles WHERE pair = 'ETH/USD') / (SELECT price_cents FROM oracles WHERE pair = 'BTC/USD'), 2) AS eth_pct_of_btc;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "Aave",
    title: "Collateral efficiency ranking",
    scenario: "Ranking liquidation events by collateral value seized.",
    steps: [
      { prompt: "List top 5 liquidations by collateral_cents: liquidation_id, borrower, collateral_cents, debt_cents, ordered by collateral_cents DESC LIMIT 5.", code: `SELECT liquidation_id, borrower, collateral_cents, debt_cents\nFROM liquidations\nORDER BY collateral_cents DESC\nLIMIT 5;`, order: "exact" },
      { prompt: "Calculate sum of collateral_cents seized in the top 5 liquidations. Single column: top5_collateral.", code: `SELECT SUM(collateral_cents) AS top5_collateral\nFROM (SELECT collateral_cents FROM liquidations ORDER BY collateral_cents DESC LIMIT 5);`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "Curve",
    title: "Tick range width summary",
    scenario: "Summarizing tick intervals chosen by active liquidity providers.",
    steps: [
      { prompt: "Calculate average tick width (upper_tick - lower_tick) for active positions. Single column: avg_tick_width.", code: `SELECT ROUND(AVG(upper_tick - lower_tick), 1) AS avg_tick_width\nFROM lp_positions\nWHERE status = 'active';`, order: "exact" },
      { prompt: "List position_id, owner, (upper_tick - lower_tick) AS width for positions with width <= 100, ordered by width ASC.", code: `SELECT position_id, owner, (upper_tick - lower_tick) AS width\nFROM lp_positions\nWHERE (upper_tick - lower_tick) <= 100\nORDER BY width ASC;`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard (20)
  {
    id: "c41",
    difficulty: "Hard",
    company: "Uniswap",
    title: "Cumulative pool market share",
    scenario: "Analyzing the market concentration of trading volume across pools using window functions.",
    steps: [
      { prompt: "Calculate pool volume and its percentage share of total volume: pool_id, total_vol, ROUND(100.0 * total_vol / SUM(total_vol) OVER (), 2) AS share_pct FROM (SELECT pool_id, SUM(amount_in_cents) AS total_vol FROM swaps GROUP BY pool_id) ORDER BY share_pct DESC;", code: `SELECT pool_id, total_vol, ROUND(100.0 * total_vol / SUM(total_vol) OVER (), 2) AS share_pct\nFROM (SELECT pool_id, SUM(amount_in_cents) AS total_vol FROM swaps GROUP BY pool_id)\nORDER BY share_pct DESC;`, order: "exact" },
      { prompt: "Compute running cumulative volume: pool_id, total_vol, SUM(total_vol) OVER (ORDER BY total_vol DESC) AS running_vol FROM (SELECT pool_id, SUM(amount_in_cents) AS total_vol FROM swaps GROUP BY pool_id) ORDER BY running_vol ASC;", code: `SELECT pool_id, total_vol, SUM(total_vol) OVER (ORDER BY total_vol DESC) AS running_vol\nFROM (SELECT pool_id, SUM(amount_in_cents) AS total_vol FROM swaps GROUP BY pool_id)\nORDER BY running_vol ASC;`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "Aave",
    title: "Borrower flash liquidity ranking",
    scenario: "Ranking flash loan borrowers by total principal and dense rank.",
    steps: [
      { prompt: "Rank borrowers by volume: borrower, SUM(principal_cents) AS vol, RANK() OVER (ORDER BY SUM(principal_cents) DESC) AS rnk FROM flash_loans GROUP BY borrower ORDER BY rnk ASC;", code: `SELECT borrower, SUM(principal_cents) AS vol, RANK() OVER (ORDER BY SUM(principal_cents) DESC) AS rnk\nFROM flash_loans\nGROUP BY borrower\nORDER BY rnk ASC;`, order: "exact" },
      { prompt: "Compute dense rank of flash loan borrowers: borrower, SUM(principal_cents) AS vol, DENSE_RANK() OVER (ORDER BY SUM(principal_cents) DESC) AS d_rnk FROM flash_loans GROUP BY borrower ORDER BY d_rnk ASC;", code: `SELECT borrower, SUM(principal_cents) AS vol, DENSE_RANK() OVER (ORDER BY SUM(principal_cents) DESC) AS d_rnk\nFROM flash_loans\nGROUP BY borrower\nORDER BY d_rnk ASC;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "Curve",
    title: "LP net yield quartiles",
    scenario: "Segmenting active LP positions into quartiles based on net profitability.",
    steps: [
      { prompt: "Compute net profit and assign NTILE(4): position_id, owner, (fees_earned_cents - impermanent_loss_cents) AS net, NTILE(4) OVER (ORDER BY (fees_earned_cents - impermanent_loss_cents) DESC) AS quartile FROM lp_positions WHERE status = 'active' ORDER BY quartile ASC, net DESC;", code: `SELECT position_id, owner, (fees_earned_cents - impermanent_loss_cents) AS net, NTILE(4) OVER (ORDER BY (fees_earned_cents - impermanent_loss_cents) DESC) AS quartile\nFROM lp_positions\nWHERE status = 'active'\nORDER BY quartile ASC, net DESC;`, order: "exact" },
      { prompt: "Calculate average net profit in quartile 1: Single column: top_quartile_avg_net.", code: `SELECT ROUND(AVG(net), 2) AS top_quartile_avg_net\nFROM (SELECT (fees_earned_cents - impermanent_loss_cents) AS net, NTILE(4) OVER (ORDER BY (fees_earned_cents - impermanent_loss_cents) DESC) AS q FROM lp_positions WHERE status = 'active')\nWHERE q = 1;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "MakerDAO",
    title: "Cumulative liquidated debt schedule",
    scenario: "Analyzing the accumulation of liquidated debt chronologically.",
    steps: [
      { prompt: "Calculate running cumulative debt repaid: liquidation_id, timestamp, debt_cents, SUM(debt_cents) OVER (ORDER BY timestamp ASC) AS running_debt FROM liquidations ORDER BY timestamp ASC;", code: `SELECT liquidation_id, timestamp, debt_cents, SUM(debt_cents) OVER (ORDER BY timestamp ASC) AS running_debt\nFROM liquidations\nORDER BY timestamp ASC;`, order: "exact" },
      { prompt: "Calculate rolling 3-event average debt repaid: liquidation_id, timestamp, ROUND(AVG(debt_cents) OVER (ORDER BY timestamp ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_3_debt FROM liquidations ORDER BY timestamp ASC;", code: `SELECT liquidation_id, timestamp, ROUND(AVG(debt_cents) OVER (ORDER BY timestamp ASC ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_3_debt\nFROM liquidations\nORDER BY timestamp ASC;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Nexus AMM",
    title: "Cross-chain protocol TVL rank",
    scenario: "Ranking protocols within their respective blockchains.",
    steps: [
      { prompt: "Rank protocols within chain: name, chain, tvl_cents, RANK() OVER (PARTITION BY chain ORDER BY tvl_cents DESC) AS chain_rank FROM protocols ORDER BY chain ASC, chain_rank ASC;", code: `SELECT name, chain, tvl_cents, RANK() OVER (PARTITION BY chain ORDER BY tvl_cents DESC) AS chain_rank\nFROM protocols\nORDER BY chain ASC, chain_rank ASC;`, order: "exact" },
      { prompt: "Calculate chain total TVL and protocol share: name, chain, tvl_cents, ROUND(100.0 * tvl_cents / SUM(tvl_cents) OVER (PARTITION BY chain), 2) AS share_in_chain FROM protocols ORDER BY chain ASC, share_in_chain DESC;", code: `SELECT name, chain, tvl_cents, ROUND(100.0 * tvl_cents / SUM(tvl_cents) OVER (PARTITION BY chain), 2) AS share_in_chain\nFROM protocols\nORDER BY chain ASC, share_in_chain DESC;`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Uniswap",
    title: "Trade-by-trade volume delta",
    scenario: "Measuring volume changes between successive swaps on pool 1.",
    steps: [
      { prompt: "Find previous trade volume on pool 1: swap_id, amount_in_cents, LAG(amount_in_cents) OVER (ORDER BY swap_id ASC) AS prev_amount FROM swaps WHERE pool_id = 1 ORDER BY swap_id ASC;", code: `SELECT swap_id, amount_in_cents, LAG(amount_in_cents) OVER (ORDER BY swap_id ASC) AS prev_amount\nFROM swaps\nWHERE pool_id = 1\nORDER BY swap_id ASC;`, order: "exact" },
      { prompt: "Calculate delta vs previous trade: swap_id, amount_in_cents, (amount_in_cents - COALESCE(LAG(amount_in_cents) OVER (ORDER BY swap_id ASC), amount_in_cents)) AS delta_cents FROM swaps WHERE pool_id = 1 ORDER BY swap_id ASC;", code: `SELECT swap_id, amount_in_cents, (amount_in_cents - COALESCE(LAG(amount_in_cents) OVER (ORDER BY swap_id ASC), amount_in_cents)) AS delta_cents\nFROM swaps\nWHERE pool_id = 1\nORDER BY swap_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "Chainlink",
    title: "Stale oracle alert severity",
    scenario: "Classifying oracle deviation into operational risk tiers.",
    steps: [
      { prompt: "Classify feeds: pair, deviation_bps, CASE WHEN deviation_bps > 30 THEN 'CRITICAL' WHEN deviation_bps > 15 THEN 'WARNING' ELSE 'NORMAL' END AS status_tier FROM oracles ORDER BY deviation_bps DESC;", code: `SELECT pair, deviation_bps, CASE WHEN deviation_bps > 30 THEN 'CRITICAL' WHEN deviation_bps > 15 THEN 'WARNING' ELSE 'NORMAL' END AS status_tier\nFROM oracles\nORDER BY deviation_bps DESC;`, order: "exact" },
      { prompt: "Count feeds per status_tier, ordered by count DESC: status_tier, COUNT(*) AS feed_count.", code: `SELECT CASE WHEN deviation_bps > 30 THEN 'CRITICAL' WHEN deviation_bps > 15 THEN 'WARNING' ELSE 'NORMAL' END AS status_tier, COUNT(*) AS feed_count\nFROM oracles\nGROUP BY CASE WHEN deviation_bps > 30 THEN 'CRITICAL' WHEN deviation_bps > 15 THEN 'WARNING' ELSE 'NORMAL' END\nORDER BY feed_count DESC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "Aave",
    title: "Liquidator bonus yield rank",
    scenario: "Computing liquidator profitability percentage on debt repaid.",
    steps: [
      { prompt: "Calculate bonus yield: liquidation_id, borrower, ROUND(100.0 * bonus_cents / debt_cents, 2) AS yield_pct, RANK() OVER (ORDER BY 100.0 * bonus_cents / debt_cents DESC) AS rnk FROM liquidations ORDER BY rnk ASC, liquidation_id ASC;", code: `SELECT liquidation_id, borrower, ROUND(100.0 * bonus_cents / debt_cents, 2) AS yield_pct, RANK() OVER (ORDER BY 100.0 * bonus_cents / debt_cents DESC) AS rnk\nFROM liquidations\nORDER BY rnk ASC, liquidation_id ASC;`, order: "exact" },
      { prompt: "Calculate average bonus yield across all liquidations: Single column: mean_bonus_yield_pct.", code: `SELECT ROUND(AVG(100.0 * bonus_cents / debt_cents), 2) AS mean_bonus_yield_pct\nFROM liquidations;`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "MakerDAO",
    title: "Borrower debt concentration",
    scenario: "Calculating the debt concentration percentage of individual liquidated borrowers.",
    steps: [
      { prompt: "Sum borrower debt and percentage of total debt: borrower, SUM(debt_cents) AS debt, ROUND(100.0 * SUM(debt_cents) / (SELECT SUM(debt_cents) FROM liquidations), 2) AS share_pct FROM liquidations GROUP BY borrower ORDER BY share_pct DESC;", code: `SELECT borrower, SUM(debt_cents) AS debt, ROUND(100.0 * SUM(debt_cents) / (SELECT SUM(debt_cents) FROM liquidations), 2) AS share_pct\nFROM liquidations\nGROUP BY borrower\nORDER BY share_pct DESC;`, order: "exact" },
      { prompt: "Calculate top borrower's debt share percentage. Single column: top_borrower_share_pct.", code: `SELECT ROUND(100.0 * SUM(debt_cents) / (SELECT SUM(debt_cents) FROM liquidations), 2) AS top_borrower_share_pct\nFROM liquidations\nGROUP BY borrower\nORDER BY top_borrower_share_pct DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Curve",
    title: "Pool fee efficiency index",
    scenario: "Measuring fees captured per unit of reserve capital.",
    steps: [
      { prompt: "Calculate fee basis points captured: p.pair, ROUND(10000.0 * SUM(s.fee_cents) / (p.reserve0_cents + p.reserve1_cents), 2) AS bps_yield FROM pools p JOIN swaps s ON p.pool_id = s.pool_id GROUP BY p.pool_id, p.pair, p.reserve0_cents, p.reserve1_cents ORDER BY bps_yield DESC;", code: `SELECT p.pair, ROUND(10000.0 * SUM(s.fee_cents) / (p.reserve0_cents + p.reserve1_cents), 2) AS bps_yield\nFROM pools p\nJOIN swaps s ON p.pool_id = s.pool_id\nGROUP BY p.pool_id, p.pair, p.reserve0_cents, p.reserve1_cents\nORDER BY bps_yield DESC;`, order: "exact" },
      { prompt: "Find highest fee yield pool name. Single column: top_pool_pair.", code: `SELECT p.pair AS top_pool_pair\nFROM pools p\nJOIN swaps s ON p.pool_id = s.pool_id\nGROUP BY p.pool_id, p.pair, p.reserve0_cents, p.reserve1_cents\nORDER BY ROUND(10000.0 * SUM(s.fee_cents) / (p.reserve0_cents + p.reserve1_cents), 2) DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Nexus AMM",
    title: "Rolling 3-trade volume smoothing",
    scenario: "Applying moving averages to smooth swap volume series.",
    steps: [
      { prompt: "Compute rolling 3-trade average volume: swap_id, pool_id, amount_in_cents, ROUND(AVG(amount_in_cents) OVER (PARTITION BY pool_id ORDER BY swap_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_avg FROM swaps ORDER BY pool_id ASC, swap_id ASC;", code: `SELECT swap_id, pool_id, amount_in_cents, ROUND(AVG(amount_in_cents) OVER (PARTITION BY pool_id ORDER BY swap_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_avg\nFROM swaps\nORDER BY pool_id ASC, swap_id ASC;`, order: "exact" },
      { prompt: "Calculate maximum rolling average observed across swaps: Single column: max_rolling_avg.", code: `SELECT MAX(rolling_avg) AS max_rolling_avg\nFROM (SELECT ROUND(AVG(amount_in_cents) OVER (PARTITION BY pool_id ORDER BY swap_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_avg FROM swaps);`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Uniswap",
    title: "MEV searcher volume dominance",
    scenario: "Evaluating the volume concentration among MEV searchers.",
    steps: [
      { prompt: "Aggregate MEV volume by sender: sender, COUNT(*) AS txs, SUM(amount_in_cents) AS vol FROM swaps WHERE is_mev = 1 GROUP BY sender ORDER BY vol DESC;", code: `SELECT sender, COUNT(*) AS txs, SUM(amount_in_cents) AS vol\nFROM swaps\nWHERE is_mev = 1\nGROUP BY sender\nORDER BY vol DESC;`, order: "exact" },
      { prompt: "Calculate top searcher volume share of all MEV volume: Single column: top_searcher_mev_share.", code: `SELECT ROUND(100.0 * MAX(vol) / (SELECT SUM(amount_in_cents) FROM swaps WHERE is_mev = 1), 2) AS top_searcher_mev_share\nFROM (SELECT SUM(amount_in_cents) AS vol FROM swaps WHERE is_mev = 1 GROUP BY sender);`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "Aave",
    title: "Flash arbitrage fee generation",
    scenario: "Measuring total protocol revenue accrued from arbitrage flash loans.",
    steps: [
      { prompt: "Summarize arbitrage loans: COUNT(*) AS arb_count, SUM(principal_cents) AS total_principal, SUM(fee_cents) AS total_fees FROM flash_loans WHERE is_arbitrage = 1;", code: `SELECT COUNT(*) AS arb_count, SUM(principal_cents) AS total_principal, SUM(fee_cents) AS total_fees\nFROM flash_loans\nWHERE is_arbitrage = 1;`, order: "exact" },
      { prompt: "Compare average principal: is_arbitrage, ROUND(AVG(principal_cents), 2) AS mean_principal FROM flash_loans GROUP BY is_arbitrage ORDER BY is_arbitrage DESC;", code: `SELECT is_arbitrage, ROUND(AVG(principal_cents), 2) AS mean_principal\nFROM flash_loans\nGROUP BY is_arbitrage\nORDER BY is_arbitrage DESC;`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "Curve",
    title: "Underwater position triage",
    scenario: "Classifying liquidity positions by net fee surplus vs deficit.",
    steps: [
      { prompt: "Classify positions: position_id, owner, CASE WHEN fees_earned_cents >= impermanent_loss_cents THEN 'Profitable' ELSE 'Deficit' END AS status_health FROM lp_positions ORDER BY position_id ASC;", code: `SELECT position_id, owner, CASE WHEN fees_earned_cents >= impermanent_loss_cents THEN 'Profitable' ELSE 'Deficit' END AS status_health\nFROM lp_positions\nORDER BY position_id ASC;`, order: "exact" },
      { prompt: "Count positions per status_health, ordered by count DESC: status_health, COUNT(*) AS count.", code: `SELECT CASE WHEN fees_earned_cents >= impermanent_loss_cents THEN 'Profitable' ELSE 'Deficit' END AS status_health, COUNT(*) AS count\nFROM lp_positions\nGROUP BY CASE WHEN fees_earned_cents >= impermanent_loss_cents THEN 'Profitable' ELSE 'Deficit' END\nORDER BY count DESC;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "MakerDAO",
    title: "Collateral asset volume share",
    scenario: "Computing each collateral token's share of total liquidated collateral.",
    steps: [
      { prompt: "Sum collateral and calculate percentage: collateral_asset, SUM(collateral_cents) AS total_c, ROUND(100.0 * SUM(collateral_cents) / (SELECT SUM(collateral_cents) FROM liquidations), 2) AS share_pct FROM liquidations GROUP BY collateral_asset ORDER BY share_pct DESC;", code: `SELECT collateral_asset, SUM(collateral_cents) AS total_c, ROUND(100.0 * SUM(collateral_cents) / (SELECT SUM(collateral_cents) FROM liquidations), 2) AS share_pct\nFROM liquidations\nGROUP BY collateral_asset\nORDER BY share_pct DESC;`, order: "exact" },
      { prompt: "Find highest liquidated collateral asset name: Single column: top_collateral_asset.", code: `SELECT collateral_asset AS top_collateral_asset\nFROM liquidations\nGROUP BY collateral_asset\nORDER BY SUM(collateral_cents) DESC\nLIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Nexus AMM",
    title: "High-value trade threshold",
    scenario: "Filtering trades exceeding pool volume benchmarks.",
    steps: [
      { prompt: "Count swaps where amount_in_cents > (SELECT AVG(amount_in_cents) FROM swaps). Single column: above_avg_swaps.", code: `SELECT COUNT(*) AS above_avg_swaps\nFROM swaps\nWHERE amount_in_cents > (SELECT AVG(amount_in_cents) FROM swaps);`, order: "exact" },
      { prompt: "Calculate sum of amount_in_cents for above-average trades. Single column: above_avg_volume.", code: `SELECT SUM(amount_in_cents) AS above_avg_volume\nFROM swaps\nWHERE amount_in_cents > (SELECT AVG(amount_in_cents) FROM swaps);`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Chainlink",
    title: "Feed price spread vs mean",
    scenario: "Comparing token prices against average feed value.",
    steps: [
      { prompt: "List pair, price_cents, (price_cents - (SELECT AVG(price_cents) FROM oracles)) AS diff_from_mean FROM oracles ORDER BY price_cents DESC;", code: `SELECT pair, price_cents, (price_cents - (SELECT AVG(price_cents) FROM oracles)) AS diff_from_mean\nFROM oracles\nORDER BY price_cents DESC;`, order: "exact" },
      { prompt: "Calculate average oracle price in cents. Single column: overall_avg_price.", code: `SELECT ROUND(AVG(price_cents), 2) AS overall_avg_price\nFROM oracles;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Uniswap",
    title: "Swap slippage percentiles",
    scenario: "Evaluating trading execution quality using percentile ranks.",
    steps: [
      { prompt: "Assign PERCENT_RANK to swap slippage: swap_id, slippage_bps, ROUND(PERCENT_RANK() OVER (ORDER BY slippage_bps ASC), 3) AS slip_pct_rank FROM swaps ORDER BY slip_pct_rank DESC, swap_id ASC;", code: `SELECT swap_id, slippage_bps, ROUND(PERCENT_RANK() OVER (ORDER BY slippage_bps ASC), 3) AS slip_pct_rank\nFROM swaps\nORDER BY slip_pct_rank DESC, swap_id ASC;`, order: "exact" },
      { prompt: "Count swaps with slip_pct_rank >= 0.8: Single column: top_quintile_slippage_swaps.", code: `SELECT COUNT(*) AS top_quintile_slippage_swaps\nFROM (SELECT PERCENT_RANK() OVER (ORDER BY slippage_bps ASC) AS r FROM swaps)\nWHERE r >= 0.8;`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "Aave",
    title: "Liquidation protocol yield",
    scenario: "Determining liquidator profitability per protocol.",
    steps: [
      { prompt: "Sum debt and bonuses by protocol: protocol_id, SUM(debt_cents) AS total_debt, SUM(bonus_cents) AS total_bonus, ordered by total_bonus DESC.", code: `SELECT protocol_id, SUM(debt_cents) AS total_debt, SUM(bonus_cents) AS total_bonus\nFROM liquidations\nGROUP BY protocol_id\nORDER BY total_bonus DESC;`, order: "exact" },
      { prompt: "Calculate overall bonus yield percentage: ROUND(100.0 * SUM(bonus_cents) / SUM(debt_cents), 2) AS yield_pct FROM liquidations.", code: `SELECT ROUND(100.0 * SUM(bonus_cents) / SUM(debt_cents), 2) AS yield_pct\nFROM liquidations;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "Uniswap",
    title: "Executive DeFi health board",
    scenario: "Synthesizing full protocol health metrics across trading and lending worlds.",
    steps: [
      { prompt: "Produce DEX trading summary: COUNT(*) AS total_swaps, SUM(amount_in_cents) AS volume, SUM(fee_cents) AS fees FROM swaps;", code: `SELECT COUNT(*) AS total_swaps, SUM(amount_in_cents) AS volume, SUM(fee_cents) AS fees\nFROM swaps;`, order: "exact" },
      { prompt: "Produce complete DeFi board: (SELECT COUNT(*) FROM protocols) AS protocols, (SELECT COUNT(*) FROM pools) AS pools, (SELECT COUNT(*) FROM swaps) AS swaps, (SELECT COUNT(*) FROM flash_loans) AS flash_loans, (SELECT COUNT(*) FROM liquidations) AS liquidations;", code: `SELECT (SELECT COUNT(*) FROM protocols) AS protocols, (SELECT COUNT(*) FROM pools) AS pools, (SELECT COUNT(*) FROM swaps) AS swaps, (SELECT COUNT(*) FROM flash_loans) AS flash_loans, (SELECT COUNT(*) FROM liquidations) AS liquidations;`, order: "exact" },
    ],
  },
];

