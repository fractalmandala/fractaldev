# Pāṇinian compositions: a grammar for styling

> Establish the vocabulary once, let context carry repeated information, and write only the distinctions that matter.

This document explains the inspiration, the implemented border–padding–gap grammar, its Sass configuration, and the **used-only delivery pipeline**. It distinguishes what the grammar *can express* from what an application actually downloads.

## 1. The inspiration: Pāṇini’s Aṣṭādhyāyī

Pāṇini’s *Aṣṭādhyāyī* is a grammar of Sanskrit organized into eight chapters, each divided into four sections, containing approximately four thousand concise rules, or *sūtras*. Its economy is not simply a matter of shortening words. A rule can depend on technical definitions, governing context, material continued from earlier rules, and conventions for interpreting other rules.

The reader does not interpret every sūtra as an isolated, self-contained sentence. Much of its meaning is recoverable from the system surrounding it. Brevity is possible because the shared machinery is precise.

That is the useful design lesson here:

**Compression should move repetition into a shared grammar, not move meaning into an arbitrary dictionary of cryptic names.**

### Relevant ideas and their engineering analogues

| Idea | Broad grammatical role | Styling analogy |
|---|---|---|
| **Saṃjñā** — technical designation | Gives a term a precisely defined specialized meaning. | `b`, `p`, and `g` identify operations; `s`, `b`, and `l` identify particular spacing steps. |
| **Adhikāra** — governing scope | Establishes a domain applying over a range of rules. | An operation prefix supplies a term’s context; a final `-desk` scopes an entire compound. |
| **Anuvṛtti** — continuation | Carries applicable material forward instead of repeating it. | Border width, border token, density multipliers, and unmarked all-side scope need not be restated in every use. |
| **Utsarga–apavāda** — general rule and exception | Relates a general provision to a more particular exception. | Specify all-side padding, then use an ordinary side utility for a departure. |
| **Paribhāṣā** — interpretive principle | Helps determine how rules are understood or applied. | Define canonical term order, omission versus reset, and the meaning of directional scopes explicitly. |

These are **design analogies**, not a claim that this library implements Sanskrit grammar. In particular, CSS cascade precedence is not a translation of Pāṇinian rule precedence. Pāṇini’s use of *pratyāhāras* to designate sound groups is also more specific than simply giving a Sass map a short name.

The goal is not the shortest possible string. A notation that saves two characters but becomes ambiguous has lost the more important economy: ease of understanding.

## 2. From independent utilities to a sentence

The expanded form is:

```html
<div class="box border pad-sm gap-lg">...</div>
```

The condensed form is:

```html
<div class="box b-ps-gl">...</div>
```

Read the compound in three parts:

```text
b   → border, all sides
ps  → padding, all sides, small
gl  → gap, both directions, large
```

The class is a single HTML class token. A browser does not split it into utilities. Sass supplies equivalent selectors for the compound.

`box` stays separate: **a gap does not implicitly choose flex or grid**. A composition controls only the operations it actually names.

## 3. The implemented grammar

### Operations and order

A compound contains **two or three operations**, always in this order:

```text
border → padding → gap
```

Supported shapes are:

```text
border-padding
border-gap
padding-gap
border-padding-gap
```

Each operation has at most one scope. Missing operations emit nothing; they do not reset a property. Single-operation abbreviations are not generated—use `border`, `pad-sm`, or `gap-lg` directly.

### Border terms

| Term | Utility | Scope |
|---|---|---|
| `b` | `border` | All sides |
| `bt` | `border-top` | Physical top |
| `br` | `border-right` | Physical right |
| `bb` | `border-bottom` | Physical bottom |
| `bl` | `border-left` | Physical left |

All read the existing `1px solid var(--border)` declaration. Omission is not `border: none`. `border-subtle` and resets such as `bord0` remain ordinary utilities rather than new terms in this grammar.

### Spacing measures

The actual scale has nine steps, not just small/base/large:

| Full step | Short measure for unscoped terms | Padding | Gap |
|---|---|---|---|
| `2xs` | `2xs` | `p2xs` | `g2xs` |
| `xs` | `xs` | `pxs` | `gxs` |
| `sm` | `s` | `ps` | `gs` |
| `md` | `md` | `pmd` | `gmd` |
| `bs` | `b` | `pb` | `gb` |
| `lg` | `l` | `pl` | `gl` |
| `xl` | `xl` | `pxl` | `gxl` |
| `2xl` | `2xl` | `p2xl` | `g2xl` |
| `3xl` | `3xl` | `p3xl` | `g3xl` |

