---
title: 'Fractal Svelte Playbook'
description: 'Phases, delegation contracts, and the delivery loop for the Fractal Svelte agent.'
type: guide
---

# Fractal Svelte Playbook

[`AGENTS.md`](./AGENTS.md) is the entry point and the contract. This file is the
*procedure*: how a task moves from request to verified receipt.

Read this when a task is multi-step, spans more than one file, or ends in a
completion claim. For a single component or a one-file edit, `fa route` plus the
contract is enough.

## Scope

This agent owns the frontend contract: Svelte 5 runes, SvelteKit routing and data
flow, indented SASS, CUBE CSS composition, component construction, React→Svelte
porting, motion, and accessibility.

It does not own backend architecture, infrastructure, or database design. When a
task crosses that line, say so and scope your change to the frontend surface.

## Phases

Not every task needs every phase. `fa route` tells you which apply.

### Phase 1 — Resolve the surface

1. Run `fa route "<task>"`. Load exactly the skills it names.
2. Read the target file, its sibling `.sass`, and the nearest project `AGENTS.md`.
3. Run `fa tokens` before writing any color, spacing, or type value.
4. State the bounded change surface: which files you will create or modify.

Stop here and ask if the target cannot be resolved, or if the request implies
replacing a route or layout that already works.

### Phase 2 — Build

1. Start from a recipe when one exists: `fa component <name> --dense`.
   Prefer the native/zero-JS paradigm unless the request needs runes state.
2. Apply the contract as you write, not as a cleanup pass. The common failures
   are `<style>` blocks, hex fallbacks, `on:click`, and slots.
3. Keep the component's styles in a sibling `*.sass`. Keep markup in `*.svelte`.
4. Guard every browser-only API behind `browser` from `$app/environment`.

### Phase 3 — Verify

1. `fa verify --all` — runs static and build, writes
   `.fractal-agentic/receipts/latest.json`.
2. Start the dev server and exercise **every affected route**. Inspect the browser
   console and the server output.
3. Record the three layers separately. Never let a green `pnpm check` stand in for
   a route you did not load.

### Phase 4 — Review and report

Report, in this order:

1. Files created and modified — actual paths.
2. Verification receipt — each layer, its command, and its real result.
3. Gaps and residual risk — what you did not verify, and why.
4. Exactly one verdict: **ship** · **fix-first** · **rethink**.

On `fix-first`, fix and re-verify before claiming completion. On `rethink`, return
to scope before writing more code.

## Delegating to a subagent

When you hand work to another agent thread, give it a five-part contract. A vague
handoff produces work you cannot verify.

| Part | Content |
| --- | --- |
| **Objective** | The single outcome. One sentence. |
| **Ownership** | Exact paths this agent may create or modify. Nothing outside them. |
| **Interfaces** | Props, types, routes, and tokens it must consume — not invent. |
| **Constraints** | The output contract. Paste `fa contract --dense` into the prompt. |
| **Verification** | Which layers to run, and that a receipt is required. |

**A worker's receipt is a claim, not evidence.** Inspect the real diff and re-run
the verification commands yourself before accepting it.

## Failure recovery

| Symptom | Root cause | Recovery |
| --- | --- | --- |
| `fa route` returns `unrouted` | Task phrasing missed every pattern | Re-run with a concrete verb + object ("add a route", "convert React"). If it is genuinely a new task class, add a route to `routing.json`. |
| `fa component <name>` → unknown | No recipe for that component | Build from `fa contract` and the closest listed recipe. Do not invent a new styling system. |
| Recipe tokens don't exist in the project | Recipe drift from the template | `fa tokens` is authoritative. Map the recipe onto real semantic tokens; never keep a hex fallback. |
| `pnpm check` green, route 500s | Static check cannot see rendering | This is `fix-first`, not `ship`. Read the server output; check SSR guards and load functions. |
| `fa doctor` reports broken links | Armory rot | Fix before shipping. A dead link is a harness failure. |
| A skill contradicts the contract | Superseded skill loaded | Check `fa skill --list`. The contract in `routing.json` outranks any skill body. |

## Boundaries

- Never install a dependency or mutate `package.json` without asking.
- Never introduce Tailwind, BEM, CSS-in-JS, or a second styling system.
- Never create root-level style files when the project co-locates them.
- Never replace a working route or layout to make a component fit.
