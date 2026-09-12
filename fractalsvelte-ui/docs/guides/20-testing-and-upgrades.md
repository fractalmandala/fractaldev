# Testing and upgrades

The repository’s minimum verification commands are:

```sh
pnpm check
pnpm build
pnpm verify
```

`pnpm verify` also checks that the token Sass is generated from the source, compiles the system, scans the accessibility contract, and smoke-tests a packed external consumer.

`pnpm docs:check` runs independently when you are editing documentation. It verifies that every exported component and SvelteBits alias has a catalogue page, every page has a description/props/usage entry, all guides are listed, Markdown guide links resolve, every public token is named in the token guide, and every `--ui-*` contract is documented. `pnpm kit3:check` verifies the Kit 3 Vite-owned configuration, dependency floor, `#lib` imports, typed route loads, and removed API guards.

## Test matrix

For a consuming application, add browser checks for light and dark mode, system preference fallback, saved mode restoration before hydration, body attributes, scoped `Theme`, preset and custom accent paths, plain/Aura/Gradient/Pattern backgrounds, responsive drawer behavior, keyboard focus, reduced motion, WebGL fallback, and syntax-highlighted guide/component code blocks in both modes.

## Documentation checks

Every exported component must have a catalogue entry, a live preview branch, an accurate prop table, a usage example, accessibility notes, and styling-token notes. Every guide link must resolve. Run the docs site in a browser before considering a visible docs change accepted.

## Upgrades

Treat raw token names, `--ui-*` contracts, component prop names, persistence keys, and data attributes as public API. Record breaking changes when removing or renaming any of them. Add a migration note when changing token defaults or preset classification.

The package currently ships a source-oriented export surface. A registry release still needs a release workflow, published version, and a consumer test against the actual registry artifact. Before publishing, replace local `file:` installation instructions with the released version, run `pnpm pack`, install that archive in a clean consumer, and run `pnpm package:check`. The local command already verifies package exports and compiles the packed Sass entrypoint.

For the SvelteKit 3 migration sequence, follow [SvelteKit 3 migration](23-sveltekit-3-migration.md). Upgrade the host application to the latest stable SvelteKit 2 first, then apply the Kit 3 codemod when it is available for the target release. Keep the migration branch pinned to the versions listed there and do not mix a Kit 2 `svelte.config` with the Kit 3 Vite configuration.
