import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";
import { Tweak } from "./Tweak";

/** `/tweak` — step 1 in a frame with a hand-tuning panel. See `Tweak.tsx`. */
export const metadata: Metadata = { title: metadataTitleFor("/tweak") };

export default function Page() {
  return <Tweak />;
}
