---
title: Panini Composition
description: How to write the condensed border–padding–gap classes in markup, exactly what each one expands to, and where the grammar stops.
id: 15
type: docs
---

This is the **practical** companion to [PANINIAN-COMPOSITIONS.md](./PANINIAN-COMPOSITIONS.md),
which covers the inspiration, the Sass implementation and the used-only delivery
pipeline. This document is only about *writing the classes*.

Everything below is verified against the compiled stylesheet, not just the source.


## 1. The model in one paragraph

A composition is a **single HTML class token** that stands for two or three
ordinary utilities at once. `b-ps-gl` is one class, not three; the browser never
splits it. Sass attaches it as an extra selector on the *original* utility rules,
so it behaves exactly as if you had written the long form — same declarations,
same source position, same specificity.

```html
<!-- these two are equivalent -->
<div class="box border pad-sm gap-lg">…</div>
<div class="box b-ps-gl">…</div>
```

`box` stays separate on purpose: **a gap does not imply flex or grid.** A
composition controls only the properties it actually names.

---

## 2. Anatomy of a compound

```
b - ps - gl
│    │    └── gap operation:     gap, both axes, lg step
│    └─────── padding operation: padding, all sides, sm step
└──────────── border operation:  border, all sides
```

### Operations and their fixed order

A compound contains **two or three** operations, always in this order:

```
border  →  padding  →  gap
```

Four shapes are generated, and only these four:

| Shape | Example | Expands to |
|---|---|---|
| `border-padding` | `b-ps` | `border pad-sm` |
| `border-gap` | `b-gl` | `border gap-lg` |
| `padding-gap` | `ps-gl` | `pad-sm gap-lg` |
| `border-padding-gap` | `b-ps-gl` | `border pad-sm gap-lg` |

**Rules that follow from this:**

- **Order is fixed.** `ps-b` and `gl-ps` do not exist. Nothing reorders.
- **Each operation appears at most once.** No two padding scopes in one compound.
- **Single operations are not generated.** There is no `.ps` or `.b`. For one
  operation, write the ordinary utility: `border`, `pad-sm`, `gap-lg`.
- **Omission emits nothing.** `ps-gl` makes no border declaration at all — it does
  *not* set `border: none`. Absence is silence, never a reset.

---

## 3. The terms

### 3.1 Border terms — 5

| Term | Utility | Property |
|---|---|---|
| `b` | `.border` | `border` |
| `bt` | `.border-top` | `border-top` |
| `br` | `.border-right` | `border-right` |
| `bb` | `.border-bottom` | `border-bottom` |
| `bl` | `.border-left` | `border-left` |

All emit `1px solid var(--border)` — the theme's border token, so they follow the
active theme and colour mode. Named sides are **physical**, not logical.

`border-subtle` and resets like `bord0` are ordinary utilities; they are not terms
in this grammar and cannot appear inside a compound.

### 3.2 The step scale — 9 steps

| Step | Token | Value |
|---|---|---|
| `2xs` | `--space-2xs` | `0` |
| `xs` | `--space-xs` | `clamp(0.125rem, 0.0739rem + 0.2273vw, 0.25rem)` |
| `sm` | `--space-sm` | `clamp(0.25rem, 0.1477rem + 0.4545vw, 0.5rem)` |
| `md` | `--space-md` | `clamp(0.5rem, 0.3977rem + 0.4545vw, 0.75rem)` |
| `bs` | `--space-bs` | `clamp(0.75rem, 0.6477rem + 0.4545vw, 1rem)` |
| `lg` | `--space-lg` | `clamp(1rem, 0.7955rem + 0.9091vw, 1.5rem)` |
| `xl` | `--space-xl` | `clamp(1.5rem, 1.2955rem + 0.9091vw, 2rem)` |
| `2xl` | `--space-2xl` | `clamp(2rem, 1.5909rem + 1.8182vw, 3rem)` |
| `3xl` | `--space-3xl` | `clamp(3rem, 2.5909rem + 1.8182vw, 4rem)` |

