# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The main readers are developers. Other people may find the site through search, links, or social media.

## Product Purpose

Vartifact is Michael Tsai's personal blog. Success means visitors can find, read, and understand the published articles.

## Operating Context

Visitors read the public website without an account. They can browse and search articles, use RSS or Markdown versions, react to articles, and contact the author. The author manages articles in EmDash.

## Capabilities and Constraints

- Astro 7 renders the site on Cloudflare Workers.
- EmDash stores content in D1 and media in R2.
- Native browser scripts provide public interactions without a client framework.
- Cloudflare KV preserves article views and contact submissions.
- Cloudflare Rate Limiting protects counter writes.
- The contact form uses Turnstile and an email binding.
- Existing public routes and article slugs must remain stable.
- The site supports light and dark themes and reduced motion.

## Brand Commitments

- Product name: Vartifact.
- Author: Michael Tsai.
- The site uses Traditional Chinese with some English labels.
- Technical writing is the main content.

## Product Principles

1. Put articles first.
2. Make reading simple.
3. Keep content easy to find and share.
4. Preserve stable links and machine-readable access.
