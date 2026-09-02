import { useId } from "react";
import type { CatalogProduct } from "@/lib/products";

/**
 * ⚠️ NOT IN FIGMA — the product illustration that replaces the camera glyph.
 *
 * Every image well in the file (`ProductThumb` 48x48, `ProductCard`'s 352x140)
 * was drawn in the comps as a camera glyph on `bg/surface-frost`, because the
 * design system has no product or bottle icon and the comps had no photography
 * to place. That reads as "no photo yet" ONCE. On `/check/new`, on the PRODUCTS
 * hub and in the add tray it repeats down a whole list, and a column of
 * identical camera glyphs tells the user nothing about which row is which — the
 * one thing a thumbnail exists to do.
 *
 * So the picture is now a DRAWN VESSEL rather than a glyph: a jar, pump
 * bottle, tube, dropper or capped bottle, tinted per brand. It is decided here,
 * under the prototype-leads rule, and Figma catches up.
 *
 * ⚠️ IT IS THE ONLY PICTURE — a real Open Beauty Facts photograph used to win
 * over it. It no longer does, and the client no longer even requests the image
 * fields; see lib/openBeautyFacts.ts for why. `artFor` therefore has to serve
 * every LIVE search result too, not just the thirteen catalogue entries: an id
 * the `ART` table doesn't name falls back to `formFor` (silhouette from the
 * product's own words) and `paletteFor` (tint from the brand).
 *
 * **It is an illustration, not a photograph, and not a brand mark.** The forms
 * are generic skincare packaging and the tints are LUX's own palette family —
 * nothing here reproduces a real product's livery. What the artwork carries is
 * IDENTITY: same brand → same tint, same product type → same silhouette, so a
 * list of six CeraVe products still reads as six different things at 48px.
 *
 * **The pigments are literals, and that is deliberate.** They are not design
 * tokens and must not become them: `02 Color` has no "bottle glass" or "cap"
 * role, and binding a jar lid to `bg/brand` would make the illustration move
 * every time the brand colour does. They are drawn FROM the LUX family (sage,
 * porcelain, the app ink `#2e2a3f`) so the shelf sits on the canvas, but they
 * stay local to this file. Raise a real illustration set in Figma before
 * spreading them.
 */

/**
 * The silhouettes. One per packaging type, not per product.
 *
 * ⚠️ NINE, NOT THE ORIGINAL FIVE. Five covered the thirteen fixture products
 * and nothing else, which was fine while the catalogue WAS the search. Now that
 * `/check/new` and the add tray both search Open Beauty Facts live, the list is
 * whatever the database holds — masks, mists, sticks, ointments — and every one
 * of them fell through `formFor`'s default to the same pump. A column of
 * identical pumps is the camera glyph again with an extra step.
 */
type Form =
  | "tub"
  | "pump"
  | "tube"
  | "dropper"
  | "bottle"
  | "airless"
  | "spray"
  | "sachet"
  | "tin";

/** In a fixed order, so the hashed fallback below is stable across reloads. */
const FORMS: Form[] = [
  "tub",
  "pump",
  "tube",
  "dropper",
  "bottle",
  "airless",
  "spray",
  "sachet",
  "tin",
];

type Palette = {
  /** the lit edge of the body */
  light: string;
  /** the shaded edge — the two make the body's sheen */
  dark: string;
  /** lid, pump head, dropper bulb */
  cap: string;
  /** the one printed band on the label */
  accent: string;
};

/** Brand tints, all inside the LUX family. See the note above on why these are
 *  literals. `sage` is the fallback for anything not named here — a live Open
 *  Beauty Facts result, or a product added after this table was written. */
