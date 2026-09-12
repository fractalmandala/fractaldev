# Light and dark mode

The library uses `data-theme="light"` or `data-theme="dark"` on the document root to select the corresponding raw token values. `data-mode` mirrors the same state for application logic, and `color-scheme` informs browser-native controls.

The minimum document contract is:

```html
<html data-theme="light" data-mode="light">
	<body data-theme="light" data-mode="light">
		<!-- the hydrated application -->
	</body>
</html>
```

Set the attributes on both elements when body-level selectors, native controls, or embedded widgets need to read the mode. The complete no-flash implementation lives in `src/app.html`; keep that file as the reference when adapting the bootstrap to another host.

## Persisted application mode

The documentation shell stores the selected mode under `fractalsvelte.mode`. The pre-hydration script in `src/app.html` reads that value before Svelte mounts, applies it to `<html>`, and mirrors it to `<body>` as soon as the body exists. This prevents a dark-mode flash and keeps body-level selectors and browser controls in sync.

If your application implements persistence, keep the same ordering:

1. Read a validated mode from storage.
2. Set the root `data-theme`, `data-mode`, and `color-scheme` before hydration.
3. Mirror the attributes to body.
4. Let the hydrated UI update the stored value after user interaction.

Do not use a theme family ID as `data-theme`; use `data-theme-family` for that separate concept.

## System preference

Without an explicit mode, the token layer has a `prefers-color-scheme: dark` fallback. Explicit `data-theme` values take precedence.

For a scoped component, `<Theme theme="system">` deliberately leaves the scope’s `data-theme` unset so it inherits the nearest explicit root or system fallback. `<Theme theme="light">` and `<Theme theme="dark">` select their complete coordinated palette inside the scope, even when the document is in the opposite mode.
