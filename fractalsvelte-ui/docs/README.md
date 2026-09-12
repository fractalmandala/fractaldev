# Fractalsvelte UI documentation

This directory contains the cross-project usage documentation for Fractalsvelte UI. The live component pages are available from the documentation application at `/components/<slug>`; the guides below explain how to adopt the library, theme it, compose it, and maintain it.

## Guides

1. [Installation and setup](guides/01-installation-and-setup.md)
2. [Quick start](guides/02-quick-start.md)
3. [Component index](guides/03-component-index.md)
4. [Component API documentation](guides/04-component-api.md)
5. [Component accessibility](guides/05-component-accessibility.md)
6. [Component styling hooks](guides/06-component-styling.md)
7. [Foundations](guides/07-foundations.md)
8. [Layout primitives](guides/08-layout-primitives.md)
9. [Token reference](guides/09-token-reference.md)
10. [Theming quick start](guides/10-theming-quick-start.md)
11. [Light and dark mode](guides/11-light-dark-mode.md)
12. [Scoped themes](guides/12-scoped-themes.md)
13. [Preset themes](guides/13-preset-themes.md)
14. [Theme setter](guides/14-theme-setter.md)
15. [Background system](guides/15-background-system.md)
16. [Component contracts](guides/16-component-contracts.md)
17. [Motion](guides/17-motion.md)
18. [Canvas and visual effects](guides/18-canvas-effects.md)
19. [Accessibility](guides/19-accessibility.md)
20. [Testing and upgrades](guides/20-testing-and-upgrades.md)
21. [Contributing a component](guides/21-contributing-a-component.md)
22. [Troubleshooting and FAQ](guides/22-troubleshooting.md)
23. [SvelteKit 3 migration](guides/23-sveltekit-3-migration.md)

The source of truth for token values is [`src/lib/styles/token-source.json`](../src/lib/styles/token-source.json); its generated Sass output is [`src/lib/styles/_tokens.sass`](../src/lib/styles/_tokens.sass), and its typed inventory is [`src/lib/styles/tokens.schema.ts`](../src/lib/styles/tokens.schema.ts). The source of truth for component metadata is [`src/lib/docs/catalogue.ts`](../src/lib/docs/catalogue.ts).
