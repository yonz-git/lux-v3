import { CheckIn } from "@/features/progress/components/CheckIn";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/progress/check-in") };


/* ⚠️ DYNAMIC ON PURPOSE, AND IT IS ABOUT THE CLOCK. `now` seeds the first
   client render so hydration matches (see `lib/useToday.ts`); prerendered, it
   would be the BUILD time, and the correction to the browser's date would then
   have to travel however stale the deployment is. Rendered per request it is
   within a timezone of the reader's own clock. */
export const dynamic = "force-dynamic";

export default function Page() {
  return <CheckIn now={Date.now()} />;
}
