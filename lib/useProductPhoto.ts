import { useEffect, useState, type SyntheticEvent } from "react";

/**
 * Open Beauty Facts photos are crowdsourced with no quality gate — a search
 * result can carry a broken URL, or a stub/near-blank image far smaller than
 * the 400px rendition a real front-of-package photo comes in. Below this, a
 * photo reads as noise rather than product detail, so it's better to fall
 * back to the camera-glyph placeholder than to render it.
 */
const MIN_DIMENSION = 120;

/**
 * Shared by ProductThumb and ProductCard: renders optimistically, then drops
 * back to the placeholder glyph if the photo 404s or loads in under
 * MIN_DIMENSION on either axis. Resets when `imageUrl` changes so a fresh
 * photo (e.g. swapping search results) gets its own chance to load.
 */
export function useProductPhoto(imageUrl?: string) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return {
    showPhoto: Boolean(imageUrl) && !failed,
    onLoad(e: SyntheticEvent<HTMLImageElement>) {
      const img = e.currentTarget;
      if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
        setFailed(true);
      }
    },
    onError() {
      setFailed(true);
    },
  };
}
