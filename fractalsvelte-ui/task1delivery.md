# Task 1 Delivery — Svelto UI Reference Benchmark (currList1)

**Task:** Create reference benchmark lists and specs from sveltoui.dev for components fractalcodex already has.
**Date:** 2026-08-28
**Source site:** https://sveltoui.dev (Svelto UI — "UI elements you can copy into your project")
**Our library:** fractalcodex (Fractalsvelte UI / `fractalsvelte` — SvelteKit component library, Svelte 5 + Sass)

**Method:**
1. `https://sveltoui.dev/elements` was fetched and its left sidebar nav enumerated (81 categories).
2. The list was intersected with fractalcodex's component inventory (`src/lib/components/index.ts`, `src/lib/docs/catalogue.ts`, component `.svelte` files) → **currList1** (17 matches).
3. Each currList1 category page was visited in a live browser. Demo counts were verified against page headers, every preview box inspected, code boxes read (verbatim where ≤ 25 lines, summarized otherwise), and every API-reference prop table captured.

**Site facts relevant to all specs below:**
- Every category page = one long page: header (title, count, tagline, "USE WITH CLAUDE" MCP banner: `claude mcp add -t http -s user sveltoui https://sveltoui.dev/api/mcp/sse`), a category filter box, then N demo cards, then an "API reference" section ("Generated from each primitive's `$props()` declaration.").
- Each demo card: `<h3>` name (e.g. "General Button 01"), size badge (SMALL/MEDIUM/LARGE), one-line description, and Preview/Code tabs. Preview = sandboxed iframe (`.../preview/component?section=elements&category=<cat>&file=<File>.svelte&theme=dark` — previews default to **dark**) with toolbar: Mobile 375px / Tablet 768px / Full width, Toggle preview theme, Reload, Open in new tab, **Copy for AI**, Copy, resize slider (320–533px).
- Code tab = filename + **INSTALL** line `npx shadcn-svelte@latest add https://sveltoui.dev/r/elements-<category>-<File>.json` + full Svelte 5 source (shiki-highlighted, `github-dark`).
- Two parallel offerings: a thin primitive registry (the API reference) and copy-paste Tailwind snippets (the demos). Most demos hand-roll ARIA patterns with Tailwind semantic tokens instead of consuming the primitives.

---

## Task 1.1 — Svelto UI Elements sidebar nav (complete list, 81 categories)

| # | Category | Path | Demos |
|---|----------|------|-------|
| 1 | Accordion | /elements/accordion | 20 |
| 2 | Alert | /elements/alert | 7 |
| 3 | Aspect Ratio | /elements/aspect-ratio | 3 |
| 4 | Badge | /elements/badge | 9 |
| 5 | Banners | /elements/banners | 12 |
| 6 | Blockquote | /elements/blockquote | 5 |
| 7 | Breadcrumb | /elements/breadcrumb | 8 |
| 8 | Button | /elements/button | 50 |
| 9 | Button Group | /elements/button-group | 6 |
| 10 | Calendar | /elements/calendar | 28 |
| 11 | Card | /elements/card | 2 |
| 12 | Chat Bubble | /elements/chat-bubble | 1 |
| 13 | Checkbox | /elements/checkbox | 20 |
| 14 | Chip | /elements/chip | 5 |
| 15 | Code | /elements/code | 5 |
| 16 | Collapsible | /elements/collapsible | 6 |
| 17 | Color Picker | /elements/color-picker | 5 |
| 18 | Combobox | /elements/combobox | 3 |
| 19 | Command | /elements/command | 6 |
| 20 | Confetti | /elements/confetti | 3 |
| 21 | Context Menu | /elements/context-menu | 4 |
| 22 | Cookie Consent | /elements/cookie-consent | 3 |
| 23 | Copy Button | /elements/copy-button | 2 |
| 24 | Countdown | /elements/countdown | 3 |
| 25 | Cropper | /elements/cropper | 11 |
| 26 | Data Table | /elements/data-table | 4 |
| 27 | Date Picker | /elements/date-picker | 3 |
| 28 | Dialog | /elements/dialog | 21 |
| 29 | Divider | /elements/divider | 5 |
| 30 | Dock | /elements/dock | 2 |
| 31 | Drawer | /elements/drawer | 6 |
| 32 | Dropdown | /elements/dropdown | 15 |
| 33 | Empty | /elements/empty | 6 |
| 34 | Fab | /elements/fab | 3 |
| 35 | Field | /elements/field | 6 |
| 36 | Fileupload | /elements/fileupload | 14 |
| 37 | Form | /elements/form | 6 |
| 38 | Hover Card | /elements/hover-card | 5 |
| 39 | Hover Effects | /elements/hover-effects | 3 |
| 40 | Indicator | /elements/indicator | 2 |
| 41 | Input | /elements/input | 57 |
| 42 | Input Group | /elements/input-group | 4 |
| 43 | Item | /elements/item | 2 |
| 44 | Kbd | /elements/kbd | 2 |
| 45 | Label | /elements/label | 2 |
| 46 | Link | /elements/link | 5 |
| 47 | List | /elements/list | 5 |
| 48 | Logos | /elements/logos | 3 |
| 49 | Menubar | /elements/menubar | 1 |
| 50 | Mockup | /elements/mockup | 3 |
| 51 | Native Select | /elements/native-select | 2 |
| 52 | Navbar | /elements/navbar | 19 |
| 53 | Notification | /elements/notification | 22 |
| 54 | Pagination | /elements/pagination | 12 |
| 55 | Popover | /elements/popover | 9 |
| 56 | Radio | /elements/radio | 19 |
| 57 | Radio Group | /elements/radio-group | 2 |
| 58 | Range Calendar | /elements/range-calendar | 1 |
| 59 | Rating | /elements/rating | 5 |
| 60 | Resizable | /elements/resizable | 2 |
| 61 | Scroll Area | /elements/scroll-area | 1 |
| 62 | Search Input | /elements/search-input | 5 |
| 63 | Select | /elements/select | 51 |
| 64 | Separator | /elements/separator | 1 |
| 65 | Sheet | /elements/sheet | 2 |
| 66 | Skeleton | /elements/skeleton | 2 |
| 67 | Slider | /elements/slider | 27 |
| 68 | Spinners | /elements/spinners | 3 |
| 69 | Stack | /elements/stack | 2 |
| 70 | Stat | /elements/stat | 5 |
| 71 | Stepper | /elements/stepper | 17 |
| 72 | Switch | /elements/switch | 15 |
| 73 | Table | /elements/table | 20 |
| 74 | Tabs | /elements/tabs | 20 |
| 75 | Textarea | /elements/textarea | 19 |
| 76 | Time Picker | /elements/time-picker | 5 |
| 77 | Timeline | /elements/timeline | 12 |
| 78 | Toggle | /elements/toggle | 3 |
| 79 | Toggle Group | /elements/toggle-group | 2 |
| 80 | Tooltip | /elements/tooltip | 12 |
| 81 | Tree | /elements/tree | 15 |

---

## currList1 — categories where fractalcodex has a component (17)

Our inventory: `src/lib/components/index.ts` (public exports) + `src/lib/docs/catalogue.ts` (documented catalogue incl. Tooltip, Toast, Progress, MacosDock, SvelteBits patterns) + 79 component `.svelte` files.

| # | Svelto category | Demos | Our component | Our file / catalogue slug | Match |
|---|-----------------|-------|---------------|---------------------------|-------|
| 1 | Accordion | 20 | `Accordion` | `Accordion.svelte` / `accordion` | Exact name |
| 2 | Alert | 7 | `Alert` | `Alert.svelte` / `alert` | Exact name |
| 3 | Badge | 9 | `Badge` | `Badge.svelte` / `badge` | Exact name |
| 4 | Button | 50 | `Button` | `Button.svelte` / `button` | Exact name |
| 5 | Card | 2 | `Card` | `Card.svelte` / `card` | Exact name |
| 6 | Checkbox | 20 | `Checkbox` | `Checkbox.svelte` / `checkbox` | Exact name |
| 7 | Dialog | 21 | `Dialog` | `Dialog.svelte` / `dialog` | Exact name |
| 8 | Dock | 2 | `MacosDock` (+ SvelteBits `Dock` pattern page) | `MacosDock.svelte` / `macos-dock`, `dock` | Concept match |
| 9 | Input | 57 | `Input` | `Input.svelte` / `input` | Exact name |
| 10 | Select | 51 | `Select` | `Select.svelte` / `select` | Exact name |
| 11 | Separator | 1 | `Separator` | `Separator.svelte` / `separator` | Exact name |
| 12 | Skeleton | 2 | `Skeleton` | `Skeleton.svelte` / `skeleton` | Exact name |
| 13 | Stepper | 17 | `Stepper` | `Stepper.svelte` / `stepper` | Exact name |
| 14 | Switch | 15 | `Switch` | `Switch.svelte` / `switch` | Exact name |
| 15 | Tabs | 20 | `Tabs` | `Tabs.svelte` / `tabs` | Exact name |
| 16 | Textarea | 19 | `Textarea` | `Textarea.svelte` / `textarea` | Exact name |
| 17 | Tooltip | 12 | `Tooltip` | `Tooltip.svelte` / `tooltip` | Exact name |

**Near-match categories deliberately NOT in currList1** (name differs; noted for completeness, not specced): Chip ≈ Badge, Divider ≈ Separator, Toggle ≈ Switch, Timeline ≈ Stepper, Notification ≈ Toast, Collapsible ≈ Accordion, Stack ≈ CardStack/SvelteBits `Stack`, Spinners ≈ (no dedicated spinner component). Our `Avatar`, `Progress`, `Toast`, `Carousel`, `Counter`, `Marquee`, `MotionList`, `Presence`, `Reveal`, `Theme`, etc. have **no** sidebar category on sveltoui.dev (sveltoui has no Progress/Avatar/Toast category at all), so they are outside this benchmark.

---

# Task 1.2 + 1.3 — Per-item page specs

Sections are named `currList1_<Name>_specs` in sidebar order.

---

## currList1_Accordion_specs

**URL:** https://sveltoui.dev/elements/accordion · **Header:** "Accordion — 20 components" · count verified (20/20 demos rendered).

### Page header
Title `Accordion`, count badge `20 components`, tagline "UI elements you can copy into your project.", Back to Elements link, "USE WITH CLAUDE" MCP banner + Setup guide link, filter searchbox. FAQ copy on the page teaches `npx sveltoui add accordion` ("The CLI copies the source into src/lib/components/ui, so you own the code"; requires Svelte 5 / SvelteKit 2 / Tailwind v4.1+).

### Demos (20 preview boxes; all have Preview + Code boxes)
Shared demo recipe: self-contained `.svelte` files, Svelte 5 `$state`, single-open behavior, `aria-expanded`/`aria-controls`, focus-visible rings, `hover:bg-muted/50` rows, 200ms `panel-in` animation (opacity + translateY) disabled under `prefers-reduced-motion`. Families: single-card (01–10) → separated-card (11–14) → table-style (15–18) → multi-level (19–20). All MEDIUM except 19–20 LARGE.

| # | Demo | Preview shows | Code box |
|---|------|---------------|----------|
| 1 | General Accordion 01 | FAQ card, 3 rows, right chevron rotating 180°, first item open with muted answer | ~75 ln: `ChevronDown` import; `divide-y` card; per-item `h3`>button; `div[role=region]` panel; scoped `panel-in` keyframes + reduced-motion guard |
| 2 | General Accordion 02 | Same, but indicator toggles Plus ⇄ Minus | ~76 ln: `Plus`/`Minus` icon swap |
| 3 | General Accordion 03 | Leading chevron rotating 90° on open; answer indented `pl-11` | ~75 ln: `ChevronRight` |
| 4 | General Accordion 04 | Leading plus/minus toggle | ~77 ln |
| 5 | General Accordion 05 | 4 questions with leading topic icons (Terminal/Code/Palette/Scale) + right chevron | ~86 ln: icon component refs rendered per item |
| 6 | General Accordion 06 | Topic icons + right plus/minus toggle | ~89 ln |
| 7 | General Accordion 07 | Two-line rows: title over muted xs sub-header ("Setup and CLI"…) | ~75 ln: `subtitle` stacked spans |
| 8 | General Accordion 08 | Sub-header rows + plus/minus toggle | ~78 ln |
| 9 | General Accordion 09 | Boxed icon (`rounded-md bg-muted p-2`) + sub-header + chevron; answer `pl-15` | ~84 ln |
| 10 | General Accordion 10 | Boxed icon + sub-header + plus/minus | ~87 ln |
| 11 | General Accordion 11 | Separated cards (`space-y-2`), open trigger tinted `bg-muted/40`, panel top border | ~77 ln: per-item card shell |
| 12 | General Accordion 12 | Separated cards + plus/minus | ~80 ln |
| 13 | General Accordion 13 | Separated cards + leading rotating chevron | ~77 ln |
| 14 | General Accordion 14 | Separated cards + leading plus/minus | ~80 ln |
| 15 | General Accordion 15 | Table-style: `<table>` rows with secondary Badges ("Popular", "Updated") + right chevron | ~84 ln: imports `Badge` (registry dep `./ui-badge.json`); `tbody.divide-y` |
| 16 | General Accordion 16 | Table-style + plus/minus toggle | ~87 ln |
| 17 | General Accordion 17 | Table-style, left chevron, trailing `ml-auto` badges ("Popular"/"New") | ~63 ln |
| 18 | General Accordion 18 | Table-style + left plus/minus | ~66 ln |
| 19 | General Accordion 19 (LARGE) | Multi-level: 3 parent sections with muted child-counts; children in tinted list; grandchild open | ~128 ln: two `$state`s (openParent/openChild), nested `h4` triggers |
| 20 | General Accordion 20 (LARGE) | Multi-level with file-tree icons (Folder⇄FolderOpen parents, FileText children, .md names) | ~152 ln: `{@const ParentIcon = …}` icon swap |

### API reference (verbatim)

**Accordion.Root** — "Expandable/collapsible content sections."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `value` (bind:) | — | — |
| `...restProps` | `Record<string, unknown>` | — |

**Accordion.Content** — ref (bind:), `class` (as className), `children` (Snippet), `...restProps`.
**Accordion.Item** — ref (bind:), `class`, `...restProps`.
**Accordion.Trigger** — ref (bind:), `class`, `level` (number, default `3`), `children` (Snippet), `...restProps`.

### Patterns
Semantic tokens only (`bg-card`, `divide-border`, `bg-muted`, `ring-ring`); OKLCH tokens + single `.dark` class; 150–200ms ease-out; a11y (real `<button>` in `h3`, `role="region"`, `aria-labelledby`); cross-component composition via registry deps (`$UI$/badge`, `$UI$/button` in demos 15–20).

---

## currList1_Alert_specs

**URL:** https://sveltoui.dev/elements/alert · **Header:** "Alert — 7 components" · count verified (7/7).

### Page header
Same header kit as all category pages (title, count, tagline, MCP banner, filter).

### Demos (7 preview boxes; all have Preview + Code boxes)

**1) Alert Glasmorphism 01** — SMALL — "Frosted glass alert with blurred translucent surface."
Visual: dark gradient stage; frosted panel (`backdrop-blur-xl`, `border-white/20`, blue gradient fill, rounded-2xl) with blue `CircleAlert`, bold white "Scheduled maintenance" + white/80 body; `role="status"`.
```svelte
<script>
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
</script>

<div class="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8">
	<div
		role="status"
		class="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-500/20 to-primary/20 p-6 shadow-xl backdrop-blur-xl"
	>
		<div class="flex items-start gap-4">
			<div class="shrink-0">
				<CircleAlert aria-hidden="true" class="h-6 w-6 text-blue-300" />
			</div>
			<div class="space-y-1">
				<h3 class="font-semibold text-white">Scheduled maintenance</h3>
				<p class="text-sm text-white/80">
					The API will be read-only on Sunday, March 16 from 02:00–04:00 UTC while we migrate the
					primary database.
				</p>
			</div>
		</div>
	</div>
</div>
```

