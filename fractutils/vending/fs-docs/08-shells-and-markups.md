---
id: 08-shells-and-markups
title: Shells & Canonical Markups
type: design
tags: [shells, canonical-markups, app-shell, navtree, toc, overlays, l4]
summary: Reference guide for Level 4 shell fractals, canonical application markup structures, role-bound sidebars, mobile disclosure physics, and interactive overlays.
updated: 2026-08-30
---

Level 4 (L4) fractals provide complete page and application scaffolding. In Fractalstyler2, an L4 class without a canonical markup is considered an incomplete definition: every shell class is paired with an authored, semantic HTML markup structure.

## 1. The Canonical App Shell

The canonical application shell establishes the viewport frame, sticky chrome, and responsive sidebar columns:

```html
<div class="app-shell">
  <!-- Sticky Header Bar -->
  <header class="app-header row ycenter xbetween">
    <button class="button is-icon" aria-label="Toggle Navigation">☰</button>
    <span class="text-sm weight-600">Application Title</span>
    <nav class="row ycenter gap-2xs">
      <button class="button ghost text-xs">Profile</button>
    </nav>
  </header>

  <!-- Fluid Main Row -->
  <main class="app-main">
    <aside class="sidebar-left">
      <!-- Left Navigation Rail -->
    </aside>

    <section class="main-section">
      <article class="content-shell">
        <!-- Center Viewport Content -->
      </article>
    </section>

    <aside class="sidebar-right">
      <!-- Right Table of Contents Rail -->
    </aside>
  </main>

  <!-- Fixed Bottom Footer -->
  <footer class="app-footer row ycenter xbetween text-xs text-muted">
    <span>© 2026 Fractalstyler2</span>
    <span>v2.0.0</span>
  </footer>
</div>
```

| Shell Element | CSS Class | Responsibility & Behavior |
|:---|:---|:---|
| Shell Root | `.app-shell` | Flex column; min-height 100vh; publishes `--header-height`. |
| Top Header | `.app-header` | Sticky top (`z-index: var(--z-sticky)`); glass blur backdrop; height `var(--header-height)`. |
| Workspace Row | `.app-main` | Horizontal row hosting sidebars and main section; `min-height: calc(100vh - var(--header-height) - var(--footer-height))`. |
| Left Rail (Nav) | `.sidebar-left` | Sticky column; width `var(--sidebar-width)`. Visible $\ge 1024\text{px}$ (`lg`). Below $1024\text{px}$, toggling `.open` on `.app-shell` renders it as an off-canvas drawer. |
| Right Rail (TOC) | `.sidebar-right` | Sticky column; width `var(--toc-width)`. Visible $\ge 1280\text{px}$ (`xl`). Below $1280\text{px}$, retracts to `.mobile-toc`. |
| Center Workspace | `.main-section` | `min-width: 0`; flex grow; contains page content and mobile disclosures. |
| Bounded Column | `.content-shell` | Max-width `var(--measure)` centered reading column inside `.main-section`. |
| Bottom Footer | `.app-footer` | Full-width bottom bar; height `var(--footer-height)`. |

---

## 2. Canonical Docs & Navigation (Role-Bound Rails)

Docs layouts are role-bound to `.sidebar-left` and `.sidebar-right`:

```html
<div class="app-shell">
  <header class="app-header">
    <button class="button is-icon" aria-expanded="false" aria-label="Menu">☰</button>
  </header>

  <main class="app-main">
    <!-- Left Navigation Tree -->
    <aside class="sidebar-left">
      <nav class="navtree">
        <span class="navtree-title">Documentation</span>
        <div class="box gap-3xs">
          <a class="navtree-link active" href="/docs/01-introduction">Introduction</a>
          <a class="navtree-link" href="/docs/02-getting-started">Getting Started</a>
          
          <div class="navtree-sub">
            <a class="navtree-link" href="/docs/04-tokens">Tokens</a>
            <a class="navtree-link" href="/docs/05-dimensions">Dimensions</a>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Center Content with Mobile Disclosure -->
    <section class="main-section">
      <details class="mobile-toc">
        <summary>On this page</summary>
        <ul class="toc-list pad-top-2xs">
          <li><a class="toc-link" href="#core">Core Concepts</a></li>
          <li><a class="toc-link" href="#usage">Usage Examples</a></li>
        </ul>
      </details>

      <article class="content-shell">
        <h1>Documentation Title</h1>
        <p>Document content...</p>
      </article>
    </section>

    <!-- Right Table of Contents -->
    <aside class="sidebar-right">
      <nav class="toc">
        <span class="toc-title">On this page</span>
        <ul class="toc-list">
          <li><a class="toc-link active" href="#core">Core Concepts</a></li>
          <li><a class="toc-link" href="#usage">Usage Examples</a></li>
        </ul>
        <div class="toc-footer">
          <a href="#top" class="link text-xs">Back to top ↑</a>
        </div>
      </nav>
    </aside>
  </main>
</div>
```