`2xs` currently refers to the zero-valued spacing token. It is an explicit value, unlike omission. `3xs` is not a defined step; references to `--space-3xs` elsewhere in the existing styles are a separate token issue, not a new supported measure.

### Explicit directional scopes

Scoped terms use a colon and the **full step name**:

| Term pattern | Expanded family |
|---|---|
| `pt:sm`, `pr:sm`, `pb:sm`, `pl:sm` | `pad-top-sm`, `pad-right-sm`, `pad-bottom-sm`, `pad-left-sm` |
| `px:sm` | `pad-x-sm` → `padding-inline` |
| `py:sm` | `pad-y-sm` → `padding-block` |
| `gr:sm` | `rgap-sm` → `row-gap` |
| `gc:sm` | `cgap-sm` → `column-gap` |

Padding `x` and `y` preserve this project’s **logical inline/block** properties. They are not reinterpreted as physical left/right and top/bottom in every writing mode. Named sides remain physical.

The colon solves a real ambiguity:

```text
pxs    = padding extra-small, all sides
px:sm  = inline padding small
pl     = padding large, all sides
pl:sm  = left padding small
```

There is one canonical spelling per term: unscoped `ps`, not `psm`; scoped `px:sm`, not `px:s`. This keeps the generated vocabulary smaller and predictable.

Write colons literally in HTML. The Sass builder escapes them in selectors. When writing a DOM query yourself, use `CSS.escape(className)` rather than treating a colon as a CSS pseudo-class.

### Examples

| Composition | Expansion |
|---|---|
| `b-ps-gl` | `border pad-sm gap-lg` |
| `bl-ps-gl` | `border-left pad-sm gap-lg` |
| `b-pl:sm-gr:lg` | `border pad-left-sm rgap-lg` |
| `pb-gc:sm` | `pad-bs cgap-sm` |
| `b-px:xs-gr:lg` | `border pad-x-xs rgap-lg` |
| `bb-py:md` | `border-bottom pad-y-md` |
| `bt-gxl` | `border-top gap-xl` |
| `ps-gb` | `pad-sm gap-bs` |

### Responsive scope

A final suffix applies to the **whole compound**:

```html
<div class="box b-ps-gs pb-gl-desk">...</div>
```

The first class provides the base border/padding/gap. At desktop widths the second changes padding and gap; it makes no border declaration.

`b-ps-gl-desk` expands to `border-desk pad-sm-desk gap-lg-desk`. Border responsive utilities were added alongside the existing spacing variants so this equivalence holds for every operation.

By default, `mob` ends at `767px` and `desk` begins at `768px`. Both come from `$responsive-modes`. Additional modes are supported, but retain the `mob` and `desk` keys: existing visibility utilities depend on them.

### Exceptions and unsupported forms

Use ordinary utilities for additional scopes:

```html
<div class="box b-ps-gl pad-top-lg">...</div>
```

This works through the existing stylesheet order: all-side padding rules precede physical-side padding rules. **HTML class order is not an instruction to override earlier classes.**

The implementation does not generate arbitrary term order, multiple padding scopes inside one compound, pixel literals, negative margins, or every conceivable abbreviation. Unsupported strings simply have no matching rule. Sass does not inspect markup and cannot diagnose its typos.

## 4. How the Sass implementation preserves meaning

The implementation lives in these files:

| File | Responsibility |
|---|---|
| `_style-vocabulary.sass` | Shared spacing steps and property-family maps. |
| `_01_config.sass` | Public configuration knobs, including composition limits and responsive queries. |
| `_compositions.sass` | Compact term maps, configuration validation, colon escaping, alias indexing, and `selectors()`. |
| `_02_dimensions.sass` | Attaches aliases to the original padding/gap rules in each responsive band. |
| `_06_visuals.sass` | Attaches aliases to original border rules and emits responsive border families. |
| `index.sass` | Full Sass entry point; it defines the potential vocabulary, not used-only delivery by itself. |

`_compositions.sass` builds the allowed two- and three-operation combinations using nested `@each` loops. It indexes each compound by the utility terms it contains. The dimensions and visuals files then ask for a selector list:

