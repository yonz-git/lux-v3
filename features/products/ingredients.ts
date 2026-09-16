/**
 * What each ingredient on an INCI list IS — the glossary behind the ingredient
 * names that explain themselves (`IngredientTerms`).
 *
 * ⚠️ NOT `lib/actives.ts`, AND IT MUST NOT BECOME IT. That module is what the
 * app REASONS about: six actives, the INCI patterns that find them and the
 * pairs that conflict, read by CHECK's score and the analysis's subtraction.
 * This is what the app EXPLAINS: a line for any name a reader might tap,
 * read by nothing but a tooltip. No score and no hypothesis may ever read it —
 * a sentence written to tell someone what glycerin is has no business behind a
 * compatibility number or a causal claim.
 *
 * ⚠️ IT LIVES IN PRODUCTS BECAUSE ONE COMPONENT READS IT. CHECK reaches it only
 * through `ProductDetails`, and sections may import each other. It moves to
 * `lib/` the day a second section imports it directly, not before.
 *
 * ⚠️ HAND-WRITTEN, AND NOT A CITABLE AUTHORITY — the same standing as
 * `ACTIVES[id].concern`. The entries were drafted and then adversarially
 * fact-checked (16 Sep 2026), their roles use CosIng's function vocabulary in
 * plain words, and every line is kept to what is well established; but CosIng
 * itself — the European Commission's cosmetic ingredient database — is still
 * wired nowhere in the build. See "The ingredient data" in `docs/decisions.md`.
 *
 * ⚠️ THE COPY IS UNDER THE CLAIM-LANGUAGE RULE, AND `npm run vocab` READS THIS
 * FILE. A line says what an ingredient IS and what it does in a formula, hedged
 * where it touches skin ("helps", "can"). It never says safe, gentle, toxic or
 * irritant, never promises an outcome, and never contradicts
 * `ACTIVES[id].concern` for the six actives that module names.
 */

/** What the ingredient mainly does in a formula — CosIng's functions, plainly. */
export type IngredientRole =
  | "Solvent"
  | "Humectant"
  | "Emollient"
  | "Emulsifier"
  | "Cleansing agent"
  | "Preservative"
  | "Chelating agent"
  | "pH adjuster"
  | "Thickener"
  | "Antioxidant"
  | "Skin conditioning"
  | "Barrier lipid"
  | "UV filter"
  | "Fragrance"
  | "Film former"
  | "Exfoliant"
  | "Soothing agent"
  | "Cooling agent"
  | "Colourant"
  | "Absorbent"
  | "Opacifier"
  | "Stabiliser";

export type IngredientNote = {
  role: IngredientRole;
  /** one or two plain sentences, at most 120 characters */
  about: string;
};

type Entry = IngredientNote & {
  /** the INCI name as a label usually prints it */
  name: string;
  /** every normalised spelling that means THIS substance — see `normalise` */
  aliases: string[];
};

/**
 * An INCI list as its separate names, in order, each as the label prints it.
 *
 * ⚠️ A COMMA SEPARATES TWO NAMES ONLY OUTSIDE BRACKETS, AND NOT BETWEEN DIGITS.
 *   - Inside a bracket it is the name's own. Open Beauty Facts lists like
 *     `CI 77891 (Titanium Dioxide, Mica)` are common, and a plain split cuts
 *     one ingredient into two nonsense halves.
 *   - Between two digits it is a locant or a decimal comma — `1,2-Hexanediol`,
 *     `Diethylhexyl 2,6-Naphthalate`, `Salicylic Acid 0,5%`. Splitting there put
 *     `1, 2-Hexanediol` on screen, a name no label prints, and no lookup could
 *     ever reach it.
 *   - ⚠️ A BRACKET THAT NEVER CLOSES IS TEXT, NOT A GROUP. A stray `[` or an OCR
 *     misread (`(PARFUMI.`) used to swallow every comma after it, so the rest
 *     of the list lost its notes. Brackets are paired first — `(` with `)`,
 *     `[` with `]` — and only a paired one holds its commas.
 */
export function splitInci(list: string): string[] {
  const chars = [...list];

  const paired = new Set<number>();
  const opened: number[] = [];
  chars.forEach((ch, i) => {
    if (ch === "(" || ch === "[") {
      opened.push(i);
    } else if (ch === ")" || ch === "]") {
      const at = opened.at(-1);
      if (at !== undefined && chars[at] === (ch === ")" ? "(" : "[")) {
        opened.pop();
        paired.add(at);
        paired.add(i);
      }
    }
  });

  const names: string[] = [];
  let depth = 0;
  let start = 0;
  chars.forEach((ch, i) => {
    if (paired.has(i)) {
      depth += ch === "(" || ch === "[" ? 1 : -1;
    } else if (ch === "," && depth === 0 && !(isDigit(chars[i - 1]) && isDigit(chars[i + 1]))) {
      names.push(chars.slice(start, i).join(""));
      start = i + 1;
    }
  });
  names.push(chars.slice(start).join(""));
  return names.map((n) => n.trim()).filter(Boolean);
}

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= "0" && ch <= "9";
}

/**
 * A label's own lead-in on the first name — `Ingredients:`,
 * `INGREDIENTS / SASTOJCI:`, a `G2047548 - ` batch code — split off the name
 * after it. Both halves stay on screen; only the name is looked up and shown
 * in the panel.
 *
 * The batch code needs ` - ` after its digits, so a colour index that LEADS a
 * name (`77891 Titanium Dioxide`) is left alone; the lead-in word allows 40
 * characters before its colon, so it cannot run on into a real name.
 */
export function splitLeadIn(name: string): { leadIn: string; name: string } {
  const leadIn = name.match(LEAD_IN)?.[0] ?? "";
  const rest = name.slice(leadIn.length);
  return rest.trim() ? { leadIn, name: rest } : { leadIn: "", name };
}

const LEAD_IN = /^\s*(?:[a-z]{0,2}\d{5,}\s+-\s+)?(?:ingr[eé]dient[es]?s?\b[^:,]{0,40}:\s*)?/i;

/**
 * The explanation for one name off a label, if the glossary has one.
 *
 * The whole name first, always. Then, only for text that reads as ONE name —
 * `looksLikeList` — three fallbacks, first hit wins:
 *   1. the name without its brackets (`Butyrospermum Parkii (Shea) Butter`);
 *   2. the sides of a slash, but ONLY when every side names the same entry
 *      (`Aqua/Water/Eau`);
 *   3. what is inside a bracket, but only when the name outside it is at most
 *      three words (`CI 77891 (Titanium Dioxide)`).
 *
 * ⚠️ EACH FALLBACK USED TO BE UNCONDITIONAL, AND EACH ONE LIED.
 *   - In INCI a slash also means "a copolymer of" — `Dimethicone/Vinyl
 *     Dimethicone Crosspolymer`, `Castor Oil/IPDI Copolymer` — or a blend, or
 *     `Glyceryl Caprylate/Caprate`. Any side that matched explained the whole,
 *     so an elastomer powder read as Dimethicone's line. A slashed name the
 *     glossary does not know now gets NO note, which beats a borrowed one.
 *   - A bracket fallback run over text `splitInci` could not split — a list
 *     separated by full stops, dashes or new lines, 950 characters of it on
 *     one live product — made the whole paragraph one dotted button, explained
 *     by the first bracketed word anywhere inside it.
 * Known residue: a short run with no separators at all (`BISABOLOL CETYL
 * ALCOHOL FRAGRANCE (PARFUM)`) is four words outside its bracket and gets no
 * note, but three words and a bracket would still borrow one.
 */
export function noteFor(name: string): IngredientNote | undefined {
  const index = glossaryIndex();
  const find = (key: string) => (key ? index.get(key) : undefined);
  const whole = normalise(name);

  const exact = find(whole);
  const hit =
    exact ??
    (looksLikeList(name)
      ? undefined
      : (find(normalise(withoutBrackets(whole))) ??
        slashSynonym(whole, find) ??
        bracketed(whole, find)));

  return hit && { role: hit.role, about: hit.about };
}

/**
 * Text that is still several names run together, not one — a list the label
 * separated with something other than commas. No glossary name is longer than
 * `LONGEST_NAME`, so the length cap can never hide an exact match.
 */
function looksLikeList(raw: string): boolean {
  if (raw.length > LONGEST_NAME) return true;
  /* read the RAW text: `normalise` folds new lines into spaces */
  if (/[;•\n\r]/.test(raw)) return true;
  /* `Aqua - Glycerin - …` — an INCI hyphen never has spaces round it */
  if (/\s[-–—]\s/.test(raw)) return true;
  if (/\+\s*\/\s*-|may contain|peut contenir/i.test(raw)) return true;
  /* a full stop between words, outside brackets — `Alcohol Denat. (SD
     Alcohol 40-B)` has none, `Cera Alba. Glyceryl Stearate` does */
  return /\.\s+\p{L}/u.test(withoutBrackets(raw));
}

const LONGEST_NAME = 80;

/**
 * The name with its brackets taken out, innermost first — so `a (b (c))` is
 * `a`, not `a )` — and a bracket that never closes cut off where it opens.
 */
