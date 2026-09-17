/**
 * Resolves a colorField value to a usable CSS color string.
 * Handles the known "Inherit" gotcha: every preset selection, including a
 * custom "Inherit" entry, arrives wrapped as { type: "custom", value: "inherit" },
 * never as the bare string "inherit".
 */
export function resolveColor(value, themeColors = {}) {
  if (!value) return null;

  if (value === "inherit" || value?.value === "inherit") {
    return "inherit";
  }

  if (value.type === "token" && themeColors[value.value]) {
    return themeColors[value.value];
  }

  if (value.type === "custom") {
    return value.value;
  }

  // Legacy fallback: plain string values stored before the {type,value} shape existed.
  if (typeof value === "string") {
    return value;
  }

  return null;
}
