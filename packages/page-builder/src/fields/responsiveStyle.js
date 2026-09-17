/**
 * Builds a scoped <style> block from a flat style object.
 * Needed because Tailwind's JIT compiler never sees runtime/DB-stored
 * values (spacing, grid-template-columns, etc.) — those must be inline CSS
 * injected via a scoped class, not Tailwind utility classes.
 */
export function buildResponsiveCSS(scopedClass, styles = {}) {
  const declarations = Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([prop, v]) => `${camelToKebab(prop)}: ${typeof v === "number" ? `${v}px` : v};`)
    .join(" ");

  if (!declarations) return "";

  return `.${scopedClass} { ${declarations} }`;
}

function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
