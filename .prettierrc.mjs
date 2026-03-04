/** @type {import("prettier").Config} */
export default {
  endOfLine: "lf",
  plugins: [
    "prettier-plugin-tailwindcss",
    "prettier-plugin-astro",
    "prettier-plugin-svelte",
  ],
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [
    {
      files: ["**/*.astro"],
      options: {
        parser: "astro",
      },
    },
    { files: ["*.svelte"], options: { parser: "svelte" } },
  ],
};
