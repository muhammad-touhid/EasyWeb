/**
 * Reusable per-side spacing field (top/right/bottom/left + link toggle + unit).
 * Extracted so every widget (Section, Divider, future widgets) shares one
 * consistent margin/padding input instead of re-implementing it per widget.
 */
export function spacingBoxField(label = "Spacing") {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => {
      // Render the linked/unlinked 4-input box UI here.
      // Kept intentionally minimal in this starter — copy your existing
      // SpacingBoxField component implementation from IELTS7+ into this file.
      return null;
    },
  };
}

export function normalizeSpacing(value) {
  if (typeof value === "string" || typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value, linked: true };
  }
  return value || { top: 0, right: 0, bottom: 0, left: 0, linked: true };
}
