import { CheckNoProfile } from "@/components/CheckScreen";

/**
 * `Check — no profile` (— / 606:2183).
 *
 * ⚠️ A PROTOTYPE-ONLY ROUTE. In the design this is a STATE of `/check`, not a
 * screen of its own — but the landing now seeds a profile rather than falling
 * back here, so this is the only way left to show it. See `CheckNoProfile`.
 */
export default function Page() {
  return <CheckNoProfile />;
}
