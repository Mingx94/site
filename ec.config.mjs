import { defineEcConfig, pluginFramesTexts } from "astro-expressive-code";

pluginFramesTexts.addLocale("zh-TW", {
  terminalWindowFallbackTitle: "終端機",
  copyButtonTooltip: "複製程式碼",
  copyButtonCopied: "已複製",
});
export default defineEcConfig({
  // Vite maps shiki/wasm to a precompiled Workers module (see shikiWasm.ts).
  shiki: { engine: "oniguruma" },
  styleOverrides: {
    borderRadius: "4px",
    codeBackground: ({ theme }) =>
      theme.type === "light" ? "#f0e9d6" : "#1a1715",
    codeFontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    codeFontSize: "0.875rem",
    codeLineHeight: "1.7142857rem",
    codePaddingInline: "1rem",
    frames: {
      editorActiveTabBackground: ({ theme }) =>
        theme.type === "light" ? "#f0e9d6" : "#1a1715",
      editorTabBarBackground: ({ theme }) =>
        theme.type === "light" ? "#ebe3cd" : "#15120e",
      frameBoxShadowCssValue: "none",
      terminalBackground: ({ theme }) =>
        theme.type === "light" ? "#f0e9d6" : "#1a1715",
      terminalTitlebarBackground: ({ theme }) =>
        theme.type === "light" ? "#ebe3cd" : "#15120e",
    },
    uiLineHeight: "inherit",
  },
  themeCssSelector(theme, { styleVariants }) {
    if (styleVariants.length >= 2) {
      const baseTheme = styleVariants[0]?.theme;
      const altTheme = styleVariants.find(
        (v) => v.theme.type !== baseTheme?.type,
      )?.theme;
      if (theme === baseTheme || theme === altTheme)
        return `[data-theme='${theme.type}']`;
    }
    return `[data-theme="${theme.name}"]`;
  },
  themes: ["min-light", "min-dark"],
  useThemedScrollbars: false,
});
