---
name: svelte-styling-patterns
description: Styling patterns for Svelte and SvelteKit applications using external indented SASS (.sass), two-layer semantic CSS variables, single-tab indentation without braces or semicolons, and zero in-component style blocks.
metadata:
  origin: ECC
---

# Svelte Styling & Indented SASS Discipline

Styling discipline for modular Svelte applications requiring pure indented SASS (`.sass` syntax) and two-layer CSS token architecture.

## Key Rules

1. **Zero `<style>` Blocks in Svelte Components**: Svelte components should remain markup and script only. Component styles must reside under `src/lib/styles/components/` or per-module `src/lib/modules/<app>/styles/` directories.
2. **Indented SASS Format**: Write SASS using classic indented syntax (`.sass` files) with single-tab indentation, no curly braces `{}` and no semicolons `;`.
3. **Two-Layer CSS Tokens**:
   - Layer 1 (Primitive): Raw values (`--color-blue-500: #3b82f6`, `--space-4: 16px`).
   - Layer 2 (Semantic): Domain meaning (`--background10: var(--color-dark-10)`, `--theme-color: var(--color-blue-500)`).
   - Component styles MUST consume semantic tokens only.
4. **No Hardcoded Style Values**: Colors, radii, spacing, and font sizes must come from semantic tokens (except where hardcoding $\le 2$ instances is approved to prevent over-tokenization).

## Example Indented SASS File (`button.sass`)

```sass
.btn-primary
	display: inline-flex
	align-items: center
	justify-content: center
	padding: var(--space-2) var(--space-4)
	background-color: var(--theme-color)
	color: var(--text-primary)
	border-radius: var(--radius-medium)
	border: 1px solid var(--border-secondary)
	transition: background-color 0.2s ease

	&:hover
		background-color: var(--theme-color-hover)
```
