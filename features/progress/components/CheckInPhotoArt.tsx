/**
 * ⚠️ NOT IN FIGMA — the sample capture inside a check-in's photo well.
 *
 * `Check-in detail` (556:1330 / 557:1353) draws each photo well as a camera
 * glyph on `surface/data-strong`, because the comps had no photography to
 * place. That is the same hole `ProductThumb` had, and it fails the same way:
 * the PHOTOS card is the one card on the screen whose whole content is the
 * picture, so a card that draws a camera icon says only "there is no picture
 * here" — on a record whose point is that the user took one.
 *
 * ⚠️ IT IS A SAMPLE PHOTOGRAPH, NOT A DRAWING — asked for directly 13 Sep
 * 2026, replacing an SVG illustration varied per day by a hash of `seed`.
 *
 * ⚠️ AND IT IS SIX PHOTOGRAPHS AGAIN AS OF 25 Sep 2026, asked for directly
 * ("fetch different skin images from unsplash for the progress gallery").
 * From 13 Sep every capture in the app showed ONE close-up, so the progress
 * gallery — whose whole job is a row of DIFFERENT days — drew the same picture
 * five times over and read as a rendering fault rather than as a diary. `seed`
 * picks one of `SAMPLES` now, which is why the prop was kept on the contract
 * when the variety went away.
 *
 * ⚠️ A DATE COUNTS, EVERYTHING ELSE HASHES — and the split is what keeps two
 * neighbouring days from drawing the same picture. A pure FNV-1a hash over the
 * seed is stable and evenly spread, but over six samples it repeats about one
 * pair in six, and the first gallery built that way put the same photograph on
 * two of five tiles — which reads as the bug this change exists to fix. A
 * seed that IS a check-in's ISO date now indexes by its day number instead, so
 * consecutive days step through the list and can never collide; a capture id
 * (`SelfieSheet` writes a new one per capture) still hashes, so a retake lands
 * somewhere unrelated rather than on the next picture. Both are pure functions
 * of the seed, so a given day always shows the same photograph and the
 * gallery, the record and the recap cannot disagree about what was captured.
 *
 * The files and their photographers are in `public/images/skin-samples/CREDITS.md`
 * — Unsplash, free to use, and a placeholder for the product's own photography.
 *
 * ⚠️ EVERY CAPTURE SURFACE IN LUX IS A PLACEHOLDER — the selfie tray, the
 * products scan view and the check-in's camera all draw a viewfinder rather
 * than calling `getUserMedia`, so that walking the prototype never demands a
 * permission. This is the same decision one step later: the record of a photo
 * that was never really taken.
 *
 * Decorative (`alt=""`): both callers wrap it in a `figure` whose visually
 * hidden `figcaption` already names it.
 */

/* ⚠️ UNSPLASH PHOTOGRAPHS, 1 Oct 2026 — asked for directly ("fetch images
   from unsplash for the progress gallery"). Free-licence photos (the
   Unsplash License: free to use, no attribution required), cropped square at
   1200 by Unsplash's own CDN and kept locally in `public/images/gallery` so
   the prototype needs no network for them.
   ⚠️ SKIN, NOT PORTRAITS, AS OF 3 Oct 2026 — asked for directly ("don't use
   this image, it's not skin related, look for pictures of skin", with two
   close-ups as the reference). The four faces (freckled portrait, lit lower
   face, closed eyes, face in hands) were swapped for close textures, which
   also drops the original 13 Sep sample. Sources, in order:
     photo-1541752857837-f8a0154fd092   freckled skin, close
     photo-1710580889701-9fa8f2cd5927   skin texture, close
     photo-1723540634462-528708cc17aa   water drops on skin
     photo-1659531412263-bf2b9e1abf6f   pores and small moles, close
     photo-1771510581541-58a40280d8c7   dewy skin, close
     photo-1591973669966-52d2534d9087   breakouts on a cheek, close: a
                                        640 square cut from the cheek of a
                                        full portrait. It replaced, 4 Oct
                                        2026, a 324 photo the user supplied
                                        whose source was unknown ("just use
                                        free images"), so every photo here
                                        is now under the Unsplash License.
   The old `skin-samples` set (one of which rendered as a blank well) is no
   longer read. */
const SAMPLES = [
  "/images/gallery/gallery-01.jpg",
  "/images/gallery/gallery-02.jpg",
  "/images/gallery/gallery-03.jpg",
  "/images/gallery/gallery-04.jpg",
  "/images/gallery/gallery-05.jpg",
  "/images/gallery/gallery-06.jpg",
];

/** FNV-1a, 32-bit — stable across renders and platforms, unlike a bare sum. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* ⚠️ `Date.UTC`, NOT `new Date(seed)` — this only ever converts a Y-M-D to a
   day count, and UTC keeps that count the same in every timezone. A local
   parse would shift a date across midnight for half the world and hand two
   readers different photographs for one check-in. */
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

function indexFor(seed: string, count: number): number {
  const iso = ISO_DAY.exec(seed);
  if (!iso) return hash(seed) % count;
  const days = Math.floor(
    Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) / 86_400_000
  );
  return ((days % count) + count) % count;
}

export function CheckInPhotoArt({
  seed,
  className,
}: {
  /** the capture this picture stands for — its ISO date, or a capture id */
  seed: string;
  className?: string;
}) {
  const src = SAMPLES[indexFor(seed, SAMPLES.length)];

  return (
    // biome-ignore lint/performance/noImgElement: a fixed local sample filling a CSS-sized well; next/image adds nothing here
    <img
      className={className}
      src={src}
      alt=""
      width={1200}
      height={1200}
      decoding="async"
      draggable={false}
    />
  );
}
