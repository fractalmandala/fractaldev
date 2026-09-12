# Contributing a component

Use this sequence for every new component or pattern equivalent.

1. Define the component’s purpose, semantic element, public props, bindable state, events, snippets, and reduced-motion behavior.
2. Implement the Svelte component with Svelte 5 runes and native semantics where available.
3. Add Sass selectors to `_components.sass` and consume only the raw token vocabulary plus documented `--ui-*` contracts.
4. Add the export to `src/lib/components/index.ts`.
5. Add an accurate entry to `src/lib/docs/catalogue.ts` with every public prop, default, description, and usage example.
6. Add an interactive branch to `ComponentPreview.svelte` that exercises the important states.
7. Add accessibility, styling, and composition notes to the relevant guide or component page.
8. Check the component in light and dark mode, with custom accents, with a scoped theme, and with reduced motion.
9. Run `pnpm check` and `pnpm build`.
10. Run the documentation site and manually verify the live preview, copy-ready usage, responsive layout, keyboard behavior, and theme setter interaction.

Keep the change focused, preserve unrelated worktree changes, and document any new public token or contract before using it in component selectors.
