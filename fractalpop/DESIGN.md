# DESIGN.md — Fractalgraphic Design System (Sveltekit Theme)

A strict, implementation-grade technical specification of design tokens, typography scales, layout geometry, structural component archetypes, and CSS specifications for use in the Sveltekit Theme of the Fractalgraphic Design System.


> I have removed as many as i could spot cases of `--` or `__` in classes, like `.this-class__here` kind of syntax. it is not permitted. 

## 1. Design Tokens & Color Architecture

### Color Variables and Values

=light--tokens
--bg: #ffffff
--bg-surface: #f4f4f5
--bg-raised: #FaFaFa
--bg-panel: #e4e4e7
--bg-dialog: #d4d4d8
--bg-popover: #e4e4e7
--bg-terminal: #b1b1b1
--text-primary: #202122
--text-secondary: #717171
--text-muted: #a3a4a7
--text-inverse: #121212
--state-hover: #e4e4e7
--state-hover-subtle: #edebeb
--state-selected: #edebeb
--border: #dfdfdf
--border-strong: #a7a7a7
--border-subtle: #efefef
--border-blueprint: var(--theme-color)
--theme-color: var(--theme-5)
--theme-color-alt: var(--theme-4)
--color-alt: #047FB4
--color-alt2: #F12323

=dark-mode-tokens
--bg: #101010
--bg-surface: #161616
--bg-raised: #2F2F2F
--bg-panel: #303030
--bg-dialog: #403C3C
--bg-popover: #0D0D0D
--bg-terminal: #0D0D0D
--text-primary: #f1f1f1
--text-secondary: #B0B0B0
--text-muted: #5E5D5F
--text-inverse: #f1f1f1
--state-hover: #303030
--state-hover-subtle: #292828
--state-selected: #5E5D5F
--border: #3E3E3E
--border-strong: #494545
--border-subtle: #242424
--border-blueprint: var(--theme-color)
--theme-color: var(--theme-5)
--theme-color-alt: var(--theme-4)
--color-alt: #047FB4
--color-alt2: #F12323

--theme-1: #FF8A5C
--theme-2: #FF6E38
--theme-3: #FF5719
--theme-4: #FF4500
--theme-5: #FA3701
--theme-6: #DE2D00
--theme-7: #B82200
--theme-8: #911800
--theme-9: #6B0F00
--theme-10: #480800

### Typography

--font-sans: -apple-system, BlinkMacSystemFont, "Geist", "Inter", "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace;

.sans
	font-family: var(--font-sans)
.mono
	font-family: var(--font-mono)
> no need to redefine font family in hundred different classes. just use `sans` or `mono` in styling inline markup.
> ie, for example, no need to define and eyebrow-mono, stage-mono etc. just "eyebrow mono" or "stage mono" inline.

--text-xs: 0.675rem
--text-sm: 0.75rem
--text-md: 0.875rem
--text-bs: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem
--text-3xl: 1.875rem
--text-4xl: 2.25rem
--text-5xl: 2.75rem
--text-6xl: 3.75rem
--text-7xl: 5rem

//body text
.text-bs 
	font-size: var(--text-bs)
.text-lg
	font-size: var(--text-lg)
.text-md
	font-size: var(--text-md)

//display text
.text-xl, .text-2xl, .text-3xl - using their own variables

//special text
.eyebrow
	font-size: var(--text-xs)
.stage
	font-size: var(--text-sm)
.metatext //use in places like stat numbers
	font-size: var(--text-2xl)
.metalabel //use in places like stat labels
	font-size: var(--text-xs)
.code-block
	font-size: var(--text-md)
.code-inline
	font-size: var(--text-sm)

