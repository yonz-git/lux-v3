/** One title per route. */
import { STEPS } from "@/features/my-skin/flow";

export const APP_NAME = "LUX";

const HUB_TITLES: Record<string, string> = {
  "/": "Welcome",
  "/products": "Products in use",
  "/progress": "Progress",
  "/progress/empty": "Progress, no check-ins yet",
  "/progress/check-in": "Daily check-in",
  "/check": "Analysis",
  "/check/no-profile": "Analysis, no skin profile",
  "/check/new": "Compatibility analysis",
  "/check/analyzing": "Analysing your products",
  "/check/results": "Analysis results",
  "/check/history": "Previous analyses",
  "/investigation/analysis": "Analysis",
  "/investigation/profile": "What we know about your skin",
  /* the design system rendered live — a dev tool, in no nav section */
  "/styleguide": "Style guide",
  /* step 1 framed beside a panel for tuning it by hand — a dev tool, in no
     nav section */
  "/tweak": "Tweak a screen",
  "/tweak/welcome": "Tweak a screen",
};

/**
 * The title for a pathname, or `null` if nothing matches — an unrouted path is
 * Next's own 404, which carries its own title.
 */
export function titleFor(pathname: string): string | null {
  const step = STEPS.find((s) => s.href === pathname);
  if (step) return step.title;
  if (CHECK_IN_DETAIL.test(pathname)) return "Check-in record";
  return HUB_TITLES[pathname] ?? null;
}

const CHECK_IN_DETAIL = /^\/progress\/check-in\/[^/]+$/;

/** The same title with the product name on it, for a page's `metadata` export. */
export function metadataTitleFor(pathname: string): string {
  const title = titleFor(pathname);
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
