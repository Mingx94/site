/** @type {import("prettier").Config} */
export default {
  tailwindConfig: "./tailwind.config.js",
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-astro"],
  overrides: [
    {
      files: ["**/*.astro"],
      options: {
        parser: "astro",
      },
    },
  ],
};
