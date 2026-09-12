---
description: Trigger comprehensive Svelte 5 and SvelteKit code review — checks runes usage ($state, $derived), snippet migration, SvelteKit data flow (+page.server.ts, load/actions), indented SASS discipline, and component reactivity boundaries.
---

# Svelte Code Review Command

Audit Svelte 5 component files and SvelteKit routes for reactivity correctness, clean data flow, styling discipline, and performance.

## Usage

```
/svelte-review [file-path or diff-target]
```

## Review Focus Areas

1. **Svelte 5 Runes**: Inspect for `$state`, `$derived`, `$effect`, `$props`, and `$bindable`. Ensure derived runes use direct expressions (`let x = $derived(val)`), never anonymous functions.
2. **SvelteKit Routes**: Validate `+page.svelte`, `+layout.svelte`, `+page.server.ts`, and `+server.ts` data handling, SSR safety, and `{@render children()}` rendering.
3. **Template Directives & Snippets**: Verify `{#snippet}`, `{@render}`, and `onclick` syntax.
4. **Indented SASS Styling**: Ensure no `<style>` blocks inside `.svelte` files and verify indented SASS (`.sass`) syntax adherence.

## Output

Invokes the [`svelte-reviewer`](../skills/svelte-components-patterns/SKILL.md) agent and returns a severity-ranked code review report with actionable diffs.
