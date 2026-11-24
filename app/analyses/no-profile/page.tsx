import { CheckNoProfile } from "@/features/check/components/CheckScreen";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/** `Check — no profile` (— / 606:2183). */
/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/analyses/no-profile") };

export default function Page() {
  return <CheckNoProfile />;
}
