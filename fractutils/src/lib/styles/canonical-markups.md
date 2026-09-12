---
title: Canonical Markups
description: Source of truth for shell and layout markups
---

> An L4 class without a canonical markup is an incomplete definition: the
> stylesheet cannot hold up its end alone. These are the structures the shell
> classes in `_05_shells.sass` assume — copy them verbatim and the responsive
> behaviour follows.

## 1 - Canonical App Shell and Children

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
			<article class="content-shell"></article>
		</section>
		<aside class="sidebar-right"></aside>
	</main>
	<footer class="app-footer"></footer>
</div>
```

| Class | Responsibility |
|---|---|
| `.app-shell` | min-height fill; column; publishes `--header-height` |
| `.app-header` | fixed-height bar (sticky), `height: var(--header-height)` |
| `.app-main` | the row below the header; `min-height: calc(100vh - var(--header-height))` |
| `.sidebar-left` / `.sidebar-right` | sticky columns; `top: var(--header-height)`; width from `--sidebar-width`; dress your own bg |
| `.main-section` | `min-width: 0`; owns horizontal padding via `.page-main` semantics |
| `.content-shell` | max-width content column inside main-section |
| `.app-footer` | full-width footer bar |

Status: **implemented** — `_05_shells.sass`.

**Shell composition (`data-shell` on `<html>`):** the value names the optional
regions present — `l` = left rail (nav), `r` = right rail (TOC), `f` = footer,
`a` = the constrained `.app-content` article (docs column) in place of the
full-bleed `PageShell`. The attribute absent means the full shell (`lrf`); `c`
(content-only) means none of the region rails/footer. Set it through the preset
system (`setPreset('shell', …)`), not by hand. Legacy numeric `shelltype` values
(`1`–`7`) are migrated forward automatically (`7` → `lrfa`). The sanctioned set
is `lrf`, `lrfa`, `lr`, `lra`, `lf`, `l`, `f`, `c` — the full cube is not exposed
(e.g. TOC-without-nav is deliberately absent).

### shell="lrf" — full (was shelltype-1)

header, footer, main
	- sidebar-left, main-section, sidebar-right

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
		</section>
		<aside class="sidebar-right"></aside>
	</main>
	<footer class="app-footer"></footer>
</div>
```

### shell="lr" — no footer (was shelltype-2)

header, main
	- sidebar-left, main-section, sidebar-right

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
		</section>
		<aside class="sidebar-right"></aside>
	</main>
</div>
```

### shell="f" — no rails, blank main section (was shelltype-3)

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
	</main>
	<footer class="app-footer"></footer>
</div>
```

### shell="c" — bare: no rails, no footer (was shelltype-4)

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
	</main>
</div>
```

### shell="lf" — nav + footer, no TOC (was shelltype-5)

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
		</section>
	</main>
	<footer class="app-footer"></footer>
</div>
```

### shell="l" — nav only, no TOC, no footer (was shelltype-6)

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
		</section>
	</main>
</div>
```

### shell="lrfa" — full docs: nav + TOC + footer, constrained article (was shelltype-7)

The main section wraps its children in `.app-content` (a 640px column, centred
≥ 1025px) instead of the full-bleed `PageShell`. `AppShell` chooses the wrapper
from the `a` letter (`presets.shell`).

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
			<article class="app-content"></article>
		</section>
		<aside class="sidebar-right"></aside>
	</main>
	<footer class="app-footer"></footer>
</div>
```

### shell="lra" — docs, no footer: nav + TOC, constrained article

As `lrfa` without the footer (the value omits `f`, so `--footer-height` drops to
0 and `.app-footer` is not rendered).

```html
<div class="app-shell">
	<header class="app-header"></header>
	<main class="app-main">
		<aside class="sidebar-left"></aside>
		<section class="main-section">
			<article class="app-content"></article>
		</section>
		<aside class="sidebar-right"></aside>
	</main>
</div>
```

## 2 - Canonical Shell with Nav + TOC (roles)

One markup — the shell is role-bound (Amendment A1): `.sidebar-left` is the nav, `.sidebar-right` is the TOC. This single markup IS the definition of docs/navtree/toc; there is no `.docs` modifier.

```html
<div class="app-shell">
	<header class="app-header">
		<button class="button is-icon" aria-expanded="false" aria-label="Menu"></button>
	</header>
	<main class="app-main">
		<aside class="sidebar-left">
			<nav class="navtree">
				<div class="accordion">
					<div class="accordion-item open">
						<button class="accordion-trigger" aria-expanded="true">Section title</button>
						<div class="accordion-content">
							<div class="accordion-panel box">
								<a class="navtree-link active" href="…"></a>
								<div class="navtree-sub">
									<a class="navtree-link" href="…"></a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</aside>
		<section class="main-section">
			<details class="mobile-toc">
				<summary>On this page</summary>
			</details>
			<article class="content-shell"></article>
		</section>
		<aside class="sidebar-right">
			<nav class="toc">
				<div class="toc-title"></div>
				<ul class="toc-list">
					<li><a class="toc-link" href="…"></a></li>
				</ul>
				<div class="toc-footer"></div>
			</nav>
		</aside>
	</main>
	<footer class="app-footer"></footer>
</div>
```

Retraction physics:

| Rail | Visible | Below the seam |
|---|---|---|
| `.sidebar-left` (nav) | ≥ 1024px | off-canvas drawer — header menu toggles `.open` on `.app-shell` |
| `.sidebar-right` (TOC) | ≥ 1280px | `.mobile-toc` dropdown at the top of `.main-section` |

Tab strip, wherever it lives:

```html
<div class="tab-list" role="tablist">
	<button class="tab-trigger active" role="tab" aria-selected="true"></button>
</div>
```

Current tab = `.active`; triggers carry native `aria-selected`.

Status: **implemented** — `_05_shells.sass` (Amendment A1 rails + `.navtree*`/`.toc*`/`.tab-*` role classes). Navtree groups ride the accordion family; `.navtree-title` is the flat-label variant for groups that don't collapse.

## 3 - Canonical Sidebar with Accordions

```html
<aside class="page-sidebar">
	<div class="accordion">
		<div class="accordion-item open">
			<button class="accordion-trigger" aria-expanded="true"></button>
			<div class="accordion-content">
				<div class="accordion-panel">
					<a class="navtree-link" href="…"></a>
				</div>
			</div>
		</div>
		<div class="accordion-item">
			<button class="accordion-trigger" aria-expanded="false"></button>
			<div class="accordion-content">
				<div class="accordion-panel"></div>
			</div>
		</div>
	</div>
</aside>
```

`.open` on `.accordion-item` shows the content; triggers carry native `aria-expanded`.

`.accordion-panel` is required — it is the element that actually collapses, and
it carries the `overflow` and `min-height` the grid transition needs. Without it
the panel will not clip while closed.

Status: accordion family **implemented** — `_05_shells.sass`.

## 4 - Canonical Page Frames

```html
<!-- plain page: padded content frame -->
<section class="page-shell"> … </section>

<!-- sidebar page: full-bleed split, padding lives in .page-main -->
<section class="page-split">
	<aside class="page-sidebar"></aside>
	<main class="page-main"></main>
</section>
```

Status: **implemented** — `_05_shells.sass`.

## 5 - Canonical Hero

```html
<section class="hero">
	<h1 class="text-3xl"></h1>
	<p class="text-lg text-muted"></p>
</section>
```

Status: **implemented** — `_05_shells.sass` (documented sugar: `.box.ycenter` + `gap-lg` + `pad-y-xl`).
