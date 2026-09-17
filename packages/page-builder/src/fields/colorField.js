/**
 * Reusable color field. Value shape is always { type: "token"|"custom", value }.
 * Includes the "Inherit" preset gotcha handled at resolveColor() time —
 * see resolveColor.js for the known edge case with custom/"inherit" wrapping.
 */
export function colorField(label = "Color") {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => {
      // Copy your existing ColorField component implementation from
      // IELTS7+ into this file (theme token picker + custom swatch + inherit option).
      return null;
    },
  };
}