```sass
#{compositions.selectors(pad, sm)}
	padding: calc(var(--space-sm) * var(--pad-scale, 1))
```

Conceptually, a selected part of that rule is:

```sass
.pad-sm, .b-ps-gl
	padding: calc(var(--space-sm) * var(--pad-scale, 1))
```

The border and gap aliases accompany their own original rules. The compound is **not** a new, stronger block appended at the end of the stylesheet.

This preserves:

- Existing declaration values and source order.
- Ordinary class specificity.
- `--pad-scale` for padding and `--gap-scale` for gaps.
- Theme-dependent border tokens.
- Component precedence: where the later `.card` rules previously beat dimensional utilities, they still do.

Equal spacing step names do not promise equal pixel lengths: the two density multipliers may differ. Context supplies those differences without making every class repeat them.

## 5. Configuring the grammar

The public knobs belong to `_01_config.sass`; `_compositions.sass` reads them. Its `$_short-steps` and prefix maps are implementation details, not application-level settings.

| Setting | Default | Effect |
|---|---|---|
| `$compositions-enabled` | `true` | Enables compound aliases. `false` leaves ordinary utilities available. |
| `$composition-steps` | All nine full step names | Limits only compound measures, not the underlying utility scale. |
| `$composition-directions` | `true` | Enables side borders, scoped padding, and row/column-gap terms. `false` keeps all-side combinations. |
| `$breakpoint` | `768px` | Supplies the default mobile/desktop seam. |
| `$responsive-modes` | `mob` and `desk` queries | Controls responsive suffixes and their media conditions. |

Configure before any module loads `_01_config.sass`:

```sass
@use '01_config' as cfg with (
	$composition-steps: ('sm' 'bs' 'lg'),
	$composition-directions: false
)
@use 'index'
```

Place such a wrapper in a separate `.sass` file and pass it as `styleEntry` to the delivery plugin. Do not make `index.sass` import itself. Unknown or duplicate configured steps and non-boolean enable/direction flags cause Sass compilation errors.

### Why limits still matter with used-only delivery

With defaults, there are five border terms, 63 padding terms, and 27 gap terms. The two- and three-operation combinations produce:

```text
B×P + B×G + P×G + B×P×G = 10,656 compounds per band
3 bands = 31,968 compound class names
```

The complete compiled stylesheet measured about **1.90 MB / 232 KB gzip** before used-only delivery. Aliases share declaration bodies, but selector text still costs bytes.

Restricting steps and scopes reduces compilation work and potential vocabulary. **Pruning is what prevents unused selectors from reaching the application.** These are separate mechanisms.

## 6. Used-only delivery: grammar versus deployment

The intended pipeline is:

```text
Sass vocabulary → compile internally → discover source literals + safelist
               → filter individual selectors → deliver used-only CSS
```

`builder.ts` and `vite.ts` are Node/build tooling. All styling declarations remain authored in tab-indented Sass. The tooling does not maintain a second TypeScript registry of property values, rewrite HTML class attributes, or run a CSS generator in the browser.

The full Sass expansion can exist temporarily in the builder’s memory. It is **not** returned as the application stylesheet. Removing unused aliases from each selector list keeps the declarations for any remaining used class at their original position. If a rule has no remaining selectors, it is removed.

### This project

`vite.config.ts` enables `fractutilsStyles()`. The root layout imports:

```ts
import 'virtual:fractutils.css';
```

It no longer imports `$lib/styles/index.sass` directly.

The measured production client stylesheet after this change is approximately **12 KB / 3 KB gzip**, including the application’s other component styles. That is a measurement of this application, not a guaranteed size for every consumer.

### A packaged consumer

Install the package in a Vite 8 application, then configure:

```ts
import { defineConfig } from 'vite';
import { fractutilsStyles } from 'fractutils/styles/vite';

export default defineConfig({
	plugins: [
		fractutilsStyles({
			content: ['index.html', 'src/**/*.{svelte,html,js,ts,jsx,tsx}'],
			safelist: ['b-ps-gl', 'b-px:xs-gr:lg-desk']
		})
		// Keep the application's existing framework plugin(s) as well.
	]
});
```

Import `virtual:fractutils.css` once in the application entry or root layout. If nothing imports it, no stylesheet is emitted.

For custom Sass settings in a consumer, create `src/styles.sass`:

```sass
@use 'pkg:fractutils/styles/config' as cfg with (
	$composition-steps: ('sm' 'bs' 'lg'),
	$breakpoint: 900px
)
@use 'pkg:fractutils/styles/full.sass'
```

Pass `styleEntry: 'src/styles.sass'` to `fractutilsStyles()`. The builder enables Dart Sass’s `NodePackageImporter` for these `pkg:` imports. This wrapper is **input to the builder**, not an additional direct stylesheet import in application code.

### Delivery options

| Option | Meaning |
|---|---|
| `root` | Source root; the plugin defaults to Vite’s resolved root. |
| `content` | Source paths/globs relative to root. Defaults include `index.html`, supported source files under `src`, and route Markdown. |
| `exclude` | Additional exclusions. Tests, generated application output, and this tooling’s own directory are excluded by the scanner. |
| `safelist` | Complete literal class names that must survive even when not discoverable in content. No wildcard or regular-expression expansion. |
| `styleEntry` | Optional application-owned Sass wrapper. Defaults to the package’s `index.sass`. |
| `sass` | Additional Dart Sass options, such as load paths/importers. Delivery always uses compressed compilation without a source map. |
| `maxCssBytes` | Uncompressed output budget; defaults to `128 × 1024`. Oversized output throws instead of quietly shipping bulk. |

Inspect unexpectedly broad content globs or safelists before increasing the byte budget. The budget is a guardrail, not a replacement for selector filtering.

### Dynamic classes and dependency components

Literal alternatives are discoverable:

```svelte
<div class={compact ? 'b-ps-gs' : 'b-pb-gl'}>...</div>
```

Fragments are not evaluated:

```svelte
<div class={`b-p${size}-gl`}>...</div>
```

Use a map containing complete class strings, or safelist every permitted completed value. The same applies to class names arriving from a CMS, API, or runtime theme selection.

If a dependency contains classes that are not present in the application’s own source, include its component files explicitly:

```ts
fractutilsStyles({
	content: [
		'index.html',
		'src/**/*.{svelte,html,js,ts}',
		'node_modules/my-ui-library/dist/**/*.{svelte,js}'
	]
});
```

There is no blanket `node_modules` exclusion that defeats this explicit configuration. Vite may still ignore changes inside `node_modules` while watching; restart the server after rebuilding such a dependency, or configure Vite’s watcher appropriately. External development packages can also be listed through explicit source globs.

The scanner is deliberately conservative: it reads complete candidate tokens from source text, including comments and strings. It is not an AST reachability analysis or a record of the live DOM. A token in a scanned but unrendered file can retain CSS. Keep documentation and generated bundles out of `content` unless they genuinely supply runtime class names.

### What remains intentionally

Used-only here means **unused class-based selectors are filtered**. It does not mean every byte that could theoretically be unused is eliminated:

- Root tokens, resets, element rules, and attribute-based mode/preset rules remain.
- Font declarations, keyframes, and layer-order declarations are retained.
- Negated class conditions do not require the negated class to appear in source.
- Supported selector alternatives such as `:is()` are checked conservatively; their original structure is retained when the selector survives.
- Unknown functional pseudo-classes are preserved conservatively rather than risk deleting required behavior.
- Selection covers the configured application source set, not just the current route.

For custom Sass asset references in the virtual stylesheet, use public-root URLs such as `/images/example.svg`; import other assets through Vite modules separately. The builder does not implement source-relative URL rebasing across Sass partials.

## 7. First paint, SSR, and development changes

Pruning must not trade stylesheet size for a flash of unstyled content.

The public import is virtual, but internally the plugin resolves it to a **file-shaped virtual CSS ID**, `/.fractutils/used.css`. No file is written there. This lets SvelteKit discover the same stylesheet through its SSR and browser dependency URLs and inline it in development’s initial HTML. Production uses Vite/SvelteKit’s normal extracted stylesheet delivery.

A null-prefixed virtual ID previously prevented that discovery in the tested Vite 8/SvelteKit setup: CSS appeared only after client-side injection. The file-shaped ID fixes that path without hiding the page until JavaScript runs.

Content additions, changes, and removals trigger a rescan. When candidates change, the plugin invalidates **only its stylesheet modules and their importers** and requests a full page reload. It does not invalidate the entire module graph: doing so can replace Svelte’s SSR runtime while older components still refer to its previous context, producing a null-context error in `push_element`.

