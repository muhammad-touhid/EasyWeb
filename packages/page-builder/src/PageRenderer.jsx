"use client";

import { Render } from "@measured/puck";
import { pageBuilderConfig } from "./index";

/**
 * Shared PageRenderer used by every project's [...slug]/page.js,
 * (public)/page.js, and student layout for site-header/site-footer.
 * Copy your existing PageRenderer implementation's data-fetching
 * wiring here — this stub focuses on the render call itself.
 */
export function PageRenderer({ data, themeColors }) {
  if (!data) return null;

  return <Render config={pageBuilderConfig} data={data} />;
}
