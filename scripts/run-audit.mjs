/* Runner: executes audit-content.ts with @/* alias resolved. */
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, { alias: { "@": new URL("../src/", import.meta.url).pathname } });
await jiti.import("./audit-content.ts");
