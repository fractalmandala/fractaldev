# fractaldev

This is a monorepo for all my dev and design releases - libraries, packages, sites. Mostly Sveltekit.
Usual stack - Sveltekit, SASS (single-tab indented) styling. Never Tailwind.

> No root pnpm workspace: every project below is standalone (own `package.json`, own deps, own lockfile).
> Run `pnpm install` inside a project folder to restore `node_modules`.

## Projects

| Folder | Package | What it is |
| --- | --- | --- |
| `fractalsvelte-ui/` | `@fractaldev/fractalsvelte-ui` | Svelte 5 component library (Sass-first, token-driven) |
| `fractalicons/` | `@fractaldev/fractalicons` | Icon library — 27,000+ icons across 25 families |
| `fractalpop/` | `fractalpop-monorepo` (nested) | Nested pnpm monorepo (core, mdsvex, remark, svelte + demo app) |
| `fractalstyler/` | `fractalstyler` | SASS styling system |
| `site-fractalsvelte/` | `fractalsvelte` (private) | Website fronting the Sveltekit projects, docs, and resources |
| `fractalthemer/` | `fractalthemer` | Themeing / theme builder system for fractalstyler2 |
| `fractutils/` | `fractutils` | Utilities (SvelteKit/Vite tooling, daylight themes, vending) |
| `markgraphy/` | `markgraphy` | Markdown graphics tooling |
| `morphicons-svelte/` | `morphicons-svelte` | Morphing icon components |
| `svelte-animated-icon/` | `svelte-animated-icons` | Animated icon components |
| `acrolls/` | `acrolls` (nested) | Nested pnpm monorepo — docs for SvelteKit |
| `fractal-agentic/` | `fractal-agentic` | Fractal Agentic plugin — one-boss orchestration runtime + vendored skills |
| `fractal-svelte-scaffold/` | `fractal-svelte-scaffold` | SvelteKit + Svelte 5 scaffold generator (agent-ready) |
| `frcked/` | `frcked` (private) | Pre-existing standalone app (not part of the migration) |

Migration tracker: [`project-migration.md`](project-migration.md)