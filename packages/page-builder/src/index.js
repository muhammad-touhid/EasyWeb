import { DividerWidgetConfig } from "./widgets/Divider";
// As you extract more widgets from a project, import and register them here:
// import { SectionWidgetConfig } from "./widgets/Section";
// import { HeadingWidgetConfig } from "./widgets/Heading";
// import { ButtonBlockWidgetConfig } from "./widgets/ButtonBlock";
// ...etc

/**
 * The single Puck config every consuming project imports.
 * Adding a widget here makes it available in EVERY project that has
 * `npm update @easyweb59/page-builder`'d to this version — no per-project
 * code changes required.
 */
export const pageBuilderConfig = {
  components: {
    Divider: DividerWidgetConfig,
    // Section: SectionWidgetConfig,
    // Heading: HeadingWidgetConfig,
  },
};

export { PageRenderer } from "./PageRenderer";
export * from "./fields/resolveColor";
export * from "./fields/spacingBoxField";
export * from "./fields/colorField";
export * from "./fields/responsiveStyle";
