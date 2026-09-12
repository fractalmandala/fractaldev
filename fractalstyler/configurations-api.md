# Configurations API — complete registry of variables, tokens, attributes and classes

> Companion to `configurations.md` (the *why* and *how to edit*).
> This document is the *what*: every config variable, every CSS custom
> property, every `data-*` value, every theme name, every class pattern —
> with types, defaults, allowed values, and who reads what.
>
> Sources read verbatim:
> `_01_config.sass`, `_style-vocabulary.sass`, `_00_tokens.sass`,
> `_00_presets.sass`, `_00_themes.sass`, `_01_base.sass`, `_02_dimensions.sass`,
> `_03_containers.sass`, `_04_layouts.sass`, `_05_shells.sass`,
> `_06_visuals.sass`, `_07_interactions.sass`, `_08_own.sass`,
> `_10_compositions.sass`, `_11_richtext.sass`, `_12_deck.sass`,
> `_13_siteintro.sass`, `_14_frame.sass`, `_14_shiki.sass`, `index.sass`,
> `utils/allutils.sass` (standalone, not indexed), `utils/builder.ts`,
> `presets/stylepresets.ts`.
>
> Three kinds of API — do not mix them:
>
> | Kind | Example | Set where / when |
> |---|---|---|
> | **A. Sass compile-time vars** (`!default`) | `$literal-max: 512` | `@use '01_config' as cfg with (…)` **before** first load, or JIT wrapper |
> | **B. Runtime CSS props + `data-*` + theme classes** | `--gap-scale`, `data-layout="tight"`, `.theme-night-dark` | In browser, live, no recompile (`setPreset` / `setMode` / `classList`) |
> | **C. Classes** (emitted utilities, shells, components, compounds) | `.gap-bs`, `.grid-3`, `.b-ps-gl-desk` | Baked at compile time from A; *parameterised* at runtime by B |

---

## 1. A — Sass compile-time configuration (`_01_config.sass`)

All eight knobs are `!default`: overridable via `with (…)`, never edited in place.
Namespace the configuring load (`as cfg`) — `01_config` starts with a digit and
is not a valid identifier bare.

```sass
@use 'styles/01_config' as cfg with ($literal-max: 256, $composition-steps: ('sm' 'bs' 'lg'))
@use 'styles/index' as *
```

| Variable | Type | Default | Allowed values | Read by | Effect |
|---|---|---|---|---|---|
| `$breakpoint` | Length (px) | `768px` | Any length, e.g. `640px`, `1024px` | Interpolated into default `$responsive-modes` only | Moves the mob/desk seam **iff** `$responsive-modes` still interpolates it. Alone it emits nothing |
| `$responsive-modes` | Map `name → media-query string` | `(mob: 'all and (max-width: 767px)', desk: 'all and (min-width: 768px)')` (derived from `$breakpoint`) | Any map, e.g. `(mob: '…', desk: '…')`, `(mob: '…', desk: '…', wide: 'all and (min-width: 1440px)')`, `(desk: '…')` single-band | `_02_dimensions` §responsive loop, `_06_visuals` border + visibility | Keys become `-suffix`es; values become `@media` text (unquoted via `string.unquote`). Add key = +1 full band (~+50% dimension CSS). Remove key = those selectors cease to exist. Keep `mob`+`desk`: `.hide-mobile/.hide-desktop/.only-mobile` hardcode those keys |
| `$literal-fine` | List of numbers | `(0, 1, 2, 4, 6, 8, 12)` | Any list of non-negative numbers | `_02` `$literals` seed | Precision tail of pixel ladder. Each entry ≈ 28 space selectors + 4 sizing/radius selectors per band |
| `$literal-step` | Number | `8` | Any positive divisor of `$literal-max`, typically `4`, `8`, `16` | `_02` `@for $i from 2 through max/step` | Coarse rhythm. `4` ≈ doubles coarse rungs; `16` ≈ halves. Non-divisor max undershoots top rung |
| `$literal-max` | Number (px) | `512` | Any number ≥ step, e.g. `256`, `320` | `_02` `$literals` ceiling | Sizing-only ceiling (`w/h/square`). Space/radius truncate earlier. Lower to `256` ≈ saves 32 rungs × 4 sel × 3 bands |
| `$literal-space-max` | Number (px) | `64` | Any ladder value, e.g. `32`, `96`, `128` | `_02` `$space-literals` filter (`<=`) | Caps gap/pad/marg literals. Default ladder subset: `0,1,2,4,6,8,12,16,24,32,40,48,56,64` (14). Values snap to ladder — `20` yields up to `16` |
| `$literal-radius-max` | Number (px) | `64` | Any ladder value, typically `16`–`64` | `_02` `$radius-literals` filter | Caps `.radius-N`. Literals bypass `data-shape`; prefer channels (§5.4) |
| `$breakpoints` | Map `name → length` | `(sm: 640px, md: 768px, lg: 1024px, xl: 1280px)` | Any map **containing at least** `sm, md, lg` (for `_04`) and `md, lg, xl` (for `_05`) | `_04_layouts` (`sm/md/lg`), `_05_shells` (`md/lg/xl`) via `map.get` | Named steps for grid stepping + rail visibility. **Not** the utility seam. Missing key → `map.get` returns null → `(min-width: )` silently dropped by browsers. Extra key (e.g. `2xl`) emits nothing until a file writes a rule for it |
| `$compositions-enabled` | Boolean | `true` | `true` \| `false` | `_10` term-list build + `selectors()` short-circuit | `false` removes ALL shorthand aliases. Ordinary utilities + responsive border utilities remain. Full ≈ 1.90 MB / 232 KB gzip → disabled ≈ 166 KB / 28 KB gzip |
| `$composition-steps` | List of step names | All nine: `('2xs' 'xs' 'sm' 'md' 'bs' 'lg' 'xl' '2xl' '3xl')` (= `vocabulary.$steps`) | Any sub-list, e.g. `('sm' 'bs' 'lg')`. Empty list legal but pointless — use the boolean | `_10` `$_pads/$_gaps` build; `selectors()` per-step gate | Shorthand-only restriction. Utilities for unlisted steps still exist; compounds containing them don't. Unknown/duplicate step → `@error` compile fail |
| `$composition-directions` | Boolean | `true` | `true` \| `false` | `_10` `or $family == …` guards | `false` keeps only all-side `border/pad/gap` combos (`b-ps-gl` survives); drops `bt/br/bb/bl`, `px:/py:/pt:/…`, `gr:/gc:` aliases. B 5→1, P 63→9, G 27→9 terms |
| `$composition-allowlist` | `null` \| List of strings | `null` (exhaustive AOT) | `null` \| list of compound names, e.g. `('b-ps-gl', 'px:sm-gr:lg')` \| `()` (no compounds) | `_10` AOT-vs-JIT branch; written by `builder.ts` JIT wrapper | `null` = whole cartesian product (~10,656/band, ~31,968 total). List = build only these (validated: ≥2 known terms, else silently ignored). `()` = none. Your `styleEntry` must leave `01_config` unconfigured when `jit: true` (double-config = Sass error) |