| Token | Family | Font Size | Weight | Tracking | Line Height | Case | Default Color |
|---|---|---|---|---|---|---|---|
| `text-4xl` | Sans | `var(--text-4xl)` (52px) | 800 | `-0.035em` | 1.05 | None | `--text-primary` |
| `text-3xl` | Sans | `var(--text-3xl)` | 700 | `-0.030em` | 1.15 | None | `--text-primary` |
| `text-2xl` | Sans | `var(--text-2xl)` | 700 | `-0.025em` | 1.25 | None | `--text-primary` |
| `text-xl` | Sans | `var(--text-xl)` | 600 | `-0.015em` | 1.35 | None | `--text-primary` |
| `text-lg` | Sans | `var(--text-lg)` | 400 | `-0.010em` | 1.60 | None | `--text-secondary` |
| `text-bs` | Sans | `var(--text-bs)` | 400 | `0` | 1.55 | None | `--text-secondary` |
| `text-md` | Sans | `var(--text-md)` | 400 | `0` | 1.50 | None | `--text-muted` |
| `eyebrow` | Mono | `var(--text-sm)` | 600 | `+0.14em` | 1.20 | Uppercase | `--text-accent` |
| `stage` | Mono | `var(--text-sm)` | 600 | `+0.12em` | 1.20 | Uppercase | `--text-accent` |
| `metatext` | Sans/Mono | `var(--text-2xl)` | 700 | `-0.020em` | 1.00 | None | `--theme-color` |
| `metalabel` | Mono | `var(--text-xs)` | 500 | `+0.12em` | 1.20 | Uppercase | `--text-muted` |
| `metatag` | Mono | `var(--text-sm)` | 700 | `+0.10em` | 1.00 | Uppercase | `--text-inverse` |
| `code-block` | Mono | `var(--text-md)` (13px) | 400 | `-0.010em` | 1.55 | None | `--color-terminal-fg` |
| `code-inline` | Mono | `var(--text-sm)` | 400 | `0` | 1.20 | None | `--text-primary` |


## Spatial System

--space-xs: clamp(0.125rem, 0.0739rem + 0.2273vw, 0.25rem)
--space-sm: clamp(0.25rem, 0.1477rem + 0.4545vw, 0.5rem)
--space-md: clamp(0.5rem, 0.3977rem + 0.4545vw, 0.75rem)
--space-bs: clamp(0.75rem, 0.6477rem + 0.4545vw, 1rem)
--space-lg: clamp(1rem, 0.7955rem + 0.9091vw, 1.5rem)
--space-xl: clamp(1.5rem, 1.2955rem + 0.9091vw, 2rem)
--space-2xl: clamp(2rem, 1.5909rem + 1.8182vw, 3rem)
--space-3xl: clamp(3rem, 2.5909rem + 1.8182vw, 4rem)


### Basic Resets

```sass
:root
	--container-max-width: 1080px
	--container-gutter: 1.5rem
@media (min-width: 768px)
	:root
		--container-gutter: 2.5rem
@media (min-width: 1200px)
	:root
		--container-gutter: 3rem
```

### Specs - Blueprint Frame (`.blueprint-box`)

A technical frame with dashed borders, registration marks, and an anchor pill.

```sass
.blueprint-box
	position: relative
	background: var(--bg-raised)
	border: 1px dashed var(--border)
	border-radius: 0
	padding: var(--space-xl) var(--space-lg)

/* Corner registration marks (+) */
.blueprint-box::before,
.blueprint-box::after
	position: absolute
	font-family: var(--font-mono)
	font-size: 11px
	font-weight: 400
	line-height: 1
	color: var(--theme-color)
	pointer-events: none

.blueprint-box::before
	content: "+"
	top: -6px
	left: -4px

.blueprint-box::after
	content: "+"
	bottom: -6px
	right: -4px

.blueprint-box-corner-tr
	position: absolute
	top: -6px
	right: -4px
	font-family: var(--font-mono)
	font-size: 11px
	line-height: 1
	color: var(--theme-color)
	pointer-events: none

.blueprint-box-corner-bl
	position: absolute
	bottom: -6px
	left: -4px
	font-family: var(--font-mono)
	font-size: 11px
	line-height: 1
	color: var(--theme-color)
	pointer-events: none

.blueprint-box-badge
	display: inline-block
	background: var(--theme-color)
	color: var(--text-inverse)
	font-family: var(--font-mono)
	font-size: 0.6875rem
	font-weight: 700
	letter-spacing: 0.10em
	text-transform: uppercase
	padding: 3px 8px
	border-radius: 2px
	margin-bottom: var(--space-md)
```

### Split Comparison Card (`.split-card`)

