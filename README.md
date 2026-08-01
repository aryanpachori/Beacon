# Handoff: Beacon Dashboard Redesign

## Overview
A black-and-white redesign of the Beacon dashboard (dependency/agent monitoring product). Replaces the prior dark-mode UI with a light, editorial, strictly monochrome interface inspired by modern minimal SaaS dashboards (floating dark sidebar, card-free content, bold serif headings for numbers/titles). Covers four views: Overview, Agent Activity, Dependency Tracker, Billing.

## About the Design Files
The bundled file (`Beacon Dashboard.dc.html`) is a **design reference built in HTML** — a working prototype showing intended look, layout and interaction, not production code to copy directly. The task is to **recreate this design in the target codebase's existing environment** (React, Vue, native, etc.) using its established component patterns, state management, and data layer — or, if no frontend environment exists yet, choose the most appropriate framework and implement there.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and component states shown are final. Recreate pixel-close using the codebase's existing styling approach (CSS-in-JS, Tailwind, CSS modules, etc.) — the values below are the source of truth, not the raw inline styles in the HTML file.

## Global Layout
- Two-region shell: a floating collapsible sidebar (black) + a continuous white content area, sitting on a white page background.
- Sidebar: fixed width 250px expanded / 84px collapsed, floats with 16px margin (top/bottom/left only — flush against content on the right), fully black (`#0d0d0d`), 26px border radius, no shadow.
- Content area: flex:1, white background (`#ffffff`), no card wrapper, padding 48px 56px 64px, vertical scroll.
- Root font: `var(--font-body)` (Source Serif 4) for content; sidebar chrome uses **Space Grotesk** (Google Font, weights 400–700) for a deliberate serif/sans contrast between the editorial content area and the modern UI chrome.

## Screens / Views

### 1. Sidebar (persistent, all views)
- **Purpose**: Primary navigation + collapse toggle + search + account.
- **Logo row**: 34×34px white rounded-square (radius 10px) mark with a black compass/target icon, "Beacon" wordmark (Space Grotesk 700, 18px, white) next to it. Collapse button (22×22px, chevron, rotates 180° between states) sits at the row's end when expanded, or below the mark when collapsed.
- **Nav items** (icons filled/stroked white @ ~55% opacity when inactive, solid white pill background + black icon/text when active): Overview, Agent Activity, Dependency Tracker, Billing. Row: 11px vertical padding, 14px horizontal (0 when collapsed, icon centered), 14px border radius, Space Grotesk 500/600 13.5px label (hidden when collapsed).
- **Quick search row** (bottom, above divider): pill, 1px `rgba(255,255,255,0.14)` border, `rgba(255,255,255,0.04)` fill, search icon + "Quick search" label + "⌘K" kbd chip (label/kbd hidden when collapsed).
- **Profile row**: 34px circular white avatar with black initials ("AR"), name "Aryan" (white, 600) + truncated email (white @40% opacity) — text hidden when collapsed.
- **Collapse behavior**: toggling swaps sidebar width, hides all text labels (nav labels, search text, profile text, wordmark), centers icons, persists via component state (no page reload needed).

### 2. Overview
- **Header row** (flex, wraps at narrow widths): "Good morning, Aryan" (Source Serif 4, 600, 34px) + "Beacon is watching your stack in real time." (15px, `#8a8a8a`). Right side: email pill (border `#e4e4e4`, 20px radius, black dot + email text) and "Pro Plan" badge (solid black pill, white bold text).
- **Two-column grid** (1.7fr / 1fr, 20px gap):
  - **Agent Activity card**: 1px `#e4e4e4` border, 14px radius, 28px padding. Title + subtitle, "Connect →" link top-right, centered "No activity yet" pill mid-card, footer line "No agent activity yet — connect the CLI, MCP, or IDE extension to start filling this in." (13px, `#b0b0b0`, top border).
  - **Connected Surfaces card**: title + "Manage →" link, list of 3 rows (GitHub/Slack/Google Chat) each with 32px icon tile (`#f5f5f5` bg), name (14px 600) + status (12.5px `#9a9a9a`), and a status dot (solid black = connected, hollow gray-bordered = not).
- **Packages summary bar**: bordered row, "29 packages · 0 critical · 2 at-risk" (bold serif count, muted middle, bold black "at-risk"), right-aligned "View Dependency Tracker →" link that navigates to the Dependency Tracker view.

### 3. Dependency Tracker
- Header: "Dependency Tracker" (30px serif) + subtitle.
- **Sub-tab segmented control**: pill container (1px border, 10px radius, 4px padding), 4 tabs — Packages / Repos / Maintainers / Analytics — active tab solid black bg + white text, inactive transparent + `#6f6f6f` text. Each tab has a small icon (package/repo/people/chart).
- **Packages table** (default sub-tab): bordered list, each row: NPM tag chip (`#f5f5f5` bg, 10.5px bold gray), name (14.5px 600 serif) + version (12px `#b0b0b0`) in a 200px column, scope ("Leaf", 70px col), maintainer avatar (22px black circle, white initials) + name (160px col), 5-bar sparkline (5×20px bars, gray, height % from data), score number (bold serif), risk pill (see below), "15h ago" timestamp, trailing chevron.
- **Risk pill styles**: Critical = solid black pill, white text. At risk = white bg, 1.4px black border, black text. Watch = light gray (`#f2f2f2`) bg, `#8a8a8a` text.
- Other sub-tabs (Repos/Maintainers/Analytics): simple centered empty-state card ("`<Tab name>` — Nothing tracked here yet.") — real content pending backend data.

