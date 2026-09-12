# Project Migration

Sheet to plan and migrate active projects into this monorepo. Current items in list.
> For each of them, i am okay losing any commit histories etc. and starting clean and fresh from this monorepo.
> Do not commit this monorepo ever without explicit user instruction, because after moving every project i need to check if anythings need to be added/removed from gitignore.
> if i tell you to commit, remind me if i have checked for gitignore.

## Status: ALL MIGRATED ✅ (awaiting gitignore review + commit confirmation)

> ⚠️ **Pending user action:** review `.gitignore` (see notes below) and then explicitly tell the agent to commit. Agent must NOT commit without that instruction.

## fractalcodex ✅

- from `/Users/amrit/fractalmandala/fractalcodex`. This is a Sveltekit components package, it has to be named `fractalsvelte-ui`, and npm package name scoped `@fractaldev/fractalsvelte-ui`.
	- old github repo - `https://github.com/fractalmandala/fractalsvelte-package/tree/main` - no need to maintain any link/legacy with this.
	- fractalcodex to be migrated into this repo, and started fresh as `fractalsvelte-ui`. fresh new repo on github.
	- npm old package - `https://www.npmjs.com/settings/fractaldesign/packages`. never maintained it. once `@fractaldev/fractalsvelte-ui` is published, this old one should be deleted.

- [x] migrated into this monorepo as `fractalsvelte-ui/` (folder + package.json renamed to `@fractaldev/fractalsvelte-ui`, repo/homepage fields repointed to fractaldev monorepo)
- [x] build artifacts (`.svelte-kit/`) cleaned; `node_modules`, `dist`, `.git` excluded
- [ ] alert user to check for any gitignores to maintain, add, remove
- [ ] at user confirmation, push and commit the monorepo to github with commit message 'fractalsvelte-ui migrated'

## fractalicons ✅

- from `/Users/amrit/fractalmandala/fractalicons`.
- this is an active package on npm - `https://www.npmjs.com/package/fractalicons`.
- but i anyway want to publish as new scoped `@fractaldev/fractalicons` package. and then i will delete/deactivate the one above.
- github repo current - `https://github.com/fractalmandala/fractalicons`. clean worktree.
- if that github repo can be migrated into this monorepo - great.
- else will delete that repo, after migration of fractalicons into this monorepo is complete.

- [x] migrated into this monorepo as `fractalicons/` (package.json renamed to `@fractaldev/fractalicons`, repo/homepage/bugs repointed, README + install docs updated to scoped name)
- [x] build artifacts (`.svelte-kit/`, `.vercel/`) cleaned; `node_modules`, `dist`, `.git` excluded
- [ ] alert user to check for any gitignores to maintain, add, remove
- [ ] at user confirmation, push and commit the monorepo to github with commit message 'fractalicons migrated'

## the above cases detailed the steps, similar steps must be followed for the following also

1. fractalpop ✅ - migrated into this monorepo as `fractalpop/` (nested pnpm monorepo, kept as-is; `node_modules`, `dist`, `.git` excluded)
2. fractalstyler ✅ - migrated as `fractalstyler/` (`.svelte-kit/`, `.vercel/` cleaned)
3. fractalsvelte ✅ - migrated and renamed folder to `site-fractalsvelte/` (website; `.svelte-kit/`, `.vercel/` cleaned)
4. fractalthemer ✅ - migrated as `fractalthemer/`
5. fractutils ✅ - migrated as `fractutils/`
6. markgraphy ✅ - migrated as `markgraphy/`
7. morphicons-svelte ✅ - migrated as `morphicons-svelte/`
8. svelte-animated-icon ✅ - migrated from `svelte-animated-icons/` as `svelte-animated-icon/` (⚠️ package.json name is still `svelte-animated-icons` — npm package is `svelte-animated-icon`; confirm which should be published)
9. acrolls ✅ - migrated as `acrolls/` (nested pnpm monorepo, kept as-is)

> All projects: no root pnpm workspace (per user preference) — each project keeps its own `package.json`, dependencies, and lockfile. Run `pnpm install` per project to restore `node_modules`.

## Gitignore review notes (for user)

- Each project brought its own `.gitignore` (all 10 had one) — these are preserved in place and handle project-specific rules.
- Root `.gitignore` currently reflects `frcked/` (Tauri/sidex) + generic rules; it already covers `node_modules/`, `dist/`, `.DS_Store`, `.env`, `build/` broadly.
- Size flags worth deciding on (currently NOT gitignored anywhere → would be committed):
  - `fractalicons/vendor/` — ~109MB of upstream icon sources (part of the generate pipeline — likely should be kept)
  - `markgraphy/qa-screenshots/` — ~19MB screenshots (likely droppable)
  - `acrolls/temp/` — ~756K scratch (likely droppable)
  - `site-fractalsvelte/screenshots/` — ~848K
- `frcked/` stays untouched (has its own `node_modules`, already gitignored by root).

## Migration Sprint 2

1. fractal-agentic ✅ - `/Users/amrit/fractalmandala/fractal-agentic` → migrated as `fractal-agentic/` (Fractal Agentic plugin v2.6.6; no `.git` in source; `node_modules`, `.DS_Store` excluded)
2. fractal-svelte-scaffold ✅ - `/Users/amrit/fractalmandala/fractal-svelte-scaffold` → migrated as `fractal-svelte-scaffold/` (`node_modules`, `dist`, `.git`, `.pnpm-store` excluded)

> Sprint 2 follow-ups still pending with the Sprint 1 gitignore review (same commit-confirmation gate applies).