A two-column qualification card with an asymmetric top accent stripe.

```sass
.split-card
	display: grid
	grid-template-columns: 1fr
	border: 1px solid var(--border-subtle)
	background: var(--bg-surface)
	border-radius: 0

@media (min-width: 768px)
	.split-card
		grid-template-columns: 1fr 1fr

.split-card-pane-left
	position: relative
	padding: var(--space-xl) var(--space-lg)
	border-top: 3px solid var(--theme-color)

.split-card-pane-right
	position: relative
	padding: var(--space-xl) var(--space-lg)
	border-top: 3px solid transparent
	border-left: 0
	border-top: 1px solid var(--border-subtle)

@media (min-width: 768px)
	.split-card-pane-right
		border-left: 1px solid var(--border-subtle)
		border-top: 3px solid transparent

.split-card-list
	list-style: none
	margin: 0
	padding: 0
	display: flex
	flex-direction: column
	gap: var(--space-sm)

.split-card-item
	display: flex
	align-items: flex-start
	gap: var(--space-xs)
	font-size: 0.9375rem
	line-height: 1.5
	color: var(--text-secondary)

.split-card-item-positive .split-card-marker
	color: var(--theme-color)
	font-family: var(--font-mono)
	font-weight: 700

.split-card-item-negative 
	.split-card-marker
		color: var(--text-secondary)
		font-family: var(--font-mono)
		font-weight: 400
```

### Metric Strip (`.metric-strip`)

A single-row, multi-cell metric bar with internal hairline dividers.

```sass
.metric-strip
	display: grid
	grid-template-columns: repeat(2, 1fr)
	border: 1px solid var(--border-subtle)
	background: var(--bg-surface)
	border-radius: 0

@media (min-width: 640px)
	.metric-strip
		grid-template-columns: repeat(3, 1fr)

@media (min-width: 900px)
	.metric-strip
		grid-template-columns: repeat(6, 1fr)

.metric-strip-cell
	padding: var(--space-md) var(--space-sm)
	display: flex
	flex-direction: column
	gap: var(--space-2xs)
	border-right: 1px solid var(--border-subtle)
	border-bottom: 1px solid var(--border-subtle)

@media (min-width: 900px)
	.metric-strip-cell
		border-bottom: none
	.metric-strip-cell:last-child
		border-right: none

.metric-strip-val
	font-size: 1.75rem
	font-weight: 700
	line-height: 1.0
	color: var(--theme-color)

.metric-strip-label
	font-family: var(--font-mono)
	font-size: 0.625rem
	font-weight: 500
	letter-spacing: 0.12em
	text-transform: uppercase
	color: var(--text-muted)
```

### Benchmark Cards (`.benchmark-cards`)

A 3-column horizontal comparison card group with internal bar tracks.

```sass
.benchmark-cards
	display: grid
	grid-template-columns: 1fr
	border: 1px solid var(--border-subtle)
	border-radius: 12px
	background: var(--bg-surface)
	overflow: hidden

@media (min-width: 768px)
	.benchmark-cards
		grid-template-columns: repeat(3, 1fr)

.benchmark-card
	padding: var(--space-lg)
	border-bottom: 1px solid var(--border-subtle)

@media (min-width: 768px)
	.benchmark-card
		border-bottom: none
		border-right: 1px solid var(--border-subtle)
	.benchmark-card:last-child
		border-right: none

.benchmark-card-title
	font-size: 0.9375rem
	font-weight: 700
	color: var(--text-primary)
	margin-bottom: var(--space-md)

.benchmark-row
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-md)
	margin-bottom: var(--space-xs)

.benchmark-row-track
	flex: 1
	height: 3px
	background: var(--state-hover)
	border-radius: 2px
	overflow: hidden

.benchmark-row-fill
	height: 100%
	border-radius: 2px

.benchmark-row-fill-1
	background: var(--theme-color)

.benchmark-row-fill-2
	background: var(--color-alt)

.benchmark-row-fill-3
	background: var(--color-alt2)

.benchmark-row-fill-4
	background: var(--theme-2)

.benchmark-row-val
	font-family: var(--font-mono)
	font-size: 0.8125rem
	font-weight: 700
	color: var(--text-primary)
	min-width: 4.5rem
	text-align: right

.benchmark-row-unit
	font-weight: 400
	color: var(--text-muted)
```

