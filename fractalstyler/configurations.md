# Configurations — src/lib/styles/ builder knobs

Scope: `_01_config.sass`, `_02_dimensions.sass`, `_04_layouts.sass`,
`_05_shells.sass`, `_06_visuals.sass`, `_10_compositions.sass`.

Supporting context: `_style-vocabulary.sass` (shared closed vocabulary),
`_00_tokens.sass` (runtime CSS custom properties),
`_00_presets.sass` (`data-*` remaps), `utils/builder.ts` (JIT scanner),
`_composition-guide.sass` (grammar + cost table).

## Golden rule for this whole document
1. compile-time Sass config (!default) is not runtime theming.
2. If you want to re-theme a deployed site you touch `--space-*`, `--radius-*`, `--gap-scale`, `data-layout/shape/...` in `_00_tokens / _00_presets`.
3. If you want to change what CSS gets emitted and how big the stylesheet is* you configure *`_01_config`* *before anything loads it, or you change a loop/map in `_02/_04/_05/_06/_10` and accept that you have forked the Contract.

## Overview

### 1. Three layers

| Layer | Where | When it takes effect | Example |
| --- | --- | --- | --- |
| **A. Compile-time builder knobs** | `_01_config.sass` `$…: … !default` | At `sass.compile()` time only. Bakes class names, breakpoints, ladder values into the CSS text. | `$breakpoint: 768px`, `$literal-max: 512` |
| **B. Runtime tokens + presets** | `_00_tokens.sass` `:root { --… }`, `_00_presets.sass` `[data-layout]`, `[data-shape]` | In the browser, live. No recompile. | `--gap-scale`, `--space-bs`, `--radius-md` |
| **C. Emitted loops / hand rules** | `_02/_04/_05/_06` `@each/@for` + plain classes, `_10` `selectors()` | At compile time, *driven by* A + `_style-vocabulary`. This is what turns a knob into thousands of selectors. | `@each $n in $literals { .w-#{$n} … }` |

Editing A changes **which selectors exist**. Editing B changes **what existing
selectors compute to**. Editing C changes **the system's shape itself** (new
families, new components, new grammar) and is a fork — do it in `_08_own.sass`
unless you intend to change the library.

### 0.2. How to edit _01_config correctly (never in place)

Header of `_01_config.sass` (lines 1–10) is a contract, not a comment:

```sass
//   @use 'styles/01_config' as cfg with ($literal-max: 256)
//   @use 'styles/index' as *
```

1. **Namespace the configuring load.** The file is literally named
`01_config` — `01_config` is not a valid Sass identifier, so
`@use '01_config' with (…)` without `as cfg` fails. Always
`@use '01_config' as cfg with (…)`.
1. **Configure before anything else loads **`01_config`**.** Sass freezes a
module on first load. `index.sass` does `@use '01_config' as *` on line 11,
and `_02/_04/_05/_06/_10` each do `@use '01_config' as *|cfg`. Your wrapper
must be the *first* loader. In practice that means an app-owned wrapper
file, or letting `utils/builder.ts` generate the wrapper for you (JIT path,
§1.8).
1. **Only **`!default`** variables are knobs.** A variable without `!default`
(e.g. `$literals` in `_02`, `$frame-ratios` in `_04`, `$_aliases` in
`_10`) is derived state — overriding it with `with (...)` is a compile
error. To change derived state you change its inputs in `_01_config` +
`_style-vocabulary`, or you fork the file.
1. **Types are enforced.** `_10` lines 21–30 `@error` on non-boolean flags,
unknown steps, duplicate steps. There is no silent fallback.

### 0.3. Where to look while reading this doc

```text
_style-vocabulary.sass  — $steps, $gap-families, $pad-families, $border-families
                         Closed, CSS-free. _02 and _10 read the SAME maps.
00_tokens.sass          — --space-*, --radius-*, --header-height, --card-min …
00_presets.sass         — [data-layout] → --gap-scale/--pad-scale
                          [data-shape]  → --radius-sm/md/lg
                          [data-motion], [data-color], [data-mode]
```

---

## 1. _01_config.sass — the builder knobs (line by line)

File is 59 lines. Everything configurable lives here; nothing here emits CSS
by itself — it only parameterises the loops in `_02/_06/_10` and the media
queries in `_04/_05/_06`.

### 1.1. Line 11 — @use 'style-vocabulary' as vocabulary

```sass
@use 'style-vocabulary' as vocabulary
```

Imports the closed vocabulary (`$steps`, `$gap-families`, `$pad-families`,
`$border-families`) so the default for `$composition-steps` on line 45 can be
`vocabulary.$steps`. This is why `_01_config` does not re-declare the nine
step names — there is exactly one source of truth for step names, and it is
CSS-free (no declarations, only maps/lists).

**Editing it:** don't. If you remove it, line 45 breaks. If you want a private
step name (e.g. `3xs`), you add it to `_style-vocabulary.sass` `$steps`
*and* to `--space-3xs` in `_00_tokens.sass` — otherwise every
`calc(var(--space-3xs) …)` you generate points at an undefined custom property
and the declaration is invalid at computed-value time (silently drops).

### 1.2. Lines 14–15 — the responsive seam

```sass
$breakpoint: 768px !default
$responsive-modes: (mob: 'all and (max-width: #{$breakpoint - 1})', desk: 'all and (min-width: #{$breakpoint})') !default
```

**What it does:**

- `$breakpoint` is the *single* seam. Every loop-generated utility exists in
three bands per Contract 7: base (`.gap-sm`), `-mob` (below the seam),
`-desk` (at/above the seam).
- `$responsive-modes` is the map the loops actually iterate
(`@each $mode, $query in $responsive-modes` in `_02` lines 120ff and `_06`
lines 81ff). Keys become the class suffix (`-mob`, `-desk`); values become
the `@media` query text, unquoted at the use site with
`string.unquote($query)`.

Note the `- 1` trick: `max-width: 767px` vs `min-width: 768px`, so there is no
1px overlap or gap. It is computed inside `#{}` interpolation at config time,
so `$breakpoint: 768px` bakes to the strings `'all and (max-width: 767px)'`
and `'all and (min-width: 768px)'`.

**Ways to edit it:**