Derived (not knobs — do not pass to `with`): `_02` `$literals`, `$space-literals`,
`$radius-literals`; `_04` `$sm/$md/$lg`, `$frame-ratios`; `_05` `$md/$lg/$xl`;
`_10` `$_short-steps`, `$_border/pad/gap-prefixes`, `$_borders/$_pads/$_gaps`,
`$_aliases`.

---

## 2. A — shared vocabulary (`_style-vocabulary.sass`, CSS-free)

Single source of truth for step names and family maps. `_02` (emitter) and
`_10` (alias indexer) read the **same** maps — that is what keeps a compound
and its utilities on the same rule.

| Export | Value |
|---|---|
| `$steps` | `('2xs' 'xs' 'sm' 'md' 'bs' 'lg' 'xl' '2xl' '3xl')` — 9 steps. Preset rungs (`--space-<step>`), never px. Note `2xs` = `0` (zero-valued, still gets compounds) |
| `$gap-families` | `(gap: gap, rgap: row-gap, cgap: column-gap)` — 3 families, gap-scale channel |
| `$pad-families` | `(pad: padding, pad-x: padding-inline, pad-y: padding-block, pad-top: padding-top, pad-right: padding-right, pad-bottom: padding-bottom, pad-left: padding-left)` — 7 families, pad-scale channel. `x/y` logical (inline/block, RTL-safe); named sides physical |
| `$border-families` | `(border: border, border-top: border-top, border-right: border-right, border-bottom: border-bottom, border-left: border-left)` — 5 families, no scale, no steps. Consumed in `_06`, indexed in `_10` |
| `$marg-families` (local to `_02`, line 38 — **not** in vocabulary) | `(marg: margin, marg-x: margin-inline, marg-y: margin-block, marg-top/right/bottom/left)` — 7 families, gap-scale channel, ± both signs (`-` / `--` infix). Local because margins never enter compounds; keeping them out of the shared module makes that a structural fact, not a convention |

Forwarding: `_02` re-exports `$steps, $gap-families, $pad-families`
(`@forward … show …`) so downstream `@use '02_dimensions'` sees them.

To add a step/family: add to vocabulary **and** add matching `--space-*` /
declaration support — a vocabulary entry without a token compiles but points at
an undefined `var()` (declaration dropped silently at computed-value time).

---

## 3. B — runtime tokens (`_00_tokens.sass`, `:root` + mixins)

Light is the marker-free default (SSR/JS-off safe). Dark arrives via
`prefers-color-scheme` **and** explicit `[data-mode='dark']`; `[data-mode='light']`
forces light. Theme classes (`.theme-*`, §5) sit **after** tokens and beat mode
defaults; `_08_own` sits after themes.

Convention: every preset utility has a `, 1` fallback on its scale
(`var(--gap-scale, 1)`) and viewport maths have px fallbacks — utilities stand
alone without shell/preset context. An *undefined* variable with **no** fallback
invalidates the whole declaration (this is why new steps need tokens).

### 3.1. Surfaces / backgrounds

| Token | Light (`=light-theme-tokens`) | Dark (`=dark-theme-tokens`) | Overridden by | Consumed by |
|---|---|---|---|---|
| `--bg` | `#ffffff` | `#101010` | every `.theme-*`, `data-color` | `.bg`, `body`, `.app-header`, `.drawer`, `button.small.outline` |
| `--bg-surface` | `#eae9e8` | `#202021` | every `.theme-*`, `data-color` | `.surface`, `.card`, `.pill`, `.button` |
| `--bg-raised` | `#d0d0d2` | `#3a3a3a` | every `.theme-*`, `data-color` | `.raised`, `.kbd`, `.switch-track`, `.mobile-toc[open]` |
| `--bg-panel` | `#eae9e8` | `#1f1f20` | every `.theme-*`, `data-color` | `.panel` |
| `--bg-footer` | `#E9ECEF` | `#111111` | every `.theme-*` | `.footer` |
| `--bg-popover` | `#e6e8e9` | `#363637` | every `.theme-*` | `.popover` |
| `--bg-dialog` | `#e6e6e6` | `#39393a` | every `.theme-*` | `.dialog`, `.badge`, `.rig-harness` |
| `--bg-terminal` | `#0F172A` | `#121213` | every `.theme-*` | `.terminal` (dark navy in both modes by design) |
| `--bg-input` | `#FFFFFF` | `#1c1c1d` | every `.theme-*` | `.input`, `.select` |
| `--bg-button` | `#9a9a9a` | *(not redefined — inherits light `#9a9a9a`)* | — | `.pd-rail` (deck wireframe) |
| `--bg-canvas` | *(not in light mixin — inherits theme or unset)* | `#171818` | every `.theme-*` (all 76 set it) | `.canvas` |

