# Scaffolding guide

How to build things with the system that already exists here. Every command
below was run and verified on 2026-08-13.

Three tools do the work:

| Tool | Scaffolds | Lives in |
|---|---|---|
| `fractal-svelte` | whole projects | `fractal-svelte-scaffold/` |
| `fractals-styler` | the SASS system | published on npm, v2.2.1 |
| `pnpm fa` | components, routes, docs — inside a project | `.fractal-agentic/` |

---

## 1. A new project

```bash
fractal-svelte my-site
```

That is the whole command. It copies a template, substitutes tokens, runs
`git init`, and runs `pnpm install`.

```bash
fractal-svelte my-site --no-install      # skip pnpm install
fractal-svelte my-site --no-git          # skip git init
fractal-svelte my-site -t mandala-docs   # pick a template
```

You get a project that builds and type-checks with nothing else done to it:

```
my-site/
├── docs/                    markdown → pages
├── src/
│   ├── lib/
│   │   ├── components/      Button, Card, Accordion, ThemeToggle
│   │   ├── layout/          Navigation, Footer
│   │   ├── styles/          fractals-styler partials + app.sass
│   │   └── utils/           theme.svelte.ts
│   └── routes/
├── .fractal-agentic/        22 skills, 54 recipes, the agent CLI
└── AGENTS.md
```

### Tokens available in template files

| Token | `fractal-svelte my-site` becomes |
|---|---|
| `{{name}}` | `my-site` |
| `{{AppName}}` | `My Site` |
| `{{pkg-name}}` | `my-site` |
| `{{pkgName}}` | `mySite` |

---

## 2. Making your own template

**A template is just a directory.** Nothing registers it, no manifest, no config.

```
fractal-svelte-scaffold/templates/
├── default/
└── your-template/          ← drop it here, it works
```

The recipe:

1. Build a real site until you like it. Do not start from a template.
2. Copy it into `templates/<name>/`.
3. Replace your project's name with `{{name}}` and its display name with
   `{{AppName}}` in `package.json`, `<title>` tags, and headers.
4. Delete `node_modules/`, `.svelte-kit/`, `build/`, and any lockfile you do not
   want pinned.
5. `fractal-svelte test-it -t <name>` and confirm it builds.

Templatize *after* you have something that works — you cannot guess the shape in
advance, and a broken template is worse than none.

---

## 3. An existing project

```bash
cd /path/to/existing-sveltekit-app
fractal-svelte init            # --force to overwrite an existing armory
```

Copies the agent armory to `./.fractal-agentic`, adds the `fa` npm script, and
writes `AGENTS.md`. It does not touch your source.

---

## 4. The agent surface

This is where the repetition actually goes away. Inside any scaffolded project:

```bash
pnpm fa route "add a tabs component"
```

```
task     add a tabs component
route    component-build
entry    agentic-svelte-builder

required skills (load these, in order):
  - svelte-5-runes
  - svelte-components-patterns
  - svelte-styling-patterns

conditional skills (load only if the condition holds):
  - if component is interactive (keyboard, focus, or ARIA state): frontend-a11y
  - if third-party library, web component, or advanced form: svelte-components
  - if component animates: motion-foundations, motion-patterns

hard policies:
  + externalSass
  - allowComponentStyleBlocks
  - allowInlineStyles
  - allowClassDirectives
```

`route` is the entry point — it decides what to load so you do not have to.

| Command | Gives you |
|---|---|
| `pnpm fa route "<task>"` | which skills to load, and the policies in force |
| `pnpm fa contract` | the non-negotiable output rules |
| `pnpm fa component <name>` | a full component recipe (54 available) |
| `pnpm fa skill <name>` | one skill's payload (22 available) |
| `pnpm fa docs <topic>` | a how-to guide |
| `pnpm fa tokens` | **the project's real token names** |
| `pnpm fa verify --all` | run checks, write a receipt |
| `pnpm fa doctor` | armory integrity check |

Add `--dense` for token-efficient output, `--json` for machine-readable.

