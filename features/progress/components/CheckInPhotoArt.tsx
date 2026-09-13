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
 * ⚠️ IT IS A SAMPLE PHOTOGRAPH NOW, NOT A DRAWING — asked for directly on
 * 13 Sep 2026. Until then this was an SVG illustration (gradients, a blush and
 * fractal grain) varied per day by an FNV-1a hash of `seed`. Every capture in
 * the prototype now shows the same close-up, `public/images/skin-sample.jpg`,
 * so two check-ins and a retake no longer look different. `seed` stays on the
 * props so the callers' contract — and the note in `SelfieSheet` about seeding
 * on the capture id — does not have to move if per-capture variety comes back.
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
export function CheckInPhotoArt({
  className,
}: {
  /** the capture this picture stands for — unused while every capture shares
      one sample photograph */
  seed: string;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: a fixed local sample filling a CSS-sized well; next/image adds nothing here
    <img
      className={className}
      src="/images/skin-sample.jpg"
      alt=""
      width={1200}
      height={1134}
      decoding="async"
      draggable={false}
    />
  );
}