### 3.2. Text / state / borders / accents / status

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--text-primary` | `#0f172a` | `#EDF2F7` | `.text-primary`, body, headings |
| `--text-secondary` | `#717171` | `#c7c7c7` | `.text-secondary`, `.nav-l1`, `.toc-link` |
| `--text-muted` | `#a3a4a7` | `#7c7c7c` | `.text-muted`, `.navtree-title`, `.eyebrow` |
| `--text-inverse` | `#ffffff` | `#0E1118` | `.text-inverse`, `.button.primary`, `.pill.active` — flips with mode by design |
| `--text-richtext` | `#484848` | `#797878` | `.richtext p/li` |
| `--state-hover` | `#dcdee0` | `#4a4a4b` | `.nav-l1:hover`, `.button.small.ghost.hoverstyle:hover` |
| `--state-hover-subtle` | `#edebeb` | `#2b2b2b` | `.nav-l1:hover`, `.accordion-trigger:hover`, `.code-frame__head` bg |
| `--state-selected` | `#d1d2d4` | `#666668` | `.button.active` |
| `--border` | `#e9ebed` | `#2f2f2f` | `.border*`, `.card`, `.input`, `.dialog`, `.tab-list` — theme supplies colour; density never scales borders |
| `--border-subtle` | `#f3f3f4` | `#1e1e1f` | `.border-subtle` only (outside compound grammar) |
| `--border-strong` | `#d1d1d1` | *(inherits light)* | `.rig-harness`, `.shadowfax` |
| `--theme-color` | `#2F9E44` | `#2F9E44` (same) | `.text-theme`, `.link`, `.button.primary`, `.toc-link.active`, `.richtext li::marker`, `.pd-art` border |
| `--theme-color-alt` | `#2d9206` | `#36731d` | `.text-alt`, `.button.primary:hover`, `.link-parent:hover` |
| `--success` / `--success-hover` | `#10B981` / `#059669` | `#34D399` / `#6EE7B7` | `.text-success` / `.bg-success` |
| `--warning` / `--warning-hover` | `#F59E0B` / `#D97706` | `#FBBF24` / `#FCD34D` | `.text-warning` / `.bg-warning` |
| `--danger` / `--danger-hover` | `#EF4444` / `#DC2626` | `#F87171` / `#FCA5A5` | `.text-danger` / `.bg-danger`, `.field-error` |
| `--info` / `--info-hover` | `#3B82F6` / `#2563EB` | `#60A5FA` / `#93C5FD` | `.text-info` / `.bg-info` |
| `--feedback-error` | `#DC2626` | `#F87171` | Set by every theme (22nd token); older alias of danger for forms |
| `--ring` | `rgba(0,127,78,.35)` | `rgba(16,185,129,.4)` | Focus rings (`.input`, `.button`, `.accordion-trigger`) |
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,.06)` | `0 1px 2px rgba(0,0,0,.4)` | `.shadow-sm` (+ `-mob/-desk`) |
| `--shadow-md` | `0 4px 12px rgba(15,23,42,.08)` | `0 4px 12px rgba(0,0,0,.35)` | `.shadow-md`, `.popover` |
| `--shadow-lg` | `0 12px 32px rgba(15,23,42,.12)` | `0 12px 32px rgba(0,0,0,.45)` | `.shadow-lg`, `.dialog` |

Status `*-hover` tokens have no classes — they are for hand states in `_08_own`.
The 12 tokens themes deliberately **don't** set (fall through to the per-mode
defaults above): `--success(+hover)`, `--warning(+hover)`, `--danger(+hover)`,
`--info(+hover)`, `--shadow-sm/md/lg`, `--ring`.

### 3.3. Fonts, type scale, spacing, radius, motion, controls, layers, layout, speeds

| Group | Tokens (all on `:root`) | Values / notes |
|---|---|---|
| Fonts | `--font-sans`, `--font-mono` | `Inter, Roboto, …` / `ui-monospace, Cascadia Code, …`. Consumed by `body`, `.mono`, `.font-mono`, `.shiki`, `.kbd` |
| Type scale (fluid Utopia 360→1240) | `--text-xs: 0.75rem`, `--text-sm: 0.875rem`, `--text-bs: clamp(1rem,1rem,1rem)`, `--text-lg: 1.125rem`, `--text-xl: 1.25rem`, `--text-2xl: 1.5rem`, `--text-3xl: 1.875rem`, `--text-4xl: 2.25rem`, `--text-5xl: 3rem`, `--text-6xl: 3.75rem`, `--text-7xl: 5rem` | Classes exist for `xs/sm/bs/lg/xl/2xl/3xl/4xl/5xl` (`.text-*`). `6xl/7xl` tokens have **no** classes (add if marketing needs them). ⚠️ `--text-md` has **no token** — `.text-md` points at an undefined var (gap; use `.text-bs`). `--textmultiplier: 1.2`, `--prtext-bs: calc(var(--text-bs)*var(--textmultiplier))` reserved |
| Space scale (fluid; density applied at use sites) | `--space-2xs: 0`, `--space-xs: clamp(.125rem,.0739rem+.2273vw,.25rem)`, `--space-sm: …(.25→.5)`, `--space-md: (.5→.75)`, `--space-bs: (.75→1)`, `--space-lg: (1→1.5)`, `--space-xl: (1.5→2)`, `--space-2xl: (2→3)`, `--space-3xl: (3→4)` | Gaps/margins compute `calc(var(--space-*) * var(--gap-scale,1))`; paddings `* var(--pad-scale,1)`. `--coreSpace-*` mirrors the same 8 stops for tooling |
| Radius fixed | `--radius-0: 0`, `-2: 2px`, `-3: 3px`, `-4: 4px`, `-6: 6px`, `-8: 8px`, `-12: 12px`, `-16: 16px`, `-24: 24px`, `--radius-full: 9999px` | No direct classes (literals `.radius-N` hardcode px instead); available for hand rules |
| Radius channels (the ones classes read) | `--radius-sm: 8px`, `--radius-md: 16px`, `--radius-lg: 24px` (defaults = `curved`) | Remapped by every `data-shape`. Read by `.radius-sm/md/bs/lg/xl` — wait, `bs`/`xl` channels: `--radius-bs`/`--radius-xl` have **no tokens**; `.radius-bs` compiles to `var(--radius-bs)` (undefined → dropped) and `.radius-xl` likewise. Usable channels today: `sm/md/lg` (+`full`). `code-frame` reads `var(--radius-bs)` — same gap |
| Motion | `--motion-fast: 120ms`, `--motion-base: 160ms`, `--motion-slow: 240ms`, `--ease-out: cubic-bezier(.16,1,.3,1)`, `--ease-spring: cubic-bezier(.34,1.56,.64,1)` | Remapped by `data-motion`. Read by rails/drawer/dialog/popover/accordion/switch. `prefers-reduced-motion: reduce` zeroes all three durations globally |
| Controls | `--control-h-sm: 26px`, `--control-h-md: 32px`, `--control-h-lg: 38px` | `.input/.select` use `md`; `.accordion-trigger` min-height `md` |
| Layers | `--z-base: 0`, `--z-raised: 10`, `--z-sticky: 100`, `--z-modal: 200`, `--z-toast: 300` | Header `sticky`; popover `raised`; drawer/dialog `modal` |
| Layout | `--header-height: 64px`, `--footer-height: 32px` (0 when shell omits `f`), `--measure: 65ch`, `--page-gutter: clamp(1rem,4vw,2rem)`, `--sidebar-width: 280px`, `--toc-width: 280px`, `--card-min: 16rem`, `--breakpoint: 768px` (mirror of Sass seam for JS), `--avatar-size: 32px`, `--switch-w: 40px`, `--switch-h: 22px`, `--switch-thumb: 16px`, `--select-arrow-gap: 28px`, `--popover-offset: 6px`, `--blur-sm: 12px` | Override per-context inline (e.g. `style="--card-min: 20rem"`) rather than forking classes |
| Speeds (chrome family) | `--transin-1/2/3`, `--transout-1/2/3` (cubic-beziers), `--speed-0: 40ms`, `--speed-1: 90ms`, `--speed-2: 140ms`, `--speed-3: 220ms`, `--button-std: var(--speed-2) var(--transout-2)` | Header underline + `.button` transitions (distinct from `--motion-*`) |
| Deck-scoped (not `:root`; set on `.pdeck/.solodeck`) | `--pd-h` (height, default fallback `100vh` — set on an **ancestor**, never on `.pdeck` itself), `--pd-paper: #f2f1ec`, `--pd-ink: #0e0e10`, `--pd-ink-2: #54524c`, `--pd-line: #d3d1c8`, `--pd-acid: #ff3b1f`, `--pd-deva: Kohinoor Devanagari stack` | Deck renders identically under every theme/mode by design |
| Shiki-scoped (set by highlighter at runtime) | `--shiki-light`, `--shiki-dark` | `.shiki` colour falls back to `var(--text-primary)` / `inherit` when absent |
| Density (set by `data-layout`, default `1`) | `--gap-scale`, `--pad-scale`, `--scaleMultiplier` (always `1`, reserved) | See §4 |

