---
name: svelte-style-canvas
description: >
  Inspect a Svelte/SvelteKit component or page, resolve which external SASS/CSS
  styles and design tokens actually apply, and generate a self-contained interactive
  HTML canvas preview that approximates the visual layout (regions, colors, spacing,
  type, state variants). Use whenever the user asks to preview styling, open a style
  canvas, generate a component/page mock from source, understand what styles are
  working on a Svelte file, build an interactive style prototype, or says things like
  "style preview of X", "canvas prototype of this component", "what styles hit this
  page?", "style playground", or "/svelte-style-canvas". Prefer this over layout-capture
  or flow-mapper alone when the goal is visual/style fidelity, not architecture edges.
---

# Svelte Style Canvas

Produce an **evidence-based, style-aware interactive HTML prototype** of a Svelte
component or page. This is not a full Svelte runtime and not an architecture node map.

**Bidirectional design loop:** For Open Design packages and code↔design round-trips,
use **`code-to-design`** (`preprojects/code-design-loop/`). This skill is L1/L2
**forensics and evidence**, not the design host.

## Hard requirement: visual markup (not a text tree)

The preview **must** look like the UI — real HTML structure + resolved CSS — not nested
label boxes describing regions.

| Field | Required | Role |
| --- | --- | --- |
| **`visualHtml`** | **YES** | Markup-faithful HTML mock of the target (and layout chrome if in chain). Every inspectable node has `data-ssc-id` matching a `regions[]` entry. Root of the mock uses `data-ssc-root` when theme classes apply. |
| **`cssSubset`** | **YES** | CSS that styles that markup (tokens + observed rules). Injected into the template style block. |
| `regions` | yes | Evidence for the inspector (ids, classes, file:line). **Not** the primary stage render. |
| `states` | yes (may be empty) | Toolbar toggles that add/remove classes on `[data-ssc-id="…"]` nodes. |

**Fail the run** (do not claim done) if `visualHtml` is empty or only a nested list of
region labels. The template’s region-tree path is a **degraded fallback** for broken packs —
never ship that on purpose.

**How to build `visualHtml`:**

1. Start from real markup structure in the target `.svelte` (and layout parents if included).
2. Flatten Svelte-only syntax: replace components with static HTML approximations (icons →
   SVG/emoji placeholders; `{#if}` → default/home branch; `{@render}` → expanded child mock).
3. Keep real class names from source so `cssSubset` applies.
4. Stamp `data-ssc-id="rN"` on regions you invent evidence for.
5. Prefer readable content strings from the source (headings, body copy) over placeholder “Lorem”.

**User-facing documentation:** [USERDOCS.md](./USERDOCS.md) — when to use, how to
invoke, how to open and interpret `preview.html`, limitations, and troubleshooting.
Point humans at USERDOCS; keep this file as the agent execution contract.

**Composes** (read when needed — do not re-implement their full workflows):

| Skill | Use for |
| --- | --- |
| [styling-docs-builder](../svelte-styling-patterns/SKILL.md) | Class → SASS definition, tokens, orphan classes |
| [layout-capture](../svelte-components-patterns/SKILL.md) | DOM / region hierarchy semantics |
| [fa-flow-mapper](../../PLAYBOOK.md) | Canvas interaction patterns, evidence discipline |

When installed outside the plugin tree (e.g. `.grok/skills/`), resolve compose targets
under `packages/fractal-agentic/skills/<id>/SKILL.md` in the monorepo root instead of
relative `../` links.

Load progressive references from this skill only when needed:

- [references/style-pack-schema.md](references/style-pack-schema.md) — machine-readable style pack
- [references/related-skills.md](references/related-skills.md) — when to hand off vs compose
- [assets/preview-template.html](assets/preview-template.html) — offline preview shell
- [USERDOCS.md](./USERDOCS.md) — human guide (do not skip when the user needs usage docs)

## Objective

Given a target `.svelte` file (and optional layout chain):

1. Build a **region tree** for evidence (containers that matter for layout + inspector).
2. Collect classes, `class:` states, and structural conditions (`{#if}`, `{#each}`).
3. Resolve each class to SASS/CSS definitions and token dependencies.
4. Build **`visualHtml`** (markup-faithful mock) + **`cssSubset`** (styles for that mock).
5. Emit a **style pack** JSON (`style-pack.json`) including both.
6. Emit a self-contained **preview.html** that injects CSS + pack (stage uses `visualHtml`).
7. Emit a short **report.md** with unresolved styles and confidence notes.

Do **not** invent rules that are not in the source. Do **not** claim pixel-perfect
browser fidelity at L1 (default). Mark confidence: `observed` | `inferred` | `unresolved`.

## When not to use

| Need | Prefer |
| --- | --- |
| Architecture edges / data flow canvas | `fa-flow-mapper` / monorepo `flow-mapper` |
| Mermaid-only layout diagrams | `layout-capture` |
| Living design-system markdown only | `styling-docs-builder` |
| Redesign / polish the real UI | Design boss + `impeccable` / `better-ui` |

## Scope discovery

1. Resolve the **target** path the user named (component, `+page.svelte`, layout).
2. Optional **chain**: parent `+layout.svelte` files when the user asks for a page shell,
   or when the page is empty without layout chrome.
3. Locate styles for the workspace:
   - Prefer `src/lib/styles/**/*.sass` (indented SASS, monorepo default)
   - Also scan co-located `*.sass` / `*.css` and in-file `<style>` if present
4. Cap depth: default **one component + direct layout parents**. Expand child components
   only one level deep unless the user asks for a full page tree.

If the path is ambiguous, ask once for the exact file. Do not full-scan the monorepo.

