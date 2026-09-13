import type { Metadata } from "next";
import { DarkWelcomeHarness } from "./DarkWelcomeHarness";

/* ⚠️ PROTOTYPE SURFACE — delete this folder once a direction is picked.
   Three dark-mode directions for 00 Welcome behind the picker. Nothing in
   production imports from here, and the title is a literal rather than a
   `lib/pageTitles.ts` entry because this route is not meant to outlive the
   exploration. */
export const metadata: Metadata = { title: "Dark Welcome prototype · LUX" };

export default function Page() {
  return <DarkWelcomeHarness />;
}