---

## 4. B — `data-*` attribute API (on `<html>` unless noted)

Defaults **remove** the attribute (`applyAttr`: default value ⇒ `removeAttribute`).
Absent attribute **is** the default. Persisted to `localStorage` (`futils.presets`,
`futils.mode`) except per-page `scopePreset()` overrides. Inline head script
(`getPresetScript()`) stamps saved values before first paint.

Canonical value sets live in `presets/stylepresets.ts` (`presetAxes`,
`presetDefaults`).

### 4.1. `data-layout` — density (`_00_presets.sass` lines 1–19)

| Value | `--gap-scale` | `--pad-scale` | Character |
|---|---|---|---|
| *(absent)* = `zero` (default) | `1` | `1` | Neutral |
| `tight` | `0.5` | `0.5` | Dense dashboards |
| `comfortable` | `1.125` | `2` | Reading / docs |
| `sprawling` | `1.25` | `4` | Marketing air |

`presetAxes.layout = ['zero','tight','comfortable','sprawling']`, default `'zero'`.
Gaps **and** margins read `--gap-scale`; paddings read `--pad-scale`. Equal step
names do **not** promise equal px (channels differ by design).

### 4.2. `data-shape` — corner channels (lines 21–45)

| Value | `--radius-sm` | `--radius-md` | `--radius-lg` |
|---|---|---|---|
| *(absent)* = `zero` (default) | `0` | `0` | `0` |
| `round` | `16px` | `24px` | `32px` |
| `curved` | `8px` | `16px` | `24px` (= token defaults; unset shape renders curved) |
| `pro` | `4px` | `8px` | `16px` |
| `sharp` | `2px` | `4px` | `8px` |

`presetAxes.shape = ['round','curved','pro','sharp','zero']`, default `'zero'`.
Only channel-reading classes follow it (`.radius-sm/md/lg`, `.card`, `.input`,
`.kbd`, …). `.radius-N` literals never follow it.

### 4.3. `data-color` — surface ladder tint (lines 47–102)

| Value | Light `--bg/surface/raised/panel` | Dark override |
|---|---|---|
| *(absent)* = `zero` (default) | `#FFFFFF / #fbfbfb / #f5f7f9 / #FFFFFF` | `#101010` ×4 (flat) |
| `clean` | `#FFFFFF / #fbfbfb / #f5f7f9 / #F7F8F9` | `--bg/surface #090909`, `raised #333334`, `panel #101010` |
| `vibrant` | `#FFFFFF / #f2f5f7 / #e8eef3 / #E9EEF3` | `bg/surface #202021`, `raised #333334`, `panel #1f1f20` |

`presetAxes.color = ['clean','vibrant','zero']`, default `'zero'`. (`general` is the
theme-mixin default, not a `data-color` value.) Dark selectors cover **both** dark
paths: `:root:not([data-mode='light'])[data-color]` (OS dark) and
`[data-mode='dark'][data-color]` (explicit).

### 4.4. `data-motion` — durations (lines 104–134)

| Value | `--motion-fast` | `--motion-base` | `--motion-slow` | `--ease-out` |
|---|---|---|---|---|
| *(absent)* = `active` (default) | `140ms` | `200ms` | `300ms` | spring `(.34,1.56,.64,1)` |
| `springy` | `50ms` | `100ms` | `150ms` | spring |
| `heavy` | `200ms` | `300ms` | `450ms` | spring |
| `reduced` | `0ms` | `0ms` | `0ms` | spring |

`presetAxes.motion = ['reduced','heavy','active','springy']`, default `'active'`.
`prefers-reduced-motion: reduce` zeroes all three regardless of preset. Note the
`:root` token defaults (`120/160/240ms`) apply only before any preset rule matches;
`active` is the effective default.

### 4.5. `data-mode` — colour mode (tokens lines 220–228, `stylepresets.ts` `setMode`)

| Value | Meaning |
|---|---|
| *(absent)* | Follow OS (`prefers-color-scheme`); light tokens SSR-safe default |
| `light` | Force `=light-theme-tokens` (wins over OS dark by source order) |
| `dark` | Force `=dark-theme-tokens` |

`setMode('light'|'dark')` persists; `setMode(null)` clears to OS. `getMode()`,
`isDark()`, `toggleMode()`, `onModeChange()` in `stylepresets.ts`.
**Always pair a `.theme-*-dark` class with `data-mode="dark"`** (and light with
light): colour-preset dark variants key off `prefers-color-scheme`, so a theme
without its mode can tune against the OS instead of itself.

### 4.6. `data-shell` — region composition (`_05_shells` + tokens + `stylepresets.ts`)

