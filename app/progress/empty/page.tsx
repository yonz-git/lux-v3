import { ProgressEmpty } from "@/features/progress/components/ProgressScreen";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";


/**
 * `Progress — empty` (551:1196 / 551:1231).
 *
 * ⚠️ A PROTOTYPE-ONLY ROUTE. In the design this is a STATE of `/progress`, not a
 * screen of its own — but the dashboard now seeds itself rather than falling
 * back here, so this is the only way left to show it. See `ProgressEmpty`.
 */
/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/progress/empty") };

export default function Page() {
  return <ProgressEmpty />;
}