**2) General Alert 01** — SMALL — "Simple warning alert"
Visual: amber banner (`border-amber-500/50 bg-amber-50 text-amber-800`; dark: `bg-amber-500/10`), `CircleAlert`, "Trial ends in 3 days"; `role="alert"`.
```svelte
<script>
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
</script>

<!-- Simple warning alert -->
<div class="mx-auto w-full max-w-md">
  <div class="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500" role="alert">
    <CircleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div class="space-y-1">
      <h3 class="text-sm font-medium leading-none">Trial ends in 3 days</h3>
      <p class="text-sm text-amber-700 dark:text-amber-400">
        Upgrade before March 14 to keep unlimited projects and team seats.
      </p>
    </div>
  </div>
</div>
```

**3) General Alert 05** — SMALL — "Warning alert with link"
Visual: same amber banner + right-aligned "Upgrade →" link with amber focus ring.
```svelte
<script>
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
</script>

<!-- Warning alert with link -->
<div class="mx-auto w-full max-w-md">
  <div class="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500" role="alert">
    <CircleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div class="flex-1 space-y-1">
      <h3 class="text-sm font-medium leading-none">Trial ends in 3 days</h3>
      <p class="text-sm text-amber-700 dark:text-amber-400">
        Upgrade before March 14 to keep unlimited projects and team seats.
      </p>
    </div>
    <a
      href="#!"
      class="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium transition-colors duration-150 ease-out hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 dark:focus-visible:ring-offset-transparent"
    >
      Upgrade
      <ArrowRight class="h-4 w-4" aria-hidden="true" />
    </a>
  </div>
</div>
```

**4) General Alert 09** — MEDIUM — "Dismissible warning alert with undo"
Visual: amber banner with X dismiss (sr-only "Dismiss alert"); after dismissal a dashed-border "Alert dismissed." card with Undo button restores it.
Code (~45 ln summarized): imports `X`, `CircleAlert`; `let visible = $state(true)`; `{#if visible}` banner with dismiss `{:else}` undo row.

**5) General Alert 10** — MEDIUM — "Alert with action buttons"
Visual: amber banner "Unsaved changes" with two buttons below (`pl-8`): solid amber "Save changes" + ghost "Discard".
Code (~42 ln summarized): header row then `mt-4 flex gap-2 pl-8` button row.

**6) General Alert 11** — SMALL — "Compact success alert"
Visual: one-line green pill-banner with `CircleCheck` + "Billing details updated for Acme Inc."; `role="status"`.
```svelte
<script>
  import CircleCheck from "@lucide/svelte/icons/circle-check";
</script>

<!-- Compact success alert -->
<div class="mx-auto w-full max-w-md">
  <div class="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-500" role="status">
    <CircleCheck class="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>Billing details updated for Acme Inc.</span>
  </div>
</div>
```

**7) General Alert 12** — SMALL — "Destructive alert listing multiple validation errors."
Visual: red banner "There were 3 errors with your submission" + bulleted list of 3 password errors; `role="alert"`.
```svelte
<script>
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
</script>

<!-- Alert with list -->
<div class="mx-auto w-full max-w-md">
  <div class="rounded-lg border border-red-500/50 bg-red-50 p-4 text-red-800 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-500" role="alert">
    <div class="flex items-start gap-3">
      <CircleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <h3 class="text-sm font-medium leading-none">There were 3 errors with your submission</h3>
        <ul class="mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-400">
          <li>Your password must be at least 8 characters</li>
          <li>Your password must include at least one number</li>
          <li>Your password must include at least one special character</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

### API reference (verbatim)

**Alert.Root** — "Notification message for important information."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `class` (as className) | `string` | — |
| `variant` | `"default" \| "destructive"` | `"default"` |
| `children` | `Snippet` | — |
| `...restProps` | `Record<string, unknown>` | — |

**Alert.Description** — ref (bind:), `class`, `children` (Snippet), `...restProps`.
**Alert.Title** — same table as Description.

### Patterns
Severity tint pairs (`border-X-500/50 bg-X-50 text-X-800` + `dark:bg-X-500/10 dark:text-X-500`) for amber/green/red; `role="alert"` for warnings/errors vs `role="status"` for success; dismiss via single `$state`; icon + h3 + p composition.

---

## currList1_Badge_specs

**URL:** https://sveltoui.dev/elements/badge · **Header:** "Badge — 9 components" · count verified (9/9).

### Demos (9 preview boxes; all have Preview + Code boxes)

**1) General Badge 01** — SMALL — "Small status indicator or label."
Visual: solid-primary rounded-md badge "Beta".
```svelte
<!-- Simple badge -->
<div class="flex items-center justify-center p-8">
  <span
    class="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
  >
    Beta
  </span>
</div>
```

**2) General Badge 05** — SMALL — "Status badges with colored dots for active, pending and inactive states."
Visual: three `rounded-full` tinted badges (green "Active", amber "Pending", red "Inactive") each with colored dot; `role="group" aria-label="Deployment status"`.
```svelte
<!-- Status badges -->
<div class="flex flex-wrap items-center justify-center gap-2 p-8" role="group" aria-label="Deployment status">
  <span class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
    <span class="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
    Active
  </span>
  <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
    <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
    Pending
  </span>
  <span class="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400">
    <span class="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
    Inactive
  </span>
</div>
```

**3) General Badge 07** — SMALL — "Removable filter badges with a dismiss button and empty state."
Visual: three solid-primary badges ("Design systems", "Svelte 5", "Tailwind v4") each with X dismiss; when empty shows "No filters applied" + "Reset filters" button that restores.
Code (~37 ln summarized): imports `X`; `filters = $state([...])`, remove fn, `{:else}` empty-state row.

**4) General Badge 08** — SMALL — "Badge with a leading icon."
Visual: amber tinted badge with filled star + "Featured".
```svelte
<script>
  import Star from "@lucide/svelte/icons/star";
</script>

<!-- Badge with icon -->
<div class="flex items-center justify-center p-8">
  <span class="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
    <Star class="h-3 w-3 fill-current" aria-hidden="true" />
    Featured
  </span>
</div>
```

**5) General Badge 09** — SMALL — "Notification count badge anchored to an icon button."
Visual: bordered bell button with absolute red circular counter "99+" at top-right; sr-only "Notifications, 99 or more unread".
```svelte
<script>
  import Bell from "@lucide/svelte/icons/bell";
</script>

<!-- Count badge -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="relative rounded-md border border-border bg-card p-2 text-foreground shadow-sm transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <Bell class="h-5 w-5" aria-hidden="true" />
    <span
      class="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold leading-none text-white"
      aria-hidden="true"
    >
      99+
    </span>
    <span class="sr-only">Notifications, 99 or more unread</span>
  </button>
</div>
```

**6) General Badge 10** — SMALL — "Pulsing dot badge with a live status label."
Visual: bordered pill `role="status"`: green dot with `animate-ping` halo (motion-reduce disabled) + "All systems operational".
```svelte
<!-- Dot badge -->
<div class="flex items-center justify-center p-8">
  <span
    class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm"
    role="status"
  >
    <span class="relative flex h-2 w-2" aria-hidden="true">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none"></span>
      <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
    </span>
    All systems operational
  </span>
</div>
```

**7) General Badge 11** — SMALL — "Joined label and value badge pair, like a build status shield."
Visual: two GitHub-shield pairs "build | passing" (green value) and "coverage | 94%".
```svelte
<!-- Badge group -->
<div class="flex flex-wrap items-center justify-center gap-4 p-8">
  <span class="inline-flex overflow-hidden rounded-md border border-border shadow-sm">
    <span class="bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">build</span>
    <span class="border-l border-border bg-card px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400">passing</span>
  </span>
  <span class="inline-flex overflow-hidden rounded-md border border-border shadow-sm">
    <span class="bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">coverage</span>
    <span class="border-l border-border bg-card px-2 py-1 text-xs font-semibold">94%</span>
  </span>
</div>
```

**8) General Badge 12** — SMALL — "Badge size scale from small to large."
Visual: three primary badges at increasing scale ("Small" 10px / "Default" xs / "Large" sm).
```svelte
<!-- Badge sizes -->
<div class="flex flex-wrap items-center justify-center gap-3 p-8">
  <span class="inline-flex items-center rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-4 text-primary-foreground">
    Small
  </span>
  <span class="inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium leading-4 text-primary-foreground">
    Default
  </span>
  <span class="inline-flex items-center rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium leading-5 text-primary-foreground">
    Large
  </span>
</div>
```

**9) General Badge 13** — SMALL — "Trend badges showing positive and negative percentage change."
Visual: green `TrendingUp` "+12.5%" and red `TrendingDown` "−4.2%" badges (tabular-nums; sr-only context); group `aria-label="Month over month change"`.
```svelte
<script>
  import TrendingUp from "@lucide/svelte/icons/trending-up";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
</script>

<!-- Trend badges -->
<div class="flex flex-wrap items-center justify-center gap-3 p-8" role="group" aria-label="Month over month change">
  <span class="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium tabular-nums text-green-700 dark:bg-green-500/20 dark:text-green-400">
    <TrendingUp class="h-3 w-3" aria-hidden="true" />
    <span class="sr-only">Revenue increased by </span>+12.5%
  </span>
  <span class="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium tabular-nums text-red-700 dark:bg-red-500/20 dark:text-red-400">
    <TrendingDown class="h-3 w-3" aria-hidden="true" />
    <span class="sr-only">Churn decreased by </span>-4.2%
  </span>
</div>
```

### API reference (verbatim)

**badge** — "Small status indicator or label with dark mode support." (single primitive; heading renders lowercase `badge`; `href` turns the badge into a link)

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `href` | — | — |
| `class` (as className) | `string` | — |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` |
| `status` | `boolean` | `false` |
| `children` | `Snippet` | — |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
5/9 demos are static (no script); status tint pairs identical to Alert's recipe; shapes `rounded-md` default vs `rounded-full` pills; count badges absolutely positioned over a parent button.

---

## currList1_Button_specs

**URL:** https://sveltoui.dev/elements/button · **Header:** "Button — 50 components" · count verified (50 demo boxes: files `GeneralButton01`–`GeneralButton54` with gaps at 27, 32, 35, 36; 49 SMALL, 1 MEDIUM #25).

### Page header
Title `Button`, count badge `50 components`, tagline, MCP banner, filter box "Filter button…". Per-demo install method (in each Code panel): `npx shadcn-svelte@latest add https://sveltoui.dev/r/elements-button-<FileName>.json`.

### Demos (50 preview boxes; every demo has Preview + Code boxes)
Uniform interaction recipe across demos: `rounded-md`, `shadow-xs`, `inline-flex items-center justify-center gap-2`, `transition-all duration-200 ease-out`, `hover:bg-*/90 or /80`, `focus-visible:ring-[3px] focus-visible:ring-ring/50`, `active:scale-[0.98]`; disabled via `disabled:pointer-events-none disabled:opacity-50`. Variants exercised: primary (default), secondary, destructive, outline, ghost, link, soft-tinted, pill, icon-only, loading, split/segmented/toggle groups, social, full-width, dashed.

| # | Demo (size) | Preview shows | Code box |
|---|-------------|---------------|----------|
| 01 | General Button 01 (S) | Primary "Get started" — near-white w/ dark text in dark mode; hover/press/focus states | Verbatim below |
| 02 | General Button 02 (S) | Secondary "Save draft" — dark-gray surface | Verbatim below |
| 03 | General Button 03 (S) | Destructive red "Delete workspace" | Verbatim below |
| 04 | General Button 04 (S) | Outline "Export CSV" — transparent w/ border, hover fills accent | Verbatim below |
| 05 | General Button 05 (S) | Ghost "Dismiss" — surface only on hover | Verbatim below |
| 06 | General Button 06 (S) | Link-style "View documentation" — primary text, underline on hover | Verbatim below |
| 07 | General Button 07 (S) | Disabled primary "Publish changes" — 50% opacity | Verbatim below |
| 08 | General Button 08 (S) | Size scale: Small (h-8/text-xs) / Default (h-9/text-sm) / Large (h-11/text-base) with captions | ~40 ln summarized: 3 `<button>`s, size class sets |
| 09 | General Button 09 (S) | Pill `rounded-full` primary "Start free trial" | Verbatim below |
| 10 | General Button 10 (S) | Left Mail icon + "Send invite" (`gap-2`) | Verbatim below |
| 11 | General Button 11 (S) | "Continue to payment" + trailing ArrowRight nudging right on hover (`group-hover:translate-x-0.5`) | Verbatim below |
| 12 | General Button 12 (S) | Square primary icon button (`h-9 w-9`) w/ Archive + `sr-only` name | Verbatim below |
| 13 | General Button 13 (S) | Outline icon button w/ Trash2 | Verbatim below |
| 14 | General Button 14 (S) | "Save changes" → on click: disabled + spinning Loader2 + "Saving changes", `aria-busy`, resets after 2s | ~40 ln: `$state` loading, `$effect` cleanup, min-width |
| 15 | General Button 15 (S) | "Export options" + ChevronDown rotating 180° when open; `aria-haspopup`/`aria-expanded` | ~26 ln: `$state` open |
| 16 | General Button 16 (S) | Copy icon button → green Check for 2s after copying `npx sveltoui@latest add button`; live region | ~40 ln: clipboard try/catch, timer cleanup |
| 17 | General Button 17 (S) | Outline like button: Heart + "1,284" tabular-nums; fills rose-500, count → 1,285; `aria-pressed` | ~28 ln: `Button` from `$lib/components/elements/button`, `$derived` formatted |
| 18 | General Button 18 (S) | Outline icon Star toggle; fills amber-400 + scale-110 | ~29 ln: `Button size="icon"`, `aria-pressed` |
| 19 | General Button 19 (S) | Split button: primary "Create project" + separator + compact chevron menu-trigger in a `ButtonGroup` | ~27 ln: imports `ButtonGroup`, `ButtonGroupSeparator` |
| 20 | General Button 20 (S) | Segmented Day/Week/Month outline group; selected gets `bg-accent`; `aria-pressed` | ~28 ln: `{#each}` + selected state |
| 21 | General Button 21 (S) | ToggleGroup single-select icons AlignLeft/Center/Right, `bind:value` | ~30 ln: imports `ToggleGroup`, `ToggleGroupItem` |
| 22 | General Button 22 (S) | Bordered pill group of 3 ghost icon volume buttons; live "Volume: High" readout | ~43 ln: `role="group"`, `aria-live` |
| 23 | General Button 23 (S) | "Upload file" w/ Upload icon triggering hidden file input; hint swaps to chosen filename | ~34 ln: `fileInput`/`fileName` states |
| 24 | General Button 24 (S) | `<nav>`: outline Previous/Next + "Page 1 of 12"; bounds disabled | ~36 ln: `aria-label="Pagination"`, live page indicator |
| 25 | General Button 25 (M) | Social: full-width outline "Continue with Google" (inline SVG) + primary "Continue with GitHub" + terms note | ~28 ln: two `<Button class="w-full justify-center">` |
| 26 | General Button 26 (S) | Outline icon Bell + red count badge "3" pinned `-right-1.5 -top-1.5` | Verbatim below |
| 28 | General Button 28 (S) | Soft tinted trio: "Publish" (blue), "Approve" (emerald), "Request changes" (amber) at `*/10` bg with `dark:text-*-300` | ~37 ln: 3 plain buttons, tint pattern |
| 29 | General Button 29 (S) | Primary "Generate summary" w/ Sparkles scaling + rotating 12° on hover | Verbatim below |
| 30 | General Button 30 (S) | Full-width primary "Create account" + helper "Free for 14 days…" | Verbatim below |
| 31 | General Button 31 (S) | "Continue to checkout" w/ arrow sliding `translate-x-1` on hover | Verbatim below |
| 33 | General Button 33 (S) | Full-width dashed-outline "Attach a file" w/ Paperclip + hint | Verbatim below |
| 34 | General Button 34 (S) | Mono code chip `npx sveltoui add button` + outline Copy → Check "Copied" 2s; live region | ~37 ln: `onDestroy` cleanup |
| 37 | General Button 37 (S) | Outline Like/Liked toggle: Heart + count 1,284→1,285; red-tinted border when liked | Verbatim below |
| 38 | General Button 38 (S) | Outline icon Bookmark toggle; fills primary when pressed | Verbatim below |
| 39 | General Button 39 (S) | Large primary "Add to cart" w/ ShoppingCart + "$149.00" behind internal divider | Verbatim below |
| 40 | General Button 40 (S) | Quantity stepper: minus/value/plus; bounds disabled (1–10); "Max 10 per order" | ~48 ln: plain buttons, `aria-live` value |
| 41 | General Button 41 (S) | Circular `size-12` Play ⇄ Pause transport + track info "Midnight Signal — Kiasmos · 4:12" | ~33 ln |
| 42 | General Button 42 (S) | 5-star rating radio group (default 4); hover/focus previews 5th; readout label | ~40 ln: `role="radiogroup"` |
| 43 | General Button 43 (S) | 👍 248 / 👎 12 vote pair; tints emerald/red; mutually exclusive | ~44 ln: derived counts |
| 44 | General Button 44 (S) | Eye/EyeOff toggle over mono masked secret "••••" ⇄ `sk_live_…` | ~32 ln |
| 45 | General Button 45 (S) | Outline "Refresh" w/ spinning RotateCw while busy (1.2s), `aria-busy` | ~28 ln |
| 46 | General Button 46 (S) | Outline "Filters" + round primary Badge "3" | Verbatim below |
| 47 | General Button 47 (S) | Bordered 2-segment LayoutGrid/List view toggle; active `bg-accent` | ~29 ln |
| 48 | General Button 48 (S) | "Date added" sort cycler: ArrowDown → ArrowUpDown → ArrowUp + muted state label | ~28 ln |
| 49 | General Button 49 (S) | Outline icon Maximize2 ⇄ Minimize2 expand toggle | ~27 ln |
| 50 | General Button 50 (S) | ZoomOut \| "100%" \| ZoomIn group; ±25% steps, bounds disabled | ~38 ln |
| 51 | General Button 51 (S) | Pill segmented Daily/Weekly/Monthly in `rounded-full bg-muted p-1` tray | ~26 ln |
| 52 | General Button 52 (S) | Circular Mic ⇄ destructive MicOff mute toggle | ~30 ln |
| 53 | General Button 53 (S) | Contact card w/ live call duration + circular emerald Phone ⇄ red PhoneOff | ~55 ln: `$effect` interval |
| 54 | General Button 54 (S) | "Accent color" card w/ 6 circular swatches (Crimson/Amber/Lime/Emerald/Azure/Violet); ring + check on active | ~60 ln |

