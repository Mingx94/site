/** @type {import("prettier").Config} */
export default {
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-svelte"],
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [{ files: ["*.svelte"], options: { parser: "svelte" } }],
};
