# Svelte
You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

# Cloudflare docs
see https://developers.cloudflare.com/llms-full.txt

# Rules
Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Design Context

### Users
General tech readers discovering posts via search or social media, plus professional contacts (recruiters, colleagues, collaborators) evaluating Michael's technical profile and work. Browsing context is typically during work hours on desktop, or mobile during commutes/breaks. The site is primarily in Traditional Chinese, targeting the broader developer community.

### Brand Personality
**Sharp, clean, confident** — professional and polished, shows craft without being showy. The site should feel like it was made by someone who cares deeply about quality but doesn't need to prove it. Think: a well-designed business card, not a billboard.

### Aesthetic Direction
- **Tone**: Refined editorial. Typography-led. Quiet confidence.
- **Theme**: Light mode primary (reading context during work), dark mode supported.
- **Color**: Green primary (hue ~144 in OKLCH) with warm-tinted neutrals. The green is distinctive — lean into it as the brand color.
- **Anti-references**: No generic blog templates. No "developer portfolio starter kit" feel.
- **Accessibility**: WCAG AA compliance.

### Design Principles
1. **Clarity over decoration** — every element should serve a purpose. If it's decorative, it better be earning its space.
2. **Typography-led** — let great type create hierarchy and personality. The Chinese font selection (Huninn/Iansui) is a distinctive choice; protect it.
3. **Confident restraint** — make bold choices with minimal elements. One strong decision beats five safe ones.
4. **Content-first** — the writing is the product. Design should amplify readability, not compete with it.
5. **Professional warmth** — polished but not cold. Approachable but not casual.