**Verbatim code (canonical variants):**

```svelte
<!-- 01 Primary button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    Get started
  </button>
</div>
```

```svelte
<!-- 02 Secondary button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-xs outline-none transition-all duration-200 ease-out hover:bg-secondary/80 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    Save draft
  </button>
</div>
```

```svelte
<!-- 03 Destructive button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-xs outline-none transition-all duration-200 ease-out hover:bg-destructive/90 focus-visible:ring-[3px] focus-visible:ring-destructive/40 active:scale-[0.98]"
  >
    Delete workspace
  </button>
</div>
```

```svelte
<!-- 04 Outline button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs outline-none transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    Export CSV
  </button>
</div>
```

```svelte
<!-- 05 Ghost button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium outline-none transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    Dismiss
  </button>
</div>
```

```svelte
<!-- 06 Link button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none transition-all duration-200 ease-out hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
  >
    View documentation
  </button>
</div>
```

```svelte
<!-- 07 Disabled button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    disabled
    class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50"
  >
    Publish changes
  </button>
</div>
```

```svelte
<!-- 09 Pill button -->
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    Start free trial
  </button>
</div>
```

```svelte
<!-- 10 Button with left icon -->
<script>
  import Mail from "@lucide/svelte/icons/mail";
</script>
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs outline-none transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    <Mail class="h-4 w-4" aria-hidden="true" />
    Send invite
  </button>
</div>
```

```svelte
<!-- 12 Icon only button -->
<script>
  import Archive from "@lucide/svelte/icons/archive";
</script>
<div class="flex items-center justify-center p-8">
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs outline-none transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
  >
    <Archive class="h-4 w-4" aria-hidden="true" />
    <span class="sr-only">Archive conversation</span>
  </button>
</div>
```

```svelte
<!-- 26 Button with badge -->
<script>
  import { Button } from "$lib/components/elements/button/index.js";
  import Bell from "@lucide/svelte/icons/bell";
  const unread = 3;
</script>
<div class="flex items-center justify-center p-8">
  <Button variant="outline" size="icon" class="relative" aria-label="Notifications, {unread} unread">
    <Bell class="size-4" aria-hidden="true" />
    <span
      class="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-white tabular-nums"
      aria-hidden="true"
    >
      {unread}
    </span>
  </Button>
</div>
```

```svelte
<!-- 29 Animated hover button -->
<script>
  import { Button } from "$lib/components/elements/button/index.js";
  import Sparkles from "@lucide/svelte/icons/sparkles";
</script>
<div class="flex items-center justify-center p-8">
  <Button class="group">
    <Sparkles
      class="size-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
      aria-hidden="true"
    />
    Generate summary
  </Button>
</div>
```

```svelte
<!-- 30 Full width button -->
<script>
  import { Button } from "$lib/components/elements/button/index.js";
</script>
<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-8">
  <Button class="w-full justify-center">Create account</Button>
  <p class="text-center text-xs text-muted-foreground">
    Free for 14 days. No credit card required.
  </p>
</div>
```

```svelte
<!-- 33 Dashed attach button -->
<script>
  import { Button } from "$lib/components/elements/button/index.js";
  import Paperclip from "@lucide/svelte/icons/paperclip";
</script>
<div class="mx-auto flex w-full max-w-xs flex-col items-center gap-2 p-8">
  <Button
    variant="outline"
    class="w-full justify-center border-dashed text-muted-foreground hover:text-foreground"
  >
    <Paperclip class="size-4" aria-hidden="true" />
    Attach a file
  </Button>
  <p class="text-xs text-muted-foreground">Up to 5 attachments, 10 MB each</p>
</div>
```

```svelte
<!-- 37 Like button with toggle -->
<script>
  import Heart from "@lucide/svelte/icons/heart";
  import { Button } from "$lib/components/elements/button";
  let liked = $state(false);
  const baseLikes = 1284;
  let likes = $derived(baseLikes + (liked ? 1 : 0));
</script>
<div class="flex items-center justify-center p-8">
  <Button
    variant="outline"
    onclick={() => (liked = !liked)}
    aria-pressed={liked}
    class="gap-2 {liked ? 'border-red-500/40 text-red-600 dark:text-red-400' : ''}"
  >
    <Heart class="size-4 transition-transform duration-200 ease-out {liked ? 'scale-110 fill-current' : ''}" aria-hidden="true" />
    {liked ? 'Liked' : 'Like'}
    <span class="ml-0.5 text-xs font-normal tabular-nums text-muted-foreground">
      {likes.toLocaleString()}
    </span>
  </Button>
</div>
```

```svelte
<!-- 38 Bookmark button -->
<script>
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import { Button } from "$lib/components/elements/button";
  let bookmarked = $state(false);
</script>
<div class="flex items-center justify-center p-8">
  <Button
    variant="outline"
    size="icon"
    onclick={() => (bookmarked = !bookmarked)}
    aria-pressed={bookmarked}
    class={bookmarked ? 'text-primary' : ''}
  >
    <Bookmark class="size-4 transition-transform duration-200 ease-out {bookmarked ? 'scale-110 fill-current' : ''}" aria-hidden="true" />
    <span class="sr-only">{bookmarked ? 'Remove bookmark' : 'Add bookmark'}</span>
  </Button>
</div>
```

```svelte
<!-- 39 Add to cart button -->
<script>
  import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
  import { Button } from "$lib/components/elements/button";
</script>
<div class="flex items-center justify-center p-8">
  <Button size="lg" class="gap-2">
    <ShoppingCart class="size-4" aria-hidden="true" />
    Add to cart
    <span class="ml-1 border-l border-primary-foreground/25 pl-3 tabular-nums opacity-90">$149.00</span>
  </Button>
</div>
```

```svelte
<!-- 46 Filter button -->
<script>
  import Filter from "@lucide/svelte/icons/filter";
  import { Button } from "$lib/components/elements/button";
  import { Badge } from "$lib/components/elements/badge";
  const activeFilters = 3;
</script>
<div class="flex items-center justify-center p-8">
  <Button variant="outline" class="gap-2">
    <Filter class="size-4" aria-hidden="true" />
    Filters
    <Badge class="ml-0.5 size-5 justify-center rounded-full p-0 text-[10px] tabular-nums">
      {activeFilters}
    </Badge>
    <span class="sr-only">{activeFilters} filters active</span>
  </Button>
</div>
```

```svelte
<!-- 31 Trailing arrow animation -->
<script>
  import { Button } from "$lib/components/elements/button/index.js";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
</script>
<div class="flex items-center justify-center p-8">
  <Button class="group">
    Continue to checkout
    <ArrowRight
      class="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
      aria-hidden="true"
    />
  </Button>
</div>
```

### API reference (verbatim; single primitive)

**Button.Root** — "Interactive clickable button element with dark mode support."

