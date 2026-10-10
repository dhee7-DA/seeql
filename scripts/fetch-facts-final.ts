/**
 * Fetch official LeetCode content (schemas, examples, constraints) for the
 * 37 remaining FREE Database problems — the final gap to complete the catalog.
 * Writes one facts file per authoring band under scripts/.
 * Facts only: table DDL shapes, example rows, constraints. Statements will be
 * paraphrased fresh by the authors (app policy: never scraped prose).
 */
const Q = `query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId title difficulty content
  }
}`;

const BANDS: Record<string, string[]> = {
  "classics": [
    "nth-highest-salary",
    "rising-temperature",
    "find-customer-referee",
    "customer-placing-the-largest-number-of-orders",
    "friend-requests-ii-who-has-the-most-friends",
    "tree-node",
    "biggest-single-number",
    "actors-and-directors-who-cooperated-at-least-three-times",
    "product-price-at-a-given-date",
  ],
  "band-text": [
    "find-valid-emails",
    "find-invalid-ip-addresses",
    "find-products-with-valid-serial-numbers",
    "dna-pattern-recognition",
    "first-letter-capitalization-ii",
    "find-users-with-high-token-usage",
  ],
  "band-org": [
    "analyze-organization-hierarchy",
    "find-consistently-improving-employees",
    "find-overbooked-employees",
    "find-students-who-improved",
    "find-students-with-study-spiral-pattern",
    "find-covid-recovery-patients",
  ],
  "band-commerce": [
    "find-product-recommendation-pairs",
    "seasonal-sales-analysis",
    "find-books-with-no-available-copies",
    "find-stores-with-inventory-imbalance",
    "find-books-with-polarized-opinions",
    "find-loyal-customers",
  ],
  "band-behavior": [
    "odd-and-even-transactions",
    "analyze-subscription-conversion",
    "find-drivers-with-improved-fuel-efficiency",
    "find-golden-hour-customers",
    "find-churn-risk-customers",
  ],
  "band-pairs": [
    "find-category-recommendation-pairs",
    "find-zombie-sessions",
    "most-common-course-pairs",
    "find-emotionally-consistent-users",
    "find-users-with-persistent-behavior-patterns",
  ],
};

function htmlToText(html: string): string {
  return html
    .replace(/<\/td>|<\/th>/gi, " | ")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/table>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const failures: string[] = [];
for (const [band, slugs] of Object.entries(BANDS)) {
  let out = `// Official FACTS (schemas + example rows + constraints) for band "${band}".\n// Source: leetcode.com public GraphQL, fetched ${new Date().toISOString().slice(0, 10)}.\n// Use ONLY the factual data (table shapes, example rows, ordering rules).\n// Statements/blurbs must be written as ORIGINAL PARAPHRASES (app policy).\n\n`;
  for (const slug of slugs) {
    const res = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: `https://leetcode.com/problems/${slug}/` },
      body: JSON.stringify({ query: Q, variables: { titleSlug: slug } }),
    });
    const j: any = await res.json();
    const qd = j?.data?.question;
    if (!qd || !qd.content) {
      failures.push(`${band}/${slug}`);
      out += `##### ${slug} — FETCH FAILED\n\n`;
      continue;
    }
    out += `##### ${qd.questionFrontendId} ${slug} [${qd.difficulty}]\n`;
    out += htmlToText(qd.content) + "\n\n";
    console.log(`OK ${qd.questionFrontendId} ${slug} [${qd.difficulty}] ${qd.content.length} chars`);
  }
  await Bun.write(`scripts/facts-sql-final-${band}.txt`, out);
}
console.log(failures.length ? `FAILURES: ${failures.join(", ")}` : "ALL FETCHED");
