import { notFound } from "next/navigation";
import { BucketProductsList } from "@/components/BucketProductsList";
import { ALL_BUCKETS, type BucketId } from "@/lib/products";

/**
 * A group's product list — `Long-term products list` (581:1593 / 583:1924).
 *
 * Only the long-term list is drawn, but `My Products` links to every group the
 * user can reach and the screen is entirely bucket-derived, so one dynamic
 * route serves them all rather than the sibling links going nowhere.
 *
 * ALL_BUCKETS, not BUCKETS: `/products/not-sure` has to resolve too. The hub
 * only links to it once it is non-empty, but a route that 404s for a group the
 * store can genuinely hold is a trap for anyone who bookmarks it.
 */
export function generateStaticParams() {
  return ALL_BUCKETS.map((b) => ({ bucket: b.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ bucket: string }>;
}) {
  const { bucket } = await params;
  if (!ALL_BUCKETS.some((b) => b.id === bucket)) notFound();
  return <BucketProductsList bucket={bucket as BucketId} />;
}
