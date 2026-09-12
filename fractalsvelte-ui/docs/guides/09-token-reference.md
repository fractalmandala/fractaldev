# Token reference

The token schema is the public cross-project styling API. Values in `token-source.json` are authoritative defaults; `_tokens.sass` is generated from that source. Consuming applications may replace tokens globally or scope them through `Theme`.

## Token groups and shipped values

The tables below are the complete shipped vocabulary. “Dark override” means the value is selected when `data-theme="dark"`; “inherits default” means the token does not change between modes. Change values in your application rather than editing the generated file.

### Typography

| Token | Default | Dark override |
| --- | --- | --- |
| `--font-sans` | `"Google Sans Flex", sans-serif` | inherits default |
| `--font-mono` | `"JetBrains Mono", monospace` | inherits default |
| `--text-xs` | `.75rem` | inherits default |
| `--text-sm` | `clamp(.9375rem, .9119rem + .1136vw, 1rem)` | inherits default |
| `--text-md` | `clamp(1.125rem, 1.0739rem + .2273vw, 1.25rem)` | inherits default |
| `--text-lg` | `clamp(1.35rem, 1.2631rem + .3864vw, 1.5625rem)` | inherits default |
| `--text-xl` | `clamp(1.62rem, 1.4837rem + .6057vw, 1.9531rem)` | inherits default |
| `--text-2xl` | `clamp(1.944rem, 1.7405rem + .9044vw, 2.4414rem)` | inherits default |
| `--text-3xl` | `clamp(2.3328rem, 2.0387rem + 1.3072vw, 3.0518rem)` | inherits default |
| `--text-4xl` | `clamp(2.7994rem, 2.384rem + 1.8461vw, 3.8147rem)` | inherits default |

### Space

| Token | Default | Dark override |
| --- | --- | --- |
| `--space-3xs` | `clamp(.3125rem, .3125rem + 0vw, .3125rem)` | inherits default |
| `--space-2xs` | `clamp(.5625rem, .5369rem + .1136vw, .625rem)` | inherits default |
| `--space-xs` | `clamp(.875rem, .8494rem + .1136vw, .9375rem)` | inherits default |
| `--space-s` | `clamp(1.125rem, 1.0739rem + .2273vw, 1.25rem)` | inherits default |
| `--space-m` | `clamp(1.6875rem, 1.6108rem + .3409vw, 1.875rem)` | inherits default |
| `--space-l` | `clamp(2.25rem, 2.1477rem + .4545vw, 2.5rem)` | inherits default |
| `--space-xl` | `clamp(3.375rem, 3.2216rem + .6818vw, 3.75rem)` | inherits default |
| `--space-2xl` | `clamp(4.5rem, 4.2955rem + .9091vw, 5rem)` | inherits default |
| `--space-3xl` | `clamp(6.75rem, 6.4432rem + 1.3636vw, 7.5rem)` | inherits default |

### Radius, controls, elevation, layering, layout, and structure

| Token | Default | Dark override |
| --- | --- | --- |
| `--radius-0` | `0` | inherits default |
| `--radius-2` | `2px` | inherits default |
| `--radius-3` | `3px` | inherits default |
| `--radius-4` | `4px` | inherits default |
| `--radius-6` | `6px` | inherits default |
| `--radius-8` | `8px` | inherits default |
| `--radius-12` | `12px` | inherits default |
| `--radius-16` | `16px` | inherits default |
| `--radius-24` | `24px` | inherits default |
| `--radius-full` | `9999px` | inherits default |
| `--control-h-s` | `26px` | inherits default |
| `--control-h-m` | `32px` | inherits default |
| `--control-h-l` | `38px` | inherits default |
| `--shadow-s` | `0 1px 2px rgb(15 23 42 / .06)` | inherits default |
| `--shadow-m` | `0 4px 12px rgb(15 23 42 / .08)` | inherits default |
| `--shadow-l` | `0 12px 32px rgb(15 23 42 / .12)` | inherits default |
| `--z-base` | `0` | inherits default |
| `--z-raised` | `10` | inherits default |
| `--z-sticky` | `100` | inherits default |
| `--z-modal` | `200` | inherits default |
| `--z-toast` | `300` | inherits default |
| `--header-height` | `48px` | inherits default |
| `--footer-height` | `56px` | inherits default |
| `--measure` | `65ch` | inherits default |
| `--border-width` | `1px` | inherits default |
| `--border-emphasis-width` | `3px` | inherits default |
| `--focus-ring-width` | `2px` | inherits default |

