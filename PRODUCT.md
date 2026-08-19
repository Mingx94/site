# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The main readers are developers. Other people may also find the site through search, links, or social media.

## Product Purpose

Vartifact is Michael Tsai's personal blog. Its main purpose is to share articles.

Success means visitors can find, read, and understand the published articles.

## Positioning

Open decision: no special market position or unique product claim has been confirmed.

## Operating Context

Visitors read the public website without an account. They can browse the article index, search articles, read an article, use RSS or Markdown versions, react to articles, and contact the author.

## Capabilities and Constraints

- The site is a SvelteKit 2 and Svelte 5 web project.
- Articles use mdsvex and live in `src/content/posts/`.
- The site supports light and dark themes.
- The site runs on Cloudflare Workers.
- Article views and reactions use Cloudflare KV.
- The contact form uses Cloudflare Turnstile and email bindings.
- Existing public routes, article URLs, RSS, sitemap, Markdown output, and agent-readable endpoints must keep working.

## Brand Commitments

- Product name: Vartifact.
- Author: Michael Tsai.
- The current site content uses Traditional Chinese with some English labels.
- Technical writing is the main content.

## Evidence on Hand

- Published article content and cover images: `src/content/posts/`.
- Product and author information: `README.md`, `src/config.ts`, and route copy in `src/routes/`.
- Existing logos and favicons: `static/favicon.svg` and `static/favicon-dark.svg`.
- Social links: `src/config.ts`.
- No testimonials, customer claims, benchmarks, pricing, or press evidence are present. Future work must not invent them.

## Product Principles

1. Put articles first.
2. Make reading simple for developers and casual visitors.
3. Keep content easy to find and share.
4. Preserve stable public links and machine-readable article access.