### Stage Step Row (`.stage-row`)

An asymmetric list row with horizontal hairline boundaries.

```sass
.stage-row
	display: grid
	grid-template-columns: 1fr
	padding: var(--space-xl) 0
	border-bottom: 1px solid var(--border-subtle)
	gap: var(--space-md)

@media (min-width: 768px)
	.stage-row
		grid-template-columns: 100px 1.2fr 1fr
		gap: var(--space-xl)

.stage-row-number
	font-family: var(--font-mono)
	font-size: 0.75rem
	font-weight: 600
	letter-spacing: 0.12em
	text-transform: uppercase
	color: var(--theme-color)

.stage-row-content
	display: flex
	flex-direction: column
	gap: var(--space-xs)

.stage-row-title
	font-size: 1.375rem
	font-weight: 700
	letter-spacing: -0.02em
	color: var(--text-primary)

.stage-row-body
	font-size: 0.9375rem
	line-height: 1.6
	color: var(--text-secondary)

.stage-row-list
	display: flex
	flex-direction: column
	gap: var(--space-xs)

.stage-row-item
	display: flex
	justify-content: space-between
	align-items: baseline
	padding-bottom: var(--space-2xs)
	border-bottom: 1px dotted var(--border-subtle)
	font-family: var(--font-mono)
	font-size: 0.8125rem

.stage-row-item-meta
	color: var(--text-muted)
	font-size: 0.6875rem
	letter-spacing: 0.08em
	text-transform: uppercase
```

### Terminal Code Frame (`.terminal-frame`)

A dark container for code specimens and CLI blocks.

```sass
.terminal-frame
	background: var(--bg-terminal)
	border: 1px solid var(--border-strong)
	border-radius: 4px
	padding: var(--space-lg)
	font-family: var(--font-mono)
	font-size: 0.8125rem
	line-height: 1.6
	color: var(--text-inverse)

.terminal-frame pre
	margin: 0
	padding: 0
	overflow-x: auto

.terminal-frame code
	font-family: inherit
```

### Action Buttons (`.btn-primary`, `.btn-secondary`)

```sass
.btn
	display: inline-flex
	align-items: center
	justify-content: center
	font-family: var(--font-mono)
	font-size: 0.8125rem
	font-weight: 600
	line-height: 1
	padding: var(--space-sm) var(--space-bs)
	border-radius: 2px
	text-decoration: none
	cursor: pointer
	transition: background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out

.btn-primary
	background: var(--theme-color)
	color: var(--text-inverse)
	border: 1px solid var(--theme-color)

.btn-primary:hover
	background: var(--state-hover)
	border-color: var(--state-hover)

.btn-secondary
	background: var(--bg-surface)
	color: var(--text-primary)
	border: 1px solid var(--border-strong)

.btn-secondary:hover
	background: var(--bg-surface)
```


## Hairlines & Dividers

```sass
.hairline-divider
	width: 100%
	height: 1px
	background: var(--border-subtle)
	border: none
	margin: 0

.hairline-divider-accent
	background: var(--theme-color)

.hairline-divider-dashed
	height: 0
	border-top: 1px dashed var(--border-subtle)
```


## 6. Micro-Geometry & Constraints Matrix

| Property | Rule | Allowed Values |
|---|---|---|
| **Border Radius** | Rigid geometric hierarchy | `0px` (cards, blueprint, metric strip)<br>`2px` (buttons, badge pills, bar tracks)<br>`4px` (terminal frames, code boxes)<br>`12px` (benchmark card group) |
| **Borders** | Explicit 1px rules | `1px solid var(--border-subtle)`<br>`1px dashed var(--border-blueprint)`<br>`3px solid var(--theme-color)` (active pane top) |
| **Drop Shadows** | Prohibited on surfaces | `none` (zero box-shadow; depth is delineated solely via borders and surface shifts) |
| **Focus Rings** | High contrast accessibility | `2px solid var(--theme-color)` with `2px` offset |
| **Transitions** | Fast, linear/subtle ease | `120ms ease-out` (color, border, background) |