const PALETTES: Record<string, Palette> = {
  cerave: {
    light: "#f6fcfd",
    dark: "#cfe3ec",
    cap: "#7ba5bd",
    accent: "#4a809f",
  },
  lrp: {
    light: "#fbfcfd",
    dark: "#dde3ea",
    cap: "#46587045",
    accent: "#5b7ea6",
  },
  ordinary: {
    light: "#f0f5f1",
    dark: "#c8d8ce",
    cap: "#2e2a3f",
    accent: "#2e2a3f",
  },
  paulas: {
    light: "#fdfaf5",
    dark: "#ecdfcd",
    cap: "#2e2a3f",
    accent: "#a9814f",
  },
  molecules: {
    light: "#f2fcf6",
    dark: "#cbe8d7",
    cap: "#4d8f73",
    accent: "#3d7d61",
  },
  sage: {
    light: "#f5fcfc",
    dark: "#cfe4e4",
    cap: "#7da7a9",
    accent: "#5b8b8d",
  },

  /* ⚠️ THE SIX BELOW ARE FOR BRANDS NOBODY NAMED. Everything above is a brand
     the fixture knows; a live Open Beauty Facts result is almost never one of
     them, and they all used to land on `sage` — so a search returned nine
     products in one tint and the per-brand identity the artwork exists to carry
     evaporated exactly where the list is longest. `paletteFor` hashes the brand
     into this ring instead, which is stable (the same brand is the same colour
     on every screen and every reload) without needing to know the brand. They
     stay inside the LUX family: muted, low-chroma, porcelain-lit. */
  clay: { light: "#fdf6f1", dark: "#ecd8c9", cap: "#b3866a", accent: "#9a6b4f" },
  amber: { light: "#fefaf0", dark: "#f0e2c2", cap: "#c19c4e", accent: "#9d7b32" },
  lilac: { light: "#f9f7fd", dark: "#ded7ee", cap: "#8b7fb0", accent: "#6f6296" },
  mint: { light: "#f2fdf8", dark: "#cdeade", cap: "#62a98a", accent: "#4a8d70" },
  slate: { light: "#f6f9fb", dark: "#d5e0e7", cap: "#6c8496", accent: "#55707f" },
  blush: { light: "#fdf7f8", dark: "#f0dbdf", cap: "#b8828e", accent: "#9c6774" },
};

/** The tints a brand outside the named set can be given, in a fixed order. */
const RING: Palette[] = [
  PALETTES.sage,
  PALETTES.clay,
  PALETTES.amber,
  PALETTES.lilac,
  PALETTES.mint,
  PALETTES.slate,
  PALETTES.blush,
];

/**
 * A small stable hash — FNV-1a. Deterministic, so the artwork for a given
 * product is the same on the search row, in the basket, on the results card and
 * after a reload. It must never be `Math.random()` or an index: a thumbnail
 * that changes identity between two screens is worse than one that repeats.
 */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

type Art = { form: Form; palette: Palette };

/**
 * The catalogue, drawn. Form follows what the product actually comes in — a
 * 16 oz tub is a tub and a 12 oz pump is a pump, which is exactly the pair of
 * rows `searchCatalog` had to grow a size field to tell apart. Tint follows
 * the brand.
 */
const ART: Record<string, Art> = {
  "cerave-moisturizing-cream-16": { form: "tub", palette: PALETTES.cerave },
  "cerave-moisturizing-cream-12": { form: "pump", palette: PALETTES.cerave },
  "cerave-moisturizing-lotion-12": { form: "pump", palette: PALETTES.cerave },
  "cerave-am-lotion-spf30": { form: "tube", palette: PALETTES.cerave },
  "cerave-niacinamide-body-lotion": { form: "pump", palette: PALETTES.cerave },
  "cerave-foaming-cleanser": { form: "bottle", palette: PALETTES.cerave },
  "lrp-toleriane-double-repair": { form: "tub", palette: PALETTES.lrp },
  "lrp-cicaplast-baume-b5": { form: "tube", palette: PALETTES.lrp },
  "lrp-retinol-b3-serum": { form: "dropper", palette: PALETTES.lrp },
  "the-ordinary-niacinamide": { form: "dropper", palette: PALETTES.ordinary },
  "paulas-choice-niacinamide-serum": {
    form: "dropper",
    palette: PALETTES.paulas,
  },
  "paulas-choice-bha-exfoliant": { form: "bottle", palette: PALETTES.paulas },
  "good-molecules-niacinamide-toner": {
    form: "bottle",
    palette: PALETTES.molecules,
  },
};

/** Brand → tint for anything the table above doesn't name, so a live search
 *  result from a brand already in the catalogue still matches its shelf-mates,
 *  and a brand from nowhere still gets a colour of its own. */