function withoutBrackets(s: string): string {
  let text = s;
  let before: string;
  do {
    before = text;
    text = text.replace(/\([^()]*\)|\[[^[\]]*\]/g, " ");
  } while (text !== before);
  return text.replace(/[([][^)\]]*$/, " ");
}

/** Every bracket's own text, innermost first: `a (b (c))` gives `c`, then `b`. */
function bracketContents(s: string): string[] {
  const found: string[] = [];
  let text = s;
  let before: string;
  do {
    before = text;
    text = text.replace(/\(([^()]*)\)|\[([^[\]]*)\]/g, (_, round?: string, square?: string) => {
      found.push(round ?? square ?? "");
      return " ";
    });
  } while (text !== before);
  return found;
}

/**
 * `Aqua/Water/Eau` is one substance written three ways; `Dimethicone/Vinyl
 * Dimethicone Crosspolymer` is a different substance. Only the first is split.
 */
function slashSynonym(whole: string, find: (key: string) => Entry | undefined): Entry | undefined {
  if (!whole.includes("/")) return undefined;
  const sides = whole
    .split("/")
    .map((side) => normalise(withoutBrackets(side)))
    .filter(Boolean);
  const first = find(sides[0] ?? "");
  return first && sides.length > 1 && sides.every((side) => find(side) === first) ? first : undefined;
}

/** A bracket's text explains the name only when there is little name outside it. */
function bracketed(whole: string, find: (key: string) => Entry | undefined): Entry | undefined {
  const outside = normalise(withoutBrackets(whole));
  if (outside.split(" ").filter(Boolean).length > 3) return undefined;
  for (const inner of bracketContents(whole)) {
    const entry = find(normalise(inner));
    if (entry) return entry;
  }
  return undefined;
}

/**
 * One spelling of a name, as the index keys it: lower case, no diacritics, no
 * footnote marks or percentages, one space between words, no space round a
 * slash, and no full stop, semicolon or colon at the end.
 */
function normalise(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[*†‡]+/g, "")
    .replace(/\d+(?:[.,]\d+)?\s*%/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;:]+$/, "")
    .trim();
}

let INDEX: Map<string, Entry> | undefined;

function glossaryIndex(): Map<string, Entry> {
  if (INDEX) return INDEX;
  INDEX = new Map();
  for (const entry of GLOSSARY) {
    for (const alias of [entry.name, ...entry.aliases]) {
      const key = normalise(alias);
      if (!INDEX.has(key)) INDEX.set(key, entry);
    }
  }
  return INDEX;
}

