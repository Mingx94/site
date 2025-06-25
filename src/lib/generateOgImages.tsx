import { ImageResponse } from "@vercel/og";
import { readFile } from "fs/promises";
import React from "react";
import logo from "../assets/logo.png?filepath";

// prevent editor from remove import
React.version;

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

async function loadImage(url: string) {
  const readImage = await readFile(url);
  // to base64
  return readImage.toString("base64");
}

export async function generateOgImageForPost(post: {
  title: string;
  description: string | undefined;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "2.5rem",
          backgroundImage:
            "linear-gradient(109.6deg, rgb(204, 228, 247) 11.2%, rgb(237, 246, 250) 100.2%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "3rem",
            backgroundColor: "rgba(130, 130, 130, 0.1)",
            borderRadius: "2rem",
            border: "2px solid rgba(130, 130, 130, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "0rem",
              left: "3rem",
              width: "22rem",
              height: "10rem",
            }}
          >
            <img
              src={`data:image/png;base64,${await loadImage(logo)}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              color: "black",
            }}
          >
            <div
              style={{
                display: "flex",
                marginTop: "6rem",
                fontSize: "3.75rem",
                lineHeight: 1.1,
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "2.5rem",
                fontSize: "1.75rem",
                lineHeight: 1.25,
              }}
            >
              {post.description}
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                marginTop: "auto",
                fontSize: "1.5rem",
                lineHeight: 1.25,
              }}
            >
              by Michael Tsai
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Huninn",
          data: await loadGoogleFont(
            "Huninn",
            `
              ${post.title}
              ${post.description}
              by Michael Tsai
            `,
          ),
          style: "normal",
        },
      ],
    },
  );
}