### Palette

| Token | Default | Dark override |
| --- | --- | --- |
| `--bg` | `#fdfefe` | `#111827` |
| `--bg-surface` | `#f8f7f7` | `#18212f` |
| `--bg-raised` | `#f1f5f9` | `#253041` |
| `--bg-panel` | `#f1f3f5` | `#202b3b` |
| `--bg-footer` | `#e9ecef` | `#17202e` |
| `--bg-popover` | `#fff` | `#202b3b` |
| `--bg-dialog` | `#fff` | `#202b3b` |
| `--bg-terminal` | `#0f172a` | inherits default |
| `--bg-input` | `#fff` | `#17202e` |
| `--bg-canvas` | `#f8f9fa` | `#111827` |
| `--text-primary` | `#0f172a` | `#f8fafc` |
| `--text-secondary` | `#5b6472` | `#cbd5e1` |
| `--text-muted` | `#929497` | `#94a3b8` |
| `--text-inverse` | `#fff` | `#0f172a` |
| `--state-hover` | `#e2e8f0` | `#334155` |
| `--state-hover-subtle` | `#f1f5f9` | `#263244` |
| `--state-selected` | `#cbd5e1` | `#3b4b61` |
| `--border` | `#e2e8f0` | `#334155` |
| `--border-subtle` | `#edf2f7` | `#27364a` |
| `--theme-color` | `#04825b` | `#59c49f` |
| `--theme-color-alt` | `#047857` | `#82d8b9` |
| `--theme-color` | `var(--theme-color)` | inherits default |
| `--theme-color-alt` | `var(--theme-color-alt)` | inherits default |
| `--success` | `#10b981` | `#34d399` |
| `--success-hover` | `#059669` | `#6ee7b7` |
| `--warning` | `#f59e0b` | `#fbbf24` |
| `--warning-hover` | `#d97706` | `#fcd34d` |
| `--danger` | `#ef4444` | `#f87171` |
| `--danger-hover` | `#dc2626` | `#fca5a5` |
| `--info` | `#3b82f6` | `#60a5fa` |
| `--info-hover` | `#2563eb` | `#93c5fd` |
| `--feedback-error` | `#dc2626` | `#f87171` |
| `--ring` | `rgb(0 127 78 / .35)` | `rgb(89 196 159 / .45)` |

### Numeric pixel steps

Spacing runs two parallel systems: the named scale above (`3xs`–`3xl`), and direct pixel values. Unitless numbers in mixins are pixel values — `+gap(16)` emits `16px` — and numeric utility classes exist for the common steps: `gap-4`, `gap-8`, `gap-12`, `gap-16`, `gap-20`, `gap-24`, `gap-32`, `gap-40`, `gap-48` (same for `pad-*`, `px-*`, `py-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*`, `m-*`, `mx-*`, `my-*`, `mt-*`, `mb-*`). Any other pixel value is available as an explicit escape hatch in Sass, e.g. `+gap(30px)`.

## Override rules

Override `--theme-color` and `--theme-color-alt` together. Keep text and background contrast valid when changing palette values. Structural tokens accept CSS lengths; type and space tokens accept any valid CSS value, including a different fluid scale.

The typed inventory and metadata are exported as `tokenGroups`, `TokenName`, `ThemeTokenName`, `TokenValueKind`, `tokenDefaults`, `darkTokenDefaults`, `publicTokenNames`, `tokenMetadata`, `tokenMetadataByName`, and `isPublicTokenName` from `fractalsvelte/tokens` (or `src/lib/styles/tokens.schema.ts` inside the repository). Run `pnpm tokens:generate` after changing the source file.

Use `tokenMetadata` for editors and documentation tooling. Each entry includes the token name, group, value kind (`font`, `type`, `space`, `radius`, `length`, `shadow`, `number`, `color`, or `alias`), shipped default, and a short description. Use `isPublicTokenName` before accepting arbitrary names from a theme editor; `ThemeTokens` additionally permits deliberate `--ui-*` component-contract extensions.
