import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicFontsRoot = join(projectRoot, "public", "fonts");
const families = [
  {
    name: "iansui",
    fontFamily: "Iansui",
    packageName: "@fontsource/iansui",
  },
  {
    name: "huninn",
    fontFamily: "Huninn",
    packageName: "@fontsource/huninn",
  },
];

const packages = await Promise.all(
  families.map(async (family) => {
    const packageRoot = join(projectRoot, "node_modules", family.packageName);
    const packageJson = JSON.parse(
      await readFile(join(packageRoot, "package.json"), "utf8"),
    );
    return { ...family, packageRoot, version: packageJson.version };
  }),
);

const versions = new Set(packages.map((fontPackage) => fontPackage.version));
if (versions.size !== 1) {
  throw new Error("Iansui 與 Huninn 的 Fontsource 版本必須一致");
}

const [version] = versions;
const outputRoot = join(publicFontsRoot, version);
if (!outputRoot.startsWith(`${publicFontsRoot}${sep}`)) {
  throw new Error("拒絕清除 public/fonts 以外的目錄");
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const fontPackage of packages) {
  const sourceFilename = `${fontPackage.name}-chinese-traditional-400-normal.woff2`;
  const outputFilename = `${fontPackage.name}.woff2`;
  await copyFile(
    join(fontPackage.packageRoot, "files", sourceFilename),
    join(outputRoot, outputFilename),
  );

  const outputCss =
    `@font-face{font-family:"${fontPackage.fontFamily}";font-style:normal;` +
    `font-display:swap;font-weight:400;src:url("./${outputFilename}") format("woff2");}`;

  await writeFile(join(outputRoot, `${fontPackage.name}.css`), outputCss);
}
