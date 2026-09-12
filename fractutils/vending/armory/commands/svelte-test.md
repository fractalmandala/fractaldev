---
description: Execute unit (Vitest / @testing-library/svelte) and E2E (Playwright) tests for Svelte 5 runes components and SvelteKit route endpoints.
---

# Svelte Test Command

Enforce test-driven development and regression testing for Svelte 5 component state and SvelteKit route endpoints.

## Usage

```
/svelte-test [test-file or suite-pattern]
```

## Workflow Steps

1. Execute unit tests via `pnpm test:unit` or `vitest run` targeting Svelte 5 components.
2. Verify reactive state transitions, event handler props, and snippet rendering.
3. Execute end-to-end tests via `playwright test` targeting SvelteKit routes, SSR hydration, form actions, and navigation flows.
4. Report test coverage metrics and highlight missing assertions in component or route logic.
