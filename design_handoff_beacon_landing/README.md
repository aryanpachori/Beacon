# Handoff: Beacon Marketing Site (Landing, Docs, Pricing)

## Overview
Three pages for Beacon, a local-first security review tool for AI-coding-agent output (Cursor, Claude Code, Copilot):
- **Landing** — the main marketing page (hero, pipeline viz, story section, features, CTA, footer).
- **Docs** — a documentation site (sidebar nav, installation, quick start, IDE/MCP/API reference, config, FAQ).
- **Pricing** — a two-tier (Core / Enterprise) pricing page with comparison table and FAQ.

All three share the same pure white/black monochrome theme, flat (no-shadow) surfaces, nav pattern, and cross-link to each other.

## About the Design Files
The bundled files (`Beacon Landing.html`, `Beacon Docs.html`, `Beacon Pricing.html`) are **design references built in HTML/React (inline styles)** — working prototypes of layout, motion and copy, not production code to paste in. Recreate them in the target codebase's actual framework (Next.js/React assumed most likely, but adapt to whatever stack exists) using its own component conventions, routing and asset pipeline. Each page should become its own route (e.g. `/`, `/docs`, `/pricing`).

## Fidelity
**High-fidelity.** Colors, type, spacing, copy and animation timing are final — implement pixel-for-pixel and timing-for-timing.

## Design Tokens
- Background: pure white `#ffffff`. Text: near-black `#08090a`.
- No brand accent color — the site is monochrome black/white/gray. Dark-fill surfaces (footer, Enterprise pricing card, feature detail panel) invert to black bg / white text.
- Status colors (functional only, kept muted): danger `#c4675c`, success `#6f9c82`.
- Fonts: **Instrument Sans** (body/UI, 400/500/600), **Instrument Serif italic** (hero word-swap, CTA accent word), **JetBrains Mono** (code, labels, mono UI — 400/500). All via Google Fonts.
- Radius: pills `999px` for buttons/badges, `12–18px` for cards/panels.
- Card border: `1px solid rgba(8,9,10,.08–.09)`, solid black `2px` borders on Pricing's plan cards.
- **No box-shadows or glows anywhere** — flat surfaces only, depth comes from borders.
- Max content width: `1280px`, side padding `40px`.

## Screens / Sections

### Nav
Sticky-feel top bar: pulsing orb + "beacon" wordmark (left), links (How it works / Features / Pricing / Docs), pill CTA button "Install Beacon" (solid orange, dark text).

### Hero
Two-column grid. Left: eyebrow pill ("Local-first · zero repo access" with pulsing dot), H1 "Security that ships at agent speed.", subhead with a rotating italic-serif word swap ("Beacon catches *secrets/SQL injection/broken auth/…* before commit" — cycles every 2.3s), body copy, two CTAs (solid black pill + outlined pill), small mono meta row (IDE / MCP / CLI / <40ms review). Right: a floating (gentle Y float, 9s loop) fake code editor window (flat white panel, bordered, no shadow) showing a `chargeCard` handler; runs a scripted 4-phase loop — types a Stripe key char-by-char, then "scanning" sweep, then "flagged" (muted red highlight), then "fixed" (muted green highlight) — driven by a state machine, loop repeats. Status orb in the window header changes color/label per phase (watching → reviewing → 1 issue → clear).

### Trust strip (toggleable via prop)
Thin row: "Reviews code from" + inline list of agent names (Cursor, Claude Code, Copilot, Windsurf, Zed, any MCP agent).

### Pipeline ("The pipeline")
5-column grid: faulty-code panel (red-tinted, shows a leaked key + finding count) → animated connector rail with floating tag chips (secret/sqli/authz) flowing left→right → center "beacon mcp" pulsing orb module (concentric ring pulses, live checklist of 4 items highlighting in sequence, status line + "38ms") → connector rail (green tags: env var/params/guard) → fixed-code panel (green-tinted, "clean").

### Features
Two-column layout (not cards): left is a vertical list of 6 numbered rows (hairline dividers), each row = number + title + one-line description; hovering a row sets it "active" (title brightens, number turns orange). Right is a sticky detail panel: large ghost number watermark, mono tag pill (orange, pulsing dot), feature title, and a mono "terminal" snippet block — content swaps to match the hovered feature. Six features: Real-time inline review, IDE/MCP/CLI, Local-first always, Secret detection, Vulnerability intelligence, Agent-aware context.

