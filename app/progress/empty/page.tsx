import { ProgressEmpty } from "@/components/ProgressScreen";

/**
 * `Progress — empty` (551:1196 / 551:1231).
 *
 * ⚠️ A PROTOTYPE-ONLY ROUTE. In the design this is a STATE of `/progress`, not a
 * screen of its own — but the dashboard now seeds itself rather than falling
 * back here, so this is the only way left to show it. See `ProgressEmpty`.
 */
export default function Page() {
  return <ProgressEmpty />;
}
