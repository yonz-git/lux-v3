import { CheckNoProfile } from "@/features/check/components/CheckScreen";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";


/**
 * `Check — no profile` (— / 606:2183).
 *
 * ⚠️ A PROTOTYPE-ONLY ROUTE. In the design this is a STATE of `/check`, not a
 * screen of its own — but the landing now seeds a profile rather than falling
 * back here, so this is the only way left to show it. See `CheckNoProfile`.
 */
/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/check/no-profile") };

export default function Page() {
  return <CheckNoProfile />;
}
