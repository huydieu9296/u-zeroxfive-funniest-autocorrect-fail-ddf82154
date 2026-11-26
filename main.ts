import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// One line, under 200 characters: a funny autocorrect fail.
const ENTRY =
  "I texted my boss 'I love you' instead of 'I will see you' \u2014 autocorrect just promoted me to HR's most awkward meeting of the year.";

const HERE = dirname(fileURLToPath(import.meta.url));

// The entry text is also kept in entry.txt next to this script. When that
// file is present it must agree with the embedded entry; when it is absent
// (for example a harness that copies only main.ts) the embedded text is used.
function entryFromFile(): string | null {
  const entryPath = join(HERE, "entry.txt");
  if (!existsSync(entryPath)) return null;
  const fromFile = readFileSync(entryPath, "utf8").trim();
  return fromFile.length > 0 ? fromFile : null;
}

function validateEntry(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${text.length}`);
  }
  if (text.includes("\n")) {
    throw new Error("entry must be exactly one line");
  }
  const stops = (text.match(/\./g) ?? []).length;
  if (stops !== 1) {
    throw new Error(`entry must be exactly one sentence, found ${stops} periods`);
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end with a period");
  }
  if (!text.includes("'I love you'")) {
    throw new Error("entry must keep the autocorrected phrase");
  }
}

const fromFile = entryFromFile();
if (fromFile !== null && fromFile !== ENTRY) {
  throw new Error("entry.txt does not match the entry embedded in main.ts");
}

const TEXT = ENTRY;
validateEntry(TEXT);

// A short preview on stdout so a run can be eyeballed without opening the file.
console.log(`entry (${TEXT.length} chars): ${TEXT}`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), TEXT, "utf8");
console.log(`wrote ${TEXT.length} characters to ${join(outDir, "entry.txt")}`);
