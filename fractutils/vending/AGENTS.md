# AGENTS.md - fractal-svelte-scaffold

This file applies to the `packages/fractal-svelte-scaffold` package. It is a
standalone TypeScript CLI package inside the Mandala pnpm monorepo. The package
publishes the `fractal-svelte` command, a default SvelteKit template, and a
self-contained Fractal Agentic armory that is copied into every generated project.

The closest nested instructions take precedence:

- [`armory/AGENTS.md`](./armory/AGENTS.md) governs the bundled agent: its contract,
  routing, skills, commands, and CLI.
- [`templates/default/AGENTS.md`](./templates/default/AGENTS.md) governs the
  generated SvelteKit application template. Changes there become instructions
  for users' new projects, not just development notes for this package.

## Project overview

The package has three coupled surfaces:

| Surface | Location | Responsibility |
| --- | --- | --- |
| CLI implementation | `src/cli.ts`, `src/render.ts` | Parse options, scaffold, `init` an existing project, and delegate agent commands to `armory/bin/fa.mjs`. |
| Generated application | `templates/default/` | SvelteKit + Svelte 5 + TypeScript + CUBE CSS + indented SASS starter project. |
| Bundled agent | `armory/` | Standalone agent armory copied to `.fractal-agentic/` in generated projects. |
| Agent tool surface | `armory/bin/fa.mjs` | Zero-dependency CLI: routing, recipes, skills, tokens, verification receipts, integrity checks. |

`dist/` is TypeScript build output. Treat `src/` as the source of truth and do not
edit generated JavaScript by hand. The package is not itself a SvelteKit app; run
Svelte checks against a generated project when template behavior changes.

## Repository map

- `package.json` — package metadata, published files, and the supported command set.
- `src/cli.ts` — CLI entry point and filesystem/process orchestration.
- `src/render.ts` — `{{token}}` substitution for text files in templates.
- `templates/default/` — the default project copied by the CLI. Keep its `README.md`
  and `AGENTS.md` aligned with the actual template.
- `armory/` — the payload copied verbatim into a generated project's
  `.fractal-agentic/` directory.
- `armory/routing.json` — **the single routing contract.** All task routing, skill
  precedence, policies, and verification layers live here. Nothing else routes.
- `armory/bin/fa.mjs` — the agent CLI. Node stdlib only; it must keep working inside
  a generated project with zero dependencies installed.
- `armory/skills/INDEX.md` — **generated.** Run `pnpm sync:index`; never hand-edit.
- `scripts/sync-armory-index.mjs`, `scripts/test-routing.mjs` — index generator and
  routing regression suite.
- `README.md` — user-facing package and CLI documentation.
- `dist/` — compiled output created by `pnpm build`; it is not an authoring surface.

The CLI renders only recognized text-file extensions. When adding a templated text
file, update `isTemplateTextFile()` in `src/cli.ts` if its extension is not already
covered. Binary assets must continue to be copied without string rendering.

## Commands

Run these from `packages/fractal-svelte-scaffold` (or use the equivalent pnpm filter
from the monorepo root):

```sh
pnpm install   # normally covered by the monorepo install
pnpm check     # strict TypeScript type-check, without emitting files
pnpm build     # compile src/ into dist/
pnpm smoke     # scaffold a no-install, no-Git smoke project named __smoke__
pnpm test      # routing suite + testing-results ledger + armory doctor
pnpm doctor    # armory integrity: broken links, missing recipes, index drift
pnpm sync:index # regenerate armory/skills/INDEX.md from disk
```

`pnpm test` covers routing accuracy, the results ledger, and armory integrity.
`pnpm smoke` is the package's integration check: it exercises the source CLI through `tsx`, template rendering, armory copying,
and the CLI's no-install/no-Git flags. Prefer running it from a temporary working
directory so the generated project does not pollute the package.

When the template changes, also run the generated project's checks after installing
its dependencies:

```sh
pnpm install
pnpm check
pnpm build
pnpm lint
```

Run `pnpm test` in the generated project only if the template's dependencies and test
fixtures are present; the package itself does not promise a test script.

## Development guidelines

### CLI and TypeScript

- Keep the package strict and ESM-compatible with the existing `NodeNext` TypeScript
  configuration.
- Preserve the public CLI shape: `fractal-svelte <project-name>`, `--template`,
  `--no-git`, `--no-install`, and `--help`.
- Keep project-name validation before filesystem creation and preserve the existing
  clear error messages for invalid names, existing targets, and missing templates.