### Closing CTA
Centered, large heading ("Let your AI ship faster. Let Beacon *watch*." — italic serif accent word), subhead, two pill CTAs.

### Footer
Solid black background, white text. 5-column grid: brand block (orb+wordmark, social links, copyright) + 4 link columns (Product/Install/Company/Legal). Bottom: a giant clipped "beacon" wordmark, cropped by the section's bottom edge (overflow hidden), sized via `clamp()`.

## Interactions & Behavior
- Hero word-swap: interval-driven, fades/slides in a new word every 2.3s.
- Hero code demo: scripted async loop (type key → wait → scan phase → flag phase → fix phase → repeat), speed adjustable via a `demoSpeed` multiplier (0.5–2×).
- Pipeline checklist highlight: steps through 4 items on an interval (`1150ms / demoSpeed`).
- Story timeline: replaced by the chat-thread script — see State Management below for its timing.
- Features: hover-driven only (`onMouseEnter` sets active index); no click-lock, no keyboard nav — worth adding for accessibility in production (focus-visible state, keyboard tab through rows).
- Scroll reveal: sections tagged for reveal fade/slide in on intersection (`IntersectionObserver`, threshold 0.08), with a 2.5s fallback timer.
- All animation timings use CSS `@keyframes` (orb pulse rings, word-in, scan sweep, rail-flow chips, float) — see the source `<style>` block for exact keyframes to port.

## State Management
- `word` (int): hero word-swap index, cycles on interval.
- `phase` (0–3): hero code-demo phase (typing/scanning/flagged/fixed).
- `typed` (string): partially-typed key string during phase 0.
- `step` (0–3): pipeline checklist active index, cycles on interval.
- `beat` (0–4): (removed — see chat thread state below).
- `feature` (0–5): active features-list index, set on row hover.
- `msgCount` (0–11): number of chat messages currently visible in the story thread.
- `typingIdx` (-1 or 0–10): index of the message whose "typing…" indicator is showing before it appears.
- Props: `demoSpeed` (0.5–2, default 1, controls all interval/animation speed), `showTrustStrip` (boolean, default true).

## Assets
No external images — everything is CSS/inline-SVG-free vector shapes (orbs, rings) and styled `<div>`s standing in for a code editor. No icon library used. If bringing in real product screenshots later, they weren't part of this design.

## Docs page
Fixed left sidebar (260px, sticky, full-height, own scroll) with grouped nav links (Getting started / Integration / Reference) using `#anchor` jump links and an active-state left-border indicator. Main content column (max 820px) with sections: Installation (3 IDE cards: Cursor/VS Code/JetBrains), Quick start (4 numbered steps + a privacy callout box), IDE integration, MCP protocol (JSON-RPC code blocks), API reference (method-tagged endpoints with curl examples), Configuration (JSON code block), Security rules (2-col card grid, white bg + solid black border), FAQ (plain stacked Q/A rows). Code blocks use `JetBrains Mono` on an off-white `#f7f6f4` background with a `rgba(8,9,10,.09)` border, `10px` radius, dark text. Same nav/wordmark pattern as Landing, links to Home and Pricing. Green (`#6fd39a`) is kept only for the functional "local-first" status dot and REST `POST` method badges.

## Pricing page
Bold, high-contrast treatment distinct from Landing/Docs' softer cards: 104px display headline and pricing numerals (Instrument Sans 700), a two-column split card with a **hard 2px black border** (no rounded corners, no soft shadows) — left cell "Core" ($29/seat/month, white bg, list of 5 checks), right cell "Enterprise" filled solid black with white text ("Custom" pricing, "Most requested" badge, 5 checks in white-on-black). Below: a full-width striped comparison table (Core vs Enterprise columns), then a Common Questions FAQ (4 stacked Q/A), then a full-bleed solid-black closing CTA block with white text and two buttons. Uses the same font (Instrument Sans throughout, no mono uppercase labels) and monochrome palette as the rest of the site.

## Files
- `Beacon Landing.html` — landing page source (reference implementation, inline-styled).
- `Beacon Docs.html` — docs page source.
- `Beacon Pricing.html` — pricing page source.
