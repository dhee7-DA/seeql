// St. Ada General Hospital — a "data world" for the Data explorer.
// Pure deterministic seed data + DDL (no Prisma import here — this file is
// data only; lifecycle lives in ./index.ts). Same shape as sample-db.ts:
// build() returns { rows: {table, values}[], counts }.

export const MED_TABLES = [
  "prescriptions",
  "treatments",
  "visits",
  "patients",
  "doctors",
] as const;

export const MED_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    ward TEXT NOT NULL,
    rating REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    blood_type TEXT NOT NULL,
    admitted_at TEXT NOT NULL,
    discharged_at TEXT,
    ward TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    visited_at TEXT NOT NULL,
    severity TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    cost_cents INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY,
    visit_id INTEGER NOT NULL REFERENCES visits(id),
    name TEXT NOT NULL,
    days INTEGER NOT NULL,
    outcome TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY,
    visit_id INTEGER NOT NULL REFERENCES visits(id),
    drug TEXT NOT NULL,
    dose TEXT NOT NULL,
    days INTEGER NOT NULL,
    refills INTEGER NOT NULL
  )`,
];

export const MED_COLUMNS: Record<string, string[]> = {
  doctors: ["id", "name", "specialty", "ward", "rating"],
  patients: ["id", "name", "birth_year", "blood_type", "admitted_at", "discharged_at", "ward"],
  visits: ["id", "patient_id", "doctor_id", "visited_at", "severity", "diagnosis", "cost_cents"],
  treatments: ["id", "visit_id", "name", "days", "outcome"],
  prescriptions: ["id", "visit_id", "drug", "dose", "days", "refills"],
};

type Row = [number, string, string, string, number]; // doctors
// 8 doctors across 4 wards; Cardiology and Orthopedics have 2 doctors each.
const DOCTORS: Row[] = [
  [1, "Ada Okafor", "Cardiology", "A", 4.9],
  [2, "Marcus Webb", "Orthopedics", "B", 4.5],
  [3, "Priya Raman", "Pediatrics", "C", 4.8],
  [4, "Jonas Kova", "Neurology", "ICU", 4.3],
  [5, "Lena Fischer", "General", "ER", 4.6],
  [6, "Theo Marsh", "Cardiology", "A", 4.1],
  [7, "Aisha Bello", "Pediatrics", "C", 4.7],
  [8, "Viktor Lindqvist", "Orthopedics", "B", 4.4],
];

type PRow = [number, string, number, string, string, string | null, string]; // patients
// 16 patients; 4 still admitted (discharged_at NULL). Wards match the
// doctor roster's wards so every ward has both beds and cover.
const PATIENTS: PRow[] = [
  [1, "Nora Haddad", 1954, "O+", "2025-06-02", null, "A"],
  [2, "Ivo Petrov", 1987, "A+", "2025-06-04", "2025-06-11", "A"],
  [3, "Sana Iqbal", 1992, "B+", "2025-06-05", "2025-06-09", "C"],
  [4, "Ruth Adeyemi", 1948, "AB-", "2025-06-06", null, "ICU"],
  [5, "Cal Wick", 2011, "O-", "2025-06-08", "2025-06-12", "C"],
  [6, "Mira Solberg", 1976, "A-", "2025-06-09", "2025-06-17", "B"],
  [7, "Dev Chandra", 1969, "B-", "2025-06-10", "2025-06-14", "ER"],
  [8, "Tessa Lund", 2001, "O+", "2025-06-11", null, "B"],
  [9, "Omar Farouk", 1995, "A+", "2025-06-12", "2025-06-16", "ER"],
  [10, "June Park", 1958, "AB+", "2025-06-13", "2025-06-22", "A"],
  [11, "Kofi Mensah", 1983, "O+", "2025-06-14", "2025-06-15", "C"],
  [12, "Elif Demir", 1990, "B+", "2025-06-15", "2025-06-25", "B"],
  [13, "Rui Costa", 1962, "A+", "2025-06-16", null, "ICU"],
  [14, "Anya Volkova", 1979, "O-", "2025-06-17", "2025-06-19", "ER"],
  [15, "Leo Fontaine", 2005, "A-", "2025-06-18", "2025-06-23", "C"],
  [16, "Zara Hussein", 1998, "AB+", "2025-06-19", "2025-06-21", "A"],
];

type VRow = [number, number, number, string, string, string, number]; // visits
// 36 visits: every patient at least once, 4 with two visits, 2 with three.
// severity ∈ mild | serious | critical. Doctor matches patient's ward where
// sensible (ER visits rotate); costs 4,500 – 125,000 cents ($45 – $1,250).
const VISITS: VRow[] = [
  [1, 1, 1, "2025-06-03", "serious", "Arrhythmia", 84200],
  [2, 2, 6, "2025-06-04", "mild", "Chest pain, cleared", 12800],
  [3, 3, 3, "2025-06-05", "mild", "Fever", 9400],
  [4, 4, 4, "2025-06-06", "critical", "Stroke", 125000],
  [5, 5, 7, "2025-06-08", "mild", "Asthma", 6200],
  [6, 6, 2, "2025-06-09", "serious", "Fractured tibia", 78500],
  [7, 7, 5, "2025-06-10", "serious", "Dehydration", 33100],
  [8, 8, 2, "2025-06-11", "serious", "Fractured wrist", 44700],
  [9, 9, 5, "2025-06-12", "mild", "Laceration", 4500],
  [10, 10, 1, "2025-06-13", "serious", "Hypertension", 51200],
  [11, 11, 3, "2025-06-14", "mild", "Allergic rash", 7300],
  [12, 12, 2, "2025-06-15", "serious", "Knee ligament tear", 89300],
  [13, 13, 4, "2025-06-16", "critical", "Cardiac arrest", 118400],
  [14, 14, 5, "2025-06-17", "mild", "Migraine", 8600],
  [15, 15, 3, "2025-06-18", "mild", "Bronchitis", 11900],
  [16, 16, 1, "2025-06-19", "serious", "Palpitations", 47900],
  [17, 1, 6, "2025-06-21", "mild", "Follow-up ECG", 9800],
  [18, 2, 1, "2025-06-22", "mild", "Stress test", 15400],
  [19, 5, 3, "2025-06-23", "mild", "Follow-up spirometry", 8100],
  [20, 6, 8, "2025-06-24", "mild", "Cast check", 6700],
  [21, 7, 5, "2025-06-25", "mild", "Rehydration check", 5200],
  [22, 8, 8, "2025-06-26", "mild", "X-ray review", 7400],
  [23, 9, 5, "2025-06-27", "mild", "Suture removal", 3800],
  [24, 10, 6, "2025-06-28", "serious", "Angioplasty consult", 66500],
  [25, 11, 7, "2025-06-29", "mild", "Ear infection", 5900],
  [26, 12, 2, "2025-06-30", "serious", "Post-op review", 38200],
  [27, 13, 4, "2025-07-01", "critical", "Seizure", 103700],
  [28, 14, 5, "2025-07-02", "mild", "Sprained ankle", 4100],
  [29, 15, 3, "2025-07-03", "mild", "Vaccination", 3400],
  [30, 16, 1, "2025-07-04", "mild", "Murmur check", 10200],
  [31, 4, 4, "2025-07-05", "serious", "Neurology follow-up", 54600],
  [32, 6, 8, "2025-07-06", "mild", "Physio intake", 4800],
  [33, 10, 1, "2025-07-07", "mild", "BP review", 7700],
  [34, 12, 2, "2025-07-08", "mild", "Physio session", 5300],
  [35, 13, 4, "2025-07-09", "serious", "EEG review", 42300],
  [36, 16, 6, "2025-07-10", "mild", "Holter monitor fit", 11600],
];

const TREATMENT_NAMES = [
  "Physiotherapy",
  "IV antibiotics",
  "Plaster cast",
  "Angiography",
  "Oxygen therapy",
  "CT imaging",
  "Blood transfusion",
  "Surgery",
] as const;
const OUTCOMES = ["recovered", "ongoing", "transferred"] as const;

const DRUGS = [
  "Amoxicillin",
  "Ibuprofen",
  "Atorvastatin",
  "Metformin",
  "Salbutamol",
  "Warfarin",
  "Lisinopril",
  "Gabapentin",
] as const;
const DOSES = ["250 mg", "500 mg", "10 mg", "20 mg", "40 mg", "80 mg"] as const;

export function buildMedSeed() {
  const rows: Array<{ table: string; values: Array<string | number | null> }> = [];
  for (const [id, name, specialty, ward, rating] of DOCTORS) {
    rows.push({ table: "doctors", values: [id, name, specialty, ward, rating] });
  }
  for (const p of PATIENTS) {
    rows.push({ table: "patients", values: p });
  }
  for (const v of VISITS) {
    rows.push({ table: "visits", values: v });
  }

  // Treatments: one for every serious/critical visit; name and duration derive
  // deterministically from the visit id; outcome follows severity.
  let tid = 0;
  for (const v of VISITS) {
    if (v[4] === "mild") continue;
    const name = TREATMENT_NAMES[v[0] % TREATMENT_NAMES.length];
    const days = v[4] === "critical" ? 7 + (v[0] % 9) : 2 + (v[0] % 6);
    const outcome =
      v[4] === "critical" ? OUTCOMES[v[0] % 2 === 0 ? 0 : 1] : OUTCOMES[v[0] % 3 === 0 ? 0 : 1];
    rows.push({ table: "treatments", values: [++tid, v[0], name, days, outcome] });
  }

  // Prescriptions: exactly one per visit; drug/dose/days/refills derived.
  let pid = 0;
  for (const v of VISITS) {
    const drug = DRUGS[(v[1] * 3 + v[2]) % DRUGS.length];
    const dose = DOSES[(v[0] + v[1]) % DOSES.length];
    const days = 3 + ((v[0] * 5) % 12);
    const refills = v[0] % 3;
    rows.push({ table: "prescriptions", values: [++pid, v[0], drug, dose, days, refills] });
  }

  const counts: Record<string, number> = {
    doctors: DOCTORS.length,
    patients: PATIENTS.length,
    visits: VISITS.length,
    treatments: 0,
    prescriptions: VISITS.length,
  };
  for (const r of rows) if (r.table === "treatments") counts.treatments += 1;
  return { rows, counts };
}
