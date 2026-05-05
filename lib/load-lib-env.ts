import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Loads optional `lib/.env` into `process.env` without overriding keys that are
 * already set (same behavior as dotenv). Next.js only auto-loads `.env*` at the
 * project root, so credentials kept under `lib/` would otherwise be invisible.
 */
export function loadLibEnv(): void {
  const envPath = join(process.cwd(), "lib", ".env");
  if (!existsSync(envPath)) return;

  const input = readFileSync(envPath, "utf8");
  for (const rawLine of input.split("\n")) {
    const line = rawLine.replace(/\r$/, "").trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (key in process.env) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
