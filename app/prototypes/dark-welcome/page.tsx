import type { Metadata } from "next";
import { DarkWelcomeHarness } from "./DarkWelcomeHarness";

export const metadata: Metadata = { title: "Dark Welcome prototype · LUX" };

export default function Page() {
  return <DarkWelcomeHarness />;
}
