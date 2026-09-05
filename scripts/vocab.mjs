/**
 * The controlled-vocabulary check — `npm run vocab`.
 *
 * ⚠️ THIS IS A REGULATORY CONSTRAINT, NOT A TONE PREFERENCE. `docs/decisions.md`
 * ("Claim language is a REGULATORY constraint") records why: under EU cosmetic-
 * claims rules an absolute claim needs substantiating, and absolute claims about
 * what a product does to skin are the language that pushes a beauty app toward
 * MEDICAL-DEVICE territory. The product brief states the same rule from the
 * other direction and ships the list below.
 *
 * The analysis screens add more product-effect copy than the rest of the app
 * combined, and the whole point of keeping that copy in
 * `features/my-skin/analysis.ts` rather than in the components is that one file
 * can be checked. This is the check. It runs over every user-facing string in
 * `features/`, `components/` and `app/`, so it also covers the copy that was
 * already there.
 *
 * ⚠️ IT READS COPY, NOT COMMENTARY. Comments are stripped before matching, and
 * that is not a loophole — it is the only way the rule can be WRITTEN DOWN.
 * Every file that explains the vocabulary has to quote the forbidden half to be
 * useful, and a checker that fails on its own documentation teaches people to
 * delete the documentation. User-facing copy lives in string literals and JSX
 * text; that is what is checked.
 *
 * ⚠️ OTHERWISE IT IS DELIBERATELY DUMB. A phrase on this list is one nobody
 * should be typing on purpose, so there is no judgement here to be argued with.
 * If a real string trips it, the fix is to rephrase the string.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["features", "components", "app", "lib"];
const EXT = /\.(tsx?|css)$/;

/**
 * The brief's "Avoid" list, plus the two rules stated as prose in the same
 * section. Each entry is [pattern, what to say instead].
 */
const FORBIDDEN = [
  [/\bcaused your reaction\b/i, "associated with this reaction"],
  [/\bthis caused\b/i, "associated with this reaction"],
  [/\ballergy diagnosis\b/i, "LUX does not diagnose — say what the pattern fits"],
  [/\btoxic ingredient\b/i, "name the ingredient and what it may do"],
  [/\bdangerous product\b/i, "name the ingredient and what it may do"],
  [/\bsafe for you\b/i, "used without problems"],
  [/\bguaranteed result\b/i, "no guarantees — say what may change"],
  [/\bhighest[- ]risk product\b/i, "investigation priority"],
  [/\bingredients? clashed\b/i, "may have increased irritation in the same period"],
  [/\bproven cause\b/i, "possible contributor"],
  [/\bwill clear\b/i, "may improve — never promise an outcome"],
  [/\bcures?\b/i, "LUX is not a treatment"],
];

/**
 * Blank out comments so the rule can be quoted where it is explained.
 *
 * Block comments go first, then whole-line `//` and ` * ` continuations — a
 * trailing `//` is NOT stripped, so the `https://` inside a string literal
 * survives and so does any copy sitting beside it.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => (/^\s*(\/\/|\*)/.test(line) ? "" : line))
    .join("\n");
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.test(entry)) yield full;
  }
}

const findings = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(process.cwd(), file);
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      for (const [pattern, instead] of FORBIDDEN) {
        const m = line.match(pattern);
        if (m) findings.push({ rel, line: i + 1, text: line.trim(), found: m[0], instead });
      }
    });
  }
}

if (findings.length === 0) {
  console.log("vocab: clean — no forbidden claim language in user-facing copy.");
  process.exit(0);
}

for (const f of findings) {
  console.error(`${f.rel}:${f.line}  "${f.found}" — say instead: ${f.instead}`);
  console.error(`    ${f.text}`);
}
console.error(`\nvocab: ${findings.length} forbidden phrase(s). See docs/product-brief.md § "UX vocabulary".`);
process.exit(1);