Outside a project, the same commands work as `fractal-svelte route "..."`.

### `fa tokens` is the one to actually use

```bash
pnpm fa tokens
```

An undefined CSS custom property **fails silently** — the rule simply does
nothing, the build passes, and the page looks wrong. This happened twice while
building `mandala-docs`. Run `fa tokens` before writing any token name rather
than trusting memory.

> **Known wrinkle:** the semantic/primitive split in its output is wrong for
> `fractals-styler`. It classifies by "does the value reference another var",
> so `--text-md: 14px` and `--space-4` land under "primitive (never consume
> directly)" when they are exactly what you should consume. Read the names, not
> the headings.

---

## 5. Styles

```bash
pnpm add fractals-styler
pnpm exec fractals-styler init                   # → src/lib/styles/
pnpm exec fractals-styler init src/lib/theme     # custom path
pnpm exec fractals-styler init --force           # overwrite (clobbers edits)
```

Then add the Vite plugin:

```ts
import { fractalsStyler } from 'fractals-styler';

export default defineConfig({
	plugins: [fractalsStyler(), sveltekit()],
	optimizeDeps: { exclude: ['fractals-styler'] }
});
```

### The scale

| Family | Range |
|---|---|
| `--space-1` … `--space-24` | 4px → fluid clamp |
| `--text-xs` … `--text-5xl` | 10px → fluid clamp |
| `--radius-0` … `--radius-full` | 0 → 9999px |
| colour | `--bg`, `--bg-surface`, `--bg-raised`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--theme` |

There is no `--fs-*`, `--s-*` or `--r-*`. Theming is `data-theme="light|dark"`
on the root element, with `prefers-color-scheme` as the fallback.

### JIT utilities

The Vite plugin scans your markup and emits numeric utilities on demand:

```svelte
<div class="row ycenter gap16 pad24 maxw720">
<div class="pad8 pad24-lg">        <!-- breakpoint suffix -->
```

Prefixes: `pad`, `padtop`, `padbot`, `padleft`, `padright`, `margin*`, `gap`,
`cgap`, `rgap`, `width`, `minw`, `maxw`, `height`, `minh`, `maxh`.
Suffixes: `-sm` 640px, `-md` 768px, `-lg` 1024px, `-xl` 1280px.

> **Trap:** only *flat* utilities take a breakpoint suffix. `.grid.grid-cols-3`
> is a nested modifier, so **`grid-cols-3-lg` emits nothing at all** — silently.
> Use an auto-fit grid, or a `+bp-lg` mixin in your own class.

### Compositions

`.appshell` `.appheader` `.appbody` `.bodymain` `.appfooter` — `.appbody`
switches to two or three columns from its `data-left` / `data-right` attributes.
Plus `.stack`, `.cluster`, `.with-sidebar` (`> .rail` + `> .flow`), `.reel`,
`.box`, `.row`, `.grid`.

---

## 6. Docs from any markdown tree

```bash
node scripts/ingest-docs.mjs /path/to/any/markdown --clean
node scripts/ingest-docs.mjs ~/notes --into content
```

It never overwrites what you wrote. On the 142-file corpus: **141 kept their
existing frontmatter, 1 was derived** from its `# H1`.

| Source has | Ingest does |
|---|---|
| frontmatter | keeps it verbatim; adds `title` only if missing |
| no frontmatter | derives `title` from the first H1, `description` from the lede |
| a body `# H1` | removes it (the route renders the title) |
| `INDEX.md` | normalises to `index.md` so it becomes the folder landing page |
| `[x](./y.md)` | rewrites to `[x](y/)` so it resolves as a route |
| nesting | preserved — directories become nav sections |

`--clean` wipes the target first, **including a hand-written `docs/index.md`**.
Back that file up, or keep it outside the ingest target.

### Wiring it up

`src/lib/docs/source.ts` turns the tree into navigation — the filesystem *is*
the nav, so there is no `nav.ts` to maintain:

