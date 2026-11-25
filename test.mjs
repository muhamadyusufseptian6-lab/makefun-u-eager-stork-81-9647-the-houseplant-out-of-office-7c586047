// TDD-lite test for the Houseplant Out-of-Office entry (kit: program/v1, node22).
// Checks: gate (1-120 chars, UTF-8, not whitespace-only), determinism, stdlib-only.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const main = join(dir, "main.ts");

function runOnce(outDir) {
  execFileSync(process.execPath, [main], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir, MAKEFUN_INPUT_DIR: "/input" },
    encoding: "utf8",
  });
  return readFileSync(join(outDir, "entry.txt"), "utf8");
}

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

// 1. Gate: 1-120 chars, not whitespace-only, valid UTF-8 (read as utf8 throws on bad bytes in strict mode via TextDecoder below).
const out1 = mkdtempSync(join(tmpdir(), "houseplant-1-"));
const text = runOnce(out1);
check("gate length 1-120", text.length >= 1 && text.length <= 120, `${text.length} chars`);
check("gate not whitespace-only", text.trim().length > 0);
check("gate valid UTF-8", new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(text, "utf8")) === text);
check("entry is one line (no newline inside)", !text.trim().includes("\n"));

// 2. Determinism: same input -> same output.
const out2 = mkdtempSync(join(tmpdir(), "houseplant-2-"));
const text2 = runOnce(out2);
check("deterministic output", text === text2);

// 3. Stdlib-only: main.ts imports only node: builtins.
const src = readFileSync(main, "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check("stdlib-only imports", imports.every((i) => i.startsWith("node:")), imports.join(", "));

rmSync(out1, { recursive: true, force: true });
rmSync(out2, { recursive: true, force: true });

if (failures > 0) {
  console.error(`${failures} test(s) failed`);
  process.exit(1);
}
console.log("All tests passed.");
