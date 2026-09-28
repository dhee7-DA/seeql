/* eslint-disable @typescript-eslint/no-require-imports -- standalone CJS probe script; require() is intentional */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const tabs = await p.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`);
  for (const t of tabs) {
    const n = t.name;
    const cols = await p.$queryRawUnsafe(`PRAGMA table_info(${n})`);
    const cnt = await p.$queryRawUnsafe(`SELECT COUNT(*) AS c FROM ${n}`);
    console.log(`\n== ${n} (${cnt[0].c} rows) ==`);
    console.log(cols.map(c => `${c.name}:${c.type}`).join(", "));
  }
  await p.$disconnect();
})();
