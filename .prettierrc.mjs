/** @type {import("prettier").Config} */
export default {
  tailwindConfig: "./tailwind.config.js",
  endOfLine: "lf",
  plugins: [
    "prettier-plugin-tailwindcss",
    "prettier-plugin-astro",
    "prettier-plugin-svelte",
  ],
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