/* The glossary, alphabetical by name. Aliases are stored normalised. */
const GLOSSARY: Entry[] = [
  {
    name: "1,2-Hexanediol",
    aliases: ["1,2 hexanediol"],
    role: "Solvent",
    about: "A small glycol that dissolves other ingredients and helps the preservative keep the product fresh.",
  },
  {
    name: "3-O-Ethyl Ascorbic Acid",
    aliases: ["ethyl ascorbic acid"],
    role: "Antioxidant",
    about: "A modified form of vitamin C that holds up in a formula far longer than pure ascorbic acid.",
  },
  {
    name: "Acetyl Glucosamine",
    aliases: ["n-acetyl glucosamine", "n-acetylglucosamine"],
    role: "Skin conditioning",
    about: "An amino sugar and one of the building blocks of hyaluronic acid. Helps skin hold on to moisture.",
  },
  {
    name: "Acetyl Hexapeptide-8",
    aliases: ["acetyl hexapeptide 8", "acetyl hexapeptide-3"],
    role: "Skin conditioning",
    about: "A lab-made chain of six amino acids, used in creams aimed at softening the look of expression lines.",
  },
  {
    name: "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
    aliases: [],
    role: "Thickener",
    about: "A synthetic polymer related to carbomer. Thickens gels and helps hold oil and water together.",
  },
  {
    name: "Adenosine",
    aliases: [],
    role: "Skin conditioning",
    about: "A compound found in every living cell. Often used in products aimed at fine lines.",
  },
  {
    name: "Alcohol",
    aliases: ["ethanol", "ethyl alcohol"],
    role: "Solvent",
    about: "Ethanol, which dissolves other ingredients and evaporates fast. High on a list, it can leave skin feeling dry or tight.",
  },
  {
    name: "Alcohol Denat.",
    aliases: ["denatured alcohol", "sd alcohol", "sd alcohol 40", "sd alcohol 40-b", "sd alcohol 39-c"],
    role: "Solvent",
    about: "Ethanol mixed with an additive that makes it undrinkable. Evaporates fast and can leave skin dry or tight.",
  },
  {
    name: "Allantoin",
    aliases: [],
    role: "Soothing agent",
    about: "A compound found in comfrey, usually made in the lab for cosmetics. Helps skin feel soft and comfortable.",
  },
  {
    name: "Aloe Barbadensis Leaf Juice",
    aliases: ["aloe barbadensis (aloe vera) leaf juice", "aloe vera leaf juice"],
    role: "Skin conditioning",
    about: "Juice from the aloe vera leaf, mostly water. Adds moisture and can help skin feel calmer.",
  },
  {
    name: "Alpha-Arbutin",
    aliases: ["alpha arbutin"],
    role: "Skin conditioning",
    about: "A form of arbutin, a compound found in bearberry leaves. Helps even out the look of dark spots.",
  },
  {
    name: "Alpha-Isomethyl Ionone",
    aliases: ["alpha isomethyl ionone", "alpha-isomethylionone"],
    role: "Fragrance",
    about: "A scent compound with a powdery, violet-like smell. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Aluminum Hydroxide",
    aliases: ["aluminium hydroxide"],
    role: "Opacifier",
    about: "A white powder that adds opacity. Often used as a coating on pigments and mineral UV filters.",
  },
  {
    name: "Aminomethyl Propanol",
    aliases: ["aminomethylpropanol"],
    role: "pH adjuster",
    about: "An amino alcohol used in small amounts to raise a formula's pH, often to thicken carbomer gels.",
  },
  {
    name: "Ammonium Lauryl Sulfate",
    aliases: ["ammonium lauryl sulphate"],
    role: "Cleansing agent",
    about: "A strong sulfate foaming agent, a close relative of SLS, common in shampoos. Can leave skin dry or tight.",
  },
  {
    name: "Ammonium Polyacryloyldimethyl Taurate",
    aliases: ["ammonium polyacryloyldimethyltaurate"],
    role: "Thickener",
    about: "A synthetic polymer that gives creams and gels body and keeps them evenly mixed, with a light, smooth feel.",
  },
  {
    name: "Argania Spinosa Kernel Oil",
    aliases: ["argania spinosa (argan) kernel oil", "argania spinosa oil", "argan kernel oil", "argan oil"],
    role: "Emollient",
    about: "A plant oil pressed from argan kernels, with natural vitamin E. Softens skin and helps it feel supple.",
  },
  {
    name: "Arginine",
    aliases: ["l-arginine"],
    role: "pH adjuster",
    about: "An amino acid that also occurs naturally in skin. Often used to raise and balance a formula's pH.",
  },
  {
    name: "Ascorbic Acid",
    aliases: ["l-ascorbic acid"],
    role: "Antioxidant",
    about: "Vitamin C itself, in its pure form. Helps protect skin from oxidation, but breaks down quickly in air and light.",
  },
  {
    name: "Ascorbyl Glucoside",
    aliases: ["ascorbic acid 2-glucoside"],
    role: "Antioxidant",
    about: "A form of vitamin C joined to glucose to make it more stable. Enzymes in skin can free the vitamin C.",
  },
  {
    name: "Ascorbyl Palmitate",
    aliases: [],
    role: "Antioxidant",
    about: "An oil-soluble form of vitamin C, joined to a fatty acid. Often used to stop oils in a formula going off.",
  },
  {
    name: "Asiatic Acid",
    aliases: [],
    role: "Soothing agent",
    about: "A key compound in centella (gotu kola), used in cica products. Despite the name, it is not an exfoliating acid.",
  },
  {
    name: "Asiaticoside",
    aliases: [],
    role: "Soothing agent",
    about: "A compound from centella (gotu kola), the plant behind cica products. Used to help skin feel calm and comfortable.",
  },
  {
    name: "Avena Sativa (Oat) Kernel Flour",
    aliases: ["avena sativa kernel flour", "oat kernel flour", "colloidal oatmeal"],
    role: "Soothing agent",
    about: "Finely milled oats, long used in baths and creams to help dry skin feel comfortable.",
  },
  {
    name: "Azelaic Acid",
    aliases: [],
    role: "Skin conditioning",
    about: "An acid found in grains and made by yeast that lives on skin. Helps even out tone and texture; can tingle at first.",
  },
  {
    name: "Bakuchiol",
    aliases: [],
    role: "Skin conditioning",
    about: "A plant compound from babchi seeds, often marketed as a retinol alternative. It is not chemically a retinoid.",
  },
  {
    name: "Behentrimonium Methosulfate",
    aliases: ["behentrimonium methosulphate"],
    role: "Emulsifier",
    about: "A conditioning ingredient, common in hair care, that helps oil and water blend in creams.",
  },
  {
    name: "Behenyl Alcohol",
    aliases: [],
    role: "Emollient",
    about: "A waxy fatty alcohol that softens skin and helps creams stay thick and stable. Not the drying kind of alcohol.",
  },
  {
    name: "Bentonite",
    aliases: ["bentonite clay"],
    role: "Absorbent",
    about: "A clay formed from volcanic ash. It helps absorb oil and swells in water, which thickens masks.",
  },
  {
    name: "Benzoic Acid",
    aliases: [],
    role: "Preservative",
    about: "An organic acid found naturally in some plants. Keeps mould and bacteria from growing in acidic formulas.",
  },
  {
    name: "Benzophenone-3",
    aliases: ["benzophenone 3", "oxybenzone"],
    role: "UV filter",
    about: "A sunscreen filter, also called oxybenzone, that absorbs UVB and some UVA. Also shields some products from light.",
  },
  {
    name: "Benzoyl Peroxide",
    aliases: [],
    role: "Exfoliant",
    about: "An oxidising agent used in spot products. Commonly associated with dryness and peeling, and it can bleach fabric.",
  },
  {
    name: "Benzyl Alcohol",
    aliases: [],
    role: "Preservative",
    about: "An aromatic alcohol that keeps bacteria from growing. It also occurs naturally in some flower scents.",
  },
  {
    name: "Benzyl Benzoate",
    aliases: [],
    role: "Fragrance",
    about: "A faintly sweet scent compound found in some balsams. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Benzyl Salicylate",
    aliases: [],
    role: "Fragrance",
    about: "A faint floral scent compound that helps perfumes last. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Beta-Glucan",
    aliases: ["beta glucan", "β-glucan"],
    role: "Skin conditioning",
    about: "A long sugar molecule, often from oats or yeast, that helps skin hold on to moisture.",
  },
  {
    name: "Betaine",
    aliases: ["trimethylglycine"],
    role: "Humectant",
    about: "An amino acid derivative, often sourced from sugar beet. Draws in water and helps skin feel soft.",
  },
  {
    name: "BHT",
    aliases: ["butylated hydroxytoluene"],
    role: "Antioxidant",
    about: "A synthetic compound added in small amounts to stop oils and fats in the product going rancid.",
  },
  {
    name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
    aliases: ["bemotrizinol"],
    role: "UV filter",
    about: "A sunscreen filter that absorbs both UVA and UVB light and stays stable in sunlight.",
  },
  {
    name: "Bis-PEG-18 Methyl Ether Dimethyl Silane",
    aliases: [],
    role: "Emollient",
    about: "A water-soluble, silicone-like ingredient that gives watery formulas a smoother, silkier feel.",
  },
  {
    name: "Bisabolol",
    aliases: ["alpha-bisabolol", "alpha bisabolol", "α-bisabolol"],
    role: "Soothing agent",
    about: "A compound found in chamomile, often added to formulas to help skin feel calm.",
  },
  {
    name: "Boerhavia Diffusa Root Extract",
    aliases: ["boerhaavia diffusa root extract"],
    role: "Skin conditioning",
    about: "An extract from the root of punarnava, a plant long used in Ayurveda. Added to help condition skin.",
  },
  {
    name: "Butyl Methoxydibenzoylmethane",
    aliases: ["avobenzone"],
    role: "UV filter",
    about: "A sunscreen filter, also called avobenzone, that absorbs UVA light. Other filters help keep it stable in sunlight.",
  },
  {
    name: "Butylene Glycol",
    aliases: ["1,3-butylene glycol", "1,3-butanediol"],
    role: "Humectant",
    about: "A light glycol that draws water into skin and helps other ingredients dissolve. Found in many toners and serums.",
  },
  {
    name: "Butyloctyl Salicylate",
    aliases: [],
    role: "Emollient",
    about: "A light, oily ester common in sunscreens, where it helps dissolve the UV filters.",
  },
  {
    name: "Butylparaben",
    aliases: ["butyl paraben"],
    role: "Preservative",
    about: "A paraben that keeps mould and bacteria from growing in the product. Often used alongside other parabens.",
  },
  {
    name: "Butyrospermum Parkii (Shea) Butter",
    aliases: ["butyrospermum parkii butter", "butyrospermum parkii (shea butter)", "shea butter"],
    role: "Emollient",
    about: "A rich plant butter from the nuts of the shea tree. Softens skin and helps it hold on to moisture.",
  },
  {
    name: "C12-15 Alkyl Benzoate",
    aliases: ["c12-c15 alkyl benzoate"],
    role: "Emollient",
    about: "A light synthetic ester with a dry, silky feel. Often used to dissolve the UV filters in sunscreens.",
  },
  {
    name: "C13-14 Isoparaffin",
    aliases: [],
    role: "Emollient",
    about: "A light hydrocarbon oil that spreads easily and helps soften skin without a heavy feel.",
  },
  {
    name: "Caffeine",
    aliases: [],
    role: "Skin conditioning",
    about: "The compound found in coffee and tea. Often used in eye creams to help reduce the look of puffiness.",
  },
  {
    name: "Camellia Oleifera Leaf Extract",
    aliases: [],
    role: "Antioxidant",
    about: "An extract from the leaves of Camellia oleifera, a close relative of the tea plant. Used for its antioxidants.",
  },
  {
    name: "Camellia Sinensis Leaf Extract",
    aliases: ["green tea extract", "green tea leaf extract"],
    role: "Antioxidant",
    about: "Extract of the tea plant's leaves, usually green tea. Rich in polyphenols that help neutralise free radicals.",
  },
  {
    name: "Camphor",
    aliases: [],
    role: "Cooling agent",
    about: "An aromatic compound from the camphor tree, now often made synthetically. Gives a cooling feel and a sharp scent.",
  },
  {
    name: "Caprylhydroxamic Acid",
    aliases: [],
    role: "Chelating agent",
    about: "A hydroxamic acid that binds traces of metal. Helps a formula's preservatives work, especially against mould.",
  },
  {
    name: "Caprylic/Capric Triglyceride",
    aliases: ["caprylic capric triglyceride", "caprylic/capric triglycerides"],
    role: "Emollient",
    about: "A light oil made from glycerin and coconut or palm fatty acids. Softens skin without a greasy feel.",
  },
  {
    name: "Caprylyl Glycol",
    aliases: ["1,2-octanediol"],
    role: "Skin conditioning",
    about: "A glycol that helps skin hold on to moisture and helps preservatives keep the product fresh.",
  },
  {
    name: "Caprylyl Methicone",
    aliases: [],
    role: "Emollient",
    about: "A lightweight silicone that helps products glide on and leaves a smooth, non-greasy finish.",
  },
  {
    name: "Carbomer",
    aliases: [],
    role: "Thickener",
    about: "A synthetic polymer that turns water-based products into gels and gives lotions their body.",
  },
  {
    name: "Cellulose Gum",
    aliases: ["sodium carboxymethylcellulose", "sodium carboxymethyl cellulose"],
    role: "Thickener",
    about: "A modified cellulose from plants, also used in food. Thickens the water in a formula and helps keep it stable.",
  },
  {
    name: "Centella Asiatica Extract",
    aliases: ["gotu kola extract"],
    role: "Soothing agent",
    about: "An extract of centella (gotu kola), the plant behind cica products. Used to help skin feel calm and comfortable.",
  },
  {
    name: "Cera Alba",
    aliases: ["beeswax", "cera alba (beeswax)", "beeswax (cera alba)", "cera alba/beeswax", "beeswax/cera alba"],
    role: "Thickener",
    about: "Wax made by honeybees. Firms up balms and creams and leaves a light layer on skin.",
  },
  {
    name: "Cera Microcristallina (Microcrystalline Wax)",
    aliases: ["microcrystalline wax (cera microcristallina)", "cera microcristallina", "microcrystalline wax"],
    role: "Thickener",
    about: "A soft, flexible wax refined from petroleum. Gives balms and lipsticks body and helps them hold their shape.",
  },
  {
    name: "Ceramide AP",
    aliases: ["ceramide 6 ii", "ceramide 6-ii"],
    role: "Barrier lipid",
    about: "A ceramide, one of the waxy lipids found naturally in skin's outer layer. Helps support the skin's barrier.",
  },
  {
    name: "Ceramide EOP",
    aliases: ["ceramide 1"],
    role: "Barrier lipid",
    about: "A long-chain ceramide, one of the waxy lipids found naturally in skin's outer layer. Helps support the skin's barrier.",
  },
  {
    name: "Ceramide NP",
    aliases: ["ceramide 3"],
    role: "Barrier lipid",
    about: "A ceramide, one of the waxy lipids found naturally in skin's outer layer. Helps support the skin's barrier.",
  },
  {
    name: "Ceteareth-20",
    aliases: ["ceteareth 20"],
    role: "Emulsifier",
    about: "Made from fatty alcohols. Helps oil and water mix into a smooth cream that stays blended.",
  },
  {
    name: "Cetearyl Alcohol",
    aliases: ["cetostearyl alcohol"],
    role: "Emollient",
    about: "A waxy fatty alcohol that softens skin and thickens creams. Not the drying kind of alcohol.",
  },
  {
    name: "Cetearyl Ethylhexanoate",
    aliases: ["cetearyl octanoate"],
    role: "Emollient",
    about: "A light, silky ester made from a fatty alcohol. Softens skin and helps creams spread easily.",
  },
  {
    name: "Cetearyl Glucoside",
    aliases: [],
    role: "Emulsifier",
    about: "Made from fatty alcohols and glucose. Helps oil and water blend into a stable cream.",
  },
  {
    name: "Cetearyl Olivate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from olive oil fatty acids and fatty alcohols. Often paired with sorbitan olivate to hold creams together.",
  },
  {
    name: "Cetyl Alcohol",
    aliases: [],
    role: "Emollient",
    about: "A waxy fatty alcohol that softens skin and gives creams body. Not the drying kind of alcohol.",
  },
  {
    name: "Cetyl Palmitate",
    aliases: [],
    role: "Emollient",
    about: "A soft wax made from a fatty alcohol and a fatty acid. Softens skin and gives creams body.",
  },
  {
    name: "Cetyl PEG/PPG-10/1 Dimethicone",
    aliases: ["cetyl dimethicone copolyol"],
    role: "Emulsifier",
    about: "A modified silicone that keeps water droplets evenly spread through rich creams and foundations.",
  },
  {
    name: "Chamomilla Recutita (Matricaria) Flower Extract",
    aliases: ["chamomilla recutita flower extract", "matricaria chamomilla flower extract"],
    role: "Soothing agent",
    about: "An extract of German chamomile flowers, a traditional plant ingredient used to help skin feel calm.",
  },
  {
    name: "Chlorphenesin",
    aliases: [],
    role: "Preservative",
    about: "Keeps bacteria, yeast and mould from growing in the product. Often used with a second preservative.",
  },
  {
    name: "Cholesterol",
    aliases: [],
    role: "Barrier lipid",
    about: "A waxy lipid found naturally in skin's outer layer, alongside ceramides. Helps support the skin's barrier.",
  },
  {
    name: "Citral",
    aliases: [],
    role: "Fragrance",
    about: "A lemony scent compound found in lemongrass oil. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Citric Acid",
    aliases: [],
    role: "pH adjuster",
    about: "An acid found in citrus fruit. Used in small amounts to set the product's pH.",
  },
  {
    name: "Citronellol",
    aliases: [],
    role: "Fragrance",
    about: "A rose-like scent compound found in rose and geranium. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Cocamidopropyl Betaine",
    aliases: [],
    role: "Cleansing agent",
    about: "A coconut-derived foaming agent that lifts oil and dirt. Often paired with stronger foaming agents.",
  },
  {
    name: "Cocamidopropyl Hydroxysultaine",
    aliases: [],
    role: "Cleansing agent",
    about: "A coconut-derived foaming agent that lifts oil and dirt and boosts lather. Often paired with other foaming agents.",
  },
  {
    name: "Coco-Caprylate/Caprate",
    aliases: ["coco caprylate/caprate"],
    role: "Emollient",
    about: "A light ester made from coconut fatty alcohols. Softens skin with a silky, non-greasy feel.",
  },
  {
    name: "Coco-Glucoside",
    aliases: ["coco glucoside"],
    role: "Cleansing agent",
    about: "Made from glucose and coconut fatty alcohols. Lifts oil and dirt and helps a wash foam.",
  },
  {
    name: "Cocos Nucifera (Coconut) Oil",
    aliases: ["cocos nucifera oil", "coconut oil"],
    role: "Emollient",
    about: "A plant oil from coconut flesh that turns solid when cool. Softens skin and adds a rich feel.",
  },
  {
    name: "Copernicia Cerifera (Carnauba) Wax",
    aliases: ["copernicia cerifera wax", "copernicia cerifera cera", "carnauba wax", "cera carnauba", "cire de carnauba"],
    role: "Thickener",
    about: "A hard wax from the leaves of the Brazilian carnauba palm. It firms lipsticks, balms and mascaras.",
  },
  {
    name: "Copper Gluconate",
    aliases: [],
    role: "Skin conditioning",
    about: "A mineral salt pairing copper with gluconic acid, which is made from glucose.",
  },
  {
    name: "Copper Tripeptide-1",
    aliases: ["copper tripeptide 1", "ghk-cu"],
    role: "Skin conditioning",
    about: "A three-amino-acid peptide bound to copper, which tints it blue. The same complex occurs naturally in human blood.",
  },
  {
    name: "Coumarin",
    aliases: [],
    role: "Fragrance",
    about: "A sweet, hay-like scent compound found in tonka beans. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Cyclohexasiloxane",
    aliases: ["dodecamethylcyclohexasiloxane"],
    role: "Emollient",
    about: "A light silicone that evaporates slowly from skin, leaving a smooth, silky finish.",
  },
  {
    name: "Cyclomethicone",
    aliases: [],
    role: "Emollient",
    about: "A light silicone that helps products spread with a silky feel, then mostly evaporates.",
  },
  {
    name: "Cyclopentasiloxane",
    aliases: ["decamethylcyclopentasiloxane"],
    role: "Emollient",
    about: "A light silicone that evaporates after it is applied, leaving a silky, dry finish.",
  },
  {
    name: "Decyl Glucoside",
    aliases: [],
    role: "Cleansing agent",
    about: "Made from glucose and a fatty alcohol. Lifts oil and dirt from skin and makes a light foam.",
  },
  {
    name: "Dehydroacetic Acid",
    aliases: [],
    role: "Preservative",
    about: "An organic acid that mainly keeps mould and yeast from growing. Often paired with benzyl alcohol.",
  },
  {
    name: "Dicaprylyl Carbonate",
    aliases: [],
    role: "Emollient",
    about: "A light, fast-spreading oil that softens skin and leaves a dry, velvety finish.",
  },
  {
    name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
    aliases: [],
    role: "UV filter",
    about: "A sunscreen filter that absorbs UVA light and stays stable in sunlight.",
  },
  {
    name: "Dimethicone",
    aliases: ["polydimethylsiloxane"],
    role: "Emollient",
    about: "A silicone that gives a smooth, silky finish and leaves a thin film on skin.",
  },
  {
    name: "Dimethicone Crosspolymer",
    aliases: [],
    role: "Thickener",
    about: "A cross-linked silicone that thickens formulas and leaves a soft, velvety finish on skin.",
  },
  {
    name: "Dimethiconol",
    aliases: [],
    role: "Emollient",
    about: "A silicone, often blended with dimethicone, that leaves a smooth, silky film on skin.",
  },
  {
    name: "Dimethyl Isosorbide",
    aliases: [],
    role: "Solvent",
    about: "Made from sorbitol, a sugar alcohol. Keeps actives dissolved and can help carry them into the top layer of skin.",
  },
  {
    name: "Dipotassium Glycyrrhizate",
    aliases: ["dipotassium glycyrrhizinate"],
    role: "Soothing agent",
    about: "A salt made from a compound in liquorice root. Used to help calm the look of redness.",
  },
  {
    name: "Dipotassium Phosphate",
    aliases: [],
    role: "pH adjuster",
    about: "A mineral salt that helps hold the product at a steady pH.",
  },
  {
    name: "Dipropylene Glycol",
    aliases: [],
    role: "Solvent",
    about: "A clear liquid glycol that dissolves other ingredients and helps control how thick the formula is.",
  },
  {
    name: "Disodium EDTA",
    aliases: ["disodium edetate", "edetate disodium"],
    role: "Chelating agent",
    about: "A form of EDTA. Binds traces of metal in the formula, which helps keep it stable and helps preservatives work.",
  },
  {
    name: "Disodium Laureth Sulfosuccinate",
    aliases: ["disodium laureth sulphosuccinate"],
    role: "Cleansing agent",
    about: "A foaming agent that lifts oil and dirt. Usually blended with other foaming agents in washes and shampoos.",
  },
  {
    name: "Disteardimonium Hectorite",
    aliases: [],
    role: "Thickener",
    about: "A clay modified to swell in oils. Thickens oil-based formulas and keeps pigments evenly suspended.",
  },
  {
    name: "DMDM Hydantoin",
    aliases: [],
    role: "Preservative",
    about: "A hydantoin compound that releases small amounts of formaldehyde, which keeps bacteria and fungi from growing.",
  },
  {
    name: "Ethoxydiglycol",
    aliases: ["diethylene glycol monoethyl ether"],
    role: "Solvent",
    about: "A glycol ether that keeps actives dissolved and can help carry them into the top layer of skin.",
  },
  {
    name: "Ethylhexyl Methoxycinnamate",
    aliases: ["octinoxate", "octyl methoxycinnamate"],
    role: "UV filter",
    about: "A sunscreen filter, also called octinoxate, that absorbs UVB, the part of sunlight mainly behind sunburn.",
  },
  {
    name: "Ethylhexyl Palmitate",
    aliases: ["octyl palmitate", "2-ethylhexyl palmitate"],
    role: "Emollient",
    about: "A clear, light ester that softens skin and helps products glide on. Also listed as octyl palmitate.",
  },
  {
    name: "Ethylhexyl Salicylate",
    aliases: ["octisalate", "octyl salicylate"],
    role: "UV filter",
    about: "A sunscreen filter, also called octisalate, that absorbs UVB light. Usually combined with other filters.",
  },
  {
    name: "Ethylhexyl Triazone",
    aliases: ["octyl triazone"],
    role: "UV filter",
    about: "A sunscreen filter that absorbs UVB light very efficiently and stays stable in sunlight.",
  },
  {
    name: "Ethylhexylglycerin",
    aliases: ["ethylhexyl glycerin", "octoxyglycerin"],
    role: "Skin conditioning",
    about: "A glycerin-based ingredient that can soften skin and helps preservatives such as phenoxyethanol work.",
  },
  {
    name: "Ethylparaben",
    aliases: ["ethyl paraben"],
    role: "Preservative",
    about: "A paraben that keeps mould and bacteria from growing in the product. Often used alongside other parabens.",
  },
  {
    name: "Eugenol",
    aliases: [],
    role: "Fragrance",
    about: "A spicy, clove-like scent compound found in clove oil. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Euphorbia Cerifera (Candelilla) Wax",
    aliases: ["euphorbia cerifera wax", "euphorbia cerifera cera", "candelilla wax", "candelilla cera", "cire de candelilla"],
    role: "Thickener",
    about: "A plant wax from the candelilla shrub. It firms lip balms and sticks, often in place of beeswax.",
  },
  {
    name: "Farnesol",
    aliases: [],
    role: "Fragrance",
    about: "A light floral scent compound found in many flower oils. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Ferulic Acid",
    aliases: [],
    role: "Antioxidant",
    about: "A compound found in plant cell walls, often paired with vitamins C and E to help keep them stable.",
  },
  {
    name: "Geraniol",
    aliases: [],
    role: "Fragrance",
    about: "A sweet, rosy scent compound found in palmarosa oil. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Gluconolactone",
    aliases: [],
    role: "Exfoliant",
    about: "A polyhydroxy acid (PHA) that helps loosen dead skin cells and holds water. Also part of some preservative blends.",
  },
  {
    name: "Glycereth-26",
    aliases: [],
    role: "Humectant",
    about: "A modified form of glycerin. Draws water into the top layer of skin and helps hold it there.",
  },
  {
    name: "Glycerin",
    aliases: ["glycerine", "glycerol"],
    role: "Humectant",
    about: "Draws water into the top layer of skin and holds it there. Found in most moisturisers.",
  },
  {
    name: "Glyceryl Caprylate",
    aliases: [],
    role: "Emollient",
    about: "Made from glycerin and caprylic acid. Softens skin and can help a formula resist microbes.",
  },
  {
    name: "Glyceryl Glucoside",
    aliases: [],
    role: "Humectant",
    about: "Glycerin bonded to a sugar. Draws water into the top layer of skin and helps hold it there.",
  },
  {
    name: "Glyceryl Stearate",
    aliases: ["glyceryl monostearate"],
    role: "Emulsifier",
    about: "Made from glycerin and stearic acid. Helps oil and water stay mixed and gives creams a soft, rich feel.",
  },
  {
    name: "Glyceryl Stearate Citrate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from glycerin, stearic acid and citric acid. Helps oil and water stay blended in creams.",
  },
  {
    name: "Glyceryl Stearate SE",
    aliases: [],
    role: "Emulsifier",
    about: "A form of glyceryl stearate with a little soap added, so it can hold oil and water together on its own.",
  },
  {
    name: "Glycol Distearate",
    aliases: [],
    role: "Opacifier",
    about: "A waxy ingredient that gives washes and shampoos a pearly, shimmery look.",
  },
  {
    name: "Glycolic Acid",
    aliases: [],
    role: "Exfoliant",
    about: "The smallest alpha hydroxy acid (AHA). Helps loosen dead surface cells; can sting or make skin more sun-sensitive.",
  },
  {
    name: "Glycyrrhiza Glabra (Licorice) Root Extract",
    aliases: ["glycyrrhiza glabra root extract", "glycyrrhiza glabra (liquorice) root extract"],
    role: "Skin conditioning",
    about: "An extract of liquorice root, used to help skin look more even in tone and feel calm.",
  },
  {
    name: "Hamamelis Virginiana (Witch Hazel) Water",
    aliases: ["hamamelis virginiana water", "witch hazel water", "witch hazel distillate"],
    role: "Skin conditioning",
    about: "Water distilled from parts of the witch hazel shrub. Used in toners for a fresh, slightly tightening feel.",
  },
  {
    name: "Helianthus Annuus (Sunflower) Seed Oil",
    aliases: ["helianthus annuus seed oil", "helianthus annuus (sunflower) oil", "helianthus annuus oil", "sunflower seed oil", "sunflower oil"],
    role: "Emollient",
    about: "A plant oil pressed from sunflower seeds. Softens skin and helps it feel smooth.",
  },
  {
    name: "Hexyl Cinnamal",
    aliases: ["hexyl cinnamaldehyde", "hexylcinnamaldehyde"],
    role: "Fragrance",
    about: "A widely used scent compound with a jasmine-like smell. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Hexylene Glycol",
    aliases: [],
    role: "Solvent",
    about: "A clear liquid glycol that helps dissolve and blend other ingredients in the formula.",
  },
  {
    name: "Homosalate",
    aliases: [],
    role: "UV filter",
    about: "An oil-soluble sunscreen filter that absorbs UVB light. Usually combined with other filters.",
  },
  {
    name: "Hyaluronic Acid",
    aliases: [],
    role: "Humectant",
    about: "A sugar-based molecule found naturally in skin. Binds water and helps the surface feel hydrated.",
  },
  {
    name: "Hydrogenated Polyisobutene",
    aliases: [],
    role: "Emollient",
    about: "A synthetic oil that softens skin and adds a glossy, cushioned feel. Common in lip products.",
  },
  {
    name: "Hydrogenated Vegetable Oil",
    aliases: [],
    role: "Emollient",
    about: "A plant oil processed into a firmer, more stable fat. Softens skin and adds body to balms.",
  },
  {
    name: "Hydrolyzed Collagen",
    aliases: ["hydrolysed collagen"],
    role: "Skin conditioning",
    about: "Collagen from animal sources such as fish or cattle, broken into smaller protein pieces. Helps skin hold on to moisture.",
  },
  {
    name: "Hydrolyzed Hyaluronic Acid",
    aliases: ["hydrolysed hyaluronic acid"],
    role: "Humectant",
    about: "Hyaluronic acid broken down into smaller pieces. Binds water and helps skin feel hydrated.",
  },
  {
    name: "Hydroxyethylcellulose",
    aliases: ["hydroxyethyl cellulose"],
    role: "Thickener",
    about: "A modified cellulose from plants. Swells in water to give gels and lotions body.",
  },
  {
    name: "Hydroxyethylpiperazine Ethane Sulfonic Acid",
    aliases: ["hepes"],
    role: "pH adjuster",
    about: "A buffer, widely used in lab research as HEPES, that keeps the product's pH steady.",
  },
  {
    name: "Hydroxypinacolone Retinoate",
    aliases: [],
    role: "Skin conditioning",
    about: "A retinoid made by joining retinoic acid to another molecule. Like other retinoids, it can leave skin dry at first.",
  },
  {
    name: "Hydroxypropyl Starch Phosphate",
    aliases: [],
    role: "Thickener",
    about: "A modified plant starch that thickens creams and lotions and helps keep them stable.",
  },
  {
    name: "Imidazolidinyl Urea",
    aliases: [],
    role: "Preservative",
    about: "A urea-derived compound that releases small amounts of formaldehyde, which keeps bacteria from growing.",
  },
  {
    name: "Iron Oxides",
    aliases: ["iron oxide", "ci 77491", "ci 77492", "ci 77499", "ci77491", "ci77492", "ci77499"],
    role: "Colourant",
    about: "Iron-based pigments in red, yellow and black, blended to make skin-tone shades in makeup and tints.",
  },
  {
    name: "Isoceteth-20",
    aliases: [],
    role: "Emulsifier",
    about: "A fatty-alcohol derivative that helps oily ingredients mix evenly into water-based formulas.",
  },
  {
    name: "Isohexadecane",
    aliases: [],
    role: "Emollient",
    about: "A light, clear synthetic hydrocarbon oil. Softens skin and gives a smooth, non-greasy feel.",
  },
  {
    name: "Isononyl Isononanoate",
    aliases: [],
    role: "Emollient",
    about: "A lightweight ester that helps creams spread easily and leaves a dry, silky feel.",
  },
  {
    name: "Isopropyl Myristate",
    aliases: [],
    role: "Emollient",
    about: "A light ester of a fatty acid. Helps products spread easily and feel less oily on skin.",
  },
  {
    name: "Isopropyl Palmitate",
    aliases: [],
    role: "Emollient",
    about: "A light ester of palmitic acid, a fatty acid. Softens skin and helps products spread smoothly.",
  },
  {
    name: "Kaolin",
    aliases: ["china clay"],
    role: "Absorbent",
    about: "A soft white clay that helps absorb excess oil. Common in masks and powders for a matte finish.",
  },
  {
    name: "Kojic Acid",
    aliases: [],
    role: "Skin conditioning",
    about: "A compound made by the koji mould used to brew sake and soy sauce. Helps even out the look of dark spots.",
  },
  {
    name: "Lactic Acid",
    aliases: [],
    role: "Exfoliant",
    about: "An alpha hydroxy acid (AHA) that helps loosen dead skin cells and holds water. Small amounts just adjust pH.",
  },
  {
    name: "Lanolin",
    aliases: ["adeps lanae"],
    role: "Emollient",
    about: "A rich wax taken from sheep's wool. Softens skin and forms a layer that helps hold moisture in.",
  },
  {
    name: "Laureth-7",
    aliases: ["laureth 7"],
    role: "Emulsifier",
    about: "Made from lauryl alcohol, it helps oil and water blend into a smooth mix. Often paired with polyacrylamide.",
  },
  {
    name: "Lauryl Glucoside",
    aliases: [],
    role: "Cleansing agent",
    about: "Made from glucose and lauryl alcohol. Lifts oil and dirt and adds foam to washes.",
  },
  {
    name: "Lavandula Angustifolia (Lavender) Oil",
    aliases: ["lavandula angustifolia oil", "lavandula angustifolia flower oil", "lavandula officinalis oil", "lavender oil"],
    role: "Fragrance",
    about: "An essential oil from lavender flowers, added for its scent. Can redden sensitive skin.",
  },
  {
    name: "Lecithin",
    aliases: ["soy lecithin", "sunflower lecithin"],
    role: "Emulsifier",
    about: "A fatty substance, often from soy or sunflower, that helps oil and water blend and can soften skin.",
  },
  {
    name: "Limonene",
    aliases: ["d-limonene"],
    role: "Fragrance",
    about: "A citrus scent compound found in orange and lemon peel. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Linalool",
    aliases: [],
    role: "Fragrance",
    about: "A floral scent compound found in lavender and coriander. EU rules require it to be named on the label above a set level.",
  },
  {
    name: "Madecassic Acid",
    aliases: [],
    role: "Soothing agent",
    about: "A compound from centella (gotu kola), used in cica products. Despite the name, it is not an exfoliating acid.",
  },
  {
    name: "Madecassoside",
    aliases: [],
    role: "Soothing agent",
    about: "A compound from centella (gotu kola), the plant behind cica products. Used to help skin feel calm and comfortable.",
  },
  {
    name: "Magnesium Aluminum Silicate",
    aliases: ["magnesium aluminium silicate"],
    role: "Thickener",
    about: "A purified clay mineral. Thickens creams and masks and helps keep particles evenly spread.",
  },
  {
    name: "Magnesium Ascorbyl Phosphate",
    aliases: [],
    role: "Antioxidant",
    about: "A water-soluble form of vitamin C that stays stable in formulas at a near-neutral pH.",
  },
  {
    name: "Maltodextrin",
    aliases: [],
    role: "Film former",
    about: "A carbohydrate made by breaking down starch. Can leave a light, smooth film on skin and often carries plant extracts.",
  },
  {
    name: "Mandelic Acid",
    aliases: [],
    role: "Exfoliant",
    about: "An alpha hydroxy acid (AHA) with a larger molecule than glycolic acid. Helps loosen dead cells on the surface.",
  },
  {
    name: "Manganese Gluconate",
    aliases: [],
    role: "Skin conditioning",
    about: "A mineral salt pairing manganese with gluconic acid, which is made from glucose.",
  },
  {
    name: "Melaleuca Alternifolia (Tea Tree) Leaf Oil",
    aliases: ["melaleuca alternifolia leaf oil", "melaleuca alternifolia oil", "tea tree leaf oil", "tea tree oil"],
    role: "Skin conditioning",
    about: "A scented essential oil from Australian tea tree leaves, popular in blemish products. Can redden sensitive skin.",
  },
  {
    name: "Menthol",
    aliases: ["l-menthol"],
    role: "Cooling agent",
    about: "A compound found in mint oils that sets off the skin's cold sensors, giving a cool, tingling feel.",
  },
  {
    name: "Methylchloroisothiazolinone",
    aliases: [],
    role: "Preservative",
    about: "An isothiazolinone used with methylisothiazolinone to keep microbes out. EU rules limit the pair to rinse-off products.",
  },
  {
    name: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
    aliases: ["bisoctrizole"],
    role: "UV filter",
    about: "A sunscreen filter made as tiny particles that absorb and scatter both UVA and UVB light.",
  },
  {
    name: "Methylisothiazolinone",
    aliases: [],
    role: "Preservative",
    about: "An isothiazolinone that keeps bacteria and fungi out of the product. EU rules allow it only in rinse-off products.",
  },
  {
    name: "Methylparaben",
    aliases: ["methyl paraben"],
    role: "Preservative",
    about: "A paraben that keeps mould and bacteria from growing in the product. Often paired with other parabens.",
  },
  {
    name: "Methylpropanediol",
    aliases: ["2-methyl-1,3-propanediol"],
    role: "Solvent",
    about: "A light glycol that keeps other ingredients dissolved in the formula.",
  },
  {
    name: "Mica",
    aliases: ["ci 77019", "ci77019"],
    role: "Colourant",
    about: "A mineral ground into thin flakes that catch the light, adding shimmer and a soft glow.",
  },
  {
    name: "Myristyl Myristate",
    aliases: [],
    role: "Emollient",
    about: "A waxy ester that softens skin and gives creams a cushioned feel.",
  },
  {
    name: "Niacinamide",
    aliases: ["nicotinamide"],
    role: "Skin conditioning",
    about: "A form of vitamin B3. Can help skin look more even and help support its outer barrier.",
  },
  {
    name: "Nylon-12",
    aliases: ["nylon 12"],
    role: "Absorbent",
    about: "A fine nylon powder of tiny particles. Gives products a smooth, silky, matte feel on skin.",
  },
  {
    name: "o-Cymen-5-ol",
    aliases: ["isopropyl methylphenol"],
    role: "Preservative",
    about: "A phenol compound that keeps bacteria and fungi from growing in the product.",
  },
  {
    name: "Octocrylene",
    aliases: [],
    role: "UV filter",
    about: "A sunscreen filter that absorbs mainly UVB light. Often used to help keep avobenzone stable in sunlight.",
  },
  {
    name: "Octyldodecanol",
    aliases: ["2-octyldodecanol"],
    role: "Emollient",
    about: "A liquid fatty alcohol that softens skin and helps dissolve other ingredients. Not the drying kind of alcohol.",
  },
  {
    name: "Olea Europaea (Olive) Fruit Oil",
    aliases: ["olea europaea fruit oil", "olea europaea (olive) oil", "olea europaea oil", "olive fruit oil", "olive oil"],
    role: "Emollient",
    about: "A plant oil pressed from olives, rich in oleic acid. Softens skin and leaves a richer feel.",
  },
  {
    name: "Ozokerite",
    aliases: ["ozocerite", "ozokerite wax"],
    role: "Thickener",
    about: "A mineral wax that firms lipsticks, balms and stick products and helps them hold their shape.",
  },
  {
    name: "Palmitoyl Tetrapeptide-7",
    aliases: ["palmitoyl tetrapeptide 7"],
    role: "Skin conditioning",
    about: "A chain of four amino acids joined to a fatty acid. Often paired with palmitoyl tripeptide-1 in firming creams.",
  },
  {
    name: "Palmitoyl Tripeptide-1",
    aliases: ["palmitoyl tripeptide 1"],
    role: "Skin conditioning",
    about: "A chain of three amino acids joined to a fatty acid. Used in creams aimed at firmer-looking skin.",
  },
  {
    name: "Panthenol",
    aliases: ["d-panthenol", "dl-panthenol", "dexpanthenol", "provitamin b5", "pro-vitamin b5"],
    role: "Skin conditioning",
    about: "The provitamin form of vitamin B5. Draws in water and helps skin feel soft and comfortable.",
  },
  {
    name: "Paraffin",
    aliases: ["paraffin wax"],
    role: "Thickener",
    about: "A solid wax refined from petroleum. It firms balms and sticks and leaves a film that helps slow water loss.",
  },
  {
    name: "Paraffinum Liquidum",
    aliases: ["mineral oil", "paraffinum liquidum (mineral oil)", "mineral oil (paraffinum liquidum)", "paraffinum liquidum/mineral oil", "mineral oil/paraffinum liquidum", "liquid paraffin"],
    role: "Emollient",
    about: "A clear oil refined from petroleum. Softens skin and forms a thin layer that helps slow water loss.",
  },
  {
    name: "Parfum",
    aliases: ["fragrance", "parfum (fragrance)", "fragrance (parfum)", "parfum/fragrance", "fragrance/parfum"],
    role: "Fragrance",
    about: "A mix of scent ingredients declared as one word. Commonly associated with reactions on sensitive skin.",
  },
  {
    name: "PEG-100 Stearate",
    aliases: [],
    role: "Emulsifier",
    about: "A stearic acid derivative that helps oil and water blend into a smooth cream. Often paired with glyceryl stearate.",
  },
  {
    name: "PEG-40 Hydrogenated Castor Oil",
    aliases: ["peg 40 hydrogenated castor oil"],
    role: "Emulsifier",
    about: "Made from castor oil. Helps fragrance and plant oils dissolve evenly into watery products like toners.",
  },
  {
    name: "Pentylene Glycol",
    aliases: ["1,2-pentanediol"],
    role: "Humectant",
    about: "A light glycol that helps hold water in skin and helps the preservatives keep the product free of microbes.",
  },
  {
    name: "Petrolatum",
    aliases: ["petroleum jelly", "white petrolatum", "white soft paraffin"],
    role: "Emollient",
    about: "Petroleum jelly. Sits on skin as a thin layer that helps slow water loss and softens dry patches.",
  },
  {
    name: "Phenoxyethanol",
    aliases: ["2-phenoxyethanol"],
    role: "Preservative",
    about: "Helps keep bacteria and mould from growing in the product once it is opened.",
  },
  {
    name: "Phytosphingosine",
    aliases: [],
    role: "Skin conditioning",
    about: "A lipid found in skin's outer layer. It is the base that ceramides NP, AP and EOP are built on.",
  },
  {
    name: "Polyacrylamide",
    aliases: [],
    role: "Thickener",
    about: "A synthetic polymer that thickens creams and gels. Often supplied mixed with C13-14 isoparaffin and laureth-7.",
  },
  {
    name: "Polyglyceryl-10 Laurate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from glycerin and lauric acid, a fatty acid found in coconut oil. Helps oils mix into water.",
  },
  {
    name: "Polyglyceryl-4 Caprate",
    aliases: ["polyglyceryl 4 caprate"],
    role: "Emulsifier",
    about: "Made from glycerin and capric acid. Helps oils and fragrance mix evenly into water-based products.",
  },
  {
    name: "Polymethylsilsesquioxane",
    aliases: [],
    role: "Absorbent",
    about: "A silicone powder, often as tiny spheres, that gives products a silky feel and a soft, matte finish.",
  },
  {
    name: "Polyquaternium-10",
    aliases: ["polyquaternium 10"],
    role: "Film former",
    about: "A positively charged cellulose polymer that leaves a light conditioning film on skin and hair.",
  },
  {
    name: "Polysorbate 20",
    aliases: ["polysorbate-20"],
    role: "Emulsifier",
    about: "A sorbitol-based ingredient that helps oils and fragrance dissolve evenly in watery formulas.",
  },
  {
    name: "Polysorbate 60",
    aliases: ["polysorbate-60"],
    role: "Emulsifier",
    about: "A sorbitol-based ingredient that keeps oil and water blended so lotions stay smooth and even.",
  },
  {
    name: "Polysorbate 80",
    aliases: ["polysorbate-80"],
    role: "Emulsifier",
    about: "A sorbitol-based ingredient that helps oils and fragrance mix evenly into water-based products.",
  },
  {
    name: "Potassium Cetyl Phosphate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from cetyl alcohol and phosphoric acid. Helps oil and water blend, and is often used in sunscreens.",
  },
  {
    name: "Potassium Hydroxide",
    aliases: [],
    role: "pH adjuster",
    about: "A strong alkali that raises a formula's pH. In cleansers it reacts with oils to make soap.",
  },
  {
    name: "Potassium Phosphate",
    aliases: ["monopotassium phosphate"],
    role: "pH adjuster",
    about: "A mineral salt that helps hold the product at a steady pH.",
  },
  {
    name: "Potassium Sorbate",
    aliases: [],
    role: "Preservative",
    about: "The potassium salt of sorbic acid, also used in food. Mainly keeps yeast and mould from growing.",
  },
  {
    name: "Propanediol",
    aliases: ["1,3-propanediol"],
    role: "Humectant",
    about: "A glycol often made from corn sugar. Helps hold water in skin and helps other ingredients dissolve.",
  },
  {
    name: "Propylene Glycol",
    aliases: [],
    role: "Humectant",
    about: "A widely used glycol that draws water into skin and keeps other ingredients dissolved.",
  },
  {
    name: "Propylparaben",
    aliases: ["propyl paraben"],
    role: "Preservative",
    about: "A paraben that keeps mould and bacteria from growing in the product. Often paired with methylparaben.",
  },
  {
    name: "Prunus Amygdalus Dulcis (Sweet Almond) Oil",
    aliases: ["prunus amygdalus dulcis oil", "sweet almond oil"],
    role: "Emollient",
    about: "A plant oil pressed from sweet almonds. Softens skin and helps it feel smooth.",
  },
  {
    name: "Resveratrol",
    aliases: [],
    role: "Antioxidant",
    about: "A compound from grape skins, berries and peanuts. Helps protect skin from oxidation.",
  },
  {
    name: "Retinal",
    aliases: ["retinaldehyde"],
    role: "Skin conditioning",
    about: "A form of vitamin A, one step closer to retinoic acid than retinol. Can leave skin red or peeling at first.",
  },
  {
    name: "Retinol",
    aliases: [],
    role: "Skin conditioning",
    about: "A form of vitamin A. Commonly associated with redness, dryness and peeling in the first weeks of use.",
  },
  {
    name: "Retinyl Palmitate",
    aliases: ["vitamin a palmitate"],
    role: "Skin conditioning",
    about: "A form of vitamin A joined to a fatty acid. Generally considered one of the weakest retinoids used in skincare.",
  },
  {
    name: "Ricinus Communis (Castor) Seed Oil",
    aliases: ["ricinus communis seed oil", "ricinus communis (castor) oil", "ricinus communis oil", "castor seed oil", "castor oil"],
    role: "Emollient",
    about: "A thick plant oil pressed from castor seeds. Adds shine and a cushioned feel, and is common in lip products.",
  },
  {
    name: "Rosa Damascena Flower Water",
    aliases: ["damask rose water", "damask rose flower water"],
    role: "Skin conditioning",
    about: "Rose water distilled from damask rose flowers. Used as a lightly scented base in toners and mists.",
  },
  {
    name: "Salicylic Acid",
    aliases: [],
    role: "Exfoliant",
    about: "An oil-soluble acid that helps loosen dead skin cells, even inside pores. Over-use can leave skin stinging or flaky.",
  },
  {
    name: "Sclerotium Gum",
    aliases: ["scleroglucan"],
    role: "Thickener",
    about: "A sugar-based gum made by fermentation. Thickens lotions and helps keep them stable, with a smooth feel.",
  },
  {
    name: "Shea Butter Ethyl Esters",
    aliases: [],
    role: "Emollient",
    about: "A light, liquid ester made from shea butter. Helps soften skin with a lighter feel than the butter itself.",
  },
  {
    name: "Silica",
    aliases: ["silicon dioxide"],
    role: "Absorbent",
    about: "A fine mineral powder that can soak up excess oil and helps give a soft, matte finish.",
  },
  {
    name: "Simmondsia Chinensis (Jojoba) Seed Oil",
    aliases: ["simmondsia chinensis seed oil", "simmondsia chinensis (jojoba) oil", "simmondsia chinensis oil", "jojoba seed oil", "jojoba oil"],
    role: "Emollient",
    about: "Pressed from jojoba seeds. Technically a liquid wax rather than an oil, it softens skin and helps it feel supple.",
  },
  {
    name: "Sodium Acrylates Copolymer",
    aliases: [],
    role: "Thickener",
    about: "A synthetic polymer that thickens gels and creams and helps keep their texture stable.",
  },
  {
    name: "Sodium Ascorbyl Phosphate",
    aliases: [],
    role: "Antioxidant",
    about: "A water-soluble form of vitamin C that holds up in a formula far better than pure ascorbic acid.",
  },
  {
    name: "Sodium Benzoate",
    aliases: [],
    role: "Preservative",
    about: "The sodium salt of benzoic acid, also used in food. Keeps microbes from growing and works best in acidic formulas.",
  },
  {
    name: "Sodium Chloride",
    aliases: [],
    role: "Thickener",
    about: "Ordinary table salt. Thickens many cleansers and helps keep some creams stable.",
  },
  {
    name: "Sodium Citrate",
    aliases: ["trisodium citrate"],
    role: "pH adjuster",
    about: "A salt of citric acid that holds the product at a steady pH.",
  },
  {
    name: "Sodium Coco-Sulfate",
    aliases: ["sodium coco sulfate", "sodium coco-sulphate", "sodium coco sulphate"],
    role: "Cleansing agent",
    about: "A sulfate made from coconut fatty alcohols, closely related to SLS. Foams strongly and can leave skin dry.",
  },
  {
    name: "Sodium Cocoamphoacetate",
    aliases: [],
    role: "Cleansing agent",
    about: "A coconut-derived foaming agent that lifts oil and dirt. Often blended with other foaming agents in washes.",
  },
  {
    name: "Sodium Cocoyl Isethionate",
    aliases: [],
    role: "Cleansing agent",
    about: "A coconut-derived foaming agent that lifts oil and dirt with a creamy lather. Common in face washes and bars.",
  },
  {
    name: "Sodium Dehydroacetate",
    aliases: [],
    role: "Preservative",
    about: "The sodium salt of dehydroacetic acid. Mainly keeps mould and yeast from growing in the product.",
  },
  {
    name: "Sodium Hyaluronate",
    aliases: [],
    role: "Humectant",
    about: "The salt form of hyaluronic acid. Holds water and helps skin feel more hydrated.",
  },
  {
    name: "Sodium Hydroxide",
    aliases: [],
    role: "pH adjuster",
    about: "An alkali used in small amounts to adjust the product's pH. Also sets carbomer into a gel.",
  },
  {
    name: "Sodium Lactate",
    aliases: [],
    role: "Humectant",
    about: "A salt of lactic acid. Draws water into skin and also helps keep the product at the right pH.",
  },
  {
    name: "Sodium Laureth Sulfate",
    aliases: ["sodium laureth sulphate", "sodium lauryl ether sulfate", "sodium lauryl ether sulphate", "sles"],
    role: "Cleansing agent",
    about: "A foaming agent found in many shower gels and shampoos. Lifts oil and dirt, and can leave skin feeling dry or tight.",
  },
  {
    name: "Sodium Lauroyl Lactylate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from lauric and lactic acids. Helps oil and water blend into a smooth cream.",
  },
  {
    name: "Sodium Lauroyl Sarcosinate",
    aliases: [],
    role: "Cleansing agent",
    about: "A foaming agent built from lauric acid and an amino acid. Lifts oil and dirt so they rinse away.",
  },
  {
    name: "Sodium Lauryl Sulfate",
    aliases: ["sodium lauryl sulphate", "sodium dodecyl sulfate", "sls"],
    role: "Cleansing agent",
    about: "A strong foaming agent that lifts oil and dirt from skin. Can leave skin feeling dry or tight.",
  },
  {
    name: "Sodium Methyl Cocoyl Taurate",
    aliases: [],
    role: "Cleansing agent",
    about: "Made from coconut fatty acids and a taurine derivative. Lifts oil and dirt and helps a wash foam.",
  },
  {
    name: "Sodium PCA",
    aliases: ["sodium pyrrolidone carboxylate"],
    role: "Humectant",
    about: "The sodium salt of PCA, a moisture-holding compound found in skin. Draws in water and helps keep skin hydrated.",
  },
  {
    name: "Sodium Phytate",
    aliases: [],
    role: "Chelating agent",
    about: "The sodium salt of phytic acid, found in seeds and grains. Binds traces of metal to keep the formula stable.",
  },
  {
    name: "Sodium Polyacrylate",
    aliases: [],
    role: "Thickener",
    about: "A synthetic polymer that soaks up water. Thickens creams and gels and helps keep them stable.",
  },
  {
    name: "Sodium Stearate",
    aliases: [],
    role: "Cleansing agent",
    about: "A classic soap made from stearic acid. Lifts oil and dirt, and firms up bars and deodorant sticks.",
  },
  {
    name: "Sodium Stearoyl Glutamate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from stearic acid and glutamic acid, an amino acid. Helps oil and water blend in creams.",
  },
  {
    name: "Sorbic Acid",
    aliases: [],
    role: "Preservative",
    about: "An organic acid also used to preserve food. Mainly keeps yeast and mould from growing.",
  },
  {
    name: "Sorbitan Olivate",
    aliases: [],
    role: "Emulsifier",
    about: "Made from olive oil fatty acids and sorbitol. Helps oil and water blend into a stable cream.",
  },
  {
    name: "Sorbitan Stearate",
    aliases: ["sorbitan monostearate"],
    role: "Emulsifier",
    about: "Made from sorbitol and stearic acid. Helps oil and water blend, often alongside a polysorbate.",
  },
  {
    name: "Sorbitol",
    aliases: [],
    role: "Humectant",
    about: "A sugar alcohol that draws water into the top layer of skin and helps hold it there. Not the drying kind of alcohol.",
  },
  {
    name: "Squalane",
    aliases: [],
    role: "Emollient",
    about: "A light, stable oil related to squalene, an oil skin makes. Softens skin without a heavy feel.",
  },
  {
    name: "Steareth-2",
    aliases: ["steareth 2"],
    role: "Emulsifier",
    about: "Made from stearyl alcohol. Helps oil and water blend, and is often paired with steareth-21.",
  },
  {
    name: "Steareth-21",
    aliases: ["steareth 21"],
    role: "Emulsifier",
    about: "Made from stearyl alcohol. Helps oil and water blend, and is often paired with steareth-2.",
  },
  {
    name: "Stearic Acid",
    aliases: [],
    role: "Emulsifier",
    about: "A fatty acid found in plant and animal fats. Helps oil and water stay blended and gives creams body.",
  },
  {
    name: "Stearyl Alcohol",
    aliases: [],
    role: "Emollient",
    about: "A waxy fatty alcohol that softens skin and gives creams body. Not the drying kind of alcohol.",
  },
  {
    name: "Talc",
    aliases: ["ci 77718", "ci77718"],
    role: "Absorbent",
    about: "A soft mineral powder that gives powders a smooth, silky feel and helps absorb oil.",
  },
  {
    name: "Tamarindus Indica Seed Gum",
    aliases: [],
    role: "Thickener",
    about: "A gum from tamarind seeds. Thickens the formula and can leave a light, smooth film on skin.",
  },
  {
    name: "Tetrahexyldecyl Ascorbate",
    aliases: ["ascorbyl tetraisopalmitate"],
    role: "Antioxidant",
    about: "An oil-soluble form of vitamin C that stays stable in formulas and blends easily into oils and creams.",
  },
  {
    name: "Tetrasodium EDTA",
    aliases: [],
    role: "Chelating agent",
    about: "Another form of EDTA. Binds traces of metal in the formula, which helps keep it stable and helps preservatives work.",
  },
  {
    name: "Tetrasodium Glutamate Diacetate",
    aliases: [],
    role: "Chelating agent",
    about: "A compound made from the amino acid glutamic acid. Binds traces of metal that could destabilise the formula.",
  },
  {
    name: "Theobroma Cacao (Cocoa) Seed Butter",
    aliases: ["theobroma cacao seed butter", "theobroma cacao (cocoa) butter", "theobroma cacao butter", "cocoa butter", "cocoa seed butter", "cacao butter"],
    role: "Emollient",
    about: "A rich fat pressed from cocoa beans. Softens skin and helps it hold on to moisture.",
  },
  {
    name: "Titanium Dioxide",
    aliases: ["ci 77891", "ci77891", "titanium dioxide (ci 77891)", "ci 77891 (titanium dioxide)", "titanium dioxide/ci 77891", "ci 77891/titanium dioxide"],
    role: "UV filter",
    about: "A white mineral pigment. In sunscreens it absorbs and scatters UV light; in makeup, as CI 77891, it adds white colour.",
  },
  {
    name: "Tocopherol",
    aliases: [],
    role: "Antioxidant",
    about: "A form of vitamin E. Helps stop the oils in the formula from spoiling on contact with air.",
  },
  {
    name: "Tocopheryl Acetate",
    aliases: ["tocopherol acetate", "vitamin e acetate"],
    role: "Skin conditioning",
    about: "A more stable form of vitamin E, often added to creams to help keep skin soft and supple.",
  },
  {
    name: "Tranexamic Acid",
    aliases: [],
    role: "Skin conditioning",
    about: "A synthetic relative of the amino acid lysine. Used to help even out the look of dark spots and uneven tone.",
  },
  {
    name: "Trehalose",
    aliases: [],
    role: "Humectant",
    about: "A natural sugar found in plants and fungi. Helps skin hold on to water.",
  },
  {
    name: "Triethanolamine",
    aliases: ["trolamine"],
    role: "pH adjuster",
    about: "An amine compound that raises a formula's pH. Often used to turn carbomer into a gel.",
  },
  {
    name: "Triethoxycaprylylsilane",
    aliases: [],
    role: "Stabiliser",
    about: "A coating applied to mineral powders such as zinc oxide. Helps them spread evenly instead of clumping.",
  },
  {
    name: "Trisodium Ethylenediamine Disuccinate",
    aliases: [],
    role: "Chelating agent",
    about: "Often used in place of EDTA. Binds traces of metal in the formula, helping it stay stable.",
  },
  {
    name: "Tromethamine",
    aliases: ["trometamol"],
    role: "pH adjuster",
    about: "An amine compound that raises a formula's pH and helps hold it steady.",
  },
  {
    name: "Ubiquinone",
    aliases: ["coenzyme q10", "coq10"],
    role: "Antioxidant",
    about: "Coenzyme Q10, a compound the body makes itself. Helps protect skin from oxidation.",
  },
  {
    name: "Urea",
    aliases: ["carbamide"],
    role: "Humectant",
    about: "A compound found naturally in skin. Draws in water, and at higher amounts can help soften rough, dry skin.",
  },
  {
    name: "Water",
    aliases: ["aqua", "eau", "aqua/water", "water/aqua", "aqua (water)", "water (aqua)", "aqua/water/eau"],
    role: "Solvent",
    about: "The base most creams and serums are built on. Dissolves the other ingredients and carries them onto skin.",
  },
  {
    name: "Xanthan Gum",
    aliases: [],
    role: "Thickener",
    about: "A gum made by fermenting sugar. Gives products body and keeps their texture even.",
  },
  {
    name: "Zinc Gluconate",
    aliases: [],
    role: "Skin conditioning",
    about: "A mineral salt pairing zinc with gluconic acid, which is made from glucose. Often used in products for oily skin.",
  },
  {
    name: "Zinc Oxide",
    aliases: ["ci 77947"],
    role: "UV filter",
    about: "A white mineral powder that absorbs and scatters UVA and UVB light. Can leave a white cast on skin.",
  },
  {
    name: "Zinc PCA",
    aliases: [],
    role: "Skin conditioning",
    about: "The zinc salt of PCA, a moisture-holding compound found in skin. Often used in products for oily skin.",
  },
];
