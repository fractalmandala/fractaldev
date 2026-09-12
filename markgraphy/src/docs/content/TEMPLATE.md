# Markgraphy .svx Doc Template

Every `.svx` file in `src/docs/content/` follows this structure.
The file is compiled by mdsvex as a Svelte component and rendered
by the dynamic `[doc]` route at `/docs/<slug>`.

## File location

```
src/docs/content/<component-slug>.svx
```

The slug must match the `slug` field in `catalog.ts`.

## Structure

```svx
<script lang="ts">
	import { <ComponentName> } from '$lib';
</script>

# <Title>

<One-paragraph description from catalog.ts, rewritten in doc voice.>

## Import

```svelte
import { <ComponentName> } from 'markgraphy';
```

## Basic usage

```svelte
<<ComponentName>
  title="EXAMPLE"
  <key props with realistic sample values>
/>
```

<div class="live">
<<ComponentName> <same props as code block above> />
</div>

<One sentence explaining what this example shows.>

## <Variant name>

```svelte
<<ComponentName>
  <different props showing another capability>
/>
```

<div class="live">
<<ComponentName> <same props as code block above> />
</div>

<One sentence explaining what this variant demonstrates.>

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `propName` | `type` | `default` | Description from catalog.ts. |
```

## Rules

1. **Import** — always from `'markgraphy'` in the code block (what consumers use), but `'$lib'` in the `<script>` tag (internal dev path).
2. **Title** — matches the `title` field from catalog.ts (sentence case).
3. **Description** — one paragraph, rewritten from catalog.ts description.
   Do not just copy-paste; make it read as documentation.
4. **Code blocks** — every example MUST have a fenced `svelte` code block
   showing the exact markup a user would write. Use `&lt;` and `&gt;`
   inside code blocks to prevent mdsvex from rendering them as components.
5. **Live previews** — wrap each rendered component in `<div class="live">`
   so prose styling doesn't interfere with the graph layout.
6. **Examples** — minimum 2, maximum 3. Each shows a different capability
   or prop combination. Use realistic, meaningful sample data.
7. **Props table** — include every prop from catalog.ts. Use the exact
   `name`, `type`, `default`, and `description` from catalog.ts.
   Format defaults as code (backticks). Use `—` for props with no default.
8. **Animated components** — add a "Reduced motion" note if the component
   freezes under `prefers-reduced-motion`. Mention `speedMs` in examples
   where relevant.
9. **No inline styles** — all styling through component props only.
10. **Filenames** — must match the slug exactly: `graph-bars.svx`, not
    `GraphBars.svx` or `bars.svx`.

## Animated component extra section

For animated components, add this after the Props table:

```markdown
## Reduced motion

<Component> freezes under `prefers-reduced-motion`. Pass `animated={false}`
to disable animation explicitly.
```

Only include if the component actually respects reduced motion.
