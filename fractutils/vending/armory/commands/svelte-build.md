---
description: Run Svelte 5 / SvelteKit build and svelte-check diagnostics, fixing compiler errors, runes type issues, route parameter definitions, and SSR/hydration mismatches.
---

# Svelte Build & Typecheck Command

Detect and resolve Svelte 5 compilation failures, TypeScript errors, and SvelteKit route type mismatch diagnostics.

## Usage

```
/svelte-build [module-path or app-path]
```

## Workflow Steps

1. Run `pnpm svelte-check` or `npx svelte-check --tsconfig ./tsconfig.json` to extract typecheck diagnostics.
2. Run `vite build` or `pnpm build` to verify production bundle compilation.
3. Fix identified issues incrementally:
   - Runes type mismatches (`$state`, `$derived`, `$props`).
   - SvelteKit route params and PageData type bindings.
   - SSR browser globals dereferenced during server pre-rendering.
4. Re-run verification until build passes cleanly with zero errors.
