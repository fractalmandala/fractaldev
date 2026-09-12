---
id: 13-cookbook
title: The Zero-SASS Cookbook & Recipe Gallery
type: design
tags: [cookbook, recipes, examples, patterns, components, zero-sass]
summary: Practical, copy-pasteable UI component recipes demonstrating how to build complex real-world interfaces using 100% pure Fractalstyler2 classes with ZERO custom SASS.
updated: 2026-08-30
---

99% of modern web and desktop interface patterns can be composed directly in HTML using Fractalstyler2's existing tokens, containers, layouts, and interaction classes.

## 1. Navigation & Workspace Controls

### Segmented Control (Mode Switcher)
```html
<div class="row ycenter shrink-0 pad-2 raised border radius-sm">
  <button class="button ghost text-xs active">View</button>
  <button class="button ghost text-xs">Split</button>
  <button class="button ghost text-xs">Edit</button>
</div>
```

### Scrollable Tab Strip with Close Triggers
```html
<div class="tab-list reel border-bottom">
  <div class="row ycenter gap-2xs pad-x-sm pad-y-2xs surface border-bottom tab-trigger active">
    <span class="text-xs weight-500">Document.md</span>
    <button class="button is-icon text-muted text-xs" aria-label="Close tab">✕</button>
  </div>
  <div class="row ycenter gap-2xs pad-x-sm pad-y-2xs tab-trigger">
    <span class="text-xs text-secondary">Notes.md</span>
    <button class="button is-icon text-muted text-xs" aria-label="Close tab">✕</button>
  </div>
</div>
```

### Search Input Bar with Icon & Reset Button
```html
<div class="row ycenter gap-xs pad-x-xs pad-y-3xs surface border radius-sm grow min0">
  <span class="text-muted text-xs">🔍</span>
  <input class="input grow min0 text-sm" type="search" placeholder="Search entries..." />
  <kbd class="kbd text-xs">⌘K</kbd>
</div>
```

### Breadcrumbs Navigation Bar
```html
<nav class="row ycenter gap-2xs text-xs" aria-label="Breadcrumb">
  <a href="/projects" class="link-plain text-secondary">Projects</a>
  <span class="text-muted">/</span>
  <a href="/projects/fracta" class="link-plain text-secondary">Fracta</a>
  <span class="text-muted">/</span>
  <span class="text-primary weight-500">Overview</span>
</nav>
```

---

## 2. Telemetry, Analytics & Metrics

### Metric / KPI Tile
```html
<div class="card box ycenter xcenter gap-3xs pad-sm surface border">
  <span class="text-2xl weight-700 text-primary">1,429</span>
  <span class="text-xs text-muted tt-u weight-500">Active Sessions</span>
</div>
```

### 4-Column Responsive Metrics Grid
```html
<div class="grid-4 gap-sm">
  <div class="card box ycenter xcenter gap-3xs pad-sm surface border">
    <span class="text-xl weight-600 text-primary">99.98%</span>
    <span class="text-xs text-muted">Availability</span>
  </div>
  <div class="card box ycenter xcenter gap-3xs pad-sm surface border">
    <span class="text-xl weight-600 text-success">14ms</span>
    <span class="text-xs text-muted">Avg Latency</span>
  </div>
  <div class="card box ycenter xcenter gap-3xs pad-sm surface border">
    <span class="text-xl weight-600 text-primary">8.4 GB</span>
    <span class="text-xs text-muted">Memory Usage</span>
  </div>
  <div class="card box ycenter xcenter gap-3xs pad-sm surface border">
    <span class="text-xl weight-600 text-theme">v2.4.0</span>
    <span class="text-xs text-muted">Build Target</span>
  </div>
</div>
```

### Activity Feed / Timeline Row
```html
<div class="row ycenter gap-sm pad-xs border-bottom">
  <div class="square-24 center raised radius-full text-xs text-muted">●</div>
  <div class="box grow min0 gap-3xs">
    <span class="text-sm weight-500 text-primary truncate">Merged pull request #142</span>
    <span class="text-xs text-muted">2 hours ago by @amrit</span>
  </div>
  <span class="badge text-success text-xs">Merged</span>
</div>
```

---

## 3. Cards, Lists & Compositions