```ts
export const docs = createDocsContentSource({
	documents: /* import.meta.glob over docs/**/*.md */,
	config: defineDocsConfig({
		title: 'Components',
		baseHref: '/docs',
		folders: { svelte: { title: 'Svelte 5', defaultOpen: true } }
	})
});
```

`folders` is presentation only — human names, ordering, badges. Omit it and
folder names are humanized automatically.

> **Trap:** `docs.entries()` returns **hrefs**, not slugs. Feeding it to a
> `[...slug]` param produces `/docs/docs/...`. Use `docs.documents.map(d =>
> d.slug)` instead.

> **Trap:** resolve the document component in `+page.ts`, not in an `{#await}`
> block in the page. A universal load re-runs on the client so it may return a
> component; awaiting in the page hydrates the pending branch and then swaps,
> which breaks Svelte's hydration walk outright — `node.remove is not a
> function`, and every page stuck on "Loading…".

### Acrolls CLI

```bash
cd /Users/amrit/fractalmandala/acrolls && pnpm install && pnpm build
cd /path/to/your-app
node /Users/amrit/fractalmandala/acrolls/packages/cli/dist/index.js onboard \
  --docs-dir docs --base-href /docs
```

`onboard` is a read-only walkthrough — it prints each file, code block and
verification step without writing anything. Also: `validate <file|dir>`,
`integrate --dry-run`, `studio <file>`.

```bash
acrolls validate ./docs --mode migration --on-invalid error-page \
  --report acrolls-report.json
```

Worth running on any imported corpus before you wire it in.

---

## 7. Verifying — build and check are not enough

This is the part that costs the most time when skipped.

On `mandala-docs`, `pnpm build` **passed** and `pnpm check` reported
**0 errors** on a site where every single page was a dead 500 in the browser. A
module-scope `$effect` threw `effect_orphan` at hydration; SSR still returned
200, so neither tool ever saw it.

The gate that actually works:

```bash
pnpm build                                   # 1. compiles
pnpm check                                   # 2. types
pnpm dev --port 5197 &                       # 3. serve it
curl -s -o /dev/null -w "%{http_code}" localhost:5197/   # 4. status
# 5. load it in a browser and read the console
```

Steps 3–5 are the ones that find real bugs. Everything caught while building
`mandala-docs` — the hydration crash, the flat Shiki output, the invisible
tokens, the staggered grid — was invisible to steps 1 and 2.

And measure rather than eyeball. Screenshots lie:

```js
getComputedStyle(el).color        // truth
el.getBoundingClientRect()        // truth
```

---

## 8. Traps worth remembering

| Symptom | Cause |
|---|---|
| Page 500s, build passes | `$effect` at module scope in a `.svelte.ts` — needs a component owner |
| A rule does nothing | Undefined custom property. Run `pnpm fa tokens` |
| `grid-cols-3-lg` does nothing | Nested modifiers cannot take breakpoint suffixes |
| Grid rows staggered | A `.gap-N > * + *` margin rule stacking on top of grid `gap` |
| Code blocks render flat | Shiki dual-theme emits `--shiki-light`/`--shiki-dark`, not `color:`. The host must bind them |
| `node.remove is not a function` | `{#await}` hydrating its pending branch, then swapping |
| `/docs/docs/...` | `docs.entries()` returns hrefs, not slugs |
| Title printed twice | Route renders frontmatter title *and* body kept its `# H1` |

---

## 9. Open items

- **`templates/mandala-docs` does not exist yet.** The site depends on acrolls
  via `file:../acrolls/packages/*`, which only resolves from inside
  `/Users/amrit/fractalmandala/`. Publish those packages, or document the
  workspace assumption, before this is a template worth shipping.
- **`fractals-styler` dark theme fails WCAG AA for body text.**
  `--text-secondary: #666767` on `--bg: #131313` measures **3.27:1**; AA needs
  4.5:1. Headings and nav are fine at 17.78:1. This is in the published package,
  so it affects every site built on it.
- **`fa tokens` misclassifies** the semantic/primitive split for
  `fractals-styler` — see section 4.