On `<html>`, set by the preset system / route layout / `scopePreset('shell', …)`.
Value lists **optional regions present**: `l` left rail (nav), `r` right rail
(TOC), `f` footer. `a` (in `presetAxes` values like `lrfa`) = constrained
`app-content` article column instead of full-bleed `PageShell` (layout-level
concern; no Sass rule keys off `a` — substring matching ignores it safely).
`c` = content-only (omits all three).

| Value | Left | Right | Footer | Notes |
|---|---|---|---|---|
| *(absent)* = `lrf` (default, full shell) | ✅ | ✅ | ✅ (`--footer-height: 32px`) | No suppression rules match |
| `lrfa`, `lra`, `lfa`, `la`, `fa`, `ca` | per letters | per letters | per letters | `a`-variants: same chrome, article column |
| `lr` | ✅ | ✅ | ❌ (`0px`) | |
| `lf` | ✅ | ❌ | ✅ | |
| `l` | ✅ | ❌ | ❌ | |
| `f` | ❌ | ❌ | ✅ | |
| `c`, `ca` | ❌ | ❌ | ❌ | Chromeless embed/article |

`presetAxes.shell = ['lrf','lrfa','lr','lra','lf','lfa','l','la','f','fa','c','ca']`,
default `'lrf'`. Letters disjoint ⇒ `*=` safe. The sanctioned set is deliberate
(paribhāṣā): the full cube is **not** exposed — e.g. TOC-without-nav has no value.
Footer height follows in tokens (`:not(*="f") → 0px`, `*="f" → 32px`).

### 4.7. Element-scoped attributes (not on `<html>`)

| Attribute | Element | Values | Effect |
|---|---|---|---|
| `data-wrap` | `.shiki` (`_14_shiki`) | `'true'` (only styled value) | `code { white-space: pre-wrap; word-break: break-word }`. Absent = scroll-x |
| `aria-checked` | `.switch-track` | `'true'` | On-state: theme fill + thumb `translate: 18px 0`. `.checked` class is the non-ARIA equivalent |
| `open` | `.dialog` (also `.open` class), `<details class="mobile-toc">`, `.accordion-item` (via `.open` on item) | present / absent | Shown states. Dialog honours both `[open]` (native) and `.open` |
| `aria-selected` | `.tab-trigger` | `'true'` | Native selected marker (visual current = `.active`) |
| `aria-pressed` | `.pd-key` (deck) | `'true'` | Pressed key: ink fill, paper text |

---

## 5. B — theme classes (`.theme-*`, `_00_themes.sass`, 76 palettes)

Plain classes on `<html>` (e.g. `<html class="theme-night-dark" data-mode="dark">`).
Static class works — no JS required. Position: after tokens (beats mode defaults),
before `_08_own` (your overrides beat themes).

Each theme sets **exactly 22 tokens**: `--bg, --bg-surface, --bg-raised,
--bg-panel, --bg-footer, --bg-popover, --bg-dialog, --bg-terminal, --bg-input,
--bg-canvas, --border, --border-subtle, --text-primary, --text-secondary,
--text-muted, --state-hover, --state-hover-subtle, --state-selected,
--theme-color, --theme-color-alt, --text-inverse, --feedback-error`.
The other 12 contract tokens (statuses + hovers, shadows, `--ring`) fall through
to per-mode defaults — palettes have no opinion about "danger".

### 5.1. Hand-authored light (21)

`theme-light-default`, `theme-himalaya-light`, `theme-editorial-light`,
`theme-space-light`, `theme-sun-light`, `theme-monochrono-light`,
`theme-molly-light`, `theme-malana-light`, `theme-coresync-light`,
`theme-studio-light`, `theme-matcha-light`, `theme-sakura-light`,
`theme-nordic-frost-light`, `theme-desert-dune-light`,
`theme-lavender-mist-light`, `theme-botanical-light`,
`theme-clay-studio-light`, `theme-solaris-light`,
`theme-cyberpunk-day-light`, `theme-copper-patina-light`, `theme-dracula-light`

### 5.2. Hand-authored dark (20)

`theme-lagoona-dark`, `theme-frozen-dark`, `theme-night-dark`,
`theme-inkworm-dark`, `theme-monochrono-dark`, `theme-fouram-dark`,
`theme-wintercame-dark`, `theme-sun-dark`, `theme-console-dark`,
`theme-dracula-dark`, `theme-catppuccin-mocha`, `theme-nord-dark`,
`theme-gruvbox-dark`, `theme-onedark-pro`, `theme-rose-pine-dark`,
`theme-midnight-emerald-dark`, `theme-obsidian-crimson-dark`,
`theme-synthwave-dark`, `theme-deep-ocean-dark`, `theme-amethyst-void-dark`

### 5.3. Generated counterparts (35, `pnpm pair` adds missing only, never rewrites)

Dark twins of lights: `theme-dark-default`, `theme-himalaya-dark`,
`theme-editorial-dark`, `theme-space-dark`, `theme-molly-dark`,
`theme-malana-dark`, `theme-coresync-dark`, `theme-studio-dark`,
`theme-matcha-dark`, `theme-sakura-dark`, `theme-nordic-frost-dark`,
`theme-desert-dune-dark`, `theme-lavender-mist-dark`, `theme-botanical-dark`,
`theme-clay-studio-dark`, `theme-solaris-dark`, `theme-cyberpunk-day-dark`,
`theme-copper-patina-dark`.
Light twins of darks: `theme-lagoona-light`, `theme-frozen-light`,
`theme-night-light`, `theme-inkworm-light`, `theme-fouram-light`,
`theme-wintercame-light`, `theme-console-light`, `theme-catppuccin-latte`,
`theme-nord-light`, `theme-gruvbox-light`, `theme-onelight-pro`,
`theme-rose-pine-light`, `theme-midnight-emerald-light`,
`theme-obsidian-crimson-light`, `theme-synthwave-light`,
`theme-deep-ocean-light`, `theme-amethyst-void-light`.
Each carries a `// twin: <source>` line. Ramp measured from hand-paired
sun/monochrono/dracula; accents keep hue. To regenerate one: delete its block,
re-run.

---

## 6. C — class registry

Suffix rule (Contract 7): every loop-generated utility exists as
`.x`, `.x-mob`, `.x-desk` (keys of `$responsive-modes`). Mode suffix appends
**once** per whole compound (`.b-ps-gl-desk`, never `.b-desk-ps-gl`).
HTML class order never wins — stylesheet order does. Gaps never enable layout:
keep `.box/.row/.grid(-N)` alongside `gap-*`.

