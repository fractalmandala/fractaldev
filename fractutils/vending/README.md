# fractal-svelte

Scaffold an agent-ready SvelteKit + Svelte 5 + CUBE CSS + indented SASS project —
and ship the agent with it.

The scaffolded project contains a **zero-dependency CLI** that routes a task to the
skills that matter, serves component recipes and the project's real design tokens,
and writes verification receipts. No npm dependency, no plugin install, no network.

[NPM](https://www.npmjs.com/package/fractal-svelte-scaffold)

## Usage

```sh
npx fractal-svelte my-app
cd my-app
pnpm dev
```

Wire an existing project instead:

```sh
cd my-existing-app
npx fractal-svelte init
```

`init` copies the armory to `.fractal-agentic/`, adds a `fa` npm script, and writes
or appends to `AGENTS.md`. It never overwrites your existing `AGENTS.md`.

## The agent CLI

Inside a scaffolded project, the agent starts every non-trivial task the same way:

```sh
pnpm fa route "add an accordion to the docs page"
```

```
route    component-build
entry    agentic-svelte-builder

required skills (load these, in order):
  - svelte-5-runes
  - svelte-components-patterns
  - svelte-styling-patterns

conditional skills (load only if the condition holds):
  - if component is interactive: frontend-a11y
  - if component animates: motion-foundations, motion-patterns

verification required: static, build, runtime
```

22 skills ship on disk. A typical task loads two or three. That is the point.

| Command | Purpose |
| --- | --- |
| `fa route "<task>"` | Resolve a task to the exact skills to load |
| `fa contract` | The non-negotiable output rules |
| `fa component --list` / `fa component <name>` | 54 component recipes, native and Svelte 5 |
| `fa skill --list` / `fa skill <name>` | Skill payloads, with superseded skills flagged |
| `fa docs --list` / `fa docs <topic>` | Tutorials, how-to guides, reference |
| `fa tokens` | The project's **real** design tokens, read from `tokens.sass` |
| `fa verify --all` | Run checks, write a receipt |
| `fa doctor` | Armory integrity — broken links, missing recipes, index drift |

Flags: `--dense` (token-efficient output), `--json` (machine-readable).

Every command returns the same shape: `status`, `summary`, `next_actions`,
`artifacts`, `payload`. Errors carry recovery hints, not just a message.

## What it scaffolds

- SvelteKit + TypeScript + pnpm, runnable out of the box
- Svelte 5 runes, no legacy reactivity
- Indented SASS everywhere (single-tab `.sass`, zero `<style>` blocks)
- CUBE CSS two-layer token system (primitive → semantic), light/dark via `data-theme`
- Composition utilities (`.stack`, `.cluster`, `.grid`, `.center`, `.frame`)
- `fractals-styler` JIT utility-class plugin wired into Vite
- No-FOUC theme script + runes-based theme state
- Starter components (Button, Card, Accordion, ThemeToggle)
- App shell: Navigation + Footer + error page
- `AGENTS.md` + `.fractal-agentic/` armory: CLI, routing contract, 22 skills, 54 recipes, docs

## Flags

```
fractal-svelte <project-name> [options]
fractal-svelte new <project-name> [options]

  -t, --template <name>   template to use (default: default)
  --no-git                skip git init
  --no-install            skip pnpm install

fractal-svelte init [--force]    wire an existing project
fractal-svelte <fa-command> ...  run any agent command
```

## Verification model

`pnpm check` proves types compile. It does not prove the route renders. Three
layers, always recorded separately:

| Layer | Command | Proves |
| --- | --- | --- |
| static | `pnpm check` | TypeScript + Svelte template validity |
| build | `pnpm build` | production compilation, SSR bundling |
| runtime | `pnpm dev` + exercise the route | page renders, console clean |

`fa verify` writes `.fractal-agentic/receipts/latest.json` and defaults runtime to
`not-run` — an unverified route never becomes a pass, and a receipt with an
unverified layer never returns `ship`.

## Development

```sh
pnpm build          # compile CLI to dist/
pnpm check          # typecheck
pnpm test           # routing suite + results ledger + armory doctor
pnpm smoke          # scaffold a __smoke__ project
pnpm doctor         # armory integrity
pnpm sync:index     # regenerate armory/skills/INDEX.md from disk
```

`armory/routing.json` is the single routing contract. `armory/skills/INDEX.md` is
generated — never edit it by hand. `prepublishOnly` runs the typecheck, the build,
an index staleness check, and the full test suite.

## License

MIT
