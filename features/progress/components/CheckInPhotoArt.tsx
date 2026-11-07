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