### 6.1. Base (`_01_base.sass`) — not registry classes, predictability only

`* { box-sizing: border-box; margin: 0 }`, `body/html` font/colour/background +
legibility, `img/video/svg { display:block; max-width:100% }`,
`button/input/select/textarea/blockquote` inherit font+colour, `a` inherit + no
underline, headings/paragraphs/lists zeroed, `.font-mono` (mono + tabular-nums,
weight 500).

### 6.2. L1 dimensions (`_02_dimensions.sass`)

**Space presets** — token-routed, fluid, density-aware:

| Pattern | Declaration | Bands | Count (defaults) |
|---|---|---|---|
| `.gap-<step>`, `.rgap-<step>`, `.cgap-<step>` | `gap/row-gap/column-gap: calc(var(--space-<step>)*var(--gap-scale,1))` | ×3 | 3 fam × 9 steps × 3 |
| `.pad-<step>`, `.pad-x/y/top/right/bottom/left-<step>` | `padding*: calc(var(--space-<step>)*var(--pad-scale,1))` | ×3 | 7 × 9 × 3 |
| `.marg-<…>-<step>` (7 fams) | `margin*: calc(var(--space-<step>)*var(--gap-scale,1))` | ×3 | 7 × 9 × 3 |
| `.marg-<…>--<step>` (negatives, `--` infix) | `… * -1` | ×3 | 7 × 9 × 3 |

`<step> ∈ 2xs,xs,sm,md,bs,lg,xl,2xl,3xl` (2xs = 0). Gap/pad rules also carry all
compound aliases for their term (§6.11).

**Space literals** — exact px, density-immune, never in compounds:

| Pattern | Declaration | Values (defaults) |
|---|---|---|
| `.(gap\|rgap\|cgap)-N` | `…: Npx` | N ∈ `0,1,2,4,6,8,12,16,24,32,40,48,56,64` |
| `.(pad\|pad-x/y/…)-N` | same | same 14 |
| `.marg-…-N` / `.marg-…--N` | `Npx` / `-Npx` | same 14, both signs |

**Radius:**

| Pattern | Declaration | Notes |
|---|---|---|
| `.radius-N` | `border-radius: Npx` | N ∈ same 14 (0 = reset). Bypasses `data-shape` |
| `.radius-full` | `var(--radius-full)` | Pills/circles |
| `.radius-sm/md/bs/lg/xl` | `var(--radius-<step>)` | Channels — follow `data-shape`. ⚠️ `bs`/`xl` tokens undefined today (see §3.3); usable: `sm/md/lg` |

**Sizing** (full 70-value ladder `0,1,2,4,6,8,12,16,24,…,512`):

`.w-N {width:Npx}`, `.h-N {height:Npx}`, `.square-N {width+height:Npx}` (×3 bands),
`.wfull/.hfull/.full {100%}`, `.min0 {min-width:0;min-height:0}` (grid/flex blowout fix).

**Viewport:** `.hfull-vh {min-height:100vh}`, `.hfull-vh-fitted {min-height:
calc(100vh - var(--header-height,48px) - var(--footer-height,0px))}` (normal-flow
only — never on sticky/fixed), `.h88-vh {min-height:88vh}`.

**Shadows (responsive copies only — bases in §6.6):**
`.shadow-sm/md/lg-mob/-desk {box-shadow: var(--shadow-*)}`.

### 6.3. L2 containers (`_03_containers.sass`) — alignment nests under base, never standalone

* `.box` (column): `xcenter/xleft/xright` (align + text-align), `ycenter/ytop/ybot/ybetween/yevenly/yaround` (justify). `.box.ycenter` + `.box.xcenter` = centred stack (hero basis)
* `.row` (row): `xleft/xcenter/xright/xbetween/xevenly/xaround` (justify), `ycenter/ytop/ybot` (align). Axes physical, always (Contract 4)
* `.grid` (plain grid, cf. `.grid-N` stepping): `center` (place-items), `xcenter/xleft/xright/xstretch`, `ycenter/ytop/ybot/ystretch`, `xbetween/xevenly/xaround` (justify-content), `ybetween/yevenly/yaround` (align-content)
* `.wrap {flex-wrap:wrap}`, `.grow {flex:1 1 0%}`, `.shrink-0 {flex-shrink:0}`
* `.relative/.absolute/.fixed/.sticky {position:…}`
* `.scroll-y {overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain}` (needs `.h-*` or constraining flex parent), `.scroll-x {overflow-x:auto;overflow-y:hidden;…}` (`.reel` adds snap)

### 6.4. L3 layouts (`_04_layouts.sass`)

| Class | Behaviour |
|---|---|
| `.grid-1` | 1 col always |
| `.grid-2` | 1 → 2 @ md (768) |
| `.grid-3` | 1 → 3 @ lg (1024). Exactly-3 rule: never 2+1 |
| `.grid-4` | 1 → 2 @ sm (640) → 4 @ lg. 4/multiples-of-4 rule: never 3+1 |
| `.grid-6` | 1 → 2 @ sm → 3 @ md → 6 @ lg |
| `.card-grid` | `repeat(auto-fit, minmax(min(var(--card-min),100%),1fr))` — count negotiable, `--card-min` (default 16rem) overridable inline |
| `.prose` | `max-width:50ch`, column flex (compose `.gap-*` for rhythm — no default gap, no `*+*`) |
| `.content-clamp` | `max-width:1280px; margin-inline:auto` |
| `.frame-16-9/-9-16/-4-3/-3-4/-3-2/-2-3/-1-1` | `aspect-ratio`, `overflow:hidden`, `relative`; media children fill + `object-fit:cover` |
| `.reel` | Snap rail: `overflow-x:auto`, `overscroll-inline:contain`, `scroll-snap-type:inline mandatory`; `> * {flex:0 0 auto; scroll-snap-align:start}` — the system's one permitted `>` |
| `.center-item` | `margin-inline:auto; margin-block:0` |

All `.grid-N` tracks `repeat(N,minmax(0,1fr))`; compose `.gap-*` (no default gap — self-sufficiency).

### 6.5. L4 shells (`_05_shells.sass`)

