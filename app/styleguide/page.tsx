import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";
import { StyleGuide } from "./StyleGuide";

/** `/styleguide` — the design system, live. See `StyleGuide.tsx`. */
export const metadata: Metadata = { title: metadataTitleFor("/styleguide") };

export default function Page() {
  return <StyleGuide />;
}
