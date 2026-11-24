import { ProgressEmpty } from "@/features/progress/components/ProgressScreen";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/** `Progress — empty` (551:1196 / 551:1231). */
/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/myskin/empty") };

export default function Page() {
  return <ProgressEmpty />;
}
