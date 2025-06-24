import type { CollectionEntry } from "astro:content";
import { readFile } from "fs/promises";
import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeParse from "rehype-parse";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import fontPath from "../assets/jf-openhuninn-2.1.ttf?filepath";
import { twi } from "tw-to-css";
import type React from "react";

let fontCache: Buffer | undefined;

const width = 1200;
const height = 630;

const gradients = [
  "hsl(37.5000 36.3636% 95.6863%)",
  "hsl(33.7500 34.7826% 90.9804%)",
];

const fetchFonts = async () => {
  if (fontCache) {
    return { fontBuffer: fontCache };
  }
  const fontBuffer = await readFile(fontPath);
  fontCache = fontBuffer;
  return { fontBuffer };
};

function rehypeTwToCss() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.properties.tw) {
        node.properties.style =
          (node.properties.style ?? "") + twi(node.properties.tw as string);
        delete node.properties.tw;
      }
    });
  };
}

function toJsx(this: any) {
  this.compiler = compiler;

  function compiler(tree: Root) {
    return toJsxRuntime(tree, { Fragment, jsx, jsxs });
  }
}

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeTwToCss)
  .use(toJsx);

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const { fontBuffer } = await fetchFonts();
  const options: SatoriOptions = {
    width,
    height,
    embedFont: true,
    fonts: [
      {
        name: "Huninn",
        data: fontBuffer,
        style: "normal",
      },
    ],
  };

  const template = /* html */ `
		<div tw="flex w-[${width}px] h-[${height}px]" style="background: linear-gradient(top to left, ${gradients[0]}, ${gradients[1]}); font-family:'Huninn';">
			<div tw="shadow-[0,0,20px,rgba(0,0,0,0.1)] rounded-2xl my-5 mx-8 flex justify-center bg-white">
        <div tw="flex flex-col justify-between m-8 w-full h-full">
          <div tw="flex flex-col gap-4">
            <p tw="font-bold text-[64px] leading-[96px] max-h-[64%] overflow-hidden">
              ${post.data.title}
            </p>
            <p tw="font-bold text-[32px] leading-[48px] max-h-[24%] overflow-hidden text-stone-600/70">
              ${post.data.description}
            </p>
          </div>
          <div tw="flex justify-end items-center w-full text-[32px]">
            <span tw="overflow-hidden font-bold">
              by Michael Tsai
            </span>
          </div>
        </div>
      </div>
		</div>
  `;

  const code = await processor.process(template);

  const svg = await satori(code.result as React.ReactNode, options);
  return svgBufferToJpegBuffer(svg);
}

function svgBufferToJpegBuffer(svg: string) {
  return sharp(Buffer.from(svg, "utf-8")).jpeg().toBuffer();
}