`2xs` is the **zero-valued** step. It is an explicit value, unlike omission:
`p2xs` writes `padding: 0`, whereas leaving padding out of the compound writes
no padding declaration at all.

> `3xs` is **not** a step. Any `--space-3xs` reference elsewhere in the styles is a
> separate token issue, not a usable measure here.

### 3.3 The two spellings — the single most important rule

Every term is written one of two ways, and which one you use depends on whether
the term is **scoped**:

| | Form | Measure | Example |
|---|---|---|---|
| **Unscoped** (all sides / both axes) | `prefix` + **short** step | short | `ps` = `pad-sm` |
| **Scoped** (a named direction) | `prefix` + `:` + **full** step | full | `px:sm` = `pad-x-sm` |

The **short measure** only differs for three steps. Everything else keeps its name:

| Full step | `2xs` | `xs` | **`sm`** | `md` | **`bs`** | **`lg`** | `xl` | `2xl` | `3xl` |
|---|---|---|---|---|---|---|---|---|---|
| Short | `2xs` | `xs` | **`s`** | `md` | **`b`** | **`l`** | `xl` | `2xl` | `3xl` |

There is exactly **one canonical spelling per term**. `ps`, never `psm`.
`px:sm`, never `px:s`. This keeps the generated vocabulary small and predictable.

### 3.4 Padding terms — 63 (7 families × 9 steps)

**Unscoped — all sides.** Prefix `p` + short measure:

```
p2xs   pxs   ps   pmd   pb   pl   pxl   p2xl   p3xl
```

→ `padding: calc(var(--space-STEP) * var(--pad-scale, 1))`

**Scoped — a named direction.** Prefix + `:` + full step:

| Pattern | Utility | Property |
|---|---|---|
| `px:STEP` | `pad-x-STEP` | `padding-inline` *(logical)* |
| `py:STEP` | `pad-y-STEP` | `padding-block` *(logical)* |
| `pt:STEP` | `pad-top-STEP` | `padding-top` *(physical)* |
| `pr:STEP` | `pad-right-STEP` | `padding-right` *(physical)* |
| `pb:STEP` | `pad-bottom-STEP` | `padding-bottom` *(physical)* |
| `pl:STEP` | `pad-left-STEP` | `padding-left` *(physical)* |

`x` and `y` stay **logical** (`padding-inline` / `padding-block`) and follow the
writing mode. Named sides stay **physical**. This is deliberate and matches the
rest of the project.

### 3.5 Gap terms — 27 (3 families × 9 steps)

**Unscoped — both axes.** Prefix `g` + short measure:

```
g2xs   gxs   gs   gmd   gb   gl   gxl   g2xl   g3xl
```

→ `gap: calc(var(--space-STEP) * var(--gap-scale, 1))`

**Scoped:**

| Pattern | Utility | Property |
|---|---|---|
| `gr:STEP` | `rgap-STEP` | `row-gap` |
| `gc:STEP` | `cgap-STEP` | `column-gap` |

---

## 4. ⚠️ The collisions — read this twice

Because unscoped terms use short measures, several two-letter terms look like
direction abbreviations but are **not**. The colon is the only thing that
distinguishes them.

| Looks like | Actually means | The other one |
|---|---|---|
| `pb` | padding **all sides**, `bs` step | `pb:sm` = padding-**bottom**, sm |
| `pl` | padding **all sides**, `lg` step | `pl:sm` = padding-**left**, sm |
| `pxs` | padding **all sides**, `xs` step | `px:sm` = padding-**inline**, sm |
| `pr` — *not a term* | — | `pr:sm` = padding-**right**, sm |
| `pt` — *not a term* | — | `pt:sm` = padding-**top**, sm |
| `gb` | gap **both axes**, `bs` step | — |
| `gl` | gap **both axes**, `lg` step | — |
| `gr:sm` | **row**-gap, sm | `gc:sm` = **column**-gap, sm |

Verified against the compiled CSS:

```css
.pb-gs  { padding: calc(var(--space-bs) * var(--pad-scale,1));  gap: …--space-sm… }
.pl-gb  { padding: calc(var(--space-lg) * var(--pad-scale,1));  gap: …--space-bs… }
```