function paletteFor(brand: string): Palette {
  /* ⚠️ DIACRITICS FOLDED BEFORE HASHING. Open Beauty Facts is crowdsourced, so
     the same house is filed as both "Avene" and "Avène" — two strings, two
     hashes, two tints, and a brand's own products no longer matching each other
     in the one list where they sit next to each other. Folding is the same
     treatment `normalizeForSearch` gives a query. */
  const b = brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (b.includes("cerave")) return PALETTES.cerave;
  if (b.includes("roche")) return PALETTES.lrp;
  if (b.includes("ordinary")) return PALETTES.ordinary;
  if (b.includes("paula")) return PALETTES.paulas;
  if (b.includes("molecules")) return PALETTES.molecules;
  return RING[hash(b) % RING.length];
}

/** Silhouette from the product's own words, for the same off-catalogue case.
 *  Ordered most specific first: "foaming cleanser" is a pump, not a bottle, and
 *  a "face mist" is a spray before it is a water. */
function formFor(name: string): Form {
  const n = name.toLowerCase();
  if (/sachet|sample|sheet mask|patch|stick pack|wipes?/.test(n)) return "sachet";
  if (/mist|spray|setting|thermal water|atomi[sz]er/.test(n)) return "spray";
  if (/serum|drops?|\boil\b|ampoule|concentrate|elixir|booster/.test(n)) {
    return "dropper";
  }
  if (/salve|ointment|\btin\b|pomade|lip balm|paste/.test(n)) return "tin";
  if (/cleanser|wash|foam|shampoo|\bgel\b|micellar/.test(n)) return "pump";
  if (/toner|essence|water|exfoliant|liquid|peel/.test(n)) return "bottle";
  if (/balm|spf|sunscreen|mask|tube|primer|\bbb\b|\bcc\b/.test(n)) return "tube";
  if (/cream|butter|jar|\btub\b|\bpot\b|moistur/.test(n)) return "tub";
  if (/treatment|repair|night|\bpm\b|complex/.test(n)) return "airless";
  if (/lotion|milk|emulsion|fluid/.test(n)) return "pump";
  /* ⚠️ THE FALLBACK IS HASHED, NOT A FIXED FORM. It used to return "pump" for
     anything unrecognised, which is most of a live search — so the one branch
     that runs most often was the one that drew every row the same. Spreading the
     unknowns over all nine at least keeps a list legible as a list of different
     things, and it is stable per product. */
  return FORMS[hash(n) % FORMS.length];
}

function artFor(product: CatalogProduct): Art {
  return (
    ART[product.id] ?? {
      form: formFor(`${product.name} ${product.size}`),
      palette: paletteFor(product.brand),
    }
  );
}

/**
 * Which of the three label treatments a product prints. Keyed on the id, so two
 * products of the same form AND the same brand — the four CeraVe pumps, or nine
 * results from one house — still differ from each other. It is the cheapest
 * axis of variety there is: no new silhouette, no new colour, and it reads at
 * 48px because it changes the label's largest shape.
 */
function labelVariant(id: string): 0 | 1 | 2 {
  return (hash(id) % 3) as 0 | 1 | 2;
}

/**
 * The artwork, at whatever size the well gives it.
 *
 * ⚠️ THE viewBox IS CROPPED IN FROM THE DRAWING'S 120x120 — `10 8 100 100`.
 * The vessels are drawn on a 120 grid because that is a comfortable size to
 * reason about; rendered on the full grid they sit inside about 20% of dead
 * margin, which at a 48px thumb is a 14px-wide bottle. The window is pulled in
 * to the artwork instead of every path being retuned.
 *
 * ⚠️ `preserveAspectRatio="xMidYMid meet"`, NOT the CSS default `cover`
 * behaviour a real photo gets. The two wells are different shapes — a 48
 * square and a 352x140 letterbox — and a square composition cropped to
 * cover the letterbox would cut the cap off every bottle. `meet` centres the
 * vessel and lets the well's own opaque fill be the ground, so one drawing
 * serves both.
 */
