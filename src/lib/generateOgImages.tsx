import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
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
  // Brand palette (approximated from oklch tokens)
  // --background: oklch(0.9711 0.0074 80.7211) → warm off-white
  // --primary: oklch(0.5234 0.1347 144.1672) → brand green
  // --foreground: oklch(0.3 0.0358 30.2042) → dark warm brown
  // --muted-foreground: oklch(0.4495 0.0486 39.211) → medium warm

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgb(242, 238, 228)",
        fontFamily: "Huninn",
      }}
    >
      {/* Brand green top accent bar */}
      <div
        style={{
          height: "8px",
          backgroundColor: "rgb(48, 131, 84)",
          flexShrink: 0,
        }}
      />

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "48px 64px 56px",
          justifyContent: "space-between",
        }}
      >
        {/* Logo — top left */}
        <div style={{ display: "flex", width: "172px", height: "40px" }}>
          <img
            src={`data:image/png;base64,${await loadImage(logo)}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "left center",
            }}
          />
        </div>

        {/* Text block — bottom */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "58px",
              lineHeight: "1.1",
              color: "rgb(64, 50, 38)",
              fontWeight: "bold",
              marginBottom: post.description ? "20px" : "40px",
              maxWidth: "900px",
            }}
          >
            {post.title}
          </div>

          {/* Description (optional) */}
          {post.description ? (
            <div
              style={{
                fontSize: "24px",
                lineHeight: "1.45",
                color: "rgb(110, 88, 68)",
                marginBottom: "40px",
                maxWidth: "820px",
              }}
            >
              {post.description}
            </div>
          ) : null}

          {/* Attribution */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "3px",
                height: "20px",
                backgroundColor: "rgb(48, 131, 84)",
              }}
            />
            <div style={{ fontSize: "20px", color: "rgb(110, 88, 68)" }}>
              Michael Tsai
            </div>
          </div>
        </div>
      </div>
    </div>,
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
              ${post.description ?? ""}
              Michael Tsai
            `,
          ),
          style: "normal",
        },
      ],
    },
  );
}