- **Move the seam:** `@use '01_config' as cfg with ($breakpoint: 1024px)`.
Every `-mob/-desk` utility, plus `.hide-mobile/.hide-desktop/.only-mobile`
in `_06` (lines 235–245, which read the same map), moves together. Do *not*
also hand-edit the `769px` in `_05_shells` line 89 or the `1024px` on line 77
— those are shell-typography breakpoints, deliberately independent (see §4).
- **Add a third band** (e.g. `wide`): override the whole map:
`$responsive-modes: (mob: '…', desk: '…', wide: 'all and (min-width: 1440px)')`.
Cost: every loop in `_02` + border loop in `_06` + `selectors()` in `_10`
gains a full extra band. Stylesheet grows ~+50%. The composition grammar
(`b-ps-gl-wide`) works automatically because `selectors($family,$step,$mode)`
just appends `-#{$mode}` — but `_composition-guide.sass` warns: keep `mob`
and `desk` keys; visibility utilities require both.
- **Remove a band** (e.g. desk-only output): pass a single-entry map. Saves
roughly a third of dimension output. Breaks any markup using the removed
suffix (selectors simply won't exist — no error, just no match).
- **Pitfall:** `$breakpoint` alone does nothing unless `$responsive-modes`
interpolates it. If you override `$responsive-modes` with hardcoded strings,
`$breakpoint` becomes dead. Override both together or neither.

### 1.3. Lines 23–25 — the literal ladder

```sass
$literal-fine: (0, 1, 2, 4, 6, 8, 12) !default
$literal-step: 8 !default
$literal-max: 512 !default
```

**What it does:** defines the discrete pixel values for `.gap-{N}`,
`.pad-{N}`, `.marg-{N}`, `.radius-{N}`, `.w-{N}`, `.h-{N}`, `.square-{N}`.

Construction lives in `_02` lines 17–19:

```sass
$literals: $literal-fine
@for $i from 2 through math.div($literal-max, $literal-step)
  $literals: list.append($literals, $i * $literal-step)
```

With defaults: `math.div(512, 8)` = 64, loop `2…64` → `16, 24, 32, …, 512`
(63 values) appended after `(0,1,2,4,6,8,12)` → **70 literals total**.
The comment on lines 17–22 explains *why not 1…512*: a continuous range would
emit 7,302 rungs per band for ~40 useful values.

**Ways to edit it:**

- `$literal-fine` — the precision tail. Interfaces genuinely need 1px/2px.
Add `3` or `5` if your design needs it; remove `6` if you never use it. Each
entry costs 28 classes per band for space families (gap 3 + pad 7 + marg
7×2 for negatives — see §2.4) plus 4 for sizing (w/h/square + radius
handling) — small, safe to tune.
- `$literal-step: 8` — the coarse rhythm. Change to `4` and you double the
coarse rungs (≈133 literals, ~2× dimension CSS). Change to `16` and you
halve them but lose `24, 40, 48…`. Keep it a divisor of `$literal-max` or
the top rung undershoots (e.g. max 500 / step 8 → last rung 496).
- `$literal-max: 512` — the sizing ceiling. Widths/heights/squares run the
*whole* ladder. Lower to `256` for marketing sites (saves ~32 sizing rungs ×
4 selectors × 3 bands ≈ 384 selectors). Raise beyond 512 only for canvas-like
apps; prefer `.wfull` + max-width patterns instead.
- All three compose: fine tail + multiples of step up to max. Space and radius
families then *truncate* this ladder (next section) — so raising
`$literal-max` never creates a `.gap-512` unless you also raise
`$literal-space-max`.

### 1.4. Line 31 — $literal-space-max: 64

```sass
$literal-space-max: 64 !default
```

**What it does:** caps gap/pad/marg literals at 64px. `_02` lines 23–26 build
`$space-literals` by filtering `$literals` to `<= 64`. With defaults that is
`(0,1,2,4,6,8,12,16,24,32,40,48,56,64)` — 14 values.

**Why it exists (lines 27–30 comment):** space families dominate output — 24
of 28 classes per rung (marg doubles for negatives: `marg-N` + `marg--N` for
each of 7 marg families). A 512px gap is meaningless where a 512px width is
not. Large spacing is the preset steps' job: `--space-3xl` is already
`clamp(3rem…4rem)` ≈ 48–64px fluid, and `data-layout='sprawling'` multiplies
padding ×4.

**Ways to edit it:**

- Raise to `96` or `128` if your hero sections genuinely need `pad-96`. Cost
is linear: each added rung × 28 selectors × 3 bands. Prefer a preset step
(`pad-3xl` + `data-layout`) first — it stays fluid, pixel literals don't.
- Lower to `32` for dense dashboards. Breaks markup using `.gap-48` etc.
(no compile error — the class just stops existing).
- Must stay within `$literals`. Setting it to `20` yields rungs up to `16`
(next rung is 24 > 20) — values snap to the ladder, they don't interpolate.

### 1.5. Line 36 — $literal-radius-max: 64

```sass
$literal-radius-max: 64 !default
```

Same pattern for corners. `_02` lines 28–31 build `$radius-literals`
(`<= 64`). Comment lines 33–35: `.radius-full` already handles pills, shape
presets top out at `--radius-lg` (~24–32px depending on `data-shape`). A 512px
corner is not a corner.

**Ways to edit it:** almost always *down*, not up. `32` covers every real
corner; `64` is already generous. Raising it just mints `.radius-128` curios.
Remember literals are `border-radius: Npx` exactly — they deliberately *bypass*
`--radius-*` channels and `data-shape` (see §2.5). If you want theme-responsive
corners, use `.radius-sm/md/bs/lg/xl` (the channels), not literals.

### 1.6. Line 39 — $breakpoints: (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

```sass
$breakpoints: (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) !default
```

**What it does:** the *named* steps for **grid stepping and shell rails** —
not the responsive seam. `_04` pulls `sm/md/lg` (lines 12–14);
`_05` pulls `md/lg/xl` (lines 13–15). This is Tailwind-conventional values
deliberately: 640 / 768 / 1024 / 1280.

**How it differs from **`$breakpoint`** (singular):**

| Knob | Used by | Effect |
| --- | --- | --- |
| `$breakpoint` (768px) | `_02`, `_06` loops via `$responsive-modes` | Where `-mob` stops and `-desk` starts for *utilities* |
| `$breakpoints` (map) | `_04` grids, `_05` rails | Where `grid-2/3/4/6` add columns; where sidebars appear |

They coincide at `md: 768px` by default but are independent. Moving the seam
does not move grid stepping, and vice versa.

**Ways to edit it:**

- Move one step: `$breakpoints: (sm: 600px, md: 900px, lg: 1100px, xl: 1400px)`.
Grids and rails move together — this is usually what you want (a wider rail
breakpoint pairs with a wider grid breakpoint).
- Add `2xl: 1536px` for ultra-wide shells — but nothing reads it until you
also edit `_05` (e.g. a new `@media (min-width: $2xl)` rule). Adding a map
entry alone emits nothing.
- Remove `sm` — compile error in `_04` (`map.get($breakpoints, sm)` returns
null → `(min-width: null)` interpolation fails). If you slim the map, you
must fork the files that `map.get` from it.

### 1.7. Lines 44–46 — composition vocabulary knobs

```sass
$compositions-enabled: true !default
$composition-steps: vocabulary.$steps !default
$composition-directions: true !default
```

**What they do** (comment lines 41–43): parameterise the *shorthand aliases
only*. Ordinary utilities (`border`, `pad-sm`, `gap-lg`, `pad-x-xs`…) always
remain. Compounds (`b-ps-gl`, `b-px:xs-gr:lg`) are aliases added *at* the
original rule via `compositions.selectors(…)` — see §7.

- `$compositions-enabled: true` — master switch. `false` removes ALL shorthand
aliases across `_02` and `_06`. Output drops from ~1.90 MB to ~166 KB
(per `_composition-guide` §3 measurements). Use it when you never write
compounds, or when debugging whether a style comes from a utility or an
alias (with aliases off, only full names match).
- `$composition-steps` — which of the nine steps
(`2xs xs sm md bs lg xl 2xl 3xl`) get shorthand aliases. Default: all nine.
Restrict to `('sm' 'bs' 'lg')` for smaller output (~72 compounds vs ~32k).
**Only affects shorthand.** `.pad-sm` exists regardless; only `.ps` / `.px:sm`
terms derived from non-listed steps disappear, and with them every compound
containing those terms. Validation in `_10` lines 24–30: unknown step
(`'3xs'`) or duplicate → `@error`, compile fails fast.
- `$composition-directions: true` — whether *scoped* terms exist. `false`
keeps only all-side `border/pad/gap` combinations (`b-ps-gl` survives) and
removes physical-side border (`bl-…`), scoped padding (`px:…`, `pt:…`),
row/column gap (`gr:…`, `gc:…`). See `_10` lines 61–72: the `or $family == …`
guards. Big saver: B drops 5→1, P drops 63→9, G drops 27→9 terms.

**Ways to edit them:**

```sass
@use '01_config' as cfg with (
  $composition-steps: ('sm' 'bs' 'lg'),
  $composition-directions: false
)
```

- Start with steps, not the master switch: three steps + directions off is
168 KB / 28 KB gzip — essentially the same as fully disabled (166 KB) but
keeps the most useful shorthands.
- Never use `$composition-steps: ()` to disable — use
`$compositions-enabled: false`. Empty steps list is legal but leaves the
machinery running for zero terms; the boolean short-circuits in
`selectors()` (line 142–143) and is self-documenting.

### 1.8. Line 53 — $composition-allowlist: null (JIT)

```sass
$composition-allowlist: null !default
```

**What it does:** `null` = exhaustive (AOT) vocabulary — the published
default, ~32k compounds (~10,656 per band × 3 bands). A *list* switches to
on-demand (JIT): only the named compounds are built, so compile cost tracks
what markup actually uses.

The build tooling (`utils/builder.ts` `buildStyles()`) scans content globs,
collects every class-shaped token (`extractCandidates`), passes the sorted set
as `$composition-allowlist` via a generated wrapper:

```sass
@use '01_config' as cfg with ($composition-allowlist: ('b-ps-gl', 'px:sm-gr:lg', …))
@use 'index'
```

`_10` lines 116–129 then walk the *used set* (one iteration per compound the
markup mentions), split each on `-`, validate every term against the known
prefix maps, and silently ignore unknown/single-term candidates (the scanner
hands over *every* token including `row`, `card`, `w-16` — validation, not the
scanner, decides what is a real compound). An empty list `()` emits no
compounds — the right answer for markup that uses none.

**Ways to edit it:**

- **By hand (small apps):** pass a short list of the compounds you actually
use. You lose the safety net (a typo'd compound silently emits nothing —
Sass cannot read markup and cannot report it), but compile drops from
seconds to milliseconds.
- **Via builder (recommended):** `buildStyles({ jit: true })` / the
`virtual:fractutils.css` Vite plugin. Requires your `styleEntry` to leave
`01_config` *unconfigured* (the wrapper configures it; double-configuration
is a Sass error). Dynamic class names must be full literals or safelisted —
`extractCandidates` is conservative literal discovery, not JS evaluation.
- **Leave **`null` for the published package, Storybook, or any context where
markup is not scannable (CMS content, user-generated HTML).

### 1.9. Lines 55–59 — base comment (not a knob)

The trailing comment block announces that *base* (element baseline) is builder
infrastructure, not registry classes. No variables here. It documents intent:
body margin/padding normalisation so classes behave predictably; no
typographic opinions beyond body. The actual base rules live in `_01_base.sass`
(loaded by `index.sass` line 12).

---

## 2. _02_dimensions.sass — L1, the loop-generated half of the registry

182 lines. Emits space families (gap/pad/marg), radius, sizing, viewport
heights, and the responsive copies of all of them — plus (as a quirk of file
organisation) the responsive copies of shadows whose *base* rules live in
`_06`. Every preset value is token-routed (`var(--space-*)`); every literal is
`Npx`. Every rule is emitted three times: base + `-mob` + `-desk`.

### 2.1. Lines 7–13 — imports and re-export

```sass
@use 'sass:string'
@use 'sass:list'
@use 'sass:math'
@use '01_config' as *
@use 'style-vocabulary' as *
@use '10_compositions' as compositions
@forward 'style-vocabulary' show $steps, $gap-families, $pad-families
```

- `sass:string/list/math` — `string.unquote` for media queries, `list.append`
for ladder building, `math.div` for `max/step` (slash-division is deprecated).
- `01_config as *` — brings `$breakpoint`, `$responsive-modes`,
`$literal-*`, `$composition-*` into unprefixed scope for the loops.
- `style-vocabulary as *` — brings `$steps`, `$gap-families`, `$pad-families`
into scope for iteration.
- `10_compositions as compositions` — the `selectors()` builder function. Used
as `compositions.selectors($name, $step)` so gap/pad/border rules also emit
their compound aliases at the same rule (source order + specificity
preserved — see §7).
- `@forward … show …` — re-exports exactly `$steps`, `$gap-families`,
`$pad-families` downstream, so consumers doing `@use '02_dimensions'` also
see the vocabulary without importing it twice. Note `$marg-families` and
`$border-families` are deliberately *not* forwarded here (marg is local-only;
border is forwarded by `_06` where its base rules live).

**Editing:** add a `@use` only if you add a loop that needs it. Never change
`as compositions` to `as *` — `selectors` is a dangerously generic name to
splat into scope.

### 2.2. Lines 17–19 — $literals (full ladder)

```sass
$literals: $literal-fine
@for $i from 2 through math.div($literal-max, $literal-step)
  $literals: list.append($literals, $i * $literal-step)
```

Builds the 70-value sizing ladder once. Starts at `$i = 2` (not 1) because
`1×8 = 8` is already in `$literal-fine` — starting at 1 would duplicate `8`.

**Editing:** don't touch this block; tune its three inputs in `_01_config`
(§1.3). If you must special-case (e.g. add `320` for a fixed sidebar width
without adding every multiple of 8 up to 320 — though those already exist),
append after the loop: `$literals: list.append($literals, 320)`. Fork-local
only.

### 2.3. Lines 23–31 — $space-literals and $radius-literals (truncations)

```sass
$space-literals: ()
@each $n in $literals
  @if $n <= $literal-space-max
    $space-literals: list.append($space-literals, $n)

$radius-literals: ()
@each $n in $literals
  @if $n <= $literal-radius-max
    $radius-literals: list.append($radius-literals, $n)
```

Same ladder, filtered. Only sizing (`w/h/square`, §2.6) iterates `$literals`;
space iterates `$space-literals`; radius iterates `$radius-literals`.

**Editing:** same advice — tune `$literal-space-max` / `$literal-radius-max`,
not the filter. The `<=` (not `<`) means a max exactly on a rung includes that
rung (`64` includes `64`).

### 2.4. Lines 33–38 — space families and the $marg-families question

```sass
// Space families, role-split for the layout preset: gaps/margins separate
// content (× --gap-scale); paddings are the container's breathing (× --pad-scale).
// Family maps and the step scale live in the shared style-vocabulary module.

// Negatives ride margin families only (Contract: `--` infix).
$marg-families: (marg: margin, marg-x: margin-inline, marg-y: margin-block, marg-top: margin-top, marg-right: margin-right, marg-bottom: margin-bottom, marg-left: margin-left)
```

**Why `gap`/`pad` are imported but `marg` is local — the question asked
directly:**

1. **Compositions grammar covers only border/pad/gap.** `_10` builds
`$_borders` from `$border-families`, `$_pads` from `$pad-families`,
`$_gaps` from `$gap-families` — there is no `$_margs`. Margins never appear
in compounds (`b-ps-gl` has no margin term; negatives and `auto` centering
don't compose). So `$gap-families` / `$pad-families` must live in the
*shared* `_style-vocabulary` module that both `_02` (emitter) and `_10`
(alias indexer) read. `$marg-families` is consumed only by `_02`'s own
loops (lines 57–67 base, 136–146 responsive) — keeping it local signals
"not part of the shorthand contract" and prevents `_10` from ever seeing it.
1. **Density channels differ by role.** Gap and marg read `--gap-scale`
(content separation); pad reads `--pad-scale` (container breathing). This
is the `data-layout` preset split (`tight: 0.5/0.5`, `comfortable:
1.125/2`, `sprawling: 1.25/4`). Margins ride the gap channel because a
negative margin is usually undoing a gap, not shrinking a container.
1. **Negatives are margin-only.** Only the marg loop emits the `--` infix
(`.marg-top--sm`, `.marg-x--16`). Gaps and paddings cannot be negative in
CSS — emitting those selectors would be dead weight. The local definition
keeps the negative logic co-located with the only families that need it.
1. **Logical vs physical note (vocabulary line 2):** `pad-x/marg-x` are
*logical* (`inline`), `marg-y/pad-y` are *logical* (`block`) — RTL-safe —
while named sides (`-top/-right/-bottom/-left`) remain physical. Don't
"fix" `marg-right` to `margin-inline-end`; the physical names are
intentional for absolute-position nudges.

The vocabulary itself (6 lines total):

```sass
$steps: ('2xs' 'xs' 'sm' 'md' 'bs' 'lg' 'xl' '2xl' '3xl')
$gap-families: (gap: gap, rgap: row-gap, cgap: column-gap)
$pad-families: (pad: padding, pad-x: padding-inline, pad-y: padding-block, pad-top: padding-top, pad-right: padding-right, pad-bottom: padding-bottom, pad-left: padding-left)
$border-families: (border: border, border-top: border-top, …)
```

Nine steps × (3 gap + 7 pad + 7 marg) families = the 17 space families the
header comment counts. (The "17" counts marg's 7 twice in spirit — 7 positive
- 7 negative sets — plus gap 3 + pad 7 + marg 7 = 17 positive family names.)

**Ways to edit **`$marg-families`**:**

- Add `marg-inline-start`-style logical singles — but then update both loop
sites (base + responsive) or the new family will lack `-mob/-desk`.
- Remove families you never use (e.g. keep `marg-top/bottom`, drop `left/right`
if you are all-logical). Saves 2 families × (9 steps ×2 signs + 14 literals
×2 signs) × 3 bands ≈ 276 selectors per dropped family. Check markup first —
missing families fail silently.
- Never add marg to `_style-vocabulary` to "get shorthand for free" — `_10`
would need a `$_margs` term set, a prefix map, ordering rules, and negative
handling. That's a grammar change, not a config change.

### 2.5. Lines 41–67 — base band (space)

Three parallel `@each` blocks. Structure is identical; only the declaration
and the alias call differ:

```sass
@each $name, $prop in $gap-families
  @each $step in $steps
    #{compositions.selectors($name, $step)}
      #{$prop}: calc(var(--space-#{$step}) * var(--gap-scale, 1))
  @each $n in $space-literals
    .#{$name}-#{$n}
      #{$prop}: #{$n}px
```

- **Preset rung:** `.gap-bs { gap: calc(var(--space-bs) * var(--gap-scale, 1)) }`
— plus every compound alias containing the `gb` term
(`.b-ps-gb`, `.ps-gb`, …) on the *same* rule (that's what
`#{compositions.selectors(…)}` expands to — a selector list). Token-routed,
fluid (`--space-bs` is a `clamp()`), density-aware (`--gap-scale` from
`data-layout`, default `1` so the utility stands alone).
- **Literal rung:** `.gap-16 { gap: 16px }` — exact, non-fluid, density-immune.
No compound aliases (compounds never contain pixel terms — grammar rule).
- Pad block is the same with `var(--pad-scale, 1)`.
- Marg block uses plain interpolated selectors (`.#{$name}-#{$step}`, no
`selectors()` call) and adds the negative set (`.#{$name}--#{$step}` with
`* -1`, `.#{$name}--#{$n}` with `-Npx`). The `--` infix is the Contract's
negative marker — distinct from the `-mob/-desk` suffix (`.marg-top--sm-desk`
parses as family `marg-top` + negative step `sm` + mode `desk`).

**Editing:** to change what a preset *means*, don't touch these loops — change
`--space-*` in `_00_tokens` or `--gap-scale/--pad-scale` in `_00_presets`. To
change which rungs exist, change `$steps` (vocabulary) or `$space-literals`
(config). To add a new family (e.g. `gap` shorthands for `column-gap` already
exist as `cgap` — don't duplicate), add it to the vocabulary map and it flows
into both `_02` emission and `_10` aliasing automatically.

### 2.6. Lines 69–103 — radius and sizing (base)

```sass
@each $n in $radius-literals
  .radius-#{$n}
    border-radius: #{$n}px
.radius-full
  border-radius: var(--radius-full)
@each $step in ('sm' 'md' 'bs' 'lg' 'xl')
  .radius-#{$step}
    border-radius: var(--radius-#{$step})
```

- Literals (`radius-0` = reset through `radius-64`) are exact px, never follow
`data-shape`. `0` is deliberately in the ladder so there is a reset.
- `.radius-full` (`9999px` token) handles pills/circles.
- The five *channels* (`sm md bs lg xl`) follow `data-shape`: a card on
`.radius-md` goes round → curved → pro → sharp with the preset. Note the
channel list includes `bs` (the "base" step between `md` and `lg`) but *not*
`2xs/xs/2xl/3xl` — shape needs five stops, not nine. **Reach for channels
first; literals for exact requirements** (comment lines 77–79).

```sass
@each $n in $literals
  .w-#{$n}      { width: #{$n}px }
  .h-#{$n}      { height: #{$n}px }
  .square-#{$n} { width: #{$n}px; height: #{$n}px }
.wfull/.hfull/.full/.min0
```

Sizing runs the *full* 70-value ladder (the only family that does). `.min0`
(`min-width: 0; min-height: 0`) is the grid/flex blowout fix — a flex child
with intrinsic content (long word, wide table) refuses to shrink without it.

**Editing:** extend the channel list (`'2xs'`, `'2xl'`) only if you also add
`--radius-2xs/--radius-2xl` tokens *and* per-`data-shape` values for them —
otherwise the new classes point at undefined variables. For sizing, prefer
lowering `$literal-max` over deleting loop lines.

### 2.7. Lines 105–117 — viewport heights

```sass
.hfull-vh         { min-height: 100vh }
.hfull-vh-fitted  { min-height: calc(100vh - var(--header-height, 48px) - var(--footer-height, 0px)) }
.h88-vh           { min-height: 88vh }
```

- `-fitted` is for a **normal-flow** block that fills the screen *between the
chrome*: header + block + footer = 100vh, nothing scrolls. Both custom
properties carry fallbacks **on purpose** — an undefined variable makes the
whole `calc()` invalid at computed-value time and the `min-height` silently
vanishes, so the utility stands alone without shell tokens loaded.
- **Do NOT reuse on sticky/fixed** (comment lines 110–111): there the footer
is not in the viewport and subtracting it leaves a dead gap. Rails solve
this differently (max-height clamp, §4.4).

**Editing:** add `.h50-vh` / `.h70-vh` siblings freely — they are hand rules,
not loop products, so cost is one rule each. Don't parameterise them into a
loop unless you have five or more.

### 2.8. Lines 119–182 — responsive bands

```sass
@each $mode, $query in $responsive-modes
  @media #{string.unquote($query)}
    @each $name, $prop in $gap-families … -#{$mode} …
    … (pad, marg, radius, sizing, viewport, shadows)
```

Wholesale regeneration of §2.5–§2.7 with `-mob`/`-desk` suffixes. Two details:

1. Gap/pad responsive rules also go through `compositions.selectors($name,
$step, $mode)` — compounds get responsive variants too (`b-ps-gl-desk`),
with the mode appended **once** to the whole compound, not per term.
1. **Shadows appear here with no base-band siblings in this file**
(lines 177–182: `.shadow-sm-mob`, `.shadow-md-desk`, …). Their base rules
(`.shadow-sm/md/lg`) live in `_06_visuals` lines 248–253. The split is
organisational (shadows are dress, L5) — the responsive copies are emitted
here because this file owns the `$responsive-modes` loop over dimensions.
Don't "fix" the duplication by adding base shadows here; you'd create two
competing `.shadow-sm` rules.

**Editing:** cost scales with bands. Removing a mode from
`$responsive-modes` halves this block. Adding hand rules inside the loop
(e.g. a new viewport height) requires adding them in *both* the base section
and the loop, or the utility will lack responsive variants.

---

## 3. _04_layouts.sass — L3 (grids, card-grid, prose, frames, reel)

99 lines. Philosophy (header lines 1–5): **grids are pure stepping — no default
gap.** Compose `.gap-*` explicitly (self-sufficiency; a default gap is an
opinion the system doesn't hold). If your grid looks gapless, that's correct —
you forgot `.gap-md`, not a bug.

### 3.1. Lines 7–14 — imports and named-breakpoint locals

```sass
@use 'sass:string'
@use 'sass:list'
@use 'sass:map'
@use '01_config' as *

$sm: map.get($breakpoints, sm)
$md: map.get($breakpoints, md)
$lg: map.get($breakpoints, lg)
```

Pulls `sm/md/lg` out of the `$breakpoints` map into short locals for the
`@media` interpolations below. `xl` is not needed here (no grid steps at 1280).
`string` is needed because media queries are built with
`string.unquote('(min-width: #{$lg})')` — quoting then unquoting keeps Sass
from misparsing the query as a plain string.

**Editing:** if you rename a `$breakpoints` key, update the corresponding
`map.get` here *and* in `_05` — otherwise `$sm` is `null` and every query
using it emits `(min-width: )`, which browsers drop silently.

### 3.2. Lines 16–50 — gridding golden rules

```sass
// Gridding golden rules: exactly 3 items → 3→1, never 2+1; count 4 or a
// multiple of 4 → 4→2→1, never 3+1; 6 → 6→3→2→1 (both rules hold throughout).
```

The rules prevent orphan tracks (a lone card on the last row). Each grid starts
at 1 column (mobile-first) and adds tracks at named breakpoints:

| Class | Mobile | ≥ sm (640) | ≥ md (768) | ≥ lg (1024) | Use when |
| --- | --- | --- | --- | --- | --- |
| `.grid-1` | 1 | 1 | 1 | 1 | Single column always (form, article) |
| `.grid-2` | 1 | 1 | **2** | 2 | Pairs; 2-up from tablet |
| `.grid-3` | 1 | 1 | 1 | **3** | Exactly 3 items — jumps 1→3, never 2+1 orphan |
| `.grid-4` | 1 | **2** | 2 | **4** | 4/8/12 items — 1→2→4, never 3+1 orphan |
| `.grid-6` | 1 | **2** | **3** | **6** | 6/12 items — 1→2→3→6, both rules hold |

All tracks are `repeat(N, minmax(0, 1fr))` — the `minmax(0, …)` is the blowout
guard (same job as `.min0`): without the `0` minimum, a wide child forces its
track wider than `1fr` and breaks the grid.

**Ways to edit:**

- Add `.grid-5` / `.grid-8` only if you have a genuine 5-/8-item pattern that
recurs — otherwise use `.card-grid` (next). A `grid-5` needs its own orphan
analysis (5 is prime; 5→2→1 leaves 2+2+1 — acceptable? document it).
- Move stepping breakpoints by editing `$breakpoints` in config, not these
rules. To decouple grids from rails (e.g. grids step earlier than sidebars
appear), fork these `@media` lines to hardcoded values — but note you've
broken the single-source invariant; comment why.
- Gap is always external: `<div class="grid-3 gap-lg">`. Changing these rules
to include a default `gap` would silently alter every consumer — don't.

### 3.3. Lines 52–55 — .card-grid (auto-fit)

```sass
.card-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(min(var(--card-min), 100%), 1fr))
```

Column count negotiable, minimum track from config: `--card-min: 16rem`
(`_00_tokens` line 180). `min(…, 100%)` prevents overflow on narrow screens
(a 16rem minimum in a 320px viewport would otherwise force horizontal scroll).
`auto-fit` (not `auto-fill`) collapses empty tracks so leftover space goes to
real cards, not ghost columns.

**Editing:** tune `--card-min` per context (override inline or per-section:
`style="--card-min: 20rem"`) rather than forking the class. For fixed-count
layouts use `.grid-N`, not `.card-grid` with a hacked minimum.

### 3.4. Lines 57–67 — .prose and .content-clamp

```sass
.prose
  max-width: 50ch
  display: flex
  flex-direction: column
.content-clamp
  max-width: 1280px
  margin-inline: auto
```

- `.prose` — the reading measure (≤ 760px at typical font sizes; `50ch` scales
with the font, unlike a px value). Rhythm comes from `gap` (compose
`.gap-md` on the same element), **not** adjacent-sibling margins
(`* + *`): one rule instead of a combinator, and it cannot leak into nested
content (a `* + *` rule inside `.prose` would also space elements inside a
nested `.card`). The `flex column` *is* the rhythm mechanism — without it
`gap` does nothing.
- `.content-clamp` — page-width limiter, `1280px` = the `xl` breakpoint, so
full-width content stops growing exactly where the right rail appears.
`margin-inline: auto` centres (logical, RTL-safe).

**Editing:** `.prose` intentionally has no gap default (same self-sufficiency
rule as grids) — set it at the use site. Don't raise `max-width` past ~65ch
(`--measure: 65ch` token exists for looser contexts); beyond that line length
hurts readability.

### 3.5. Lines 69–79 — $frame-ratios (aspect-ratio media boxes)

```sass
$frame-ratios: ('16-9': '16 / 9', '9-16': '9 / 16', '4-3': '4 / 3', '3-4': '3 / 4', '3-2': '3 / 2', '2-3': '2 / 3', '1-1': '1 / 1')
@each $name, $ratio in $frame-ratios
  .frame-#{$name}
    aspect-ratio: #{$ratio}
    overflow: hidden
    position: relative
    img, video, iframe, svg
      width: 100%
      height: 100%
      object-fit: cover
```

Seven ratios covering landscape/portrait/square for the common media shapes.
Each frame is a positioning context (`relative`) that clips (`hidden`) and
forces direct media children to fill + cover. This *replaces* any frame
abstraction — there is no `.frame` base class; `.frame-16-9` is complete alone.

**Ways to edit:**

- Add a ratio (`'21-9': '21 / 9'` for cinema) — one map entry, loop does the
rest. Name uses `-` not `:` because `:` would need escaping in every use
(compounds already pay that cost; frames don't need to).
- `object-fit: cover` crops. For contain-fit (letterboxed logos, diagrams)
don't edit the loop — add a `.frame-contain` modifier in `_08_own.sass` or
compose an inner `img` rule at the use site.
- The `img, video, iframe, svg` selector is a *descendant* list scoped inside
`.frame-*` — safe because frames are leaf media boxes, never nested content
wrappers. Don't generalise it to `*` (would stretch captions/overlays).

### 3.6. Lines 81–99 — .reel and .center-item

```sass
.reel
  display: flex
  flex-direction: row
  overflow-x: auto
  overscroll-behavior-inline: contain
  scroll-snap-type: inline mandatory
  > *
    flex: 0 0 auto
    scroll-snap-align: start
```

The human-driven scroll-snap rail (filmstrip; open for carousel duty).
`overscroll-behavior-inline: contain` stops scroll-chaining (swiping the rail
at its end doesn't yank the page). `scroll-snap-type: inline mandatory` is
logical (works in RTL/vertical writing modes, unlike `x mandatory`).

The `> *` on lines 92–94 is **the system's one permitted child combinator**
(comment lines 88–91): snap targets *must* be the rail's own children. A
descendant selector (`.reel *`) would make nested elements snap too and the
rail would catch in the wrong places. It is allowlisted in
`scripts/validate-deck.js`'s combinator guard — don't add a second `>` rule
without updating that guard.

```sass
.center-item
  margin-inline: auto
  margin-top: 0
  margin-bottom: 0
```

Block-level centring for a fixed-width child (pairs with `.content-clamp`
widths or explicit `.w-*`). Logical-inline `auto` margins centre; block
margins zeroed so it doesn't inherit prose rhythm.

---

## 4. _05_shells.sass — L4 (app shell, rails, overlays)

464 lines. Canonical markups are canon: every class here implements markup
registered in the registry (overlay mechanics, docs-frame roles, mobile TOC
disclosure are authored to registered behaviours). Motion reads motion tokens.

### 4.1. Lines 13–15 — named-breakpoint locals

```sass
$md: map.get($breakpoints, md)
$lg: map.get($breakpoints, lg)
$xl: map.get($breakpoints, xl)
```

Same pattern as `_04` §3.1 but a different slice: shells need `md/lg/xl`
(768/1024/1280), not `sm`. `md` drives `.page-split`'s sidebar; `lg` drives
the left rail; `xl` drives the right rail + mobile-TOC handoff. Editing rules
mirror §3.1: rename a key → update both files; add a key → wire explicit rules
for it (nothing auto-emits).

### 4.2. Lines 17–22 — .app-shell canon root

```sass
.app-shell
  display: flex
  flex-direction: column
  position: relative
```

The column that holds header → main → footer. `relative` so drawer/dialog
positioning contexts resolve inside it. `.open` on this element resurrects the
left rail as a drawer below `lg` (§4.5). Nothing else here — widths, gaps and
colours are composed at use sites, not baked in.

### 4.3. Lines 29–39 — shell composition ([data-shell])

```sass
// Shell composition — [data-shell] on <html>, set by the preset system. The
// value lists the OPTIONAL regions PRESENT: l = left rail (nav), r = right rail
// (TOC), f = footer. Absent attribute = the full shell (l r f). A declared
// composition suppresses any region whose letter it omits; c (content-only)
// omits all three. The letters are a disjoint alphabet, so substring matching
// (*=) is unambiguous. Footer height follows the same rule in _00_tokens.sass.
[data-shell]:not([data-shell*="l"])
  .app-shell .sidebar-left
    display: none

[data-shell]:not([data-shell*="r"])
  .app-shell .sidebar-right
    display: none

[data-shell]:not([data-shell*="f"])
  .app-shell .app-footer
    display: none
```

**What it does, precisely:**

- `[data-shell]` lives on `<html>`, set by the preset system (the docs frame /
route layout). Its value is a *presence list* of optional regions: `l` (left
nav rail), `r` (right TOC rail), `f` (footer). Header + main content are
mandatory and have no letters.
- **Absent attribute = full shell** (`l r f` — both rails + footer). This is
the default route: no attribute, no suppression rules match, everything
renders (subject to viewport-width rules in §4.5).
- **A declared value suppresses whatever it omits.** `data-shell="l"` keeps
only the left rail (right rail + footer hidden). `data-shell="f"` keeps only
the footer. `data-shell="c"` (content-only) omits all three letters → all
three rules match → chromeless article/embed view.
- **Substring matching (**`*=`**) is safe because the alphabet is disjoint.**
Letters `l r f c` never appear inside each other, so `[data-shell*="l"]`
can't false-positive on another region's code. Don't add a region whose
letter collides (e.g. `full` contains `f` *and* `l` — use single letters).
- **Footer height follows the same rule** in `_00_tokens.sass` lines 211–214:
`[data-shell]:not([data-shell*="f"]) { --footer-height: 0px }`,
`[data-shell*="f"] { --footer-height: 32px }`, with `:root` defaulting to
`32px` for the absent-attribute case. If you suppress the footer in markup
but forget the token rule (or vice versa), `hfull-vh-fitted` and `.app-main`
min-heights compute against a stale footer height and leave/collapse a 32px
gap. Keep the two files in sync.

**Ways to edit:**

- Add a region (e.g. `t` = top banner): append a fourth rule block in the same
shape + a matching height token if it affects viewport maths. Keep the letter
single and disjoint.
- Invert to an *absence* list (hide what I name) — don't. Presence-list means
new regions default to hidden until opted in; absence-list would make every
existing `data-shell="…"` value suddenly show the new region.
- For per-page suppression prefer setting `data-shell` on `<html>` over adding
`.hide-*` classes to rails — the attribute path also fixes footer height and
keeps the decision in one place.

### 4.4. Header, nav underline, main, content widths (lines 41–120)

- `.app-header` (41–51): sticky (`top: 0`, `z-index: var(--z-sticky)`),
`height: var(--header-height)` (64px), `background: var(--bg)` so scrolled
content slides *under* it opaquely, `padding-inline` density-aware
(`--space-bs × --pad-scale`). `space-between` centres title left, actions
right with no extra wrappers.
- `a.nav-header` (53–70): animated underline — `&:after` 2px bar, `width: 0 →
100%`, `right: 0 → left: 0`sweep using`--speed-3/--transout-3/--transin-3`
tokens (not `--motion-*` — header chrome uses the button-speed family; see
`_00_tokens` lines 191–201). `letter-spacing: -0.01rem` optical tightening.
- `.app-main` (72–78): `flex: 1` grows to fill shell height; `min-width: 0`
blowout guard; `min-height: calc(100vh - header - footer)` so short pages
still push the footer to the viewport bottom; below 1024px gains inline
padding (rails are gone there, so the main supplies the gutter).
- `.main-section` (80–82): the flex child that actually grows; rails are its
siblings.
- `.content-section` (84–120): centred reading column with `null/narrow-*`
modifiers. Base `padding: var(--space-2xl) var(--space-bs)`. From 769px up,
`narrow-full/half/wide` lock to 640/640/720px; at 1025px → 640/750/750 (+25px
right pad on half); at 1281px → 680/800/1024 (+120px right pad on half —
optical offset for the now-visible TOC rail); at 1441px `narrow-wide` →
1280px. **The 769px here is deliberately **`breakpoint + 1`**, not **`$md` — it
tracks the utility seam, while rail visibility tracks `$lg/$xl`. Don't unify
them without re-testing the 768–1024 zone where utilities are `-desk` but
rails are still hidden.

### 4.5. Role-bound rails (lines 122–166)

Left = nav (visible ≥ lg 1024px; below, `.open` on `.app-shell` resurrects it
as a fixed off-canvas drawer). Right = TOC (visible ≥ xl 1280px; below, its
content surfaces in `.mobile-toc` at page top). Both rails:

```sass
.sidebar-left, .sidebar-right
  display: none
  position: sticky
  top: var(--header-height)
  max-height: calc(100vh - var(--header-height))
  overflow-y: auto
  width: var(--sidebar-width)   /* 280px */
```

**No explicit height, no footer subtraction — on purpose** (comment lines
126–137). Flex `stretch` sizes the rail to `.app-main` (which already stops at
the footer); `max-height` clamps the *sticky box* to the viewport below the
header. Short page → stretch wins, rail ends exactly at footer. Long page →
clamp wins, rail fills screen while sticky containment keeps it inside
`.app-main` so it lands flush on the footer at scroll end. Subtracting
`--footer-height` here (as an earlier revision did) leaves a dead gap on every
long page because the footer is below the fold. The drawer's fixed height
(line 157) *does* subtract only the header — fixed-to-viewport has no
in-flow footer to stop at.

### 4.6. Mobile TOC, nav tree, TOC, tabs (lines 176–323)

- `.mobile-toc` (177–202): `<details>` disclosure housing the TOC below `xl`;
hidden ≥ xl. `summary` is custom-styled (no marker), `[open]` state raises
background + rules off the summary. Reset `list-style: none` + marker hiding
covers Safari/Firefox/Chrome.
- `.navtree*` (205–257): left-rail tree. Flat group labels (`.navtree-title`)
for non-collapsing groups; collapsible groups ride the accordion family
(trigger = title, content = links — don't restyle accordion into a second
nav pattern). `.nav-l1` (files *and* `button.nav-l1` folder triggers share
metrics; colour/weight differ: links secondary, buttons primary-520) and
indented `.nav-l2` (`margin-left: var(--space-md)`).
- `.toc*` (259–297): right-rail TOC. `.toc-link.active` tints
`var(--theme-color)` (scroll-spy hook). `.toc-footer` (edit-this-page etc.)
rules itself off with a top border.
- `.tab-list/.tab-trigger` (300–322): current = `.active`; triggers carry
native `aria-selected`. Negative `margin-bottom: -1px` overlaps the list's
bottom border so the active tab's 2px theme-colour underline sits *on* the
rule, not below it.

### 4.7. Page frames, overlays, accordion, hero (lines 324–464)

- `.page-shell` (325–327): freestanding page padding (both axes). Use when the
route has no `.app-main` gutters of its own.
- `.page-split` (329–346): one-column grid → at `md`, `sidebar-width +
content` split with sticky bordered sidebar. The sidebar's sticky rules
mirror the rails (§4.5) including the no-footer-subtraction rule.
- `.drawer/.dialog/.popover` (349–411): all shown via `.open` (dialog also
honours native `[open]`); triggers carry native aria. Drawer slides
(`translateX(-105%) → 0`, `visibility` toggled in the same transition so
focus can't land off-screen). Dialog centres (`top/left 50%` + `translate`
nudge), fades + rises; `::backdrop` dims 50%. Popover positions off
`--popover-offset` (6px token — note line 394's `calc(--popover-offset)` is
missing its `var()`: intentional? No — it computes to an invalid `top` and
falls back to `auto`. If your popover mispositions, this line is the first
suspect; the fix is `calc(100% + var(--popover-offset))`).
- `.accordion*` (413–455): grid-rows `0fr → 1fr` collapse (animatable,unlike
`height: auto`). `.accordion-panel` carries `overflow: hidden; min-height: 0`
*as a named class* (comment 426–428) because the collapsing grid row needs an
addressable box — positional selectors would break on markup drift.
- `.hero` (458–464): documented sugar `box.ycenter + gap-lg + pad-y-xl` —
centred column, `gap: space-lg × gap-scale`, `padding-block: space-xl ×
pad-scale`. (The guide notes the comment omits the implemented
`align-items: center` from its equivalence claim — behaviour is centred;
prose is imprecise.)

---

## 5. _06_visuals.sass — L5 (dress + compositions + visibility + shadows)

253 lines. Emission order follows Contract 5: **bare dress before
compositions**. Components own hover states; no standalone `.hover /
.transition`(registry ruling). All compositions read`--radius-*` channels so
shape presets reach them.

### 5.1. Bare backgrounds (lines 15–29) and ink (31–67)

One declaration each — `.bg → var(--bg)`, `.surface → --bg-surface`,
`.raised → --bg-raised`, `.panel → --bg-panel`, `.footer → --bg-footer`,
`.canvas → --bg-canvas`, `.terminal → --bg-terminal` (dark navy in both modes
— code blocks stay dark on light pages). Ink mirrors: `.text-primary /
-secondary / -muted / -inverse / -theme / -alt / -success / -warning /
-danger / -info`, plus `.bold/.italic`. Status *fills* (`.bg-success/info/…`,
60–67) exist so a dot/chip carrying status as a background has a composable
form without opening `_08_own.sass` (comment 57–59).

**Editing:** add a surface only with a token pair (light + dark in
`_00_tokens`) — a class pointing at an undefined `--bg-*` renders transparent.
Prefer reusing `surface/raised/panel` + `data-color` over minting `surface-2`.

### 5.2. Lines 70–85 — the partition-law border set (asked directly)

```sass
#{compositions.selectors(border)}
  border: 1px solid var(--border)
.border-subtle
  border: 1px solid var(--border-subtle)
@each $family, $prop in vocabulary.$border-families
  @if $family != border
    #{compositions.selectors($family)}
      #{$prop}: 1px solid var(--border)

// A responsive compound governs all its operations, including border. These
// ordinary border variants are available independently of shorthand as well.
@each $mode, $query in $responsive-modes
  @media #{string.unquote($query)}
    @each $family, $prop in vocabulary.$border-families
      #{compositions.selectors($family, $mode: $mode)}
        #{$prop}: 1px solid var(--border)
```

**What each piece does:**

1. **Line 70–71 — all-side border + its compounds.** `selectors(border)` with
no `$step` returns `.border` *plus every compound containing the *`b`* term*
(`.b-ps-gl`, `.b-px:xs-gr:lg`, … — the full B×(P+G+P×G) set for current
config). All share one rule: `1px solid var(--border)`. Theme supplies the
colour; density never touches borders (no scale multiplier — a 2px border in
`sprawling` mode would be absurd). Because compounds are aliases *on* this
rule (not a later override layer), source order, specificity (single class)
and component wins are unchanged — a `.card` border still beats `.border`
wherever `.card`'s later rule already won.
1. **Lines 72–73 — **`.border-subtle`**.** Same geometry, `--border-subtle`
colour. Deliberately *outside* the grammar (no `bs-…` compounds, no
responsive variants): subtle dividers are exceptions, not rhythm. If you
need a subtle compound, compose `.b-ps-gl.border-subtle` — the all-side
rule precedes… no wait, equal specificity, later-in-stylesheet wins:
`.border-subtle` (line 72) comes *after* `.border` (line 70), so the colour
override holds regardless of HTML class order (general rule §6.4 in the
guide).
1. **Lines 74–77 — directional borders.** Loops `$border-families` skipping
`border` (already emitted): `border-top/right/bottom/left` + their compounds
(`bt-…`, `br-…`, `bb-…`, `bl-…`). Guarded by `$composition-directions` inside
`_10` (when `false`, only the `b` term exists, so `selectors(border-top)`
returns just `.border-top` — the loop still emits correct CSS, minus
aliases).
1. **Lines 81–85 — responsive borders.** Same families × each mode, via
`selectors($family, $mode: $mode)` (note: `$step` is null — borders have no
steps, only scopes). Comment lines 79–80 states the semantic: *a responsive
compound governs all its operations, including border* — `.b-ps-gl-desk`
switches border *and* padding *and* gap together at the seam. The "ordinary
border variants … independently of shorthand" means `.border-top-desk` also
exists alone for surgical use.

**Ways to edit:**

- Change `1px` → `2px` for a heavier system — every border + compound moves
together. For a single heavier divider, add `.border-strong` (pointing at
`--border-strong`, which already exists in tokens but has no class) rather
than forking the loop.
- Add `border-x/border-y` families — requires adding them to
`_style-vocabulary` `$border-families` *and* short prefixes (`bx`? conflicts
with nothing yet) in `_10` `$_border-prefixes`. Remember `border-x` has no
CSS shorthand (must emit `border-left+right` two declarations) — the current
`$family → $prop` single-property loop can't express it without restructuring.
- Remove directional borders you never use by setting
`$composition-directions: false` (keeps the utilities, drops the aliases) —
don't delete loop lines; you'd lose the utilities too.

### 5.3. Typography (lines 87–152)

- `.text-xs … .text-5xl` map 1:1 to `--text-*` fluid tokens (note: tokens also
define `6xl/7xl` with no classes — add classes if marketing needs them).
- `.text-tight/-lg` tracking, `.lh11/12/15` leading, `.weight-400…800` loop
(comment says 400–700; code emits 800 too — trust the code),
`.mono/.tt-u/.tt-c/.ta-c`, `.truncate` (single-line ellipsis),
`.clamp-1…3` loop (WebKit line-clamp, vertical box),
`.eyebrow` (uppercase muted kicker — the one opinionated type recipe in L5).

**Editing:** type scale lives in tokens (`--text-*` clamps); these classes are
thin pointers. Change a size globally by editing the token, not the class.

### 5.4. Compositions — plain classes over the vocabulary (lines 154–232)

Hand-authored bundles, "yours to restyle" (line 154): `.card` (flex column?
no — row gap + surface + border + `--radius-md` channel so `data-shape`
reaches it), `.field/.field-label/.field-error` (form stack),
`.avatar` (square `--avatar-size`, circular, cover-fit, handles both
`<img class="avatar">` via `&:is(img)` and `<div class="avatar"><img>`),
`.divider` (`border-top` + block margin on the gap channel),
`.kbd` (mono chip on `--radius-sm` channel),
`.switch-track/.switch-thumb` (+ `[aria-checked='true']/.checked` on-state:
theme fill, thumb `translate: 18px 0`).

All radii reference `--radius-*` channels (never literals) — the header
comment's promise. All spacing references `--space-*` × the correct scale
channel.

### 5.5. Responsive visibility (235–245) and shadows (248–253)

```sass
.hide-mobile  {@media mob  { display: none } }
.hide-desktop {@media desk { display: none } }
.only-mobile  {@media desk { display: none } }  /* == hide-desktop, kept as alias */
.shadow-sm/md/lg { box-shadow: var(--shadow-*) }
```

Visibility reads `$responsive-modes` by key (`map.get(…)`) — renaming `mob`/
`desk` breaks these three classes even if the loops still work (loops iterate
whatever keys exist; these three hardcode `mob`/`desk`). Shadows are token
channels with per-mode values in `_00_tokens` (light vs dark elevations) —
the class is a pointer; the mode/motion story lives in tokens.

---

## 6. _10_compositions.sass — the Paninian shorthand grammar (all 150 lines)

No CSS declarations here. `selectors()` adds aliases *at each original rule*
in `_02`/`_06`, preserving source order, specificity, density scaling and
component wins. Philosophy/grammar/cost/delivery: `PANINIAN-COMPOSITIONS.md`;
Sass-only reference: `_composition-guide.sass`.

### 6.1. Lines 9–14 — imports

```sass
@use 'sass:list'
@use 'sass:map'
@use 'sass:meta'
@use 'sass:string'
@use '01_config' as cfg
@use 'style-vocabulary' as vocabulary
```

`cfg` (namespaced — this file reads four knobs, so the namespace documents
every use), `vocabulary` (namespaced — the family/step maps the grammar is
*over*). `meta` for `type-of` boolean guards; `string` for length/slice in
`-split`/`-escape`; `list`/`map` for index/append/get/set throughout.

### 6.2. Lines 16–19 — short prefix maps (the lexicon)

```sass
$_short-steps: ('2xs': '2xs', 'xs': 'xs', 'sm': 's', 'md': 'md', 'bs': 'b', 'lg': 'l', 'xl': 'xl', '2xl': '2xl', '3xl': '3xl')
$_border-prefixes: (border: 'b', border-top: 'bt', border-right: 'br', border-bottom: 'bb', border-left: 'bl')
$_pad-prefixes: (pad: 'p', pad-x: 'px:', pad-y: 'py:', pad-top: 'pt:', pad-right: 'pr:', pad-bottom: 'pb:', pad-left: 'pl:')
$_gap-prefixes: (gap: 'g', rgap: 'gr:', cgap: 'gc:')
```

- `$_short-steps` — unscoped measures use *short* steps (`ps` = pad-sm,
`gb` = gap-bs, `gl` = gap-lg); scoped measures use *full* steps (`px:sm`,
`gr:lg`). This keeps `pxs` (= pad-xs, all-padding-xs…) unambiguous beside
`px:sm` (= pad-x-sm). One spelling per meaning.
- Border prefixes are bare letters (`b bt br bb bl` — no step, borders have no
scale). Pad/gap directional prefixes carry a trailing `:` (`px: py: pt: …
gr: gc:`) — the colon is written literally in HTML (`class="b-px:xs-gr:lg"`)
and escaped (`\:`) only in the emitted CSS selector.
- Leading `$_` = file-private. These maps are closed: every character in a term
comes from them, which is what makes `-split` on `-` exact (no term contains
`-`, so splitting a compound on `-` recovers its terms; `:` and digits
survive because they aren't separators).

**Editing:** add a family (e.g. `pad-inline-start`) by adding it to
`_style-vocabulary` *and* a prefix here (`pist:`?). Keep prefixes disjoint and
`-`-free or `-split` breaks. Don't shorten `md` to `m` — `m` already means
marg- in author muscle memory; the short map deliberately leaves `md` long.

### 6.3. Lines 21–30 — fail-fast validation

```sass
@if meta.type-of(cfg.$compositions-enabled) != 'bool' or meta.type-of(cfg.$composition-directions) != 'bool'
  @error 'Composition enabled/directions flags must be booleans.'

$_seen: ()
@each $step in cfg.$composition-steps
  @if not list.index(vocabulary.$steps, $step)
    @error 'Unknown composition step "#{$step}". Use steps from #{vocabulary.$steps}.'
  @if list.index($_seen, $step)
    @error 'Duplicate composition step "#{$step}".'
  $_seen: list.append($_seen, $step)
```

Non-boolean flags, unknown steps (`'3xs'` without a vocabulary+token entry),
duplicates — all hard `@error` at compile time, pointing at the fix. This runs
at module load, before any alias is built, so a bad wrapper config fails in
seconds with a readable message, not 30k garbage selectors.

### 6.4. Lines 34–56 — -term() and -escape()

```sass
@function -term($family, $step: null)
  @if map.has-key($_border-prefixes, $family)
    @return map.get($_border-prefixes, $family)   // borders ignore $step
  … pad, then gap lookup; @error on unknown family …
  @if $family == pad or $family == gap
    @return '#{$prefix}#{map.get($_short-steps, $step)}'  // unscoped shorts
  @return '#{$prefix}#{$step}'                            // scoped fulls
```

Maps a utility (`pad-x` + `sm`) to its term (`px:sm`), or a bare border family
to its letter. Leading `-` = private function. The `@error` on line 41 is the
backstop for `_02`/`_06` passing a family the grammar doesn't know (e.g. marg
— which is why marg loops never call `selectors()`).

```sass
@function -escape($name)
  // Only ':' needs escaping; every other character comes from closed maps.
```

Walks the compound name char by char, prefixing `:` with `\`. Escaping belongs
to selectors, never to the HTML class attribute (write `px:sm` in markup,
match `.px\:sm` in CSS; use `CSS.escape()` in `querySelector`).

### 6.5. Lines 58–72 — term lists ($_borders/$_pads/$_gaps)

```sass
$_borders: ()  $_pads: ()  $_gaps: ()
@if cfg.$compositions-enabled
  @each $family, $prop in vocabulary.$border-families
    @if cfg.$composition-directions or $family == border
      $_borders: list.append($_borders, -term($family))
  @each $family, $prop in vocabulary.$pad-families
    @if cfg.$composition-directions or $family == pad
      @each $step in cfg.$composition-steps
        $_pads: list.append($_pads, -term($family, $step))
  … same for gaps …
```

Materialises the per-operation vocabularies. Defaults: B=5 border terms,
P=7 families × 9 steps = 63 pad terms, G=3 × 9 = 27 gap terms. With
`$composition-directions: false`: B=1, P=9, G=9. With
`$compositions-enabled: false`: all empty → `$_aliases` stays empty →
`selectors()` returns the bare utility (graceful degradation, §6.8).

### 6.6. Lines 77–100 — alias index (-register, -split)

```sass
$_aliases: ()
@function -register($index, $name, $terms...)
  $escaped: -escape($name)
  @each $term in $terms
    $names: map.get($index, $term)
    @if $names == null
      $names: ()
    $index: map.set($index, $term, list.append($names, $escaped))
  @return $index
```

*Index aliases by the utility they stand for.* Key = single term (`ps`, `gb`,
`b`); value = list of escaped compound names containing it. Built once, reused
in every band (base/mob/desk) — responsive emission doesn't repeat the
cartesian walk, it just re-suffices (`-desk`) the already-indexed names.

`-split` (lines 90–100) inverts a compound name into terms by splitting on
`-` — exact *because* no term contains `-` (§6.2). Used only by the JIT path.

### 6.7. Lines 102–129 — AOT vs JIT population

```sass
@if cfg.$composition-allowlist == null
  // AOT — the whole cartesian product. B×P + B×G + P×G + B×P×G per band.
  @each $b in $_borders
    @each $p in $_pads
      $_aliases: -register($_aliases, '#{$b}-#{$p}', $b, $p)
    @each $g in $_gaps
      $_aliases: -register($_aliases, '#{$b}-#{$g}', $b, $g)
  @each $p in $_pads
    @each $g in $_gaps
      $_aliases: -register($_aliases, '#{$p}-#{$g}', $p, $g)
      @each $b in $_borders
        $_aliases: -register($_aliases, '#{$b}-#{$p}-#{$g}', $b, $p, $g)
@else
  // JIT — walk the USED set instead of the product …
  $_known: list.join(list.join($_borders, $_pads), $_gaps)
  @each $name in cfg.$composition-allowlist
    $terms: -split($name)
    $valid: list.length($terms) >= 2
    @each $term in $terms
      @if not list.index($_known, $term)
        $valid: false
    @if $valid
      $_aliases: -register($_aliases, $name, $terms...)
```

- **AOT (**`null`**):** every 2-op (`B×P`, `B×G`, `P×G`) and 3-op (`B×P×G`) combo in
`b → p → g` order, one scope per operation. Defaults: 5×63 + 5×27 + 63×27 +
5×63×27 = 315 + 135 + 1701 + 8505 = **10,656 compounds per band**,
**31,968 across three bands**. Declarations shared; selector text not free
(~1.90 MB / 232 KB gzip full; ~168 KB / 28 KB gzip at 3 steps + directions
off — guide §3). Order is fixed (border, then padding, then gap) — arbitrary
term order is NOT generated (`g-ps-b` doesn't exist; write `b-ps-g…`).
- **JIT (list):** one pass over the allowlist. Compounds need ≥ 2 valid terms;
single terms (`ps`), unknown terms, pixel steps, negatives, `border-subtle`,
resets are ignored (left for ordinary utilities). Missing operations emit
nothing, never a reset. A gap term does not enable flex/grid — keep
`.box/.row/.grid` separate.

**Editing:** don't touch this branching; control it via the two knobs
(`$composition-steps/$composition-directions` shrink the product;
`$composition-allowlist` swaps product for used-set). If compile is slow, reach
for JIT + `buildStyles` before restricting the vocabulary — JIT keeps the full
authoring language while only *building* what's used.

### 6.8. Lines 134–150 — selectors() (the only public API)

```sass
// Public builder function, not an authoring mixin. Returns the existing utility
// selector first, followed by equivalent compounds. Unsupported/disabled scopes
// return ONLY the original utility. No substring selectors and no !important.
@function selectors($family, $step: null, $mode: null)
  $utility: $family
  @if $step != null
    $utility: '#{$family}-#{$step}'
  $suffix: ''
  @if $mode != null
    $suffix: '-#{$mode}'
  $result: (string.unquote('.#{$utility}#{$suffix}'),)
  @if not cfg.$compositions-enabled
    @return $result
  @if $step != null and not list.index(cfg.$composition-steps, $step)
    @return $result
  $names: map.get($_aliases, -term($family, $step))
  @if $names != null
    @each $name in $names
      $result: list.append($result, string.unquote('.#{$name}#{$suffix}'), comma)
  @return $result
```

Called as `#{selectors($name, $step)}` / `#{selectors($name, $step, $mode)}` /
`#{selectors($family)}` (borders) at each original rule. Returns the utility
selector first (so the utility *always* works, even with compositions off or
the step unlisted), then every compound containing that term, suffixed for the
band. No substring matching (`.ps` never matches `.ps-foo` — exact class
nodes only, also enforced post-compile by `pruneCss` in `builder.ts`), no
`!important`. Unsupported/disabled scopes degrade to the bare utility — call
sites need no conditionals.

**"Not an authoring mixin"** means: never `@include` it to *make* a component;
it's infrastructure for emitting aliases. Author components from utilities +
hand rules (or `_08_own.sass`), not from `selectors()`.

---

## 7. Quick-edit cookbook

| I want… | Edit this | Not this |
| --- | --- | --- |
| Move the mob/desk seam to 1024px | `$breakpoint: 1024px` in wrapper | Hardcoded `769px`/`1024px` in `_05` |
| Earlier grid stepping | `$breakpoints` map | Individual `.grid-N` queries |
| Fewer pixel utilities | `$literal-max: 256`, `$literal-space-max: 32` | Deleting loop lines in `_02` |
| Smaller stylesheet, keep language | `buildStyles({ jit: true })` | `$compositions-enabled: false` |
| Smaller stylesheet, smaller language | `$composition-steps: ('sm' 'bs' 'lg')`, `$composition-directions: false` | Hand-deleting compounds |
| Tighter default spacing | `data-layout="tight"` / `--gap-scale` | `$literal-step` |
| Rounder/sharper UI | `data-shape="round"/"sharp"` | `.radius-N` literals everywhere |
| New spacing step | `_style-vocabulary` `$steps` + `--space-*` token + preset values | `_01_config` alone |
| New card variant | `_08_own.sass` or use-site composition | Editing `.card` in `_06` |
| Content-only page (no rails/footer) | `data-shell="c"` on `<html>` | Hiding rails with `.hide-*` |

## 8. Pitfalls that have bitten before

1. **Configuring after first load.** Sass error `This module was already loaded,
so it can't be configured`. Fix: move your `with (...)` wrapper above every
`@use 'index'` / `@use '02_dimensions'`.
1. **Unnamespaced config load.** `01_config` starts with digits — always
`@use '…01_config' as cfg with (…)`.
1. **Undefined **`--space-*`** / **`--radius-*`**.** New `$steps` or radius channels
without matching `:root` tokens compile fine and fail silently in the
browser (invalid `calc()` → declaration dropped). Grep emitted CSS for
`var(--space-YOURSTEP)` after adding a step.
1. `marg--*`** vs **`-mob`** parsing.** `.marg-top--sm-desk` = negative `sm` in
`desk` band. Don't invent `.marg-top-sm--desk` — the `--` infix comes before
the mode suffix, always.
1. **Popover **`top`** (line 394).** `calc(--popover-offset)` lacks `var()` and is
invalid; the popover falls back to `top: auto`. Fix to
`calc(100% + var(--popover-offset))` if you depend on it.
1. **Compounds don't enable layout.** `b-ps-gl` sets border+padding+gap — not
`display`. Keep `.box/.row/.grid-N` on the element.
1. **Class order doesn't win.** `.card` vs `.pad-lg` vs `.b-ps-gl` resolve by
*stylesheet order*, not HTML order. Compose an extra utility for exceptions
(`b-ps-gl pad-top-lg` — all-side rule precedes side rule), don't reorder
`class="…"`.