| Prop | Type | Default |
|---|---|---|
| `class` (as className) | `string` | — |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` |
| `size` | `"default" \| "sm" \| "lg" \| "icon" \| "icon-sm" \| "icon-lg"` | `"default"` |
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `href` | — | `undefined` |
| `type` | `string` | `"button"` |
| `disabled` | — | — |
| `children` | `Snippet` | — |
| `...restProps` | `Record<string, unknown>` | — |

(No `Button.Group` primitive — group functionality lives in the separate Button Group category.)

### Patterns
1. Dark mode first-class: previews load `&theme=dark`; per-card light/dark toggle; primary inverts to near-white in dark.
2. shadcn-style semantic tokens everywhere (`bg-primary/text-primary-foreground`, `bg-secondary`, `bg-destructive`, `border-input`, `bg-accent`, `bg-muted`, `bg-card`, `ring-ring`) plus deliberate low-alpha Tailwind tints (`blue-500/10`, `emerald-500/15`, `red-500/40`) with `dark:` text variants for soft buttons.
3. Motion-reduce discipline: every animated icon pairs `motion-reduce:transform-none` / `motion-reduce:animate-none`.
4. A11y conventions: `aria-pressed` on toggles, `aria-live="polite"` readouts, `sr-only` labels on icon-only buttons, `aria-busy`+disabled on loading, `aria-haspopup`/`aria-expanded`, `role="radiogroup"` ratings, `role="group"` clusters.
5. Two authoring styles: plain `<button>` + utilities for simple demos; library `<Button>` (`variant`/`size`/`class`) for composition, incl. sibling-library composition (`ButtonGroup`, `ToggleGroup`, `Badge`).
6. Svelte 5 runes idiom (`$state`, `$derived`, `$effect`); icons imported per-symbol from `@lucide/svelte/icons/*`.
7. Agent-oriented affordances: per-demo "Copy for AI", per-file shadcn registry install, site-wide Claude MCP command.

---

## currList1_Card_specs

**URL:** https://sveltoui.dev/elements/card · **Header:** "Card — 2 components" · count verified (2/2).

### Demos (2 preview boxes; both have Preview + Code boxes)

**1) Card Minimal 01** — SMALL — "Minimal content card with a divided header, body copy and a text link action, with dark mode support."
Visual: white (`dark:bg-gray-950`) rounded-lg bordered card, max-w-sm: divided header with uppercase eyebrow "GUIDE" over bold "Design Systems 101"; body "A four-part guide to building a token-driven UI kit your whole team can maintain."; footer action "Read the guide →" (arrow nudges right on hover; card gains `hover:shadow-lg`).
Code (~40 ln summarized): no imports; `$props()` defaults `title`/`description`/`buttonText`; `article.rounded-lg.border.bg-white.shadow-sm.hover:shadow-lg.dark:bg-gray-950` > divided header (`px-6 py-5`) with eyebrow `p` + `h3`, body `div.px-6.pt-5`, footer `div.px-6.pb-6.pt-5` with `button.group` text-link (arrow `group-hover:translate-x-0.5`).

**2) Card Minimal 02** — SMALL — "Minimal rule-accented card with an eyebrow label, light display heading and underlined text action, with dark mode support."
Visual: borderless flat card with a left vertical rule (w-1, dark) that scales from half to full width on hover; eyebrow "FEATURED", light-weight display heading "Type in Practice", body "How we cut our type scale from nineteen sizes to six without losing a single layout.", underlined-on-hover bordered-bottom action "Continue reading".
Code (~33 ln summarized): no imports; `$props()` defaults incl. `eyebrow='Featured'`; `article.group` > absolute accent rule (`origin-left scale-x-50 group-hover:scale-x-100 motion-reduce:transition-none`), heading block, body `p.mb-8`, `button` with `border-b-2 border-transparent hover:border-gray-900 dark:hover:border-gray-100`.

### API reference (verbatim; 7 primitives)

**Card.Root** — "Contained content block with optional header/footer using design tokens."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `as` | `string` | `"div"` |
| `class` (as className) | `string` | — |
| `children` | `Snippet` | — |
| `...restProps` | `Record<string, unknown>` | — |

**Card.Header / Card.Title / Card.Description / Card.Content / Card.Action / Card.Footer** — each: `ref` (bind:) `HTMLElement \| null` `null` · `class` (as className) `string` — · `children` (Snippet) — · `...restProps`.

### Patterns
Unlike Accordion/Alert/Badge, both demos style with raw gray palettes (`gray-200/800` borders, `white`/`gray-950` surfaces) + `dark:` variants rather than semantic tokens; the only demos that expose copy through `$props()` defaults; hover micro-interactions (shadow lift, rule-scale, arrow-nudge, underline reveal) at 150–200ms with motion-reduce guards; typography-led (uppercase tracked eyebrows, generous spacing, text-link actions instead of buttons).

---

## currList1_Checkbox_specs

**URL:** https://sveltoui.dev/elements/checkbox · **Header:** "Checkbox — 20 components" · count verified (20/20).

### Demos (20 preview boxes; all have Preview + Code boxes)

**1) General Checkbox 01** — SMALL — "Basic checkbox with an associated label." Preview: checkbox + "Accept terms and conditions", unchecked.
```svelte
<script>
  import { Checkbox } from "$lib/components/elements/checkbox";
  import { Label } from "$lib/components/elements/label";

  let checked = $state(false);
</script>

<!-- Basic checkbox -->
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-3">
    <Checkbox id="checkbox01-terms" bind:checked />
    <Label for="checkbox01-terms" class="cursor-pointer">Accept terms and conditions</Label>
  </div>
</div>
```

**2) General Checkbox 02** — SMALL — "Custom styled checkbox with a soft filled indicator." Preview: checked custom box "Remember me on this device" (primary-filled, white check).
```svelte
<script>
  import Check from "@lucide/svelte/icons/check";
  let checked = $state(true);
</script>

<!-- Custom styled checkbox -->
<div class="flex items-center justify-center p-8">
  <label for="checkbox02-remember" class="flex cursor-pointer items-center gap-3 text-sm font-medium">
    <button
      id="checkbox02-remember"
      type="button"
      role="checkbox"
      aria-checked={checked}
      onclick={() => (checked = !checked)}
      class="flex size-5 items-center justify-center rounded-md border shadow-sm transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {checked
        ? 'border-primary bg-primary'
        : 'border-input bg-card hover:border-primary/60'}"
    >
      {#if checked}
        <Check class="size-3.5 text-primary-foreground" aria-hidden="true" />
      {/if}
    </button>
    Remember me on this device
  </label>
</div>
```

**3) General Checkbox 03** — MEDIUM — "Checkbox with a label and descriptive helper text." Preview: "Marketing emails" + helper about product updates.
```svelte
<script>
  import { Checkbox } from "$lib/components/elements/checkbox";
  import { Label } from "$lib/components/elements/label";
  let checked = $state(false);
</script>

<!-- Checkbox with description -->
<div class="flex items-center justify-center p-8">
  <div class="flex w-full max-w-sm items-start gap-3">
    <Checkbox
      id="checkbox03-marketing"
      bind:checked
      aria-describedby="checkbox03-desc"
      class="mt-0.5"
    />
    <div class="grid gap-1.5">
      <Label for="checkbox03-marketing" class="cursor-pointer">Marketing emails</Label>
      <p id="checkbox03-desc" class="text-sm leading-relaxed text-muted-foreground">
        Product updates, release notes, and the occasional case study. Roughly twice a month.
      </p>
    </div>
  </div>
</div>
```

**4) General Checkbox 04** — MEDIUM — "Checkbox group inside a labelled fieldset." Preview: "Notification preferences": Email (checked, hint alex@northwind.io), SMS (+1 415…), Push (checked, "Northwind for iOS").
Code (long, summarized): `Checkbox`+`Label`; `$state` options `{id,label,hint,checked}`; `fieldset`+`legend`; `{#each}` rows.

**5) General Checkbox 05** — MEDIUM — "Selectable card with an embedded checkbox indicator." Preview: selected pricing card "Starter — $0 / month / 3 projects, 1 GB…". Code (summarized): `Check` only; hand-rolled `<button role="checkbox">` card (`border-primary bg-primary/5` when checked).

**6) General Checkbox 06** — MEDIUM — "Parent checkbox with an indeterminate (mixed) state." Preview: "Share diagnostics" parent + 3 children (Analytics events, Crash reports, Usage statistics). Code (summarized): `Check`, `Minus`, `Checkbox`, `Label`; `allChecked`/`someChecked` `$derived`; parent `aria-checked="mixed"` + Minus icon; nested `border-l pl-4` list.

**7) General Checkbox 07** — SMALL — "Disabled checkboxes in unchecked and checked states." Preview: "Workspace permissions" fieldset with two disabled rows.
```svelte
<script>
  import { Checkbox } from "$lib/components/elements/checkbox";
  import { Label } from "$lib/components/elements/label";
</script>

<!-- Disabled checkbox -->
<div class="flex items-center justify-center p-8">
  <fieldset class="flex flex-col gap-4">
    <legend class="mb-3 text-sm font-semibold">Workspace permissions</legend>
    <div class="flex items-center gap-3">
      <Checkbox id="checkbox07-billing" disabled />
      <Label for="checkbox07-billing" class="font-normal opacity-50">Manage billing (owner only)</Label>
    </div>
    <div class="flex items-center gap-3">
      <Checkbox id="checkbox07-read" checked disabled />
      <Label for="checkbox07-read" class="font-normal opacity-50">Read repositories (always on)</Label>
    </div>
  </fieldset>
</div>
```

**8) General Checkbox 08** — MEDIUM — "Required checkbox showing a validation error until accepted." Preview: unchecked ToS checkbox + red "You must accept the terms before continuing." Code (summarized): `invalid = $derived(submitted && !checked)`; `aria-invalid` + conditional `aria-describedby`; error `<p role="alert" class="text-destructive">`.

**9) General Checkbox 09** — SMALL — "Circular checkbox with a label." Preview: checked round box "Send me the weekly digest".
```svelte
<script>
  import Check from "@lucide/svelte/icons/check";
  let checked = $state(true);
</script>

<!-- Rounded checkbox -->
<div class="flex items-center justify-center p-8">
  <label for="checkbox09-digest" class="flex cursor-pointer items-center gap-3 text-sm font-medium">
    <button
      id="checkbox09-digest"
      type="button"
      role="checkbox"
      aria-checked={checked}
      onclick={() => (checked = !checked)}
      class="flex size-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {checked
        ? 'border-primary bg-primary'
        : 'border-input hover:border-primary/60'}"
    >
      {#if checked}
        <Check class="size-3 text-primary-foreground" aria-hidden="true" />
      {/if}
    </button>
    Send me the weekly digest
  </label>
</div>
```

**10) General Checkbox 10** — MEDIUM — "Multi-select checkbox cards with icons." Preview: "Accepted payment methods": Credit card (selected), Mobile pay, Digital wallet (selected) icon cards. Code (summarized): `Check`, `CreditCard`, `Smartphone`, `Wallet`; `$state` payments; `w-28` button cards, corner check bubble.

**11) General Checkbox 11** — MEDIUM — "Size filter rendered as toggleable checkbox chips." Preview: XS S M L XL square chips (M, L selected); "Showing sizes M, L" live line. Code (summarized): no primitives; `size-10` chip buttons `role="checkbox"`, disabled out-of-stock XL, `aria-live="polite"` summary.

**12) General Checkbox 12** — MEDIUM — "Colour swatches as multi-select checkboxes." Preview: round swatches (Graphite, Sand, Olive, Clay, Ink), Graphite + Olive checked; "Graphite, Olive" caption. Code (summarized): `Check`; inline `style="background-color:{hex}"`, ring when selected.

**13) General Checkbox 13** — SMALL — "Large checkbox with an animated check indicator." Preview: large unchecked box + "I have backed up my recovery key".
```svelte
<script>
  import Check from "@lucide/svelte/icons/check";
  let checked = $state(false);
</script>

<!-- Large checkbox with animated check -->
<div class="flex items-center justify-center p-8">
  <label for="checkbox13-confirm" class="flex cursor-pointer items-center gap-4">
    <button
      id="checkbox13-confirm"
      type="button"
      role="checkbox"
      aria-checked={checked}
      onclick={() => (checked = !checked)}
      class="flex size-7 items-center justify-center rounded-md border-2 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {checked
        ? 'border-primary bg-primary'
        : 'border-input hover:border-primary/60'}"
    >
      {#if checked}
        <Check
          class="size-5 text-primary-foreground animate-in zoom-in-50 duration-200 motion-reduce:animate-none"
          aria-hidden="true"
        />
      {/if}
    </button>
    <span class="text-base font-medium">I have backed up my recovery key</span>
  </label>
</div>
```

**14) General Checkbox 14** — MEDIUM — "Task list with checkboxes and strikethrough completed items." Preview: "Today's tasks — 2 of 4 done" card, completed struck through. Code (summarized): `Card`, `Checkbox`, `Label`; `done = $derived(...)`; conditional `line-through`.

**15) General Checkbox 15** — MEDIUM — "Checkbox row with the control aligned to the right." Preview: bordered row "Deployment alerts / Notify me when a production deploy fails." with checkbox on the right.
```svelte
<script>
  import { Checkbox } from "$lib/components/elements/checkbox";
  import { Label } from "$lib/components/elements/label";
  let checked = $state(true);
</script>

<!-- Checkbox with right-aligned label -->
<div class="flex items-center justify-center p-8">
  <div
    class="flex w-full max-w-sm items-center justify-between gap-6 rounded-lg border bg-card p-4 shadow-sm transition-colors duration-200 ease-out hover:bg-accent"
  >
    <div class="grid gap-1">
      <Label for="checkbox15-deploys" class="cursor-pointer">Deployment alerts</Label>
      <p id="checkbox15-desc" class="text-xs leading-relaxed text-muted-foreground">
        Notify me when a production deploy fails.
      </p>
    </div>
    <Checkbox id="checkbox15-deploys" bind:checked aria-describedby="checkbox15-desc" />
  </div>
</div>
```

**16) General Checkbox 16** — MEDIUM — "Multi-select pricing cards with a highlighted popular option." Preview: Add-ons — Extra seats $9/mo, Advanced analytics $29/mo (selected, "Most popular" crown badge), Priority support $99/mo; "Add-ons total $29 / mo". Code (summarized): `Check`, `Crown`; `$derived` total; Crown badge `-top-2 right-3`; `aria-live` total.

**17) General Checkbox 17** — SMALL — "Day-of-week repeat selector built from toggleable checkbox pills." Preview: M T W T F S S round pills (Mon–Fri on); "Every weekday at 9:00 AM". Code (summarized): no primitives; `$derived` summary (Never/Every day/Every weekday/list); `h-9 w-9 rounded-full` pills.

**18) General Checkbox 18** — SMALL — "Horizontal checkbox group for filtering a list." Preview: "Filter by": In stock ✓, Free shipping ✓, On sale, New arrivals; "2 filters applied · 61 products". Code (summarized): `Checkbox`+`Label`; `sr-only` legend; `flex-wrap gap-x-6`; `aria-live` counts.

**19) General Checkbox 19** — MEDIUM — "Image picker with selectable thumbnail checkboxes." Preview: "Cover photo — 2 of 4 selected", 2×2 thumbnails with check bubbles. Code (summarized): `Check`; `aspect-square` img buttons, `border-primary` when selected.

**20) General Checkbox 20** — MEDIUM — "Settings panel with a checkbox row per preference." Preview: "Preferences — 2 enabled": Dark mode ✓, Push notifications, Usage analytics, Automatic updates ✓, Beta channel (disabled). Code (summarized): `Checkbox`+`Label`; `$state` features with `disabled` flag; `divide-y` rows, `hover:bg-accent/60`.

### API reference (verbatim; single primitive)

**Checkbox.Root** — "Selectable checkbox input with dark mode support."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `checked` (bind:) | `boolean` | `false` |
| `indeterminate` (bind:) | `boolean` | `false` |
| `class` (as className) | `string` | — |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
Two authoring styles: `Checkbox`/`Label` primitives for plain rows; hand-rolled `<button role="checkbox" aria-checked onclick>` for styled variants (cards, chips, swatches, pills, image tiles). A11y: `aria-checked` incl. `"mixed"`, `aria-describedby` helper/error text, `role="alert"` errors, `aria-live` summaries, fieldset/legend grouping, focus-visible rings. Motion: `transition-colors duration-200 ease-out`; `animate-in zoom-in-50` + `motion-reduce:animate-none`.

---

## currList1_Dialog_specs

**URL:** https://sveltoui.dev/elements/dialog · **Header:** "Dialog — 21 components" · count verified (21/21).

### Demos (21 preview boxes; all long-code, summarized)

| # | Demo (size) | Preview shows | Code (imports / structure) |
|---|-------------|---------------|---------------------------|
| 1 | General Dialog 01 (M) | "Publish changes" trigger; modal "Publish to production?" — deploy warning for build v2.4.1 (12,480 users, 30-day rollback), X close, Cancel/Publish | `X`, `Button`; `open=$state(true)`; `svelte:window` Escape; `{#if open}` fixed overlay `bg-black/50` + `role="dialog" aria-modal="true"` card `animate-in fade-in-0 zoom-in-95`; `aria-labelledby/-describedby`; sr-only X; Cancel (`variant="outline"`) / Publish |
| 2 | General Dialog 02 (M) | "Delete your account?" destructive confirm w/ warning icon, "cannot be undone", Cancel / Delete account | `TriangleAlert`, `Button`; `role="alertdialog"`; icon in `bg-destructive/10` circle; destructive confirm |
| 3 | General Dialog 03 (M) | "Payment successful" w/ green check, $249.00 to Visa 4242, receipt rows, "Back to dashboard" | `CircleCheck`, `Button`; emerald icon; `<dl>` receipt in `bg-muted/40` |
| 4 | General Dialog 04 (M) | "Welcome back" sign-in form: Email, Password + "Forgot password?", Sign in, "Create one" link | `X`, `Button`, `Input`, `Label`; `<form onsubmit|preventDefault>`; autocomplete attrs |
| 5 | General Dialog 05 (L) | File upload: dropzone "Drag files here, or browse / PNG, JPG, PDF or ZIP up to 10 MB" + file list w/ Remove | `X`, `Upload`, `FileText`, `Button`; dragover/drop handlers; `formatSize()`; "Upload N" disabled until files |
| 6 | General Dialog 06 (L) | "Share 'Q3 Board Review'": readonly link + Copy (✓ feedback), "Public to anyone at northwind.io", people list (avatar initials, roles), Done | `onDestroy`, `X/Copy/Check/Globe`, `Button`, `Input`; 2s copied timeout |
| 7 | General Dialog 07 (L) | Settings dialog: sidebar tabs Profile/Notifications/Privacy/Appearance; Profile shows Display name/Email/Bio | `X` + tab icons, `Button`, `Input`, `Label`, `Textarea`, `Switch`; `role="tablist"` sidebar + 4 conditional `role="tabpanel"` panels |
| 8 | General Dialog 08 (L) | Payment method form: "Billed monthly · Team plan, $49 per seat", Name on card, Card number, Expiry, CVC, lock note, Add card | `X`, `CreditCard`, `Lock`, `Button`, `Input`, `Label`; `autocomplete="cc-*"` |
| 9 | General Dialog 09 (L) | Command palette: "Search commands… ⌘K"; CREATE (New document ⌘N…), WORKSPACE, footer ↑↓ ↵ esc | `X`, `Search`, `FileText`, `Settings`, `Users`, `Mail`, `Calendar`, `Kbd`; `svelte:window onkeydown` |
| 10 | General Dialog 10 (M) | Full-screen lightbox: "1 / 4", "Cascade foothills, 06:12", Prev/Next, 4 dots | `X`, `ImageIcon`, `ChevronLeft/Right`, `Button`; keyboard handler; dot buttons |
| 11 | General Dialog 11 (M) | Feedback: "How was your onboarding?", 5 star buttons, "Great", comment field, Submit | `X`, `Star`, `Button`, `Textarea rows={3}` |
| 12 | General Dialog 12 (M) | Cookie consent w/ per-category toggles: Strictly necessary (locked on) + Analytics… | `X`, `Cookie`, `Button`, `Switch` (`checked disabled`) |
| 13 | General Dialog 13 (L) | Multi-step onboarding: "Welcome to Northwind", 2-minute tour, Skip/Next, "Step 1 of 4" | `X`, `Compass`, `ChevronLeft/Right`, `Check`, `Button`; step state machine |
| 14 | General Dialog 14 (L) | Invite teammate: "9 of 25 seats used", Email, Role select (Viewer/Editor/Admin), copyable join link | `onDestroy`, `X`, `UserPlus`, `Mail`, `LinkIcon`, `Copy`, `Check`, `Button`, `Input`, `Label` |
| 15 | General Dialog 15 (M) | Progress: "Exporting Q3 report — Uploading to storage…", 82%, "Keep this window open…" | `onMount/onDestroy`, `X`, `LoaderCircle`, `Check`, `Button`, **`Progress`** (`aria-label="Export progress"`) |
| 16 | General Dialog 16 (M) | Video lightbox: "Northwind in 3 minutes", poster w/ Play, control bar 0:00 / 3:12 | `X`, `Play`, `Pause`, `Volume2`; custom control bar |
| 17 | General Dialog 17 (L) | Create event: title, Date, Start time, Location, Agenda, Attendees (3 invited), Cancel/Create | `X`, `Calendar`, `Clock`, `MapPin`, `Users`, `Button`, `Input`, `Textarea`, `Label`; attendee chips |
| 18 | General Dialog 18 (L) | Export: "127 records from 'Q3 Pipeline'", CSV ~1.2 MB / Excel / JSON / PDF w/ descriptions | `X`, `Download`, file-type icons, `Check`, `Button`; radio-style option rows |
| 19 | General Dialog 19 (L) | Support chat panel: "Nimbus Support — Ravi is online · replies in ~2 min", bubbles w/ timestamps, composer | `X`, `MessageSquare`, `Send`, `Paperclip`, `Button`, `Input size="sm"`; bottom-right anchored |
| 20 | General Dialog 20 (L) | Keyboard shortcuts: GENERAL (⌘K ⌘S ⌘Z ⌘⇧Z), NAVIGATION (⌘N ⌘P ⌘B…) | `X`, `Keyboard`, `Button variant="outline"`, **`Kbd`, `KbdGroup`** |
| 21 | General Dialog 21 (L) | Cart drawer: "Your cart — 4 items · ships from Rotterdam", Atlas ANC Headphones $299.99 w/ qty stepper | `X`, `ShoppingCart`, `Minus`, `Plus`, `Trash2`, `Button`; right-side drawer panel |

### API reference (verbatim; 8 primitives — all descriptions "Modal dialog overlay.")

**Dialog.Close** — `ref` (bind:) `HTMLElement \| null` `null` · `...restProps`.
**Dialog.Content** — `ref` (bind:) · `class` (as className) · `portalProps` (—, —) · `children` (Snippet) · `showCloseButton` (boolean, `true`) · `...restProps`.
**Dialog.Description** — `ref` (bind:) · `class` · `...restProps`.
**Dialog.Footer** / **Dialog.Header** — `ref` (bind:) · `class` · `children` (Snippet) · `...restProps`.
**Dialog.Overlay** / **Dialog.Title** — `ref` (bind:) · `class` · `...restProps`.
**Dialog.Trigger** — `ref` (bind:) · `...restProps`.

### Patterns
Demos are composed, not primitive-based: `{#if open}` + fixed overlay + `role="dialog"`/`"alertdialog"` cards; only 03+ compose library Buttons/Inputs heavily. Consistent scaffolding: `svelte:window` Escape, `aria-label="Close dialog"` X, `bg-black/50 fade-in-0` overlay, `animate-in fade-in-0 zoom-in-95 duration-200` panel, sr-only close, labelled/describedby ids. Variants by role: alertdialog + destructive for irreversible confirms; success = emerald tokens; lightbox = full-screen dark; chat/drawer = anchored panels. Heavy cross-primitive reuse (Settings dialog uses 5 primitives).

---

## currList1_Input_specs

**URL:** https://sveltoui.dev/elements/input · **Header:** "Input — 57 components" · count verified (57 rendered demos; numbering runs General Input 01–59 with registry gaps at 31, 35, 45, 46, plus two unnumbered "Input Glasmorphism" demos).

### Demos (57 preview boxes; all have Preview + Code boxes)

**1) General Input 01** — SMALL — "Basic single-line text input using the shadcn Input primitive."
```svelte
<script>
  import { Input } from "$lib/components/elements/input/index.js";
  let value = $state('');
</script>

<!-- Basic input -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-xs">
    <Input
      id="input01-name"
      type="text"
      bind:value
      placeholder="Jane Cooper"
      aria-label="Full name"
      class="text-sm"
    />
  </div>
</div>
```

**2) General Input 02** — SMALL — "Email input paired with a form label."
```svelte
<script>
  import { Input } from "$lib/components/elements/input/index.js";
  import { Label } from "$lib/components/elements/label/index.js";
  let value = $state('');
</script>

<!-- Input with label -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-xs space-y-2">
    <Label for="input02-email">Email</Label>
    <Input
      id="input02-email"
      type="email"
      autocomplete="email"
      bind:value
      placeholder="jane.cooper@acme.com"
      class="text-sm"
    />
  </div>
</div>
```

| # | Demo (size) | Preview / purpose | Code summary |
|---|-------------|-------------------|--------------|
| 03 | General Input 03 (S) | Username + helper "public display name… every 30 days" | `Input`+`Label`; `aria-describedby` helper `<p>` |
| 04 | General Input 04 (S) | Invalid Email + "Enter a valid email address…" | + `CircleAlert`; `aria-invalid`, destructive classes, alert row |
| 05 | General Input 05 (S) | Disabled "acme-prod-7f21c9" Workspace ID | `Input disabled` + `bg-muted` |
| 06 | General Input 06 (S) | "Work email" w/ leading Mail icon | absolute icon + `padding-inline-start: 2.5rem` |
| 07 | General Input 07 (S) | Search w/ leading icon + Clear button when text entered | `Search`+`X`; `type="search"`, webkit cancel hidden, conditional clear |
| 08 | General Input 08 (S) | Password w/ Lock + Show/Hide Eye toggle | `Eye/EyeOff/Lock`; `type={showPassword ? 'text' : 'password'}` |
| 09 | General Input 09 (S) | Website field joined to "https://" prefix addon | native; `focus-within:ring-2` shared wrapper |
| 10 | General Input 10 (S) | Package weight joined to "kg" suffix | native; `focus-within` wrapper |
| 11 | General Input 11 (S) | "Product updates" email + Subscribe button row | `Input`+`Label`+`Button` (`disabled={!valid}`) |
| 12 | General Input 12 (S) | Bio w/ live "57/80" counter, threshold color | `maxlength` + live counter |
| 13 | General Input 13 (S) | Success state: "jane.cooper is available." + green check | + `Check`; conditional `border-green-600` |
| 14 | General Input 14 (S) | Async "Checking availability…" spinner | + `LoaderCircle`; `aria-busy`, spinning status |
| 15 | General Input 15 (S) | Floating label (Email address), transform-only animation | native; `peer` + `placeholder=" "` float pattern, `h-14 pt-6 pb-2` |
| 16 | General Input 16 (S) | Required "Full name *" + sr "(required)" hint | `Input required`; Label `gap-1` asterisk |
| 17 | General Input 17 (S) | Phone w/ "Optional" secondary Badge + helper | + `Badge variant="secondary"`; `type="tel" inputmode="tel"` |
| 18 | General Input 18 (S) | Currency: $ prefix, USD suffix, right-aligned mono digits | + `DollarSign`; `type="number" step="0.01"`, `text-right font-mono tabular-nums` |
| 19 | General Input 19 (S) | Phone joined to country dial-code select (+1/+44/…) | `Input`+`NativeSelect` joined (`rounded-e-none`/`rounded-s-none`) |
| 20 | General Input 20 (S) | Native date input "Date of birth" + age hint | `Input type="date" max="2010-01-01" autocomplete="bday"` |
| 21 | General Input 21 (S) | Native time input "Meeting time" (15-min hint) | `Input type="time" step="900"` |
| 22 | General Input 22 (S) | Color swatch + hex field pair | native `type="color"` + hex `maxlength="7" font-mono uppercase`, `aria-invalid={!isValidHex}` |
| 23 | General Input 23 (S) | Range slider "Output volume 65%" + scale labels | native `<input type="range">` + live readout |
| 24 | General Input 24 (M) | Readonly install command + copy button, Node 18 hint | + `Copy/Check`, `Button variant="outline" size="icon"`; joined input |
| 25 | General Input 25 (M) | Six-box OTP: auto-advance, backspace, paste | looped native inputs + key/paste handlers |
| 26 | General Input 26 (M) | Tag input: chips Svelte 5 / Tailwind v4 / Cloudflare D1 (removable), "5 remaining" | + `X`, `Badge variant="secondary"`; keydown add/remove |
| 27 | General Input 27 (S) | @username + live profile URL preview | + `AtSign`; `autocapitalize="none" spellcheck="false"` |
| 28 | General Input 28 (S) | Card number auto-grouped 4-4-4-4, brand icon | + `CreditCard`; `oninput={formatCard}`, `maxlength="19" font-mono tabular-nums` |
| 29 | General Input 29 (S) | Expiry (MM/YY auto-format) + CVC pair | `oninput={formatExpiry}`, `autocomplete="cc-exp"` |
| 30 | General Input 30 (S) | Quantity stepper − 1 + joined to number field | + `Minus/Plus`, `Button size="icon"`; clamp onblur |
| 32 | General Input 32 (S) | Borderless inline-editable "DOCUMENT TITLE" | native, borderless + focus underline |
| 33 | General Input 33 (S) | Password label w/ ⓘ tooltip revealing requirements | + `Info`; tooltip trigger button, `aria-describedby` |
| 34 | General Input 34 (M) | Password w/ 4-segment strength meter + requirement checklist | + `Check/Eye/EyeOff`; segmented meter, reveal toggle |
| 36 | General Input 36 (M) | Autocomplete combobox w/ keyboard nav + empty state (109 ln) | `Input`+`Label`+`Search`; filtered list, active highlight |
| 37 | General Input 37 (S) | Underline field "FULL NAME" | native underline input |
| 38 | General Input 38 (S) | Filled/tinted underline field "WORK EMAIL" | native filled variant |
| 39 | General Input 39 (S) | Pill search "SEARCH DOCS" | + `Search`; `rounded-full` |
| 40 | General Input 40 (S) | Large "POST TITLE" + "0/80 characters" | native large sizing |
| 41 | General Input 41 (S) | Compact "PROMO CODE" | native compact sizing |
| 42 | General Input 42 (M) | Split First/Last name under one legend | ×2 `Input`; `aria-label` each, `autocomplete="given-name"` |
| 43 | General Input 43 (S) | Date w/ leading Calendar icon | + `Calendar`; `type="date" min="2026-01-01" pl-10` |
| 47 | General Input 47 (S) | Discount % w/ trailing Percent icon | `type="number" min max step`, `pr-10 tabular-nums` |
| 48 | General Input 48 (S) | `contenteditable` note field + char count | div contenteditable (no input primitives) |
| 49 | General Input 49 (M) | Width joined to CSS unit select (px/rem/em/%/vw/vh) + live `width: 320px;` preview | + `ChevronDown`; native input+select joined |
| 50 | General Input 50 (M) | "Invite a teammate" + inline Invite button w/ loading/success states | `Button` + `Mail/Check/LoaderCircle` |
| 51 | General Input 51 (M) | Time picker: hour : minute : AM/PM selects | + `Clock/ChevronDown`; three native selects joined |
| 52 | General Input 52 (S) | Start/end date pair w/ range validation "14 days selected." | ×2 `Input type="date"`, `aria-invalid={invalid}` |
| 53 | General Input 53 (S) | IPv4: four auto-advancing octet boxes | looped inputs `maxlength={3}`, `aria-label="Octet N of 4"` |
| 54 | General Input 54 (S) | Code snippet textarea + JavaScript badge + "3 lines · 92 characters" | `Textarea`+`Badge`+`Code`; `font-mono resize-none` |
| 55 | General Input 55 (S) | Inline leading label inside the field frame | `Label` + native input in one framed row |
| 56 | General Input 56 (M) | AI prompt textarea + Generate button w/ loading state, "68/2000 · Shift+Enter" | `Textarea`+`Button`+`Sparkles/LoaderCircle`; `rows={3} resize-none pb-12` |
| 57 | General Input 57 (S) | Search w/ ⌘K hint that focuses field | `Input`+`Kbd`+`Search`; `aria-keyshortcuts="Meta+K Control+K"` |
| 58 | General Input 58 (M) | "Registered company" + country-flag select joined | `Building/ChevronDown`; native input+select joined |
| 59 | General Input 59 (M) | Chat composer: Attach/Emoji/Send + auto-growing field | `Button variant="ghost" size="icon-sm"` ×3 + `Paperclip/Smile/Send` |
| — | Input Glasmorphism 01 (S) | Glass username field on vivid gradient, "claim.dev/ada.lovelace is available" | native + `User/Check`; frosted `backdrop-blur` styling |
| — | Input Glasmorphism 02 (M) | "Weekly release notes" frosted card: email + Subscribe | native + `Mail/ArrowRight` |

### API reference (verbatim; single primitive)

**Input.Root** — "Text input field with dark mode support and size variants."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `value` (bind:) | — | — |
| `type` | — | — |
| `files` (bind:) | — | — |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` |
| `class` (as className) | `string` | — |
| `data-slot` (as dataSlot) | `string` | `"input"` |
| `...restProps` | `Record<string, unknown>` | — |

(`value`/`type`/`files` render as untyped "—" on the site.)

### Patterns
Primitive-first for simple fields (`Input`/`Label` + `aria-describedby`); complex widgets (OTP, tags, IPv4, combobox, floating label, glass) hand-built from native elements. Import paths vary between `$lib/components/elements/input/index.js` and `.../input`. A11y: `aria-invalid`/`aria-busy`/`aria-keyshortcuts`/`aria-live`, `autocomplete` tokens (email, cc-*, tel, bday), `inputmode`, motion guards. Icon adjacency: leading = `absolute left-3` + `pl-9`; trailing = `right-3` + `pr-*`; joined controls share `focus-within` rings.

---

## currList1_Select_specs

**URL:** https://sveltoui.dev/elements/select · **Header:** "Select — 51 components" · count verified (General Select 01–51, no gaps).

### Demos (51 preview boxes; all have Preview + Code boxes)

**1) General Select 01** — MEDIUM — "Basic dropdown select with a placeholder and single-choice listbox." (84 lines, verbatim architecture shown)
```svelte
<script>
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { fly } from "svelte/transition";

  let value = $state("");
  let open = $state(false);

  const options = [
    { value: "iad", label: "Washington, D.C. (iad1)" },
    { value: "sfo", label: "San Francisco (sfo1)" },
    { value: "fra", label: "Frankfurt (fra1)" },
    { value: "syd", label: "Sydney (syd1)" }
  ];

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label || "Select a region");

  function onKeydown(event) {
    if (open && event.key === "Escape") open = false;
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Basic select -->
<div class="flex items-center justify-center p-8">
  <div class="relative w-72">
    <label for="region-select" class="sr-only">Deployment region</label>
    <button
      id="region-select"
      type="button"
      onclick={() => (open = !open)}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls="region-select-listbox"
      role="combobox"
      class="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors duration-150 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span class="truncate {value ? 'font-medium' : 'text-muted-foreground'}">{selectedLabel}</span>
      <ChevronDown
        class="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 {open ? 'rotate-180' : ''}"
        aria-hidden="true"
      />
    </button>

    {#if open}
      <div
        id="region-select-listbox"
        role="listbox"
        aria-label="Deployment region"
        transition:fly={{ y: -4, duration: 160 }}
        class="absolute z-50 mt-1.5 w-full rounded-md border border-border bg-popover p-1 shadow-md"
      >
        {#each options as option}
          <button
            type="button"
            role="option"
            aria-selected={value === option.value}
            onclick={() => {
              value = option.value;
              open = false;
            }}
            class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors duration-150 hover:bg-accent focus-visible:bg-accent {value ===
            option.value
              ? 'bg-accent font-medium'
              : ''}"
          >
            {option.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#if open}
  <button
    type="button"
    tabindex="-1"
    aria-hidden="true"
    class="fixed inset-0 z-40 cursor-default"
    onclick={() => (open = false)}
  ></button>
{/if}
```

**2) General Select 02** — MEDIUM — "Select paired with a visible field label." Preview: "Primary workspace" + 3 workspace options. Code (85 ln, verbatim architecture identical to 01 with a visible `<label class="text-sm font-medium leading-none">`).

| # | Demo (size) | Preview / purpose | Code summary |
|---|-------------|-------------------|--------------|
| 03 | General Select 03 (M) | Notification frequency + helper via `aria-describedby` | combobox pattern + helper row |
| 04 | General Select 04 (M) | "Sort order — Newest first"; selected option check-marked | + `Check` on `aria-selected` option |
| 05 | General Select 05 (M) | Required "Billing country *" + inline error | + `CircleAlert`; `aria-invalid` trigger |
| 06 | General Select 06 (S) | Disabled "Billing plan — Team, $29/mo" locked | `Lock`+`ChevronDown`; disabled trigger, no listbox |
| 07 | General Select 07 (M) | Grouped options w/ headings + separators | group heading + separator rows in listbox |
| 08 | General Select 08 (M) | Searchable repository select w/ filter input + empty state | `Search` + `Input size="sm"` in menu |
| 09 | General Select 09 (L) | Multi-select w/ removable tag chips ("2 of 5 labels") | `X`/`Check` + `Badge variant="secondary"` chips |
| 10 | General Select 10 (M) | Export format options w/ leading file-type icons | per-option `Icon` + `SelectedIcon` |
| 11 | General Select 11 (M) | Country options w/ flag + dial code | flag emoji + code rows |
| 12 | General Select 12 (M) | Label colour w/ swatch per option | color-dot rows |
| 13 | General Select 13 (M) | Two-line options (title + supporting text) | title + muted support line |
| 14 | General Select 14 (M) | Plan select: right-aligned price + "recommended" badge | + `Badge`; price column |
| 15 | General Select 15 (M) | Assignee w/ avatar initials + name/email rows | initials avatars |
| 16 | General Select 16 (M) | Presence status w/ colored indicator dot | dot rows |
| 17 | General Select 17 (M) | Language w/ native names + checked state | + `Globe/Check` |
| 18 | General Select 18 (M) | Timezone: city, region, UTC offset | + `Clock/Check`; three-part rows |
| 19 | General Select 19 (M) | Saved cards + add-card action row | + `Button variant="ghost" size="sm"` w/ `Plus` |
| 20 | General Select 20 (M) | Mailbox folders w/ unread count badges | + `Badge tabular-nums`, folder icons |
| 21 | General Select 21 (M) | Font family: each option rendered in own typeface | per-option `font-family`; preview sentence |
| 22 | General Select 22 (M) | Rating filter w/ star previews + counts | `Star fill-amber-400` rows |
| 23 | General Select 23 (M) | Issue priority w/ colored levels + hints | + `Tag/Check`; colored dots |
| 24 | General Select 24 (M) | Duration grid menu (2-column presets) | + `Timer`; `grid grid-cols-2` listbox |
| 25 | General Select 25 (M) | Async load-on-open w/ loading + empty states (141 ln) | `onDestroy`, `Loader2`; state machine |
| 26 | General Select 26 (M) | Creatable label select (pick or type new, dup guard) | `Input size="sm"` + `Button size="sm"` w/ `Plus` in footer |
| 27 | General Select 27 (S) | Segmented size picker XS–2XL (Medium active) | native segmented buttons |
| 28 | General Select 28 (S) | Pill filter w/ counts: All 48 / Active 12 / … | native pill group |
| 29 | General Select 29 (S) | Icon-only segmented layout switch | LayoutGrid/List/Columns-3 |
| 30 | General Select 30 (M) | Ghost sort trigger, right-aligned checked menu | right-anchored menu, `Check` |
| 31 | General Select 31 (M) | Month grid menu (3-col abbreviations) | + `CalendarDays` |
| 32 | General Select 32 (M) | Year select, last 10 years scrollable | scrollable list, `Check` |
| 33 | General Select 33 (M) | Time picker: hour/minute/AM-PM columns | + `Clock`; three sync'd combobox columns |
| 34 | General Select 34 (M) | Cart-line quantity select + running line total | compact qty combobox in product row |
| 35 | General Select 35 (M) | Currency: symbol, code, full name rows | three-part rows |
| 36 | General Select 36 (M) | Price-range filter w/ per-range counts | range rows w/ counts |
| 37 | General Select 37 (M) | Device viewport w/ icons + resolutions | Smartphone/Tablet/Monitor/Tv |
| 38 | General Select 38 (M) | Org switcher w/ monogram avatars + industry labels | + `Building2/Check` |
| 39 | General Select 39 (M) | Git branch select w/ protected badges + commit times | + `GitBranch/Check` |
| 40 | General Select 40 (M) | Database engine w/ version labels | + `Database/Check` |
| 41 | General Select 41 (M) | Skills multi-select: searchable + removable chips, cap 10 | `X/Search`; in-menu search, chips |
| 42 | General Select 42 (M) | Date-range presets + custom escape hatch | + `Calendar/Check` |
| 43 | General Select 43 (M) | Contact method w/ icon + description rows | Video/Phone/Mail/MessageSquare |
| 44 | General Select 44 (L) | Nested hierarchical select w/ expandable groups | `ChevronRight` expanders, Folder icons, indented children |
| 45 | General Select 45 (M) | Theme select w/ gradient swatch per option | + `Palette/Check` |
| 46 | General Select 46 (M) | Font size select + live type-sample preview | + `Type`; live-resized sample |
| 47 | General Select 47 (M) | Release version w/ "latest" badge + dates | + `Layers/Check` |
| 48 | General Select 48 (M) | Notification preference w/ icon + description | Bell/BellOff/Volume2/Vibrate |
| 49 | General Select 49 (M) | Permissions multi-select ("2 of 4") | checkboxes-in-listbox, counter |
| 50 | General Select 50 (S) | Cycle button Light→Dark→System ("Next: Light") | Sun/Moon/Monitor; no menu |
| 51 | General Select 51 (M) | Recurrence select + start summary line | + `Repeat/Check` |

### API reference (verbatim; 10 primitives — descriptions "Dropdown selection input." unless noted)

**Select.Content** — `ref` (bind:) · `class` (as className) · `sideOffset` (number, `4`) · `portalProps` (—) · `children` (Snippet) · `preventScroll` (boolean, `true`) · `...restProps`.
**Select.Group** — `ref` (bind:) · `...restProps`.
**Select.GroupHeading** — `ref` · `class` · `children` (Snippet) · `...restProps`.
**Select.Item** — `ref` (bind:) · `class` · `value` (—) · `label` (—) · `children` (as childrenProp, —) · `...restProps`.
**Select.Label** — `ref` · `class` · `children` (Snippet) · `...restProps`.
**Select.ScrollDownButton** / **Select.ScrollUpButton** / **Select.Separator** — each: `ref` · `class` · `...restProps`.
**Select.Trigger** — "Dropdown selection input with dark mode support." — `ref` · `class` · `children` (Snippet) · `size` (string, `"default"`) · `...restProps`.
**Select.Value** — `ref` · `class` · `placeholder` (string, `""`) · `children` (Snippet) · `...restProps`.

### Patterns
Demos consistently hand-roll the ARIA combobox pattern (`role="combobox"` trigger + `aria-expanded/haspopup/controls`; `role="listbox"` + `role="option"` + `aria-selected`) rather than consuming `Select.*` primitives. Signature motifs: `svelte/transition` `fly {y:-4, duration:160}` menus, invisible full-screen close layer (`z-40`), `ChevronDown opacity-50 … {open ? 'rotate-180' : ''}` (most repeated class string on the page), `bg-popover` menus, `svelte:window` Escape. Rich option rows (flags, swatches, avatars, prices, badges, two-line, grids, groups, nested) built from one option-row skeleton. Degenerate variants: segmented controls (27–29, 50) implement select semantics with plain buttons.

---

## currList1_Separator_specs

**URL:** https://sveltoui.dev/elements/separator · **Header:** "Separator — 1 component" · count verified (1/1).

### Demos (1 preview box with Preview + Code)

**General Separator 01** — SMALL — "Horizontal and vertical separators dividing a heading block from an inline link row"
Visual: centered block — bold `h4` "SveltoUI", muted paragraph "An open-source Svelte 5 component library.", a full-width horizontal divider, then an inline link row "Blog | Docs | Source" with thin vertical separators between links.
Code (~40 ln summarized): imports `Separator` from `$lib/components/elements/separator`; `div.flex` wrapper → `div.max-w-sm` (`h4` + `p`), `<Separator class="my-4" />` (horizontal), `<nav aria-label="Project links">` with three `<a>` separated by `<Separator orientation="vertical" />`; focus-visible rings on links.

### API reference (verbatim)

**Separator.Root** — "Visual content separator."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `class` (as className) | `string` | — |
| `data-slot` (as dataSlot) | `string` | `"separator"` |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
Single primitive; orientation via prop; token-based styling carries dark mode; the only page documenting a `data-slot` prop.

---

## currList1_Skeleton_specs

**URL:** https://sveltoui.dev/elements/skeleton · **Header:** "Skeleton — 2 components" · count verified (2/2).

### Demos (2 preview boxes; both have Preview + Code)

**General Skeleton 01** — SMALL — "Avatar and two text lines as a loading placeholder for a user card."
Visual: bordered card with circular shimmer avatar block + two shimmer text lines (⅔ and ½ width); `role="status" aria-label="Loading profile"`; sr-only "Loading profile…".
Code (31 ln summarized): imports `Skeleton`; three `<Skeleton aria-hidden="true" class="motion-reduce:animate-none …">`: `size-12 rounded-full`, `h-4 w-2/3`, `h-3 w-1/2` inside `rounded-lg border bg-card p-4 shadow-sm` card with `role="status"`.

**General Skeleton 02** — SMALL — "Media card loading placeholder with image, text lines and action rows."
Visual: 320px card — 160px image block, ¾-width title bar, full + half text lines, action row (wide button-shaped block + small square block); `role="status"` + sr-only.
Code (44 ln summarized): same import; blocks `h-[160px] w-full rounded-md`, `h-4 w-3/4`, `h-3 w-full`, `h-3 w-1/2`, `h-9 flex-1 rounded-md` + `size-9 rounded-md`, all `motion-reduce:animate-none aria-hidden`.

### API reference (verbatim)

**Skeleton.Root** — "Loading placeholder animation."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `class` (as className) | `string` | — |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
Purely presentational; shape/size via Tailwind utilities on `class`; every block `aria-hidden` + `motion-reduce:animate-none`; loading containers get `role="status"` + sr-only text.

---

## currList1_Stepper_specs

**URL:** https://sveltoui.dev/elements/stepper · **Header:** "Stepper — 17 components" · count verified (17/17: General Stepper 01–17).

**Notable anomaly:** this page has **no API reference section at all** — it ends after demo 17; no `Stepper.*` primitives are documented (verified after full scroll). The demos are all compositions of `Button` (+ occasionally Input/Label/Card) and lucide icons.

### Demos (17 preview boxes; all long-code → summarized; sizes: 10 = small, rest medium; install `npx shadcn-svelte@latest add https://sveltoui.dev/r/elements-stepper-GeneralStepperNN.json`)

| # | Demo (size) | Preview shows | Code summary |
|---|-------------|---------------|--------------|
| 01 | General Stepper 01 (M) | Horizontal numbered: 1 Account · 2 Workspace · 3 Invite team · 4 Done; completed filled, connectors tinted; Previous/Next | No Stepper import — hand-rolled; `Button`; `currentStep = $state(2)`; `ol > li` circles + `h-px` connectors; `aria-current="step"` |
| 02 | General Stepper 02 (M) | ✓ Account, ✓ Billing, ③ Review (ring highlight), ④ Done | adds `Check`; completed `bg-primary` + sr-only "Completed"; current `ring-4 ring-primary/15` |
| 03 | General Stepper 03 (M) | Vertical rail; ✓ Create account; current "Company profile" expanded into card panel; 2 pending | steps carry `label/description/body`; active `rounded-lg border bg-card p-4` panel; vertical `w-px` rail |
| 04 | General Stepper 04 (M) | Icon checkout: Account (user), Payment (credit-card), Shipping (package), Confirmed (check) | lucide icons; `size-12` circles; current `bg-primary/10 text-primary ring-4` |
| 05 | General Stepper 05 (M) | 4 clickable labels over a continuous progress bar; "STEP 3 OF 4 / Payment — Visa ending 4242 · $148.00 incl. tax" | `role="progressbar"` w/ aria-value*; fill via `transform: scaleX(progress)`; `$derived` |
| 06 | General Stepper 06 (M) | Compact dots (current enlarged); "STEP 2 OF 4 / Shipping"; content card "118 Kearny St, San Francisco" | dot `button`s `size-2.5`, current `scale-150 bg-primary` |
| 07 | General Stepper 07 (M) | Pill chips: ✓ Plan, ✓ Team, **Billing** (filled), Launch | pill buttons `rounded-full border px-4 py-2`; done chips show Check |
| 08 | General Stepper 08 (M) | Chevron/arrow segments (clip-path polygons): Personal info / Contact details (dark active) / Preferences / Review | states `bg-primary` / `bg-primary/10` / `bg-muted` |
| 09 | General Stepper 09 (M) | Two-line labels under small circles: Billing–Shipping–Payment–Review + descriptions | `Check` + `Circle` (dot for current); `text-[11px]` descriptions |
| 10 | General Stepper 10 (S) | Minimal: large "3/5" counter + 5 clickable tick bars, "Set schedule" | `text-4xl font-bold tabular-nums`; ticks `h-1.5 w-8 rounded-full` w/ aria-labels |
| 11 | General Stepper 11 (M) | 128px SVG progress ring ~33%, "2 / of 4" centered, "Configure build", "33% complete" | SVG two-circle progress (`stroke-dasharray/offset`, `role="progressbar"`); `CIRCUMFERENCE = 2π·40` |
| 12 | General Stepper 12 (M) | Failed step: ✓ Details, ✕ Verification (red), ③ Payment, ④ Complete + red alert "We could not verify your ID document…" | `Check` + `AlertCircle`; `getStepStatus()`; destructive circle/connector/label; `role="alert"` |
| 13 | General Stepper 13 (M) | Card tiles w/ check/number; active tile ringed + notch caret; panel "STEP 2 OF 4 Verify email — 6-digit code sent…" | grid of tile buttons; active `border-primary bg-primary/5 ring-1` + rotated-square caret |
| 14 | General Stepper 14 (M) | Slim rail: ✓ Draft — ● In review — ○ Published; partially filled `h-1` rail | absolute rail w/ `scaleX` fill; `size-6` node buttons |
| 15 | General Stepper 15 (M) | Form wizard: mini-stepper above form card (Street / City / ZIP inputs) | `Button` + `Input` + `Label`; per-step `fields` config (name/type/autocomplete); "Submit" on last |
| 16 | General Stepper 16 (M) | ✓ Upload, ⟳ Processing (spinner circle) + card "Matching rows against your chart of accounts." | `Check` + `Loader2`; `loading = $state(false)` + 1.5s `setTimeout`; `aria-busy` + `aria-live` panel; `$effect` cleanup |
| 17 | General Stepper 17 (M) | Breadcrumb-style: "✓ Account Setup › **Profile Details** › Preferences › Confirmation" + review card (dl grid); future steps locked | `Check` + `ChevronRight`; `Card` namespace (`Card.Root/Header/Title/…`); future steps `disabled` |

### API reference
**None.** Explicit finding: no API reference section, no `Stepper.*` primitive prop tables exist on the page.

### Patterns
All 17 demos are composition examples (Button/Input/Label/Card + lucide), not a dedicated primitive; `aria-current="step"`, `role="progressbar"`/`role="alert"` where relevant; `transition-colors duration-200 ease-out`; focus-visible rings; motion-reduce variants; Svelte 5 runes.

---

## currList1_Switch_specs

**URL:** https://sveltoui.dev/elements/switch · **Header:** "Switch — 15 components" · count verified (15/15: General Switch 01–12 then 14–16 — **13 does not exist**; its registry endpoint 404s; header count still 15).

### Demos (15 preview boxes; all have Preview + Code)

**01 · small — "Basic toggle switch built on the Switch primitive."**
```svelte
<script>
  import { Switch } from '$UI$/switch';
  let checked = $state(false);
</script>

<!-- Basic switch -->
<div class="flex items-center justify-center p-8">
  <Switch bind:checked aria-label="Enable two-factor authentication" />
</div>
```

**02 · small — "Switch paired with a label"**
```svelte
<script>
  import { Switch } from '$UI$/switch';
  import { Label } from '$UI$/label';
  let checked = $state(true);
</script>

<!-- Switch with label -->
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-3">
    <Switch id="switch02-notifications" bind:checked />
    <Label for="switch02-notifications" class="cursor-pointer">Product update emails</Label>
  </div>
</div>
```

**03 · small — "Switch with a supporting description"**
```svelte
<script>
  import { Switch } from '$UI$/switch';
  import { Label } from '$UI$/label';
  let checked = $state(true);
</script>

<!-- Switch with description -->
<div class="flex items-center justify-center p-8">
  <div class="flex w-full max-w-sm items-start justify-between gap-6">
    <div class="flex flex-col gap-1">
      <Label for="switch03-airplane" class="cursor-pointer">Airplane mode</Label>
      <span id="switch03-description" class="text-sm text-muted-foreground">
        Turns off Wi-Fi, Bluetooth and cellular data.
      </span>
    </div>
    <Switch
      id="switch03-airplane"
      bind:checked
      aria-describedby="switch03-description"
      class="mt-1"
    />
  </div>
</div>
```

| # | Demo (size) | Preview shows | Code summary |
|---|-------------|---------------|--------------|
| 04 | General Switch 04 (S) | Wide pill switch; thumb shows Check/X icon; "Automatic backups" | hand-rolled `role="switch"`; translating white thumb w/ lucide Check/X |
| 05 | General Switch 05 (S) | Two disabled switches: "Beta features" (off), "Audit logging" (on) | Verbatim below |
| 06 | General Switch 06 (S) | Mini switch (`h-4 w-8`) + xs label "Compact table density" | Verbatim below |
| 07 | General Switch 07 (S) | Oversized switch (`h-8 w-14`) + "Sync across devices" | Verbatim below |
| 08 | General Switch 08 (S) | Wide switch w/ cross-fading ON/OFF micro-labels; "Maintenance mode" | hand-rolled; two absolute `text-[10px]` spans toggling opacity |
| 09 | General Switch 09 (S) | Day/night switch: sky track + sun ⇄ slate track + moon; label "Light theme"/"Dark theme" | hand-rolled; `Sun`/`Moon` opacity cross-fade |
| 10 | General Switch 10 (S) | Square-cornered switch (`rounded-md` track, `rounded-sm` thumb); "Snap to grid" | Verbatim below |
| 11 | General Switch 11 (M) | "Notifications" card: three divided rows Email (on) / Push (off) / SMS (on) w/ descriptions | `Card` + `Switch` + `Label`; `$state` array, keyed `{#each}`, `bind:checked={settings[i].checked}` |
| 12 | General Switch 12 (S) | Three accent colors: Default (primary), Success (emerald-500), Info (blue-500) | hand-rolled; per-track class config + matching ring colors |
| 14 | General Switch 14 (S) | Idle "Saved" switch beside disabled 70%-opacity switch w/ spinner in thumb ("Saving…") | `Spinner` from `$UI$/spinner`; `aria-busy` + disabled |
| 15 | General Switch 15 (S) | Two 64×64 icon toggle tiles: Wi-Fi (on, primary-tinted, "ON") / Bluetooth (off, muted, "OFF") | lucide icons; `aria-pressed` tiles (not role=switch); active `border-primary bg-primary/10 text-primary` |
| 16 | General Switch 16 (M) | Monthly [switch] Yearly + "Save 20%" badge + price "$29" ⇄ "$278" | `Switch` + `Badge`; `price`/`period` via `$derived`; invisible-opacity badge transition |

**Verbatim code:**

```svelte
<!-- 05 Disabled switches -->
<script>
  import { Switch } from '$UI$/switch';
  import { Label } from '$UI$/label';
</script>
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-10">
    <div class="flex items-center gap-3">
      <Switch id="switch05-off" checked={false} disabled />
      <Label for="switch05-off" class="text-muted-foreground">Beta features</Label>
    </div>
    <div class="flex items-center gap-3">
      <Switch id="switch05-on" checked disabled />
      <Label for="switch05-on" class="text-muted-foreground">Audit logging</Label>
    </div>
  </div>
</div>
```

```svelte
<!-- 06 Small switch -->
<script>
  let checked = $state(true);
</script>
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-2">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby="switch06-label"
      onclick={() => (checked = !checked)}
      class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background {checked ? 'bg-primary' : 'bg-input'}"
    >
      <span
        class="pointer-events-none block h-3 w-3 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ease-out motion-reduce:transition-none {checked ? 'translate-x-[1.0625rem]' : 'translate-x-0.5'}"
      ></span>
    </button>
    <span id="switch06-label" class="text-xs font-medium">Compact table density</span>
  </div>
</div>
```

```svelte
<!-- 07 Large switch -->
<script>
  let checked = $state(true);
</script>
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby="switch07-label"
      onclick={() => (checked = !checked)}
      class="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background {checked ? 'bg-primary' : 'bg-input'}"
    >
      <span
        class="pointer-events-none block h-6 w-6 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ease-out motion-reduce:transition-none {checked ? 'translate-x-7' : 'translate-x-1'}"
      ></span>
    </button>
    <span id="switch07-label" class="text-base font-medium">Sync across devices</span>
  </div>
</div>
```

```svelte
<!-- 10 Square switch -->
<script>
  let checked = $state(true);
</script>
<div class="flex items-center justify-center p-8">
  <div class="flex items-center gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby="switch10-label"
      onclick={() => (checked = !checked)}
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-md border border-transparent shadow-sm transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background {checked ? 'bg-primary' : 'bg-input'}"
    >
      <span
        class="pointer-events-none block h-5 w-5 rounded-sm bg-background shadow-sm ring-0 transition-transform duration-200 ease-out motion-reduce:transition-none {checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}"
      ></span>
    </button>
    <span id="switch10-label" class="text-sm font-medium">Snap to grid</span>
  </div>
</div>
```

### API reference (verbatim; single primitive)

**Switch.Root** — "Toggle switch input with dark mode support."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `class` (as className) | `string` | — |
| `checked` (bind:) | `boolean` | `false` |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
Primitive composition (`Switch` + `bind:checked` — demos 01/02/03/05/11/16) vs hand-rolled `role="switch"` buttons (04/06/07/08/09/10/12/14) and `aria-pressed` tiles (15); universal `motion-reduce:transition-none`, `focus-visible:ring-2 ring-ring ring-offset-*`, token palette (`bg-primary`, `bg-input`, `bg-background`, `text-muted-foreground`); a11y via `aria-labelledby`, `aria-describedby`, `aria-busy`, `disabled`. Registry code uses `$UI$/` alias while on-page display shows `$lib/components/…` paths.

---

## currList1_Tabs_specs

**URL:** https://sveltoui.dev/elements/tabs · **Header:** "Tabs — 20 components" · count verified (20/20, all MEDIUM).

### Demos (20 preview boxes; all have Preview + Code; all code >25 lines → summarized)

| # | Demo | Preview shows | Code summary |
|---|------|---------------|--------------|
| 1 | General Tabs 01 | Underlined tabs Account/Password/Preferences; active gets `bg-primary` 2px bottom bar; panel "Account details… MEMBER SINCE MARCH 2023" | 105 ln, no imports. Hand-rolled `role="tablist"/tab/tabpanel`, `$state` activeTab, roving tabindex keydown (Arrow/Home/End), absolute underline span |
| 2 | General Tabs 02 | Pill tabs in `bg-muted rounded-lg` tray; active pill `bg-background shadow-sm`; stats card "18,432 sessions" + dl grid | 115 ln, no imports |
| 3 | General Tabs 03 | Underlined tabs w/ leading icons (Profile/Settings/Notifications); "Public profile" panel | 120 ln; lucide user/settings/bell |
| 4 | General Tabs 04 | Boxed segmented shipping-speed picker; active `bg-primary text-primary-foreground`; price + ETA card | 95 ln, no imports |
| 5 | General Tabs 05 | Issue detail tabs w/ count badges: Details / Comments(12) / History(5) + sr-only text | 140 ln; imports `Badge` from `$lib/components/elements/badge` |
| 6 | General Tabs 06 | Vertical tab column (General/Security/Advanced/Billing) + bordered pane "Northwind Studio · northwind.io" | 82 ln, no imports |
| 7 | General Tabs 07 | Icon-only segmented tabs (House/User/Settings/CircleHelp) w/ sr-only labels + live region "3 projects updated…" | 66 ln; lucide icons |
| 8 | General Tabs 08 | Write/Preview toggle over shared comment draft; textarea "Markdown supported", counter 68/500 | 78 ln, no imports |
| 9 | General Tabs 09 | Billing-cycle pills Monthly/Yearly; "$29 /month", "Billed monthly, cancel any time." | 67 ln; imports Badge |
| 10 | General Tabs 10 | Browser-style document tabs w/ per-tab X close + "+" new-tab; docs "Q3 roadmap.md", "onboarding-flow.fig" | 112 ln; lucide x/plus; `svelte-ignore a11y_no_noninteractive_tabindex`; WCAG 2.1.1 note |
| 11 | General Tabs 11 | Full-width underline tabs filtering task list (All/Active/Completed/Archived) + empty state | 83 ln, no imports |
| 12 | General Tabs 12 | Card-style payment tabs: Card/Bank/Wallet w/ icons; "Visa ending 4242 · $290.00" | 86 ln; lucide credit-card/building-2/wallet |
| 13 | General Tabs 13 | Sliding underline measured to active tab width (Overview/Features/Pricing/FAQ) | 106 ln, no imports; JS-measured indicator |
| 14 | General Tabs 14 | Vertical tabs w/ icons (Profile/Security/Notifications/Appearance); profile pane (email, timezone) | 116 ln; lucide user/lock/bell/palette |
| 15 | General Tabs 15 | Compact pills Day/Week/Month/Year above small bar chart; "9,417 +12.4%" | 74 ln, no imports |
| 16 | General Tabs 16 | Centered underline tabs switching social feed (For You/Following/Trending); posts list | 88 ln, no imports |
| 17 | General Tabs 17 | Filter tabs w/ icon + count badge over file list: All Files 128 / Documents 45 / Images 67 / Other 16 | 137 ln; Badge + lucide folder/file/image/file-text; `svelte-ignore a11y_…` |
| 18 | General Tabs 18 | Plan tabs w/ disabled "Team — Soon" option; "$24 per seat / month" + feature list | 110 ln; lucide check |
| 19 | General Tabs 19 | Terminal-window tabs: Input/Output/Logs; "✓ Resolved 4 files… Done in 1.84s" | 98 ln, no imports |
| 20 | General Tabs 20 | Horizontally scrollable tab bar w/ edge-aware ChevronLeft/Right arrows + underline indicator; "Reports — 6 scheduled" | 139 ln; lucide chevrons; `svelte-ignore a11y_…role` |

### API reference (verbatim; 4 primitives)

**Tabs.Root** — "Tabbed content navigation."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `value` (bind:) | `string` | `""` |
| `class` (as className) | `string` | — |
| `...restProps` | `Record<string, unknown>` | — |

**Tabs.Content** / **Tabs.List** — `ref` (bind:) · `class` · `...restProps` (identical tables).
**Tabs.Trigger** — "Tabbed content navigation with dark mode support." — same table as Content.

### Patterns
None of the 20 demos import `Tabs.Root` etc. — all hand-roll the WAI-ARIA tabs pattern (tablist/tab/tabpanel, `aria-selected`, `aria-controls`, roving tabindex, duplicated Arrow/Home/End handler). Token-only theming; `focus-visible:ring-2 ring-ring ring-offset-2`; `motion-reduce:transition-none` + `duration-200 ease-out`.

---

## currList1_Textarea_specs

**URL:** https://sveltoui.dev/elements/textarea · **Header:** "Textarea — 19 components" · count verified (19/19).

### Demos (19 preview boxes; all have Preview + Code)

**Demo 01 — Basic**
```svelte
<script>
  import { Textarea } from "$lib/components/elements/textarea";
  let value = $state('');
</script>

<!-- Basic textarea -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm">
    <Textarea
      id="message-basic"
      bind:value
      placeholder="Share a few details about your request…"
      rows="4"
      aria-label="Message"
      class="resize-y"
    />
  </div>
</div>
```

**Demo 02 — With label**
```svelte
<script>
  import { Textarea } from "$lib/components/elements/textarea";
  import { Label } from "$lib/components/elements/label";
  let value = $state('');
</script>

<!-- Textarea with label -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm space-y-2">
    <Label for="message">Message</Label>
    <Textarea
      id="message"
      bind:value
      placeholder="Let the team know what you need help with…"
      rows="4"
      class="resize-y"
    />
  </div>
</div>
```

**Demo 03 — With description**
```svelte
<script>
  import { Textarea } from "$lib/components/elements/textarea";
  import { Label } from "$lib/components/elements/label";
  let value = $state('Staff design engineer at Northwind. I build design systems and write about accessible UI.');
</script>

<!-- Textarea with description -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm space-y-2">
    <Label for="bio">Bio</Label>
    <Textarea
      id="bio"
      bind:value
      placeholder="Tell us about yourself…"
      rows="4"
      aria-describedby="bio-help"
      class="resize-y"
    />
    <p id="bio-help" class="text-xs leading-relaxed text-muted-foreground">
      A short bio shown on your public profile. Markdown links are supported.
    </p>
  </div>
</div>
```

**Demo 10 — Floating label**
```svelte
<script>
  let value = $state('');
</script>

<!-- Floating label textarea -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm">
    <div class="relative">
      <textarea
        id="floating"
        bind:value
        placeholder=" "
        rows="4"
        class="peer flex w-full resize-y rounded-md border border-input bg-background px-3 pb-2 pt-6 text-sm shadow-sm outline-none transition-[color,box-shadow] duration-200 placeholder:text-transparent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      ></textarea>
      <label
        for="floating"
        class="pointer-events-none absolute left-3 top-2 origin-left text-xs font-medium text-muted-foreground transition-all duration-200 ease-out peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-foreground"
      >
        Message
      </label>
    </div>
  </div>
</div>
```

**Demo 13 — Borderless**
```svelte
<script>
  let value = $state('');
</script>

<!-- Borderless textarea -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm space-y-2">
    <label for="borderless" class="text-sm font-medium leading-none">Notes</label>
    <textarea
      id="borderless"
      bind:value
      placeholder="Jot down anything from today's standup…"
      rows="4"
      class="flex w-full resize-none rounded-md bg-muted/60 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-150 placeholder:text-muted-foreground hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    ></textarea>
  </div>
</div>
```

**Demo 14 — Underlined**
```svelte
<script>
  let value = $state('');
</script>

<!-- Underlined textarea -->
<div class="flex items-center justify-center p-8">
  <div class="w-full max-w-sm space-y-1.5">
    <label for="underlined" class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
    <textarea
      id="underlined"
      bind:value
      placeholder="What does this workspace do?"
      rows="4"
      class="flex w-full resize-none border-b-2 border-input bg-transparent px-1 py-2 text-sm leading-relaxed outline-none transition-colors duration-200 placeholder:text-muted-foreground hover:border-muted-foreground/50 focus-visible:border-primary"
    ></textarea>
  </div>
</div>
```

| # | Demo (size) | Preview / purpose | Code summary |
|---|-------------|-------------------|--------------|
| 4 | General Textarea 04 (S) | "Product description", live counter "113 / 200 characters" w/ limit warning | 35 ln; `Textarea`+`Label`; `$state` count |
| 5 | General Textarea 05 (S) | "Feedback" invalid state + red "must be at least 10 characters" | 28 ln; lucide `circle-alert`, `aria-invalid` |
| 6 | General Textarea 06 (S) | Disabled "Comments" + "Commenting closed after this thread was archived" | 27 ln; lucide `lock` |
| 7 | General Textarea 07 (M) | Comment box + **Post comment** Button disabled while empty | 30 ln; + `Button` |
| 8 | General Textarea 08 (S) | Auto-growing textarea ("The field grows as you type — no scrollbar.") | 33 ln; auto-resize oninput |
| 9 | General Textarea 09 (M) | Formatting toolbar Bold/Italic/Underline/Bullets/Link above raw textarea | 66 ln; lucide bold/italic/underline/list/link; raw `<textarea>` |
| 11 | General Textarea 11 (S) | "Reason for refund *" + required helper | 30 ln; `aria-required` |
| 12 | General Textarea 12 (M) | Chat composer: Paperclip/Add image/Add emoji + Send | 50 ln; `Button` + lucide paperclip/image/smile/send |
| 15 | General Textarea 15 (S) | "Essay · 26 words · 74 to go" minimum-length counter | 34 ln; `Textarea`+`Label` |
| 16 | General Textarea 16 (S) | Validated success: "Thanks — your review meets our guidelines…" | 29 ln; lucide `circle-check` |
| 17 | General Textarea 17 (M) | Split markdown editor + live "MARKDOWN PREVIEW" pane, "30 words" | 100 ln; `{#if}` tab state |
| 18 | General Textarea 18 (M) | Active-editing indicator: "Message · Sends to #eng-releases · 151 left" | 48 ln; `Label`+`Textarea` |
| 19 | General Textarea 19 (M) | Voice note: mic toggle + live timer + transcription state | 77 ln; `Button` + lucide mic/square |

### API reference (verbatim; single primitive)

**Textarea.Root** — "Multi-line text input with dark mode support."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `value` (bind:) | — | — |
| `class` (as className) | `string` | — |
| `data-slot` (as dataSlot) | `string` | `"textarea"` |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
Most demos compose the `Textarea` primitive (`bind:value` + `Label`); stylistic variants (floating label, borderless, underlined, toolbar, composer) drop to a raw `<textarea>` with Tailwind. Helper idiom: `text-xs text-muted-foreground`; error/success rows pair lucide status icon + message; disabled = opacity + Lock hint; counters live-bound; `resize-y`/`resize-none` per demo.

---

## currList1_Tooltip_specs

**URL:** https://sveltoui.dev/elements/tooltip · **Header:** "Tooltip — 12 components" · count verified (12/12).

### Demos (12 preview boxes; all have Preview + Code; code summarized)

| # | Demo (size) | Preview shows | Code summary |
|---|-------------|---------------|--------------|
| 1 | General Tooltip 01 (S) | "Deploy to production" button; dark tooltip above: "Ships build #482 to app.acme.io" w/ bottom arrow | 33 ln; `Button` only. Hand-rolled `role="tooltip"` `bg-foreground text-background`, border-trick arrow (`border-t-foreground`), `animate-in fade-in-0 zoom-in-95`; hover+focus open, Escape closes, `aria-describedby`; starts open |
| 2 | General Tooltip 02 (L) | Four triggers Top/Left/Right/Bottom popping tooltips on that side | 99 ln; 4 positioned wrappers |
| 3 | General Tooltip 03 (M) | Circle-help icon button; rich tooltip "About the monthly spend cap" + body | 41 ln; lucide `circle-help` + Button |
| 4 | General Tooltip 04 (M) | "Copy API key"; tooltip + copied state (Copy→Check icons) | 55 ln; lucide copy/check; `onDestroy` timer reset |
| 5 | General Tooltip 05 (M) | Hover "@maya.chen": avatar chip "MC", "Maya Chen — Staff Engineer, Platform", "Joined March 2021 · Berlin" | 47 ln; rich-content tooltip |
| 6 | General Tooltip 06 (M) | Mini toolbar Bold/Italic/Underline/Strikethrough; tooltips incl. kbd "Bold · Ctrl+B" | 53 ln; lucide icons |
| 7 | General Tooltip 07 (S) | "Invite teammates" trigger; light popover-style tooltip "3 of 10 seats remaining on Team" | 38 ln; `bg-popover` + border (light surface idiom) |
| 8 | General Tooltip 08 (M) | Three colored variants: Info (inverted), Success ("Deploy passed", green), Error (red) | 66 ln |
| 9 | General Tooltip 09 (M) | Wide multiline tooltip: "Terms & Conditions · Terms of Service v4.2 · Effective 1 May 2026…" | 37 ln; `whitespace-normal`/max-width |
| 10 | General Tooltip 10 (M) | "Archive project" → tooltip after 500ms hover delay: "Hidden from the sidebar, restorable for 30 days" | 54 ln; `onMount` delay timers + cleanup |
| 11 | General Tooltip 11 (S) | "Export CSV" → "Downloads 1,248 rows", no arrow glyph | 33 ln; arrowless variant |
| 12 | General Tooltip 12 (M) | Two destructive actions w/ leading icons: "Rotate key — New key is active immediately" (Info), "Delete workspace — This action cannot be undone" (TriangleAlert) | 65 ln; lucide info/triangle-alert |

### API reference (verbatim; 2 primitives)

**Tooltip.Content** — "Informational tooltip on hover."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `class` (as className) | `string` | — |
| `sideOffset` | `number` | `0` |
| `side` | `string` | `"top"` |
| `children` | `Snippet` | — |
| `arrowClasses` | — | — |
| `...restProps` | `Record<string, unknown>` | — |

**Tooltip.Trigger** — "Informational tooltip on hover."

| Prop | Type | Default |
|---|---|---|
| `ref` (bind:) | `HTMLElement \| null` | `null` |
| `...restProps` | `Record<string, unknown>` | — |

### Patterns
API documents `Tooltip.Content`/`Tooltip.Trigger` (`side`, `sideOffset`, `children`, `arrowClasses`), but every demo hand-rolls: `role="tooltip"`, `aria-describedby`, hover/focus open, Tailwind positioning (`bottom-full left-1/2 -translate-x-1/2 mb-2` for top, etc.). Two surface idioms: inverted (`bg-foreground text-background`) and light popover (`bg-popover text-popover-foreground border-border`); arrow = rotated border triangle; `motion-reduce:animate-none`.

---

## currList1_Dock_specs

**URL:** https://sveltoui.dev/elements/dock · **Header:** "Dock — 2 components" · count verified (2/2).
**No API reference section exists on this page** (no API heading, no `Dock.*` prop tables) — explicit finding.

### Demos (2 preview boxes; both have Preview + Code)

**General Dock 01** — small — "MacOS-style dock navigation."
Visual: centered floating glass dock bar — `nav[aria-label="Dock"]` `rounded-2xl border border-border bg-card/80 px-3 py-2 shadow-lg backdrop-blur-xl`; five icon buttons (Finder/House, Spotlight/Search, Mail, Calendar, Settings); small floating labels above items on hover/focus ("Finder", "Spotlight"…) in popover colors; bottom-origin magnification — hovered scales to 1.3, neighbors 1.15, others 1.
Code (52 ln summarized): imports `{ Home, Search, Mail, Calendar, Settings } from '@lucide/svelte'`; `items` array; `let hoveredIndex = $state(-1)`; `scaleFor(i)` magnification fn (1.3/1.15/1); each item = `div.group` w/ hover-label `<span>` (`bg-popover text-popover-foreground border-border opacity-0 group-hover:opacity-100`, `aria-hidden`) + `<button aria-label>` `origin-bottom` with hover/focus/blur handlers; `motion-reduce:transition-none`.

**General Dock 02** — medium — "Mobile bottom dock navigation"
Visual: mock phone card (`max-w-sm rounded-xl border bg-card shadow-sm`): content pane (`bg-muted/30`) whose heading switches to active tab (default "Home", "12 new posts from people you follow."), fixed bottom nav (`border-t border-border bg-card`) with five icon+label items: Home, Discover, Create (plus-circle), Activity (heart), Profile; active = `text-primary` + `aria-current="page"`.
Code (56 ln summarized): imports `{ Home, Search, PlusCircle, Heart, User } from '@lucide/svelte'`; `let active = $state(0)`; per-tab content via `{#if active === n}`; `<nav aria-label="Primary">` `justify-around` buttons (icon + `text-xs` label), `aria-current`, focus rings, motion-reduce guards.

### API reference
**None.** Dock is demos-only; no primitives documented.

### Patterns
Pure snippet compositions: `nav` landmark + `aria-label`; icon-only buttons with `aria-label` (01) or icon+text with `aria-current="page"` (02); theming through tokens incl. translucency (`bg-card/80`, `backdrop-blur-xl`); magnification via rune function + inline transforms rather than CSS-only.

---

# Cross-benchmark summary (currList1)

## Verification matrix

| Category | Header count | Demos found | Match | API reference |
|----------|-------------|-------------|-------|---------------|
| Accordion | 20 | 20 | ✅ | 4 primitives (Root/Item/Trigger/Content) |
| Alert | 7 | 7 | ✅ | 3 primitives (Root/Title/Description) |
| Badge | 9 | 9 | ✅ | 1 primitive (`badge`) |
| Button | 50 | 50 | ✅ | 1 primitive (Root) |
| Card | 2 | 2 | ✅ | 7 primitives (Root/Header/Title/Description/Content/Action/Footer) |
| Checkbox | 20 | 20 | ✅ | 1 primitive (Root) |
| Dialog | 21 | 21 | ✅ | 8 primitives |
| Dock | 2 | 2 | ✅ | **None** |
| Input | 57 | 57 | ✅ | 1 primitive (Root) |
| Select | 51 | 51 | ✅ | 10 primitives |
| Separator | 1 | 1 | ✅ | 1 primitive (Root) |
| Skeleton | 2 | 2 | ✅ | 1 primitive (Root) |
| Stepper | 17 | 17 | ✅ | **None** |
| Switch | 15 | 15 | ✅ | 1 primitive (Root) |
| Tabs | 20 | 20 | ✅ | 4 primitives (Root/List/Trigger/Content) |
| Textarea | 19 | 19 | ✅ | 1 primitive (Root) |
| Tooltip | 12 | 12 | ✅ | 2 primitives (Content/Trigger) |

Registry numbering anomalies: Button files skip 27/32/35/36 (50 files); Input skips 31/35/45/46 (57 files incl. 2 Glasmorphism); Switch skips 13 (15 files); Stepper complete 01–17.

## Distinctive API props per category

| Category | Distinctive props |
|----------|-------------------|
| Accordion | Root `value` (bind); Trigger `level` (number, 3) |
| Alert | Root `variant`: `default \| destructive` |
| Badge | `variant` (4), `status` (boolean), `href` (link mode) |
| Button | `variant` (6: default/destructive/outline/secondary/ghost/link), `size` (6: default/sm/lg/icon/icon-sm/icon-lg), `href`, `type` |
| Card | Root `as` (element override, default `div`) |
| Checkbox | `checked` (bind), `indeterminate` (bind) |
| Dialog | Content `showCloseButton` (true), `portalProps` |
| Input | `value`/`files` (bind), `size` (sm/default/lg), `data-slot` |
| Select | Content `sideOffset` (4) + `preventScroll` (true); Item `value`/`label`; Trigger `size`; Value `placeholder` |
| Separator | `data-slot` |
| Skeleton | — (ref/class only) |
| Switch | `checked` (bind) |
| Tabs | Root `value` (bind, default `""`) |
| Textarea | `value` (bind), `data-slot` |
| Tooltip | Content `side` ("top"), `sideOffset` (0), `arrowClasses` |

## Site-wide conventions observed across all 17 pages

1. **Copy-paste demos + thin primitives.** The demos rarely consume the documented primitives; they are self-contained Svelte 5 snippets (registry: `npx shadcn-svelte@latest add https://sveltoui.dev/r/…json`) using Tailwind semantic tokens (`bg-primary`, `bg-card`, `bg-popover`, `bg-muted`, `text-muted-foreground`, `border-input`, `ring-ring`, `bg-accent`, `bg-destructive`).
2. **Dark mode first-class:** previews load with `&theme=dark`; per-card light/dark toggle; severity/status colors use light/dark tint pairs (`bg-X-50 text-X-800` + `dark:bg-X-500/10 dark:text-X-500`).
3. **Svelte 5 runes everywhere:** `$state`, `$derived`, `$effect`, `bind:checked`/`bind:value`; lifecycle via `onMount`/`onDestroy` where needed.
4. **Accessibility discipline:** `aria-expanded`/`aria-controls`/`aria-selected`/`aria-pressed`/`aria-checked` (incl. `mixed`)/`aria-current`/`aria-invalid`/`aria-busy`/`aria-live="polite"`/`sr-only`; focus-visible rings with offset; hand-rolled ARIA patterns (combobox, tabs, switches, tooltips) duplicated per demo.
5. **Motion:** 150–200ms `ease-out` color/transform transitions; `motion-reduce:*` guards on every animation; enter animations via `animate-in fade-in-0 zoom-in-95` or svelte `fly`.
6. **Icons:** per-symbol imports from `@lucide/svelte/icons/*` (`@lucide/svelte` namespace imports in Dock demos).
7. **Agent-oriented distribution:** per-demo "Copy for AI" prompt button, per-file registry JSON, site-wide Claude MCP setup command, per-category filter search.

## Benchmark observations vs our library (fractalcodex)

- **Coverage shape:** sveltoui is demo-volume-first (282 demos across currList1 categories; Button 50, Input 57, Select 51) with minimal primitives per category; fractalcodex is component-first (each component a single documented API + one live preview). The benchmark value is in the *variant matrix*: which states/variants each of our components should offer to reach parity (e.g., Button: 6 variants × 6 sizes incl. icon sizes + loading/disabled/social/split patterns; Input: prefix/suffix/OTP/tags/combobox/floating-label families; Select: combobox ARIA pattern + rich option rows).
- **Gaps on our side worth flagging:** no dedicated variant families for loading buttons, split buttons, toggle groups, OTP/tag inputs, or searchable/nested selects; Stepper and Dock on sveltoui ship **no API at all** (demos-only), whereas our Stepper/MacosDock are real components with APIs — a differentiation point.
- **API style:** sveltoui primitives are shadcn-svelte-style `X.Root` composites with `ref` bind + `...restProps` spread and Snippet children; our components are single-tag APIs with explicit props (`variant`, `size`, `bind:*`). Both support `class` passthrough.
- **Naming note:** sveltoui previews default to dark; our docs previews follow the app theme. Any parity work should treat their "variant" as our `variant` prop values plus the composed patterns (groups, addons, chips) that we would cover via recipes rather than prop explosions.
