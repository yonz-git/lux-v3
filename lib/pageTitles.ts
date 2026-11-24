/** One title per route. */
import { STEPS } from "@/features/my-skin/flow";

export const APP_NAME = "LUX";

const HUB_TITLES: Record<string, string> = {
  "/": "Welcome",
  "/products": "Products in use",
  "/myskin": "Progress",
  "/myskin/empty": "Progress, no check-ins yet",
  "/myskin/check-in": "Daily check-in",
  "/myskin/health": "Skin health",
  "/analyses": "Analysis",
  "/analyses/no-profile": "Analysis, no skin profile",
  "/analyses/new": "Compatibility analysis",
  "/analyses/analyzing": "Analysing your products",
  "/analyses/results": "Analysis results",
  "/analyses/history": "Previous analyses",
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

const CHECK_IN_DETAIL = /^\/myskin\/check-in\/[^/]+$/;

/** The same title with the product name on it, for a page's `metadata` export. */
export function metadataTitleFor(pathname: string): string {
  const title = titleFor(pathname);
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
