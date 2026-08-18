/**
 * Downloads disposable_email_blocklist.conf and writes JSON for the client checker.
 * Source: https://github.com/disposable-email-domains/disposable-email-domains
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src/lib/auth/data");
const outFile = path.join(outDir, "disposable_email_blocklist.json");

const res = await fetch(SOURCE_URL);
if (!res.ok) {
  throw new Error(`Failed to download blocklist: ${res.status} ${res.statusText}`);
}

const domains = [
  ...new Set(
    (await res.text())
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line && !line.startsWith("#")),
  ),
].sort();

if (domains.length < 100) {
  throw new Error(`Blocklist too small (${domains.length}); aborting`);
}

await mkdir(outDir, { recursive: true });
await writeFile(outFile, `${JSON.stringify(domains, null, 2)}\n`, "utf8");
console.log(`Wrote ${domains.length} domains to ${path.relative(root, outFile)}`);
