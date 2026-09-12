---
title: Rooms — the four-page site deconstruction
description: markgraphy-pages-2.html + markgraphy-pages.js deconstructed into Svelte 5 rooms wired at src/routes/(rooms)/ — /stage, /set, /set/[slug], /rules, /install
type: markgraphy
---

# Rooms — the four-page site deconstruction

Status: implemented — pending user evaluation.

The reference mockup (`markgraphy-pages-2.html` + `markgraphy-pages.js`, a
hash-routed SPA with one global stylesheet and an imperative glyph-painting
engine) is deconstructed into a SvelteKit route group at `src/routes/(rooms)/`,
wired on 2026-09-06. Svelte 5 runes, `$site`/`$lib` aliases, real URLs. All six
`.svelte` files compile clean in forced runes mode (zero warnings); after the
move, `pnpm check` reports 0 errors / 0 warnings and `pnpm build` completes
including the new routes.

## File inventory (mockup → file)

| Mockup view | File | Notes |
| --- | --- | --- |
| hud + footer + body grid | `src/routes/(rooms)/+layout.svelte` | brand, primary nav, accent dots, install chip, skip link, grid backdrop, shared room vocabulary |
| (shared) `colorize()` | `src/routes/(rooms)/lib/colorize.ts` | naive `.tok` tint for usage snippets; no highlighter dependency |
| `page-stage` (observatory, wall, principles, close) | `src/routes/(rooms)/stage/+page.svelte` | room 01 |
| `page-set` (cabinet) | `src/routes/(rooms)/set/+page.svelte` | room 02 |
| `page-component` (detail) | `src/routes/(rooms)/set/[slug]/+page.svelte` | dynamic detail, real URLs |
| `page-rules` (grammar) | `src/routes/(rooms)/rules/+page.svelte` | room 03 |
| `page-install` (bench) | `src/routes/(rooms)/install/+page.svelte` | room 04 |

## Mapping decisions

- **Hash router → real routes.** `#stage/#set/#rules/#install/#graph-*`
  become `/stage`, `/set`, `/rules`, `/install`, `/set/[slug]`. The mockup's
  `localStorage` page restore and `history.replaceState` disappear — SvelteKit
  owns the URL. Nav `aria-current` derives from `page.url.pathname`.
- **Glyph-painting engine → real components.** `renderRain/renderFire/…` and
  the `arts` map are replaced by `$site/docs/previews` live mounts (the same
  registry the docs and home wall use). The vitrine, cabinet plate, detail
  plate, and wall tiles all mount real library components. Reduced-motion
  handling for the marching frame lives in the pages' `march` keyframes guard.
- **`specimens` array → `$site/docs/catalog`.** Families derive from the
  catalog (`graph-frame` → frame, `*Diagram` → diagrams, animated set →
  animated, else graphs); props tables render via `$site/components/docs/props-table.svelte`.
- **Mockup tokens → site tokens.** `--bg/--surface/--fg/--muted/--faint/
  --border/--accent/--accent-2/--graph-bg/--font-display` map to
  `--bg/--bg-surface/--text-primary/--text-secondary/--text-muted/--border/
  --graph-accent/--graph-accent-2/--bg-raised/--font-sans`. Accent dots call
  `$site/lib/accents` `setAccent` (the mockup's inline `--accent` mutation is
  gone); the four dots map to the `fractal/green/cyan/orange` accents.
- **Buttons.** Mockup `.primo`/`.ghost-btn` are the global `.primo`/`.ghost`
  utilities from `src/site/global.sass`; copy actions use
  `$site/components/docs/copy-code.svelte`. Mockup `.ghost` (muted text) is
  renamed `.dim` because `.ghost` is a global button class here.
- **Shared class vocabulary lives in the layout** under `.room :global(...)`
  (same pattern as `docs/+layout.svelte`): `h1`, `.page-head`, `.lede`,
  `.kicker` spacing, `.tok`, `.dim`, `.rule`, `.caption`, `.import-box`,
  `.cta-row`, `.right`. Everything else is page-scoped.
- **Rules demos are live props.** Glyph set tabs drive `GraphRank glyphs`,
  corner tabs drive `Graph corner`, palette tabs drive `GraphStack palette` —
  the mockup's fake glyph rows become real component states.

## Class inventory per file

- `+layout.svelte` — owns: `.skip`, `.shell`, `.hud`, `.brand`, `.brand-mark`,
  `.brand-ver`, `.nav`, `.hud-right`, `.accents`, `.accent-dot`,
  `.install-chip`, `.room` (+`::before` grid), `footer`; global vocabulary:
  `h1`, `.page-head`, `.lede`, `.kicker`, `.tok`, `.dim`, `.rule`, `.caption`,
  `.import-box`, `.cta-row`, `.right`.
- `stage/+page.svelte` — `.observatory`, `.stage`, `.vitrine`, `.live`,
  `.dossier`, `.meta-row`, `.spec-list`, `.film`, `.film-label`, `.clips`,
  `.clip`, `.mini`, `.name`, `.section`, `.section-head`, `.wall`, `.tile`,
  `.span`, `.scroll`, `.open`, `.principles`, `.principle`, `.idx`, `.close`,
  `.close-meta`; reuses `CopyCode`, `GraphActivity`, `previews`,
  `instruments`, `commits`, `colorize`.
- `set/+page.svelte` — `.set`, `.cabinet`, `.index`, `.index-tools`, `.find`,
  `.tabs`, `.tab`, `.index-list`, `.spec-btn`, `.fam`, `.empty`,
  `.plate-wrap`, `.plate`, `.art`; reuses `CopyCode`, `catalog`, `previews`,
  `colorize`.
- `set/[slug]/+page.svelte` — `.detail`, `.comp-layout`, `.comp-stage`,
  `.plate`, `.art`, `.file-path`, `.comp-side`, `.props-label`, `.missing`;
  reuses `CopyCode`, `PropsTable`, `getComponent`, `previews`, `colorize`.
- `rules/+page.svelte` — `.rules`, `.grammar`, `.rule-plate`, `.rule-copy`,
  `.rule-idx`, `.rule-demo`, `.controls`, `.mark-btn`, `.demo-art`, `.dont`;
  mounts `Graph`, `GraphBody`, `GraphRank`, `GraphStack`.
- `install/+page.svelte` — `.install`, `.bench`, `.station` (`.on`),
  `.st-num`, `.pkg`, `.tab`, `.cmd`, `.live-row`, `.plate`, `.svx`, `.tokens`,
  `.token-bay`, `.token`; mounts `GraphStat`, reuses `CopyCode`.

## Wiring (done 2026-09-06)

The route tree was moved (not copied) from the staging folder into
`src/routes/(rooms)/` — the group keeps its own `+layout.svelte` and
`lib/colorize.ts`; no duplicate remains to drift. `pnpm check` reports
0 errors / 0 warnings and `pnpm build` completes with the new routes.

`src/site/` styling was not modified; existing components keep their styles
untouched.

## Docs list (added 2026-09-06)

The four rooms are listed in the site's docs navigation, driven by a new
`rooms: NavLink[]` export in `src/site/docs/catalog.ts`:

- Docs rail (≥1024px): a `[ rooms ]` group between *get started* and
  *graphs* — Stage, Set, Rules, Install (`/stage`, `/set`, `/rules`,
  `/install`), each tagged `room`.
- Mobile strip: the four room chips follow the get-started chips.
- No existing `getStarted` entries, docs pages, or styles were changed.