**Mnemonic:** *no colon → the letters after the prefix are a **measure**. Colon →
the letters before it are a **direction**.*

If a compound isn't doing what you expect, this table is the first place to look.

---

## 5. Responsive suffix

One optional suffix applies to the **whole compound**:

| Suffix | Media condition |
|---|---|
| `-mob` | `all and (max-width: 767px)` |
| `-desk` | `all and (min-width: 768px)` |

```html
<div class="box b-ps-gs pb-gl-desk">…</div>
```

The first class sets the base border/padding/gap. At desktop widths the second
changes padding and gap — and makes **no border declaration**, because it names no
border operation.

`b-ps-gl-desk` is exactly equivalent to `border-desk pad-sm-desk gap-lg-desk`.
Border responsive variants exist alongside the spacing ones so this equivalence
holds for every operation.

The seam comes from `$breakpoint` / `$responsive-modes` in `_01_config.sass`. You
may add further modes, but keep the `mob` and `desk` keys — visibility utilities
depend on them.

---

## 6. Equal step names are not equal pixels

Padding and gap are scaled by **two different multipliers**, set by the `layout`
preset on `<html>`:

| `data-layout` | `--gap-scale` | `--pad-scale` |
|---|---|---|
| `zero` | 1 | 1 |
| `tight` | 0.5 | 0.5 |
| `comfortable` | 1.125 | 2 |
| `sprawling` | 1.25 | 4 |

So in `ps-gs` — both naming step `sm` — under `comfortable` the padding resolves at
**×2** and the gap at **×1.125**. This is intentional: uniform scaling is a
perceptual no-op, and breathing room opens when padding outgrows gap.

Context supplies those differences so no class has to restate them. Read step names
as *rhythm positions*, never as fixed lengths.

---

## 7. Exceptions: mixing with ordinary utilities

A compound gives one scope per operation. For anything more, add an ordinary
utility beside it:

```html
<div class="box b-ps-gl pad-top-lg">…</div>
```

This works because of **stylesheet order**: all-side padding rules are emitted
before physical-side padding rules, so `pad-top-lg` lands after `pad-sm` and wins.

> **HTML class order is not an instruction.** `class="pad-top-lg b-ps-gl"` behaves
> identically to `class="b-ps-gl pad-top-lg"`. Precedence lives in the stylesheet,
> not in your attribute. This is ordinary CSS, and the compositions change nothing
> about it.

### Specificity and component wins

An alias is attached to the original rule, so a compound is a plain single-class
selector — specificity `(0,1,0)`, no `!important`, no appended override block.
Anything that beat `pad-sm` before still beats `b-ps-gl` now. Where the later
`.card` rules previously won over dimensional utilities, they still do.

---

## 8. What is deliberately not generated

Unsupported strings simply have **no matching rule**. They are not errors; they
are silence.

- Arbitrary term order — `ps-b`, `gl-ps`, `b-gl-ps`
- More than one scope per operation — no two paddings in one compound
- Single-operation compounds — `.ps`, `.b`, `.gl`
- Alternative spellings — `psm`, `px:s`, `p-sm`, `b-psm`
- Pixel literals, negative margins, arbitrary values
- Any operation beyond border, padding and gap

> **Sass does not read your markup and cannot diagnose typos.** A misspelled
> compound produces no CSS and no warning — the element is simply unstyled. When
> something looks unstyled, check the spelling against §3 and §4 first.

---

## 9. Writing the colon

Write colons **literally** in HTML:

```html
<div class="b-px:xs-gr:lg">…</div>
```

Sass escapes them in the generated selector (`.b-px\:xs-gr\:lg`); that escaping
belongs to the stylesheet, never to your class attribute.

When querying the DOM yourself, a colon would otherwise be read as a
pseudo-class — so escape it:

```js
document.querySelector('.' + CSS.escape('b-px:xs-gr:lg'));   // correct
document.querySelector('.b-px:xs-gr:lg');                    // throws
```