export function ProductArt({
  product,
  className,
}: {
  product: CatalogProduct;
  className?: string;
}) {
  /* ⚠️ ids MUST be instance-unique. A list renders a dozen of these on one
     page and a duplicated gradient id means every row paints with the first
     row's fill. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { form, palette } = artFor(product);

  const body = `body-${uid}`;
  const cap = `cap-${uid}`;
  const shade = `shade-${uid}`;
  const parts: PartProps = {
    body,
    cap,
    palette,
    variant: labelVariant(product.id),
  };

  return (
    <svg
      className={className}
      viewBox="10 8 100 100"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {/* the body sheen: lit left edge, a soft core, a shaded right — the
            whole reason a flat fill reads as a sticker and this reads as a
            cylinder */}
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.dark} />
          <stop offset="0.16" stopColor={palette.light} />
          <stop offset="0.52" stopColor={palette.light} />
          <stop offset="0.86" stopColor={palette.dark} />
          <stop offset="1" stopColor={palette.dark} />
        </linearGradient>
        <linearGradient id={cap} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.cap} stopOpacity="0.82" />
          <stop offset="0.2" stopColor={palette.cap} />
          <stop offset="0.85" stopColor={palette.cap} stopOpacity="0.86" />
          <stop offset="1" stopColor={palette.cap} stopOpacity="0.9" />
        </linearGradient>
        {/* the contact shadow — a blurred ellipse without a filter, so it
            costs nothing to render a list of them */}
        <radialGradient id={shade}>
          <stop offset="0" stopColor="#2e2a3f" stopOpacity="0.22" />
          <stop offset="0.6" stopColor="#2e2a3f" stopOpacity="0.08" />
          <stop offset="1" stopColor="#2e2a3f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="103" rx="32" ry="7" fill={`url(#${shade})`} />

      {form === "tub" && <Tub {...parts} />}
      {form === "pump" && <Pump {...parts} />}
      {form === "tube" && <Tube {...parts} />}
      {form === "dropper" && <Dropper {...parts} />}
      {form === "bottle" && <Bottle {...parts} />}
      {form === "airless" && <Airless {...parts} />}
      {form === "spray" && <Spray {...parts} />}
      {form === "sachet" && <Sachet {...parts} />}
      {form === "tin" && <Tin {...parts} />}
    </svg>
  );
}

type PartProps = {
  body: string;
  cap: string;
  palette: Palette;
  variant: 0 | 1 | 2;
};

/**
 * The label panel and the specular highlight, shared by every form — they are
 * what make five rectangles read as packaging. The label's printed lines are
 * deliberately abstract: a thumbnail at 48px cannot hold type, and drawing
 * fake words at 352 would read as a mistake rather than as an illustration.
 */
function Label({
  x,
  y,
  w,
  h,
  palette,
  variant = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  palette: Palette;
  /** see `labelVariant` — 0 stacked rules, 1 a printed band, 2 an emblem */
  variant?: 0 | 1 | 2;
}) {
  const panel = (
    <rect x={x} y={y} width={w} height={h} rx="4" fill="#ffffff" opacity="0.72" />
  );

  if (variant === 1) {
    /* a solid printed band across the top third, the way a clinical range
       prints its name out of a colour block */
    return (
      <g>
        {panel}
        <path
          d={`M${x} ${y + 4} a4 4 0 0 1 4 -4 h${w - 8} a4 4 0 0 1 4 4 v${h * 0.34} h${-w} z`}
          fill={palette.accent}
          opacity="0.85"
        />
        <rect
          x={x + w * 0.2}
          y={y + h * 0.56}
          width={w * 0.6}
          height="2.2"
          rx="1.1"
          fill={palette.accent}
          opacity="0.5"
        />
        <rect
          x={x + w * 0.28}
          y={y + h * 0.74}
          width={w * 0.44}
          height="2"
          rx="1"
          fill={palette.accent}
          opacity="0.3"
        />
      </g>
    );
  }

  if (variant === 2) {
    /* an emblem over a single rule — the apothecary/minimal layout */
    const r = Math.min(w, h) * 0.19;
    return (
      <g>
        {panel}
        <circle
          cx={x + w / 2}
          cy={y + h * 0.36}
          r={r}
          fill="none"
          stroke={palette.accent}
          strokeWidth="1.8"
          opacity="0.7"
        />
        <circle
          cx={x + w / 2}
          cy={y + h * 0.36}
          r={r * 0.4}
          fill={palette.accent}
          opacity="0.55"
        />
        <rect
          x={x + w * 0.22}
          y={y + h * 0.68}
          width={w * 0.56}
          height="2.2"
          rx="1.1"
          fill={palette.accent}
          opacity="0.42"
        />
      </g>
    );
  }

  return (
    <g>
      {panel}
      <rect
        x={x + w * 0.18}
        y={y + h * 0.24}
        width={w * 0.64}
        height="2.6"
        rx="1.3"
        fill={palette.accent}
      />
      <rect
        x={x + w * 0.28}
        y={y + h * 0.46}
        width={w * 0.44}
        height="2"
        rx="1"
        fill={palette.accent}
        opacity="0.45"
      />
      <rect
        x={x + w * 0.34}
        y={y + h * 0.66}
        width={w * 0.32}
        height="2"
        rx="1"
        fill={palette.accent}
        opacity="0.28"
      />
    </g>
  );
}