App frame: `.app-shell` (column, relative; `.open` resurrects left drawer < lg),
`.app-header` (sticky, `--header-height`, `--bg`, density padding),
`a.nav-header` (animated theme underline), `.app-main` (flex-1, footer-aware
min-height, <1024px gutters), `.main-section`, `.content-section` (+ `.null`,
`.narrow-full/half/wide` stepped 640→1280px across 769/1025/1281/1441px).
Rails: `.sidebar-left` (≥ lg; drawer < lg when `.app-shell.open`), `.sidebar-right`
(≥ xl), sticky `top: header`, `max-height: 100vh-header`, **no** footer subtraction.
`.mobile-toc` (`<details>`, < xl only). Tree/TOC: `.navtree`, `.navtree-title`,
`.nav-l1` (+ `button.nav-l1`), `.nav-l2`, `.navtree-sub`, `.toc`, `.toc-title`,
`.toc-list`, `.toc-link` (+ `.active`), `.toc-footer`. Tabs: `.tab-list`,
`.tab-trigger` (+ `.active`). Page: `.page-shell` (padding both axes),
`.page-split` (1 col → sidebar+content @ md; `.page-main`, `.page-sidebar`).
Overlays (shown via `.open`; dialog also `[open]`): `.drawer` (slide),
`.dialog` (fade+rise, `::backdrop` 50%), `.popover` (offset `6px` token —
see popover-`top` caveat in companion doc), `.accordion` / `.accordion-item`
(`.open` → grid-rows `0fr→1fr`) / `.accordion-panel` (named collapse box) /
`.accordion-trigger`. `.hero` (centred column, `gap-lg`, `pad-y-xl` sugar).

### 6.6. L5 visuals (`_06_visuals.sass`)

* Surfaces: `.bg/.surface/.raised/.panel/.footer/.canvas/.terminal`
* Ink: `.text-primary/-secondary/-muted/-inverse/-theme/-alt/-success/-warning/-danger/-info`, `.bold`, `.italic`; fills `.bg-success/-warning/-danger/-info`
* Borders: `.border` (+ all `b-…` compounds), `.border-subtle` (solo, no compounds),
  `.border-top/right/bottom/left` (+ `bt/br/bb/bl-…` compounds), responsive `.border*-mob/-desk` + responsive compounds (one suffix governs all ops)
* Type: `.text-xs/sm/bs/lg/xl/2xl/3xl/4xl/5xl` (⚠️ `.text-md` undefined token — use `bs`), `.text-tight/-lg`, `.lh11/.lh12/.lh15`, `.weight-400/500/600/700/800`, `.mono/.tt-u/.tt-c/.ta-c`, `.truncate`, `.clamp-1/2/3`, `.eyebrow`
* Compositions (restyleable): `.card` (row-gap surface border `--radius-md`), `.field/.field-label/.field-error`, `.avatar` (`--avatar-size`, circular, `img` + nested-`img` cover), `.divider`, `.kbd`, `.switch-track/.switch-thumb` (`[aria-checked='true']/.checked` on-state)
* Visibility: `.hide-mobile` (mob none), `.hide-desktop` + `.only-mobile` (desk none — aliases)
* Shadows: `.shadow-sm/md/lg {box-shadow: var(--shadow-*)}` (per-mode values in tokens)

### 6.7. Interactions (`_07_interactions.sass`)

`.badge` (chip, `--bg-dialog`, `--radius-sm`, `max-content`), `.pill` (+ `.active`/`.themed`),
`.input` / `.select` (`--control-h-md`, `--bg-input`, theme focus ring; select custom
chevron + `--select-arrow-gap`), `.link` (theme, underline on hover),
`.link-plain` (inherit → theme on hover), `.link-parent:hover .link/.link-plain`
alt colour, `.button` + nested `.primary/.ghost/.active/.is-icon/.small(.outline/.ghost.hoverstyle)` (never standalone modifiers), `.bord0 {border:none}`,
`button.blank` (reset).

### 6.8. Prose / deck / intro / frame / shiki / own

* `.richtext` (`_11`): `p/li` base rhythm, `strong` primary, list markers themed,
  `blockquote` (theme bar, `cite`), `h2/h3` scroll-margin + hover `.rlink`, `h2` 2xl/5rem-2.5rem, `h3` lg/3rem-1.5rem
* Deck (`_12`, theme-immune, `pd-` namespaced under `.pdeck/.solodeck`):
  `.pdeck` (grid-paper backdrop, `height: var(--pd-h,100vh)`), `.solodeck .pd-slide` (+ `.active` + stagger),
  `.pd-tag/.pd-dv`, `h1/h2 (+u accent)`, `.pd-strip`, `.pd-collapse (.done .drop/.keep)`,
  `.pd-cap`, `.pd-devices/.pd-device/.pd-tr/.pd-ds`, `.pd-verse/.pd-translit/.pd-micmac/.pd-mm`,
  `.pd-q(.sm/.lg) i(.hot)`, `.pd-cell`, `.pd-eq`, `.pd-ladder/.pd-rung(.pd-lv/.pd-nm/.pd-ds)`,
  `.pd-composer/.pd-keys/.pd-key([aria-pressed].pd-ltr/.pd-nm)`, `.pd-wire/.pd-head(.off)/.pd-bodyrow/.pd-rail(.r/.off)/.pd-mainrow/.pd-art(.wide)/.pd-foot(.off)/.pd-value`,
  `.pd-figs/.pd-f/.pd-mark`, `.pd-idx/.pd-brand/.pd-dots/.pd-dot(.on)/.pd-nav(.prev/.next)`,
  responsive <900/<800/<620, `@keyframes pd-grow`, `.pd-special`
* `.shadowfax` (`_13`): bordered `--space-2xl/3xl` padded block (site-intro surface)
* Frame (`_14_frame`, loaded last): `.bg-line` (border-as-background for hairline grids),
  `.border-theme` (border-colour companion to `.border`), `.bg-theme/.bg-theme-alt` (accent fills),
  `.cap` (inset top-edge label — pair with `.relative`; fixed light ink by design),
  `.corner(.tl/.tr/.bl/.br)` (corner `+` ticks), `.weight-900` (display weight)
* Shiki (`_14_shiki`): `.shiki` (mono xs code scroller, `--shiki-light/dark` aware),
  `.shiki[data-wrap='true']`, `.code-frame` (`--radius-bs` ⚠️ undefined token — see §3.3) /
  `__head/__copy(.is-copied)/__body`
