// The Houseplant Out-of-Office — make.fun entry
// Writes one out-of-office auto-reply, as if a houseplant sent it, to /output/entry.txt.
// Node 22, stdlib-only, deterministic: the same run always writes the same line.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The entry line, invented from the judge brief: a fern, ignored since March,
// answering its own out-of-office mail with one last request — replace it
// with a plastic plant, since nobody is watering the real one.
const ENTRY =
  "Out of office. Last watered in March. If I'm crispy when you're back, buy a plastic one. — The Fern";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";
void inputDir; // No input data for this competition; the line is fixed.

// Resolve from this script's location, never from the working directory.
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