### User Profile Row with Avatar & Actions
```html
<div class="row ycenter xbetween gap-sm pad-sm surface border radius-md">
  <div class="row ycenter gap-sm min0">
    <div class="avatar shrink-0">
      <img src="/user.jpg" alt="Profile" />
    </div>
    <div class="box min0 gap-3xs">
      <span class="text-sm weight-600 text-primary truncate">Alex Vance</span>
      <span class="text-xs text-muted truncate">alex@fractalmandala.org</span>
    </div>
  </div>
  <div class="row ycenter gap-2xs shrink-0">
    <button class="button ghost text-xs">Message</button>
    <button class="button is-icon text-muted">⋯</button>
  </div>
</div>
```

### Settings Row with Toggle Switch
```html
<div class="row ycenter xbetween gap-md pad-y-sm border-bottom">
  <div class="box gap-3xs">
    <span class="text-sm weight-500 text-primary">Enable Telemetry</span>
    <span class="text-xs text-muted">Collect anonymized performance traces.</span>
  </div>
  <button type="button" role="switch" aria-checked="true" class="switch-track checked shrink-0">
    <span class="switch-thumb"></span>
  </button>
</div>
```

---

## 4. Modals, Dialogs & Overlays

### Standard Action Dialog with Header & Footer
```html
<dialog class="dialog pad-0 surface border radius-md">
  <!-- Header Bar -->
  <header class="row ycenter xbetween pad-x-md pad-y-sm border-bottom">
    <h3 class="text-sm weight-600 marg-0">Confirm Deletion</h3>
    <button class="button is-icon text-muted text-xs" aria-label="Close">✕</button>
  </header>

  <!-- Body Content -->
  <div class="box gap-sm pad-md">
    <p class="text-sm text-secondary marg-0">
      Are you sure you want to delete this workspace? This action cannot be undone.
    </p>
  </div>

  <!-- Footer Actions -->
  <footer class="row ycenter xright gap-xs pad-x-md pad-y-sm border-top raised">
    <button class="button ghost text-xs">Cancel</button>
    <button class="button primary text-xs">Delete Workspace</button>
  </footer>
</dialog>
```

### Dropdown Action Menu
```html
<div class="relative">
  <button class="button ghost">Actions ▾</button>

  <div class="popover open box gap-3xs pad-3xs surface border shadow-md radius-sm">
    <button class="button ghost text-xs wfull xleft">Duplicate Document</button>
    <button class="button ghost text-xs wfull xleft">Export as PDF</button>
    <hr class="divider marg-0" />
    <button class="button ghost text-xs wfull xleft text-danger">Delete</button>
  </div>
</div>
```

---

## 5. Status Indicators & Badges

### Status Indicator Badge
```html
<!-- Success status -->
<span class="row ycenter gap-3xs pad-x-2xs pad-y-3xs raised border radius-sm text-xs">
  <span class="square-6 radius-full bg-success"></span>
  <span class="text-success weight-500">Operational</span>
</span>

<!-- Error status -->
<span class="row ycenter gap-3xs pad-x-2xs pad-y-3xs raised border radius-sm text-xs">
  <span class="square-6 radius-full bg-danger"></span>
  <span class="text-danger weight-500">Degraded</span>
</span>
```

### Sticky Footer Status Bar
```html
<footer class="app-footer row ycenter xbetween pad-x-sm text-xs text-muted border-top surface">
  <div class="row ycenter gap-xs">
    <span class="square-6 radius-full bg-success"></span>
    <span>Connected to local daemon</span>
  </div>
  <div class="row ycenter gap-sm">
    <span>Ln 42, Col 18</span>
    <span>UTF-8</span>
  </div>
</footer>
```

---

## Summary Checklist Before Writing Custom SASS

When about to create a new class in `_08_own.sass`:
- [ ] **Can it be composed with `.box` or `.row`?**
- [ ] **Can `.gap-*` and `.pad-*` provide all necessary breathing room?**
- [ ] **Can `.surface`, `.raised`, or `.panel` provide the background?**
- [ ] **Can `.border` or `.border-bottom` provide the dividing line?**
- [ ] **Can `.button`, `.badge`, `.input`, or `.select` handle the interactive state?**

If the answer to all of the above is **YES**, compose it in markup. Keep your codebase clean and your stylesheets small!

