// Northland Football League — a "data world" for the Data explorer.
// Pure deterministic seed data + DDL. Highlights: a self-join story
// (matches.home_team_id / away_team_id → teams) and a natural anti-join
// (players who never scored).

export const SPORT_TABLES = ["goals", "matches", "players", "teams"] as const;

export const SPORT_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    founded INTEGER NOT NULL,
    stadium TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    squad_number INTEGER NOT NULL,
    signed_on TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,
    played_on TEXT NOT NULL,
    stage TEXT NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    home_goals INTEGER NOT NULL,
    away_goals INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    player_id INTEGER NOT NULL REFERENCES players(id),
    minute INTEGER NOT NULL,
    penalty INTEGER NOT NULL DEFAULT 0
  )`,
];

export const SPORT_COLUMNS: Record<string, string[]> = {
  teams: ["id", "name", "city", "founded", "stadium"],
  players: ["id", "team_id", "name", "position", "squad_number", "signed_on"],
  matches: ["id", "played_on", "stage", "home_team_id", "away_team_id", "home_goals", "away_goals"],
  goals: ["id", "match_id", "player_id", "minute", "penalty"],
};

type TRow = [number, string, string, number, string];
const TEAMS: TRow[] = [
  [1, "Ashford United", "Ashford", 1891, "Millbank Park"],
  [2, "Boreham Wanderers", "Boreham", 1876, "The Hollow"],
  [3, "Carlisle Rovers", "Carlisle", 1902, "Edgemount"],
  [4, "Dunmoor City", "Dunmoor", 1888, "Citadel Field"],
  [5, "Eastwick Athletic", "Eastwick", 1921, "Harborside"],
  [6, "Fallowdale Town", "Fallowdale", 1899, "The Dales"],
  [7, "Greystone FC", "Greystone", 1869, "Quarry Road"],
  [8, "Havenport Queens", "Havenport", 1905, "Quayside Arena"],
  [9, "Ironbridge FC", "Ironbridge", 1913, "The Foundry"],
  [10, "Jedburgh Rangers", "Jedburgh", 1884, "Mooreland"],
];

// 4 players per team (GK 1, DF 5, MF 8, FW 9). Names by slot so the
// goal-scorer distribution below can favour FW/MF deterministically.
const FIRST = ["Ben", "Karl", "Sven", "Diego", "Milan", "Ravi", "Tomas", "Yusuf", "Andre", "Nils"];
const LAST = [
  "Ashcroft", "Bergström", "Cavalli", "Duval", "Eriksen",
  "Fontaine", "Gallagher", "Hoffmann", "Ibrahim", "Jansen",
];
const POSITIONS = ["GK", "DF", "MF", "FW"] as const;

type MRow = [number, string, string, number, number, number, number];
// 24 matches: 4 league rounds (round-robin pairs 1v2/3v4/... with reverses)
// played on August weekends 2025, plus 4 cup ties midweek. Scores planted to
// give: a 4-0 highlight, two draws, one 3-2 thriller, mostly low scores.
const MATCHES: MRow[] = [
  [1, "2025-08-09", "league", 1, 2, 2, 1],
  [2, "2025-08-09", "league", 3, 4, 0, 0],
  [3, "2025-08-09", "league", 5, 6, 1, 3],
  [4, "2025-08-09", "league", 7, 8, 4, 0],
  [5, "2025-08-09", "league", 9, 10, 1, 1],
  [6, "2025-08-16", "league", 2, 1, 0, 2],
  [7, "2025-08-16", "league", 4, 3, 2, 2],
  [8, "2025-08-16", "league", 6, 5, 1, 0],
  [9, "2025-08-16", "league", 8, 7, 1, 2],
  [10, "2025-08-16", "league", 10, 9, 3, 1],
  [11, "2025-08-23", "league", 1, 3, 1, 1],
  [12, "2025-08-23", "league", 2, 4, 0, 1],
  [13, "2025-08-23", "league", 5, 7, 2, 1],
  [14, "2025-08-23", "league", 6, 8, 0, 2],
  [15, "2025-08-23", "league", 9, 10, 2, 0],
  [16, "2025-08-30", "league", 3, 1, 2, 3],
  [17, "2025-08-30", "league", 4, 2, 1, 0],
  [18, "2025-08-30", "league", 7, 5, 0, 0],
  [19, "2025-08-30", "league", 8, 6, 2, 1],
  [20, "2025-08-30", "league", 10, 9, 1, 2],
  [21, "2025-09-03", "cup", 1, 10, 3, 2],
  [22, "2025-09-03", "cup", 4, 5, 2, 0],
  [23, "2025-09-04", "cup", 7, 9, 1, 1],
  [24, "2025-09-04", "cup", 2, 6, 0, 1],
];

export function buildSportSeed() {
  const rows: Array<{ table: string; values: Array<string | number | null> }> = [];
  for (const t of TEAMS) rows.push({ table: "teams", values: t });

  let pid = 0;
  for (const [teamId] of TEAMS) {
    for (let slot = 0; slot < 4; slot++) {
      const idx = (teamId - 1) * 4 + slot;
      const name = `${FIRST[idx % FIRST.length]} ${LAST[(idx * 3 + teamId) % LAST.length]}`;
      const squad = POSITIONS[slot] === "GK" ? 1 : POSITIONS[slot] === "DF" ? 5 : POSITIONS[slot] === "MF" ? 8 : 9;
      const signed = `20${19 + ((teamId + slot) % 7)}-0${1 + ((teamId + slot) % 8)}-1${(teamId + slot) % 10}`;
      rows.push({
        table: "players",
        values: [++pid, teamId, name, POSITIONS[slot], squad, signed],
      });
    }
  }
  // players 1..40; team T's players are ids (T-1)*4+1 .. T*4.
  const teamPlayers = (teamId: number) => [(teamId - 1) * 4 + 1, (teamId - 1) * 4 + 2, (teamId - 1) * 4 + 3, (teamId - 1) * 4 + 4];

  for (const m of MATCHES) rows.push({ table: "matches", values: m });

  // Goals: distribute each match's goals to scoring-position players of the
  // scoring team (FW first, then MF, then DF — never the GK). Deterministic.
  let gid = 0;
  const scored = new Set<number>(); // player ids with ≥1 goal
  for (const m of MATCHES) {
    const entries: Array<[number, number]> = [
      ...Array.from({ length: m[5] }, () => [m[3], 0] as [number, number]), // home goals
      ...Array.from({ length: m[6] }, () => [m[4], 1] as [number, number]), // away goals
    ];
    for (const [teamId, side] of entries) {
      const [gk, df, mf, fw] = teamPlayers(teamId);
      const pick = (gid + m[0] + side) % 10; // 0-4 FW, 5-7 MF, 8-9 DF
      const playerId = pick < 5 ? fw : pick < 8 ? mf : df;
      void gk;
      const minute = ((gid * 13 + m[0] * 7 + pick * 11) % 89) + 1;
      const penalty = (gid + pick) % 8 === 3 ? 1 : 0;
      rows.push({ table: "goals", values: [++gid, m[0], playerId, minute, penalty] });
      scored.add(playerId);
    }
  }

  const counts: Record<string, number> = {
    teams: TEAMS.length,
    players: 40,
    matches: MATCHES.length,
    goals: 0,
  };
  for (const r of rows) if (r.table === "goals") counts.goals += 1;
  void scored;
  return { rows, counts };
}
