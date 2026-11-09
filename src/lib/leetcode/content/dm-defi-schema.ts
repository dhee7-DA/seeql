// Domain Mastery — pack #10 "DeFi & AMM Analytics" · shared world schema.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these seven tables. Money is INTEGER cents (_cents suffix),
// basis points are INTEGER (1 bps = 0.01%), timestamps are 'YYYY-MM-DD HH:MM:SS'
// or dates 'YYYY-MM-DD' — matching the house conventions across all domain packs.

export const DM_DEFI_SCHEMA = {
  ddl: `CREATE TABLE protocols (
  protocol_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  chain TEXT NOT NULL,
  tvl_cents INTEGER NOT NULL
);

CREATE TABLE pools (
  pool_id INTEGER PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(protocol_id),
  pair TEXT NOT NULL,
  token0 TEXT NOT NULL,
  token1 TEXT NOT NULL,
  fee_tier_bps INTEGER NOT NULL,
  reserve0_cents INTEGER NOT NULL,
  reserve1_cents INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE swaps (
  swap_id INTEGER PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(pool_id),
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  amount_in_cents INTEGER NOT NULL,
  amount_out_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  slippage_bps INTEGER NOT NULL,
  is_mev INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL
);

CREATE TABLE lp_positions (
  position_id INTEGER PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(pool_id),
  owner TEXT NOT NULL,
  lower_tick INTEGER NOT NULL,
  upper_tick INTEGER NOT NULL,
  liquidity_cents INTEGER NOT NULL,
  fees_earned_cents INTEGER NOT NULL,
  impermanent_loss_cents INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE flash_loans (
  loan_id INTEGER PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(protocol_id),
  borrower TEXT NOT NULL,
  asset TEXT NOT NULL,
  principal_cents INTEGER NOT NULL,
  fee_cents INTEGER NOT NULL,
  is_arbitrage INTEGER NOT NULL DEFAULT 1,
  timestamp TEXT NOT NULL
);

CREATE TABLE liquidations (
  liquidation_id INTEGER PRIMARY KEY,
  protocol_id INTEGER NOT NULL REFERENCES protocols(protocol_id),
  borrower TEXT NOT NULL,
  collateral_asset TEXT NOT NULL,
  debt_asset TEXT NOT NULL,
  collateral_cents INTEGER NOT NULL,
  debt_cents INTEGER NOT NULL,
  bonus_cents INTEGER NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE oracles (
  oracle_id INTEGER PRIMARY KEY,
  pair TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  deviation_bps INTEGER NOT NULL,
  heartbeat_sec INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);`,
  tables: [
    { name: "protocols", note: "6 protocols across Ethereum, Arbitrum, and Optimism with total TVL tracking" },
    { name: "pools", note: "10 liquidity pools across 4 fee tiers (1, 5, 30, 100 bps) with reserves and active/paused status" },
    { name: "swaps", note: "30 swap transactions with input/output amounts, slippage in bps, fee capture, and MEV searcher flags" },
    { name: "lp_positions", note: "18 LP positions tracking liquidity staked, tick ranges, fees earned, and impermanent loss" },
    { name: "flash_loans", note: "12 atomic flash loans with zero-fee MakerDAO and 9 bps Aave loans across DEX arbitrage and liquidations" },
    { name: "liquidations", note: "10 collateral liquidation events with debt repaid, collateral seized, and liquidator bonuses" },
    { name: "oracles", note: "6 Chainlink price feeds with heartbeat monitors, deviation thresholds, and timestamp tracking" },
  ],
};