### 4. Agent Activity
- Header: "Agent Activity" + "Findings from CLI, MCP, and IDE-extension scans, as they happen."
- **Connect card**: "Connect your agent" title + instructions. Row of 4 tool-select chips (Claude / Codex / Cursor / Other — selected = black bg white text, unselected = white bg `#e4e4e4` border). Dark code block (`#0d0d0d` bg, monospace white text) showing the MCP connect command with a "Copy" button (turns to "Copied" for 1.5s on click). Below: "Waiting for your agent to connect…" status line (hollow circle) + black "Continue" pill button (navigates to Overview).
- **Empty state card**: circular icon badge, "No agent activity yet" (17px serif 600), muted subtitle, and a light gray code chip showing the CLI init command.

### 5. Billing
- Header: "Billing" + subtitle.
- **Current plan card**: "CURRENT PLAN" eyebrow (11px bold uppercase gray), "Pro" (32px serif bold) + "$12/month", description line, limits line.
- **Plan comparison grid** (2 columns): Starter ($0) and Pro ($12/mo) cards. Current plan has a 1.6px black border + "CURRENT" pill badge (top-right). Each card: plan name, price (32px serif bold), description, checklist of features (black checkmark icon + 13.5px text).
- **Secure checkout row**: bordered strip with card icon tile, "Secure checkout" title + note that Pro bills monthly and can be changed anytime.

## Interactions & Behavior
- View switching is client-side state (no real routing shown) — active nav item highlights, corresponding view renders.
- Dependency Tracker keeps its own sub-tab state independent of the main view state.
- Sidebar collapse is local UI state, expected to persist per-user in a real app (e.g. localStorage) — not persisted in this prototype.
- "Copy" button in Agent Activity should copy the MCP command to the clipboard in a real implementation (prototype only simulates the copied label).
- All interactive rows (nav items, tabs, table rows, plan cards) should get real hover/focus states matched to the black/white palette — the prototype relies on default browser cursor + minimal hover tinting; add `:hover` background tints (e.g. `rgba(255,255,255,0.08)` on dark surfaces, `#f7f7f7` on light) and visible `:focus-visible` outlines for accessibility.

## State Management
- `view`: 'overview' | 'agent' | 'dependency' | 'billing'
- `dtTab` (Dependency Tracker only): 'packages' | 'repos' | 'maintainers' | 'analytics'
- `collapsed`: boolean (sidebar)
- `agentTool`: 'Claude' | 'Codex' | 'Cursor' | 'Other'
- `copied`: boolean (transient, for Copy button feedback)
- Package/surface/plan data is currently hardcoded sample data — wire to real API responses (package registry scan results, connected-integrations status, billing plan config) in production.

## Design Tokens
- **Colors**: `#ffffff` (page/content bg), `#0d0d0d` (sidebar bg / solid black elements), `#111111` (primary text / solid black UI accents), `#e4e4e4` (borders), `#f5f5f5` / `#f2f2f2` (subtle fills), `#8a8a8a` / `#9a9a9a` (muted secondary text), `#b0b0b0` / `#c0c0c0` (tertiary/muted text), `#d5d5d5` / `#d0d0d0` (faint borders/icons). No color accents anywhere — strict grayscale by design intent.
- **Typography**: Headings/numbers use "Source Serif 4" (weight 600) at 17–34px. Sidebar chrome and UI labels use "Space Grotesk" (weights 400–700) at 11–18px. Body/muted text uses Source Serif 4 regular, 13–15px.
- **Radius**: 26px (sidebar, cards in some contexts), 14px (content cards, plan cards), 10–14px (buttons, pills, chips), 20px (pill badges/buttons), 50% (avatars, dots).
- **Spacing**: sidebar padding 26px/18px; card padding 24–28px; content padding 48px/56px/64px; row gaps 4–20px depending on density.
- **Shadows**: none — flat design throughout (sidebar shadow was explicitly removed per design direction).

## Assets
- No external images. Icons are hand-drawn inline SVGs (monochrome, stroke or filled) — grid, radar/clock, isometric cube, card, search, chevron, checkmark, github/slack/chat marks. Recreate as an icon component set or swap in the codebase's existing icon library matched to these shapes.
- Fonts: Source Serif 4 (via the bound design system) and Space Grotesk (Google Fonts, loaded via `<link>`).

## Files
- `Beacon Dashboard.dc.html` — the full interactive prototype (all 4 views, sidebar collapse, tab/view state) referenced throughout this document.