`classList.add/remove/contains` take the raw string and need no escaping.

---

## 10. Delivery: only literal classes survive

The build scans your source for **complete class tokens** and ships only what it
finds. Literal alternatives are discoverable:

```svelte
<div class={compact ? 'b-ps-gs' : 'b-pb-gl'}>…</div>   <!-- both found -->
```

Fragments are **not** evaluated:

```svelte
<div class={`b-p${size}-gl`}>…</div>                    <!-- nothing found -->
```

For dynamic cases, keep complete strings in a map, or safelist every permitted
value in the plugin config:

```ts
fractutilsStyles({
  safelist: ['b-ps-gl', 'b-px:xs-gr:lg-desk']
});
```

The same applies to class names arriving from a CMS, an API, or a runtime theme.
Safelist entries are complete literals — no wildcards, no regular expressions.

---

## 11. Worked examples

| Composition | Expands to | Result |
|---|---|---|
| `b-ps-gl` | `border pad-sm gap-lg` | bordered box, small padding, large gap |
| `bl-ps-gl` | `border-left pad-sm gap-lg` | left rule only |
| `b-pl:sm-gr:lg` | `border pad-left-sm rgap-lg` | border, left padding, row gap |
| `pb-gc:sm` | `pad-bs cgap-sm` | `bs` padding all round, small column gap |
| `b-px:xs-gr:lg` | `border pad-x-xs rgap-lg` | border, inline padding, row gap |
| `bb-py:md` | `border-bottom pad-y-md` | bottom rule, block padding |
| `bt-gxl` | `border-top gap-xl` | top rule, extra-large gap |
| `ps-gb` | `pad-sm gap-bs` | no border touched at all |
| `b-p2xs-g3xl` | `border pad-2xs gap-3xl` | border, zero padding, largest gap |

A realistic card:

```html
<div class="box b-ps-gs pb-gl-desk">
  <h3>Title</h3>
  <p>Body</p>
</div>
```

Mobile and up: border, `sm` padding, `sm` gap. From 768px: padding becomes `bs`,
gap becomes `lg`, border unchanged.

---

## 12. Vocabulary size

With the default configuration:

```
5 border terms  ×  63 padding terms  ×  27 gap terms

B×P + B×G + P×G + B×P×G
315 +  135 + 1701 +  8505  =  10,656 compounds per band
                              × 3 bands (base, mob, desk)
                              = 31,968 possible class names
```

That is the vocabulary the grammar *can express*, not what an application
downloads. Selector filtering removes every compound your source never mentions —
this project ships roughly **12 KB / 3 KB gzip** of CSS in total.

To shrink the *potential* vocabulary as well (faster compiles), restrict it before
loading the entry point:

```sass
@use '01_config' as cfg with (
	$composition-steps: ('sm' 'bs' 'lg'),
	$composition-directions: false
)
@use 'index'
```

| Setting | Default | Effect |
|---|---|---|
| `$compositions-enabled` | `true` | `false` drops compounds; ordinary utilities remain |
| `$composition-steps` | all nine | limits compound measures only, not the utility scale |
| `$composition-directions` | `true` | `false` drops side borders and all scoped terms |

Unknown or duplicated steps, and non-boolean flags, are **compile-time errors**.

---

## 13. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Element completely unstyled | Typo — no rule exists. Check §3/§4 spellings. |
| Padding is the wrong size | Short-vs-full measure confusion (`pb` = `bs`, not bottom). See §4. |
| Padding on the wrong side | Missing colon — `pl` is `lg` all round, `pl:lg` is left. |
| Works in dev, gone in production | Class built by interpolation. Use a literal or safelist it. |
| `querySelector` throws | Unescaped colon. Use `CSS.escape`. |
| Sizes differ between two elements naming the same step | Different `--pad-scale` / `--gap-scale` context. See §6. |
| A component overrides your compound | Expected — specificity is unchanged. See §7. |

**Verify a compound exists** without guessing:

```sh
pnpm exec sass --no-source-map src/lib/styles/index.sass | grep -F 'b-ps-gl'
```
