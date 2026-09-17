"use client";

import { spacingBoxField } from "../fields/spacingBoxField";
import { colorField } from "../fields/colorField";
import { resolveColor } from "../fields/resolveColor";
import { buildResponsiveCSS } from "../fields/responsiveStyle";

/**
 * Divider — fully generic, no project-specific data.
 * This is the reference example other widgets should follow when
 * being extracted from a project into this shared package.
 */
export const dividerFields = {
  thickness: { type: "number", label: "Thickness (px)", min: 1, max: 20 },
  style: {
    type: "select",
    label: "Style",
    options: [
      { label: "Solid", value: "solid" },
      { label: "Dashed", value: "dashed" },
      { label: "Dotted", value: "dotted" },
    ],
  },
  color: colorField("Divider Color"),
  margin: spacingBoxField("Margin"),
};

export function Divider({ thickness = 1, style = "solid", color, margin, themeColors }) {
  const scopedClass = "pb-divider";
  const resolvedColor = resolveColor(color, themeColors) || "#e5e7eb";

  const css = buildResponsiveCSS(scopedClass, {
    marginTop: margin?.top,
    marginRight: margin?.right,
    marginBottom: margin?.bottom,
    marginLeft: margin?.left,
  });

  return (
    <>
      <style>{css}</style>
      <hr
        className={scopedClass}
        style={{
          border: "none",
          borderTop: `${thickness}px ${style} ${resolvedColor}`,
        }}
      />
    </>
  );
}

export const DividerWidgetConfig = {
  fields: dividerFields,
  defaultProps: {
    thickness: 1,
    style: "solid",
    margin: { top: 16, right: 0, bottom: 16, left: 0 },
  },
  render: Divider,
};