## Pipeline

### Phase 1 — Structure inventory

Read the target Svelte file fully (not Grep-only). Extract:

- Outer semantic regions (shell, header, sidebar, main, footer, panels, lists, empty states)
- Element / component tag, `class` tokens, `class:foo` state names
- Conditions that change layout (`{#if}`, `{:else}`, `{#each}`)
- Child components (name + import path) — treat as leaf regions unless expanded

Assign each region: `id`, `label`, `kind`, `file`, `lineRange`, `classes[]`,
`states[]`, `parentId`, `confidence`.

### Phase 2 — Style resolve

For every class token used:

1. Search stylesheets for `.class-name` (and nested indented forms under parents).
2. Record definition file + line, raw property block (best-effort; convert indented
   SASS property lines to CSS when emitting the pack).
3. Collect referenced CSS custom properties (`var(--*)`) and SASS vars (`$…`).
4. Resolve token **definitions** from token/theme sheets when present.
5. Flag **orphan classes** (used in markup, not found in styles) as `unresolved`.

Do not expand every mixin project-wide. If a rule is mixin-only and unresolvable without
a compiler, mark `inferred` or `unresolved` and explain in the report.

### Phase 3 — Style pack + visual mock

Write `style-pack.json` matching [references/style-pack-schema.md](references/style-pack-schema.md).

Include:

- `meta` (target, date, fidelity level, repo paths; note `"visual markup"` in `notes`)
- `tokens` used by this target
- `classes` registry with evidence
- `regions` tree with applied classes + states (inspector evidence)
- `states` catalog for the preview toggle bar
- **`visualHtml`** — **required** non-empty markup-faithful HTML (see hard requirement above)
- **`cssSubset`** — CSS for that markup (only observed selectors + theme/token blocks used)
- `orphans` / `unresolved`

**Fidelity levels**

| Level | Meaning |
| --- | --- |
| `L1` (default) | Agent-resolved SASS/CSS subset + hand-built visualHtml |
| `L2` | Optional future: sass compile / PostCSS extract of used selectors |
| `L3` | Optional future: Playwright `getComputedStyle` snapshot |

Always set `"fidelity": "L1"` unless you actually used a higher method.

### Phase 4 — Interactive preview

1. Read [assets/preview-template.html](assets/preview-template.html).
2. Replace `/*__SSC_INJECTED_CSS__*/` with `cssSubset` (and any chrome-safe defaults).
3. Replace the JSON inside `<script type="application/json" id="ssc-style-pack">…</script>`
   with the style pack including **`visualHtml`** (valid JSON; escape for embedding).
4. Set document title / header from `meta.title`.
5. Write `preview.html`.

The preview must:

- **Primary stage:** inject `pack.visualHtml` into `#ssc-stage` (template does this when non-empty)
- Style that markup via injected `cssSubset` — classes from the real app, not only chrome CSS
- Provide a **state toggle** bar for discovered `class:` / structural states
- Provide an **inspector** for selected `[data-ssc-id]`: classes, tokens, file:line
- Work **offline** with no CDN deps
- Support scroll of the stage and a **reset** control
- Never invent regions that lack structure evidence
- **Never** leave `visualHtml` empty (tree fallback is failure mode only)

### Phase 5 — Report

Write `report.md`:

1. Scope and assumptions
2. Region tree (brief)
3. Class registry table (class → defined in → tokens)
4. Orphan / unresolved list
5. Paths to artifacts
6. Verification notes
7. Confidence summary

## Deliverable location

Save under the monorepo root (create if missing):

```text
vendors/style-previews/<target-slug>/
  style-pack.json
  preview.html
  report.md
```

Slug: kebab-case from component/page name (e.g. `shradhapp-project-sidebar`).

**Never** write these artifacts into the target app’s `src/`.

If the user is outside a monorepo with `vendors/`, use `./style-previews/<slug>/`
relative to the project root and say so in the report.

## Verification (required before claiming done)

1. Re-read the target Svelte file; every major region has evidence **and** appears in `visualHtml`.
2. `style-pack.json` has non-empty `visualHtml` and non-empty `cssSubset`.
3. Every class in the pack is either resolved or listed as orphan.
4. Open `preview.html` in a browser tool if available (screenshot preferred); otherwise
   state: open file → stage shows real UI layout (not dashed label boxes) → toggle states
   → click two regions → inspector updates. Header badge should read **mode: visual**.
5. Confirm no console-breaking JSON parse errors (valid pack embed).
6. Confirm artifacts live under the deliverable path, not app source.

**Reject / re-run** if the stage looks like nested dashed boxes with labels like
`Shell — tree fallback` — that means `visualHtml` was missing.

## Output to the user

Return:

1. One-paragraph summary of what was previewed (describe the visual layout, not only regions)
2. Paths to `preview.html`, `style-pack.json`, `report.md`
3. Orphan/unresolved highlights
4. Fidelity level and limitations (L1 is approximate)
5. How to open: `open vendors/style-previews/<slug>/preview.html`

## Agent discipline

- Prefer Read over Grep for nesting-aware SASS.
- Keep the style pack honest: `unresolved` is better than fake CSS.
- Do not redesign colors or invent a theme when tokens are missing — show structure
  with neutral fallbacks and flag missing tokens.
- Mandala monorepo: indented SASS, often **zero** in-component `<style>` — external
  sheets are the source of truth.
- **Visual first:** a region inventory alone is not a deliverable. The user asked for a
  canvas prototype — they must see styled markup.
- This skill is **stack-aware content** packaged under Meta portfolio process; do not
  convert product UI in the app as part of the skill unless the user asked to change
  the component itself.