Changes to loaded Sass files also invalidate the cached compilation. Unchanged source candidates reuse the compiled vocabulary.

Development file watching is kept separate from module dependencies. Vite can turn `addWatchFile()` calls made while loading CSS into CSS dependency nodes. If raw Sass inputs enter that graph, SvelteKit can inline their full, unpruned output on a cold request. The plugin therefore uses the development file watcher directly and reserves build dependency registration for production/build-watch mode.

## 8. Packaging is not tree-shaking

A library package cannot know the future consumer’s markup. Therefore:

1. The package ships the small Sass **source grammar** and Node delivery tooling.
2. It does not ship a precompiled full utility/compound stylesheet as the default style entry.
3. The consumer’s build performs selection using the consumer’s content and safelist.
4. `fractutils/styles/full.sass` is an explicitly named full-vocabulary escape hatch.

**A direct import of `index.sass` or `fractutils/styles/full.sass` bypasses pruning. Do not import it alongside `virtual:fractutils.css`.** The full Sass export exists for deliberate offline compilation and as input to custom wrappers, not as the recommended browser delivery path.

The package marks Sass/CSS imports as side-effectful so an intentional stylesheet import is not discarded. That metadata does not prune selectors. Node tooling is exported separately through `fractutils/styles/vite` and `fractutils/styles/builder`, not through the browser-facing main entry.

For a non-Vite build system, `buildStyles(options)` from `fractutils/styles/builder` returns filtered CSS and dependency paths without writing files. The host build system is responsible for writing/linking that result and performing its own rebuild watching.

### What was learned from `fractals-styler`

The neighboring project supplied a useful precedent: content scanning, explicit Vite integration, and a generated stylesheet. Its optional JIT path does not, however, prune its separately imported static Sass scaffold. Its TypeScript numeric registry also regenerates declarations rather than preserving this project’s Sass alias positions.

This implementation adapts the scanner/delivery idea, not the entire architecture. Sass remains the property source of truth, selector filtering preserves the cascade, safelists are explicit, and package consumers run selection at their own application boundary.

## 9. Further compositions worth considering

These are **proposals, not implemented syntax**:

| Candidate | Value | Constraint |
|---|---|---|
| `pg:sm` | State a repeated padding/gap measure once. | Preserve separate density multipliers. |
| `row-x:between-y:center` | Let the container govern alignment interpretation. | Preserve contextual specificity and differences between `row`, `box`, and `grid`. |
| `box-gs` | Combine a declared container with its rhythm. | Unlike a spacing-only compound, it explicitly requests display/direction. |
| `grid:3-gl` | Combine grid stepping and rhythm. | Preserve `grid-3`’s responsive 1→3 behavior. |
| Meaningful named recipes | Give recurring visual relationships recognizable names. | Prefer stable roles, not arbitrary tuples of background/radius/shadow. |

Several mechanisms are already present: `card`, `eyebrow`, and `field-label` name useful bundles; `data-layout`, `data-shape`, and `data-motion` establish inherited context. Canonical shell markup should remain explicit because a shorter class cannot remove its structural obligations.

The next extension should earn its place by reducing repeated **meaning**, not merely repeated characters.

## 10. Verification and references

Run the delivery tests with Node 24:

```sh
pnpm test:styles
```

Run the Sass-only assertions on macOS/Linux:

```sh
pnpm exec sass --no-source-map src/lib/styles/_composition-tests.sass /dev/null
```

Tests cover literal scanning, dependency sources, safelists, selector semantics, actual Sass compound output, byte budgets, production CSS extraction, and development add/change/remove behavior without resetting unrelated SSR modules. Also verify the initial HTML when changing framework integration: the stylesheet must be present before client hydration.

Historical background:

- [Learn Sanskrit: The Structure of the Aṣṭādhyāyī](https://www.learnsanskrit.org/panini/structure/) — technical definitions, governing rules, and interpretation in context.
- [Vyoma: A brief Overview of the Ashtadhyayi of Panini](https://www.sanskritfromhome.org/course-details/laghuparicaya-7129) — the eight-chapter structure, approximately four thousand sūtras, adhikāra, and anuvṛtti.

These sources support the grammatical background. The styling analogies, notation, and deployment design described here are engineering choices made for this library.