function Highlight({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <rect
      x={x}
      y={y}
      width="3.4"
      height={h}
      rx="1.7"
      fill="#ffffff"
      opacity="0.55"
    />
  );
}

/** A wide squat jar — the 16 oz tub, and Toleriane's pot. */
function Tub({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect
        x="28"
        y="50"
        width="64"
        height="50"
        rx="13"
        fill={`url(#${body})`}
      />
      <rect x="24" y="32" width="72" height="22" rx="9" fill={`url(#${cap})`} />
      <rect
        x="24"
        y="49"
        width="72"
        height="5"
        rx="2.5"
        fill="#2e2a3f"
        opacity="0.08"
      />
      <Highlight x={34} y={58} h={34} />
      <Label x={38} y={62} w={44} h={28} palette={palette} variant={variant} />
    </g>
  );
}

/** The pump bottle — a lotion or a cleanser. */
function Pump({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect
        x="38"
        y="42"
        width="44"
        height="58"
        rx="13"
        fill={`url(#${body})`}
      />
      <rect
        x="54"
        y="32"
        width="12"
        height="12"
        fill={`url(#${cap})`}
        opacity="0.9"
      />
      <rect x="47" y="22" width="26" height="11" rx="5" fill={`url(#${cap})`} />
      <rect
        x="37"
        y="25"
        width="12"
        height="5.4"
        rx="2.7"
        fill={`url(#${cap})`}
      />
      <Highlight x={43} y={50} h={40} />
      <Label x={46} y={56} w={28} h={32} palette={palette} variant={variant} />
    </g>
  );
}

/** The squeeze tube, standing on its cap — a balm or an SPF. */
function Tube({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <path
        d="M46 32 H74 Q76.4 32 76.7 34.4 L79 84 Q79.2 88 75.2 88 H44.8 Q40.8 88 41 84 L43.3 34.4 Q43.6 32 46 32 Z"
        fill={`url(#${body})`}
      />
      <rect
        x="43"
        y="25"
        width="34"
        height="8"
        rx="3.4"
        fill={`url(#${body})`}
      />
      <rect
        x="43"
        y="25"
        width="34"
        height="8"
        rx="3.4"
        fill="#2e2a3f"
        opacity="0.06"
      />
      <rect
        x="48"
        y="87"
        width="24"
        height="15"
        rx="4.5"
        fill={`url(#${cap})`}
      />
      <Highlight x={48} y={40} h={40} />
      <Label x={50} y={44} w={22} h={32} palette={palette} variant={variant} />
    </g>
  );
}

/** The serum dropper — a glass body under a bulb cap. */
function Dropper({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect
        x="45"
        y="50"
        width="30"
        height="52"
        rx="8"
        fill={`url(#${body})`}
      />
      <rect x="48" y="43" width="24" height="9" rx="3" fill={`url(#${body})`} />
      <rect
        x="47"
        y="41"
        width="26"
        height="5"
        rx="2.5"
        fill={`url(#${cap})`}
        opacity="0.85"
      />
      <rect x="51" y="22" width="18" height="20" rx="6" fill={`url(#${cap})`} />
      <Highlight x={50} y={58} h={36} />
      <Label x={52} y={62} w={16} h={30} palette={palette} variant={variant} />
    </g>
  );
}