- Use explicit filesystem paths and pass `cwd` to child processes. Do not introduce
  shell interpolation or arbitrary command execution for user-provided values.
- Keep `renderString()` token replacement deterministic. Unknown tokens should remain
  visible rather than silently becoming empty strings.
- Match the existing TypeScript formatting and tab indentation. Avoid adding a runtime
  dependency for functionality that Node's standard library already supplies.

### Generated SvelteKit projects

The template's nested `AGENTS.md` is the detailed contract. In summary, preserve:

- Svelte 5 runes instead of legacy `$:` reactivity or `svelte/store` state.
- Semantic HTML and accessible interaction patterns.
- `onclick` event attributes, snippets, and `{@render}` for Svelte 5 APIs.
- External indented SASS (`*.sass`) with tab indentation; no component `<style>`
  blocks, SCSS syntax, or hardcoded palette values.
- CUBE CSS composition and semantic design tokens instead of BEM or Tailwind.
- Explicit SSR/browser boundaries for `window`, `document`, and `localStorage`.

If a template change affects the user-facing contract, update all relevant examples
in `templates/default/README.md` and `templates/default/AGENTS.md` in the same change.

### Bundled armory

The CLI copies `armory/` verbatim. Treat changes to it as changes to the behavior of
every future scaffolded project:

- **Run `pnpm doctor` after any armory change.** It must report zero broken links,
  zero missing recipes, zero orphan skills, and zero index drift. A doc that
  references an asset the package does not ship is a harness failure: an agent
  following that link hits a dead file mid-task.
- Routing changes go in `armory/routing.json` only, then `pnpm test:routing`.
- After adding or removing a skill, run `pnpm sync:index`.
- Keep `armory/plugin.json`, `armory/AGENTS.md`, and `armory/PLAYBOOK.md` consistent
  with what is actually bundled.
- Use relative paths that remain valid after the directory is copied to
  `.fractal-agentic/`.
- Keep the armory standalone; generated users should not need the monorepo or an
  installed `fractal-agentic` package to use it.
- Do not add secrets, local absolute paths, machine-specific state, generated caches,
  or unreviewed executable payloads to the bundled armory.

## Testing and verification

For a CLI-only change, the minimum evidence is:

1. `pnpm check`
2. `pnpm build`
3. A smoke scaffold using `--no-git --no-install`
4. Inspection that the generated project contains `AGENTS.md`,
   `.fractal-agentic/plugin.json`, and representative template files

For a template or armory change, additionally inspect the generated files after token
rendering and run the generated project's `pnpm check` and `pnpm build` when its
dependencies are available. For behavior changes, add focused tests or a deterministic
smoke assertion rather than relying on a successful process exit alone.

For bundled Agent skill work, use `testing-results/README.md`. A result is not
qualified from `pnpm check` alone: exercise affected browser routes, inspect server
output and browser console errors, and record static, build, runtime, and receipt
evidence separately. Keep failed baselines and link retests; do not replace a failed
result with a later success.

Do not claim a generated-project check passed if dependencies were not installed or if
the check was run against the source template before token rendering.

## Security considerations

- The default CLI may run `pnpm install`, `git init`, `git add -A`, and `git commit`
  inside the newly created target. Review changes to these commands carefully; keep
  them scoped to the validated target directory.
- Never put credentials, API keys, personal paths, or environment contents in the
  template, armory, generated documentation, or smoke fixtures.
- Treat `armory/` documentation and scripts as distributed content. Review links,
  commands, subprocess examples, and file paths before shipping them to users.
- Do not broaden project-name validation or introduce shell command construction from
  user input without a security review.
- Avoid committing generated projects, dependency directories, lockfiles from smoke
  runs, `.DS_Store` files, or other local artifacts unless the package explicitly
  requires them.

## Release and collaboration

- Use Conventional Commit messages, for example `docs: add scaffold agent guidance`
  or `fix: preserve binary template assets`.
- Before publishing, run `pnpm check`, `pnpm build`, the smoke flow, and the relevant
  generated-project checks. Confirm that `package.json.files` still includes every
  runtime artifact required by the published CLI (`dist`, `templates`, and `armory`).
- Review the complete diff, including generated output and bundled armory changes, and
  keep unrelated work in the working tree untouched.
- Update `README.md` when CLI flags, package behavior, or release expectations change.
- This package is MIT-licensed and currently published as `fractal-svelte`; do not
  rename the package, binary, or repository directory without updating metadata,
  documentation, and the scaffolded links together.
