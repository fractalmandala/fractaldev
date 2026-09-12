# Svelte Style Canvas — user guide

**Skill id:** `svelte-style-canvas`  
**Location:** `packages/fractal-agentic/skills/svelte-style-canvas/`  
**Audience:** humans (and agents acting for them) who want to *see* which styles apply to a Svelte component or page, without running the full app.

This document is the **user-facing** guide. Agent execution rules live in [SKILL.md](./SKILL.md). Machine contract for the JSON pack lives in [references/style-pack-schema.md](./references/style-pack-schema.md).

---

## What it is

Svelte Style Canvas is a Fractal Agentic **skill**. When you point an agent at a Svelte/SvelteKit component or page, the agent:

1. Reads the markup (layout regions, classes, state classes).
2. Resolves those classes against your external SASS/CSS and design tokens.
3. Builds a **markup-faithful HTML mock** (`visualHtml`) styled with a **resolved CSS subset** (`cssSubset`) — not a text outline of region labels.
4. Writes three artifacts under `vendors/style-previews/<slug>/`:
   - **`preview.html`** — offline interactive **visual** mock of the layout and styles
   - **`style-pack.json`** — structured evidence (regions, classes, tokens, orphans) **plus** `visualHtml` / `cssSubset`
   - **`report.md`** — short human summary of what was found and what is unresolved

### What “workable” means

A good preview shows the actual chrome and content layout: headers, panels, cards, type, colors from your tokens. Click a region → inspector shows classes and file:line. State buttons toggle real CSS classes on the mock.

A **bad** preview (bug / incomplete run) is nested dashed boxes labeled like `Shell — tree fallback`. That is the emergency fallback when `visualHtml` was missing — reject it and re-run the skill.

It is **not**:

- A full Svelte runtime (no real runes data, no live IPC, no full app shell unless you include layout parents)
- An architecture / data-flow map (use flow-mapper for that)
- A redesign of your UI

Default fidelity is **L1**: the agent reconstructs a CSS subset from source and hand-builds the mock HTML. That is usually good enough to understand structure, tokens, and which rules “own” a region. It is **not** a guarantee of pixel-perfect match to the running app.

---

## When to use it

Use this skill when you want answers like:

- “What styles are actually working on this component?”
- “Show me a quick visual prototype of this page chrome from source.”
- “Which classes are orphans / missing definitions?”
- “Open a style playground for `ProjectSidebar`.”

### Good prompts

```text
Use svelte-style-canvas on apps/shradhapp/src/lib/components/ProjectSidebar.svelte

Style preview of apps/fractalengine/src/lib/components/AppDock.svelte

What styles hit this page? apps/fractalengine/src/routes/+page.svelte
Include the root layout if needed for chrome.

/svelte-style-canvas apps/foo/src/lib/components/Bar.svelte
```

### Prefer a different skill instead

| You want… | Use instead |
| --- | --- |
| Architecture / containment edges, data flow | `fa-flow-mapper` or monorepo `flow-mapper` |
| Mermaid-only layout diagrams | `layout-capture` |
| Full design-system docs / class registry markdown | `styling-docs-builder` |
| Redesign or polish the real product UI | Design workflow (`impeccable`, `better-ui`, …) |
| Port a component into the library | `port-component` |

---

## Prerequisites

- A Svelte or SvelteKit project (this monorepo or any similar layout).
- Styles you care about usually live in **external** indented SASS (e.g. `src/lib/styles/**/*.sass`). In-file `<style>` is still scanned if present.
- An agent that can read this skill (plugin path or project `.grok/skills/svelte-style-canvas`).

---

## How to run it

### 1. Name a target

Give a concrete path to a component, `+page.svelte`, or layout.

### 2. Ask the agent to use the skill

```text
Load svelte-style-canvas and run it on <path>.
```

### 3. Open the preview

```bash
open vendors/style-previews/<target-slug>/preview.html
```

`vendors/` is **gitignored** at the monorepo root. **Never** write artifacts into app `src/`.

Outside this monorepo, agents may use `./style-previews/<slug>/` instead.

---

## What you get

```text
vendors/style-previews/<target-slug>/
  preview.html
  style-pack.json
  report.md
```

### Inside `preview.html`

| Area | Purpose |
| --- | --- |
| Header | Title, target path, fidelity badge, **mode: visual** (required) |
| States toolbar | Toggle `class:` / structural variants on the mock |
| Stage | **Real HTML mock** (`visualHtml`) styled by injected `cssSubset` |
| Inspector | Click region → classes, file:line, tokens, orphans |

Controls: state buttons, **Reset**. Offline (no CDN).

If the header says **mode: tree-fallback**, the pack is incomplete — re-run with visual markup.

### Confidence

| Level | Meaning |
| --- | --- |
| observed | Rule/token found at a cited path/line |
| inferred | Reasonable reconstruction without full proof |
| unresolved | Used in markup but not found / not reconstructable |

**Orphan classes** = used in markup, no definition in scanned styles.

### Fidelity

| Level | Meaning | Status |
| --- | --- | --- |
| L1 | Agent-resolved SASS/CSS subset | Default |
| L2 | Compile / extract used selectors | Planned |
| L3 | Playwright `getComputedStyle` | Planned |

---

## Scope tips

1. One component first; add layout chain if chrome is missing.
2. Name the theme if multiple exist (`theme-amrit-dark`, etc.).
3. Ask for orphans explicitly when cleaning class debt.
4. Keep “preview from source” separate from “restyle this.”

---

## Package files

| Path | Role |
| --- | --- |
| [SKILL.md](./SKILL.md) | Agent instructions |
| **USERDOCS.md** (this file) | Human guide |
| [assets/preview-template.html](./assets/preview-template.html) | HTML shell |
| [references/style-pack-schema.md](./references/style-pack-schema.md) | JSON schema |
| [references/related-skills.md](./references/related-skills.md) | Compose map |

---

## Troubleshooting

| Symptom | Try |
| --- | --- |
| Agent does not know the skill | Point at this folder’s `SKILL.md` or install under `.grok/skills/` |
| **Stage is nested label boxes / “tree fallback”** | Pack missing `visualHtml` — re-run the skill; agent must emit markup-faithful HTML + CSS |
| Header shows **mode: tree-fallback** | Same as above — incomplete deliverable |
| Empty / unstyled boxes | Check orphans in `report.md`; confirm styles under `src/lib/styles` and non-empty `cssSubset` |
| Broken preview | Devtools console — invalid `#ssc-style-pack` JSON |
| Not in git | Expected for `vendors/` artifacts |

---

## Quick reference

```text
Skill:     svelte-style-canvas
Input:     path to .svelte (+ optional layouts)
Output:    vendors/style-previews/<slug>/{preview.html, style-pack.json, report.md}
Required:  visualHtml + cssSubset in the pack (real UI mock, not region labels)
Open:      preview.html in any browser (mode: visual)
Fidelity:  L1 (source-derived CSS subset + markup mock)
Not for:   architecture maps, full redesign, pixel-perfect QA
```
