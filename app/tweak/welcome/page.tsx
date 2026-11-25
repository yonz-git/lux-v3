import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";
import { Tweak } from "../Tweak";

/** `/tweak/welcome` — the Welcome screen in a frame with a hand-tuning panel. */
export const metadata: Metadata = { title: metadataTitleFor("/tweak/welcome") };

export default function Page() {
  return <Tweak src="/" />;
}