---

## 3. Canonical Page Frames

When an application page does not require three columns, choose between standard page shells and full-bleed splits:

### Standard Padded Page (`.page-shell`)
```html
<main class="page-shell">
  <div class="box gap-md">
    <h1>Page Heading</h1>
    <p>Padded container utilizing --page-gutter.</p>
  </div>
</main>
```

### Full-Bleed Master-Detail Split (`.page-split`)
```html
<section class="page-split wfull">
  <aside class="page-sidebar border-right">
    <!-- Explorer / File Tree -->
  </aside>
  <main class="page-main">
    <!-- Active Document Workspace -->
  </main>
</section>
```

- Mobile ($<768\text{px}$): Single column, `.page-sidebar` hidden.
- Desktop ($\ge 768\text{px}$): 2-column grid (`var(--sidebar-width) minmax(0, 1fr)`).

---

## 4. Canonical Overlays & Disclosures

Fractalstyler2 includes native classes for drawers, modals, popovers, and accordions:

### Off-Canvas Drawer (`.drawer`)
```html
<div class="drawer" class:open={isDrawerOpen}>
  <div class="box gap-sm">
    <span class="text-sm weight-600">Drawer Menu</span>
  </div>
</div>
```

### Centered Modal Dialog (`.dialog`)
```html
<dialog class="dialog" open={isDialogOpen}>
  <div class="box gap-md pad-md">
    <h3 class="text-md weight-600 marg-0">Confirm Action</h3>
    <p class="text-sm text-secondary">Are you sure you want to proceed?</p>
    <div class="row ycenter xright gap-2xs">
      <button class="button ghost">Cancel</button>
      <button class="button primary">Confirm</button>
    </div>
  </div>
</dialog>
```

### Dropdown Popover (`.popover`)
```html
<div class="relative">
  <button class="button">Options ▾</button>
  <div class="popover" class:open={isMenuOpen}>
    <div class="box pad-2xs gap-3xs">
      <button class="button ghost row text-xs wfull xleft">Duplicate</button>
      <button class="button ghost row text-xs wfull xleft text-danger">Delete</button>
    </div>
  </div>
</div>
```

### Collapsible Accordion (`.accordion`)
```html
<div class="accordion">
  <div class="accordion-item" class:open={itemIsOpen}>
    <button class="accordion-trigger" aria-expanded={itemIsOpen}>
      <span>Section Header</span>
      <span class="text-xs">▾</span>
    </button>
    <div class="accordion-content">
      <div class="accordion-panel box pad-xs">
        <p class="text-sm text-secondary">Collapsible content goes here.</p>
      </div>
    </div>
  </div>
</div>
```

---

## 5. Canonical Hero (`.hero`)

The `.hero` class is documented sugar for a centered, spacious landing section (`.box.ycenter` + `gap-lg` + `pad-y-xl`):

```html
<section class="hero">
  <span class="badge">Announcing v2.0</span>
  <h1 class="text-4xl weight-700">Design System for Modern Software</h1>
  <p class="text-lg text-secondary prose">
    Compose responsive, token-verified desktop and web interfaces using modular fractals.
  </p>
  <div class="row ycenter gap-xs">
    <button class="button primary">Get Started</button>
    <button class="button ghost">View on GitHub</button>
  </div>
</section>
```

[Next - Visuals, Interactions](./09-visuals-and-interactions.md)