* Own (`_08_own`, project-local, beats themes): `.bdr` (red debug border), `h1–h4 600`,
  `.nav-logo img`, `.marg-auto`, `.rig-harness/.in-rig`

### 6.9. Composition shorthand grammar (`_10`, full spec in `_composition-guide.sass`)

Two-or-three ops, always **border → padding → gap**, one scope each. Missing op emits
nothing (never a reset).

| Op | Unscoped (short step) | Scoped (full step) | Example compound ≡ utilities |
|---|---|---|---|
| Border | `b, bt, br, bb, bl` (no step) | — | `b-ps-gl` ≡ `border pad-sm gap-lg` |
| Padding | `p{2xs,xs,s,md,b,l,xl,2xl,3xl}` | `px:|py:|pt:|pr:|pb:|pl:{full}` | `b-pl:sm-gr:lg` ≡ `border pad-left-sm rgap-lg` |
| Gap | `g{…short…}` | `gr:|gc:{full}` | `ps-gb` ≡ `pad-sm gap-bs` |

Short map: `2xs→2xs, xs→xs, sm→s, md→md, bs→b, lg→l, xl→xl, 2xl→2xl, 3xl→3xl`.
Scoped uses full names only (`px:sm` not `px:s`); unscoped short only (`ps` not `psm`).
`:` written literally in HTML, escaped `\:` in CSS (`CSS.escape()` for querySelector).
Responsive: append `-mob/-desk` **once** (`b-ps-gl-desk`). Never generated: single-term
abbreviations, reordered terms, multi-scope compounds, pixel/negative/`border-subtle`
terms, `-md`-style full synonyms. Counts (defaults): B=5, P=63, G=27 terms →
B×P+B×G+P×G+B×P×G = **10,656/band**, **31,968** total. Tests: `selectors(border)` =
1,792 selectors; `selectors(pad,sm)` = 168; `selectors(gap,lg)` = 384
(`_composition-tests.sass`; compile explicitly, never indexed).

### 6.10. `utils/allutils.sass` — standalone, **not** in `index.sass`

`wa-*` `@layer wa-utilities` extras (align/justify helpers, `wa-border-radius-*`,
`wa-prose-*` rhythm, `wa-body/heading/caption/longform-*` type system, `wa-link*`,
`wa-list-plain`, `wa-form-control-*`). Not loaded by the library entry — import
explicitly if you want it; none of it reads L0 tokens (`--wa-*` namespace).

---

## 7. Sass + TS function API

### 7.1. `compositions.selectors($family, $step: null, $mode: null)` → selector list

Public builder (not an authoring mixin). Returns utility selector first, then
equivalent compounds (`+ -suffix` when `$mode`). Compositions off / step unlisted /
scope disabled ⇒ bare utility only. No substring selectors, no `!important`.
Private: `-term()`, `-escape()`, `-register()`, `-split()` (`-` prefix).

### 7.2. Token mixins (`_00_tokens.sass`)

`=light-theme-tokens` / `=dark-theme-tokens` — the 22-token contract bodies
(plus status/shadow extras). Emitted on `:root` (light), `prefers-color-scheme`
`:root` + `[data-mode='dark']` (dark), `[data-mode='light']` (light).

### 7.3. `utils/builder.ts` — `buildStyles()` pipeline

`scanContent({content, exclude, safelist, root})` → `compileStyles({styleEntry,
sass, maxCssBytes = 131072, jit}, candidates)` → `pruneCss(css, candidates)`
(selector-level keep: class nodes must be in candidate set; `:is/:where/:has`
alternatives, `:not`, attrs, elements, state pseudos preserved; empty
media/supports/container pruned) → `assertCssBudget` (throws over budget).
`extractCandidates()` = conservative literal scan (`[A-Za-z_][A-Za-z0-9_:-]*`,
strips `class:` + trailing `:`). JIT wraps entry with
`@use '01_config' as cfg with ($composition-allowlist: (…))` — one-element list
keeps trailing comma; `()` = no compounds. `defaultContent` covers
`index.html`, `src/**/*.{svelte,html,js,ts,jsx,tsx,mjs,svx}`, `src/routes/**/*.md`;
`defaultExclude` skips git/build/test dirs (explicitly requested `node_modules`
dist sources still scannable).

### 7.4. Preset runtime (`presets/stylepresets.ts`, Svelte mirror `presets.svelte.ts`)

`presetAxes` / `presetDefaults` (table §4), `presetState`, `onPresetChange`,
`isDefault`, `setPreset(axis,value)` (validates, applies, persists, notifies),
`getPreset`, `scopePreset` (non-persisted page-scope, returns restore fn),
`cyclePreset`, `initPresets`, `getPresetScript` (no-flicker head stamp),
`setMode/getMode/isDark/toggleMode/onModeChange`, `MODE_KEY`/`STORAGE_KEY`.
Svelte adds reactive `presets` mirror (`{layout,shape,color,motion,shell,mode,theme}`).

---

## 8. Alphabetical token → defined-in → read-by index (excerpt, full coverage)

`--bg*` tokens → `_00_tokens` (+ every theme) → §6.6/6.7/6.5 classes;
`--text-*` → same → ink/type/richtext; `--state-*` → nav/button/code-head;
`--border(-subtle/-strong)` → borders/cards/inputs; `--theme-color(-alt)` →
links/buttons/TOC/markers; `--success/warning/danger/info(+hover)` →
status text/fills; `--feedback-error` → themes/forms; `--ring` → focus;
`--shadow-*` → shadows/popover/dialog; `--font-*` → base/mono/shiki;
`--text-xs…7xl` → `.text-*` (no `md` token); `--space-*/--coreSpace-*` →
dimension loops; `--radius-0…24/full` → hand rules; `--radius-sm/md/lg` →
channels (`bs/xl` classes dangling — tokens wanted); `--motion-*/--ease-*` →
shells/overlays/switch/deck; `--control-h-*` → inputs/accordion;
`--z-*` → header/overlays; `--header/footer-height` → shell maths + fitted hero;
`--measure/--page-gutter/--sidebar-width/--toc-width/--card-min/--breakpoint/--avatar-size/--switch-*/--select-arrow-gap/--popover-offset/--blur-sm` →
§6.4–6.6 named consumers; `--transin/out-*/--speed-*/--button-std` → chrome
transitions; `--scaleMultiplier` → reserved `1`; `--pd-*` → deck only;
`--shiki-light/dark` → code only; `--gap-scale/--pad-scale` → `data-layout`.