/** The capped bottle — a toner, an exfoliant, a wash. */
function Bottle({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect
        x="42"
        y="44"
        width="36"
        height="58"
        rx="10"
        fill={`url(#${body})`}
      />
      <rect x="53" y="33" width="14" height="12" fill={`url(#${body})`} />
      <rect
        x="49"
        y="21"
        width="22"
        height="14"
        rx="4.5"
        fill={`url(#${cap})`}
      />
      <rect
        x="52"
        y="33"
        width="16"
        height="3.4"
        rx="1.7"
        fill="#2e2a3f"
        opacity="0.09"
      />
      <Highlight x={47} y={52} h={40} />
      <Label x={49} y={56} w={22} h={34} palette={palette} variant={variant} />
    </g>
  );
}

/* ---------------------------------------------------------------------------
   The four added for live results — see the note on `Form`. Each is drawn on
   the same 120 grid, stands on the same contact shadow at y≈103, and carries
   the same `Highlight` + `Label` pair, so a list mixing all nine still reads as
   one set of drawings rather than nine styles.
   -------------------------------------------------------------------------- */

/** The airless pump — a slim column with a flat disc top. The treatment
 *  serums, and the shape that is NOT a dropper: a dropper is glass and squat,
 *  this is tall and opaque, which is the difference at 48px. */
function Airless({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect x="46" y="38" width="28" height="64" rx="9" fill={`url(#${body})`} />
      <rect x="45" y="34" width="30" height="6" rx="3" fill={`url(#${cap})`} />
      <rect x="43" y="21" width="34" height="14" rx="6" fill={`url(#${cap})`} />
      <rect
        x="45"
        y="34"
        width="30"
        height="3"
        rx="1.5"
        fill="#2e2a3f"
        opacity="0.09"
      />
      <Highlight x={51} y={46} h={44} />
      <Label x={52} y={52} w={16} h={36} palette={palette} variant={variant} />
    </g>
  );
}

/** The mist — a bottle under an atomiser head, the nozzle reading left so the
 *  silhouette is asymmetric and cannot be mistaken for the capped bottle. */
function Spray({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect x="44" y="46" width="32" height="56" rx="9" fill={`url(#${body})`} />
      <rect x="54" y="36" width="12" height="12" fill={`url(#${body})`} />
      <rect x="48" y="25" width="24" height="12" rx="4" fill={`url(#${cap})`} />
      <rect x="39" y="28" width="11" height="5" rx="2.5" fill={`url(#${cap})`} />
      <rect
        x="52"
        y="36"
        width="16"
        height="3.4"
        rx="1.7"
        fill="#2e2a3f"
        opacity="0.09"
      />
      <Highlight x={49} y={54} h={38} />
      <Label x={51} y={58} w={18} h={32} palette={palette} variant={variant} />
    </g>
  );
}

/** The sachet — a flat pouch with a crimped, notched top. A mask, a sample or
 *  a stick pack, and the only form in the set with no cap: nothing else in a
 *  list of thumbnails has this outline. */
function Sachet({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect x="42" y="30" width="36" height="72" rx="4" fill={`url(#${body})`} />
      {/* the crimp, and the tear notch cut into its right edge */}
      <rect x="42" y="24" width="36" height="9" rx="2" fill={`url(#${cap})`} />
      <path d="M78 27 l-4 3 4 3 z" fill="#2e2a3f" opacity="0.18" />
      {/* the side seals — two hairlines, which is what makes it read flat
          rather than as another cylinder */}
      <rect x="45" y="33" width="1.6" height="66" fill="#2e2a3f" opacity="0.07" />
      <rect x="73.4" y="33" width="1.6" height="66" fill="#2e2a3f" opacity="0.07" />
      <Highlight x={49} y={40} h={50} />
      <Label x={50} y={44} w={20} h={44} palette={palette} variant={variant} />
    </g>
  );
}

/** The tin — a shallow wide pot for a salve or an ointment. It is the only
 *  form whose label sits on the LID, because that is the face you see. */
function Tin({ body, cap, palette, variant }: PartProps) {
  return (
    <g>
      <rect x="31" y="70" width="58" height="30" rx="6" fill={`url(#${body})`} />
      <rect x="28" y="52" width="64" height="20" rx="7" fill={`url(#${cap})`} />
      <rect
        x="28"
        y="68"
        width="64"
        height="4"
        rx="2"
        fill="#2e2a3f"
        opacity="0.08"
      />
      <Highlight x={37} y={76} h={18} />
      <Label x={44} y={54} w={32} h={16} palette={palette} variant={variant} />
    </g>
  );
}
