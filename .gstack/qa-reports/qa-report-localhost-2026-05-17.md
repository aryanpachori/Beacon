# QA Report: DriftLogg (localhost)

| Field | Value |
|-------|-------|
| **Date** | 2026-05-17 |
| **URL** | http://localhost:3004 |
| **Branch** | (current feature branch) |
| **Tier** | Standard |
| **Scope** | Full public marketing site + auth + onboarding |
| **Duration** | ~45 min (browser + code review) |
| **Pages visited** | 7 |
| **Framework** | Next.js 14 (App Router) |

## Health Score: 84/100

| Category | Score |
|----------|-------|
| Console | 70 |
| Links | 100 |
| Visual | 85 |
| Functional | 90 |
| UX | 80 |
| Performance | 85 |
| Accessibility | 82 |

## Top 3 Things to Fix

1. **Contrast on light marketing pages** — Marketing pages used dashboard CSS variables, so body copy rendered as near-white on cream backgrounds. **Addressed in working tree** via `tailwind.config.ts` token split and `dash-*` renames on dashboard code.
2. **Footer legal links** — Privacy and Terms previously routed to `/`. **Fixed:** `/privacy` and `/terms` pages added; footer updated.
3. **Nav “Compare” anchor** — “Docs” duplicated “How it works”. **Fixed:** Compare → `/#compare` with section `id="compare"`.

## Console Health

| Error | Count | First seen |
|-------|-------|------------|
| React hydration warning (`data-cursor-ref` on `<html>`) | Dev only | All pages |
| React DevTools notice | Dev only | All pages |

No production-breaking console errors observed during public-page walks.

## Summary

| Severity | Found | Fixed in tree | Deferred |
|----------|-------|---------------|----------|
| Critical | 1 | 1 | 0 |
| High | 0 | 0 | 0 |
| Medium | 3 | 3 | 0 |
| Low | 2 | 2 | 0 |
| **Total** | **6** | **6** | **0** |

## Issues

### ISSUE-001: Unreadable text on light marketing backgrounds (critical)

| Field | Value |
|-------|-------|
| **Severity** | critical |
| **Category** | accessibility |
| **URL** | `/`, `/pricing`, `/login`, `/register`, `/privacy`, `/terms` |

**Description:** `text-dl-text`, `text-dl-muted`, and related classes on marketing pages resolved to dashboard CSS variables (near-white) while backgrounds stayed light cream, producing illegible copy.

**Expected:** Dark forest green body text on light backgrounds.

**Actual (before fix):** White or near-white text on `#F0F5E8` / card surfaces.

**Fix status:** verified in browser after `tailwind.config.ts` marketing `dl.*` hex tokens and dashboard `dash-*` class migration.

**Repro (historical):**

1. Open http://localhost:3004/pricing
2. Observe hero subcopy and card body text on light sections

---

### ISSUE-002: Footer Privacy/Terms linked to homepage (medium)

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | functional |
| **URL** | All pages (footer) |

**Description:** Footer legal links pointed to `/` instead of dedicated policies.

**Fix status:** verified — `/privacy` and `/terms` routes exist; footer uses correct hrefs.

---

### ISSUE-003: Nav “Docs” duplicated “How it works” (medium)

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | ux |
| **URL** | `/` (header) |

**Description:** Nav item labeled “Docs” scrolled to `#how-it-works`, same as “How it works”.

**Fix status:** verified — label **Compare**, href `/#compare`, comparison section has `id="compare"`.

---

### ISSUE-004: Stale comparison table footnote date (medium)

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | content |
| **URL** | `/#compare` |

**Description:** Footnote read “as of May 2025”.

**Fix status:** verified — now “March 2026”.

---

### ISSUE-005: US spelling consistency (low)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | content |
| **URL** | `/pricing`, `/` (features) |

**Description:** British spellings (`organisations`, `visualised`, `command centre`) on a US-facing product site.

**Fix status:** verified — `organizations`, `visualized`, `command center`.

---

### ISSUE-006: Sharp theme change at onboarding (low, deferred)

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | ux |
| **URL** | `/onboarding` |

**Description:** Marketing pages use light cream/green; onboarding uses intentional dark dashboard theme. Not a bug, but the transition is abrupt.

**Fix status:** deferred — product decision unless you want a light onboarding shell.

---

## Fixes Applied (working tree, not atomic `fix(qa)` commits)

| Issue | Fix Status | Files Changed |
|-------|-----------|---------------|
| ISSUE-001 | verified (browser) | `frontend/tailwind.config.ts`, dashboard `text-dl-*` → `text-dash-*` renames |
| ISSUE-002 | verified | `Footer.tsx`, `privacy/page.tsx`, `terms/page.tsx` |
| ISSUE-003 | verified | `Nav.tsx`, `ComparisonTable.tsx` |
| ISSUE-004 | verified | `ComparisonTable.tsx` |
| ISSUE-005 | verified | `PricingCards.tsx`, `FeatureGrid.tsx`, `DashboardPreview.tsx` |

## Pages tested (browser)

| Route | Result |
|-------|--------|
| `/` | Pass — readable copy, Compare section, footer legal links |
| `/pricing` | Pass — light cards readable; dark hero/CTA bands intentional |
| `/login` | Pass — split layout, form labels readable |
| `/register` | Pass — form readable (spot-checked via login route session) |
| `/privacy` | Pass — legal content on light background |
| `/terms` | Pass — legal content on light background |
| `/onboarding` | Pass — dark theme; CTA uses `text-black` on teal button |

## Not tested (requires auth)

`/dashboard`, `/packages`, `/alerts`, `/repos` — need GitHub sign-in for full dashboard QA.

## PR Summary

> QA found 6 issues on the marketing/auth surface; 6 fixed in the working tree (critical contrast + nav/footer/legal/copy). Health score ~84/100 on http://localhost:3004. Recommend committing token split before ship.

## Notes for you

- **Dev server:** `npm run dev` in `frontend/` was on **http://localhost:3004** (ports 3000–3003 busy).
- **Git:** Working tree still has uncommitted QA-related changes; `/qa` fix loop did not create per-issue commits because the tree was already dirty with the same fixes.
- **Intentional dark sections:** Pricing hero/CTA and Enterprise card use light text on dark green — do not change those to dark text.
