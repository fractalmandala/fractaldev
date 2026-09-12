# Fractal Svelte — agent entry point

You are working in a **SvelteKit + Svelte 5 + indented SASS + CUBE CSS** project.
This directory is the agent armory: one agent, one contract, one router.

There is a CLI. **Use it instead of reading your way through this directory.**
It is zero-dependency and reads the armory on disk:

```sh
node .fractal-agentic/bin/fa.mjs help     # or: pnpm fa help
```

## The loop

Every non-trivial task runs this loop. Do not skip step 1.

| # | Do | Command |
| --- | --- | --- |
| 1 | **Route** the task. This names the exact skills to load — load no others. | `fa route "<what you were asked to do>"` |
| 2 | **Load** only the skills it named, in the order given. | `fa skill <name> --dense` |
| 3 | **Build**, using recipes and the project's real tokens. | `fa component <name> --dense` · `fa tokens --dense` |
| 4 | **Verify** every layer the route required, then report the receipt honestly. | `fa verify --all` |

`fa route` output is the plan. It returns the entry skill, required skills,
conditional skills with their trigger conditions, the hard policies, and which
verification layers this class of task demands.

## Trivial exemption

A single-sentence answer, a pure explanation, or a "what is X?" question with no
repository change: answer directly. Do not route, do not load skills.

## Progressive disclosure — the point of the CLI

Load context in layers. Each layer is only opened when the previous one demands it.

```
this file (always)
  └─ fa route          names 2-3 skills out of 23
       └─ fa skill     the named SKILL.md only
            └─ skills/<name>/references/*.md   only when that decision comes up
                 └─ fa docs <topic>            only for how-to questions
```

Reading all 23 skills, or opening `references/` before you need a specific
decision, is the failure mode this armory exists to prevent.

## The contract (summary — `fa contract` is authoritative)

`routing.json` holds the machine-readable policies. The CLI enforces them in output;
you enforce them in code.

- **Svelte 5 runes only.** `$state` `$derived` `$effect` `$props` `$bindable`.
  No `$:`, no `svelte/store` `writable`/`readable`.
- **Snippets and `{@render}`.** Never slots.
- **`onclick`,** never `on:click`.
- **External indented SASS.** A sibling `*.sass` imported by the `.svelte` file.
  Single tab, no braces, no semicolons.
- **No `<style>` blocks, no inline `style=""`, no `class:` directives.**
- **No hex fallbacks.** Semantic tokens only — run `fa tokens` to get the real
  names from this project's `tokens.sass`. Never guess a token name.
- **No implicit dependency installation.** Ask before touching `package.json`.
- **Explicit SSR guards** on `window` / `document` / `localStorage` via `browser`
  from `$app/environment`.
- **CUBE grouping:** `class="[ block ] [ layout ] [ utilities ]"`, state via
  `data-state` / `data-variant`.

## Precedence

When guidance conflicts, higher wins:

1. The project's own `AGENTS.md` and existing conventions
2. An explicit user instruction
3. `routing.json` — this armory's contract
4. The entry skill named by `fa route`
5. Required skills, then conditional skills

Some bundled skills are **superseded** — `fa skill --list` marks them. Prefer
`svelte-5-runes` over `svelte-runes`, `svelte-styling-patterns` over
`svelte-styling`, `svelte-components-patterns` over `svelte-components`,
`sveltekit-architecture` over `sveltekit-structure`. Load a superseded skill only
for the narrow case its canonical does not cover.

## Verification is not `pnpm check`

`pnpm check` proves types and templates compile. It does not prove the route
renders. A change is qualified only when its required layers pass:

| Layer | Command | Proves |
| --- | --- | --- |
| static | `pnpm check` | TypeScript + Svelte template validity |
| build | `pnpm build` | production compilation, SSR bundling |
| runtime | `pnpm dev` + exercise the route | page renders, console is clean |

`fa verify --all` runs static and build and writes a receipt to
`.fractal-agentic/receipts/latest.json`. **Runtime is yours to perform.** If you
cannot reach a browser, report `runtime: not-run` — never convert an unverified
route into a pass.

Close with exactly one verdict: **ship** (all required layers passed) ·
**fix-first** (bounded, actionable failure) · **rethink** (the target or boundary
was misunderstood).

## Before editing

State the bounded change surface. Preserve existing routes, layouts, and imports
unless the request explicitly authorizes replacing them. A polished component in
the wrong location is a failed task.

## Maintaining this armory

`fa doctor` checks integrity: broken links, skills referenced but not bundled,
component recipes whose files are missing, and index drift. It must be clean
before shipping a change to the armory — an agent that follows a dead link is a
harness failure, not a model failure.

## What is here

- [`routing.json`](./routing.json) — the single routing contract. All routing lives here.
- [`bin/fa.mjs`](./bin/fa.mjs) — the CLI. Zero dependencies.
- [`PLAYBOOK.md`](./PLAYBOOK.md) — phases, delegation, and the delivery loop.
- [`skills/`](./skills/INDEX.md) — 23 skills. `fa skill --list`.
- [`docs/svelte-framework/`](./docs/svelte-framework/INDEX.md) — tutorials, how-to, reference. `fa docs --list`.
- [`commands/`](./commands/) — host slash commands.
