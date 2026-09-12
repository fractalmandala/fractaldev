---
name: 'agentic-svelte-builder'
description: 'Progressive discovery router for constructing Svelte 5 components using fractalstyler2. Invoke when user asks to build any Svelte component or page or layout.'
---

# Agentic Svelte Builder

The **Agentic Svelte Builder** skill equips AI agents with a progressive discovery pipeline to instantly locate, build, and style UI components using **Svelte 5 Runes** with **fractalstyler2** SASS styling.

All component reference files live inside this skill's **`references/`** folder.

For cross-skill composition, use the machine-readable
[`references/SKILL_ROUTING.json`](./references/SKILL_ROUTING.json) and the concise
[`references/SKILL_ROUTING.md`](./references/SKILL_ROUTING.md). The builder is the entry
point; conditional skills are activated only when the request or target workspace
requires them.

---

## 0. Workspace preflight and qualification gate

Before editing, establish the target project's actual boundaries. Do not treat a
component recipe as permission to replace a route, invent a styling system, or write
files outside the requested workspace.

1. Resolve the target file and its nearest `AGENTS.md`.
2. Read the target file, its adjacent styles/components, the project `README.md`, and
   the relevant `package.json` scripts before choosing an implementation pattern.
3. Identify the framework, Svelte version, styling system, file-extension conventions,
   and required verification commands from the project itself. 
4. For styling local project rules override this skill's generic examples unless the user has explicitly asked to use `fractalstyler` or `fractalstyler2` - in which case that overrides all local styling classes and rules.
4. State the bounded change surface before implementation. Preserve existing routes,
   layouts, imports, and working structure unless the prompt explicitly authorizes a
   replacement.
5. Use the project's established extension and location conventions. Do not create
   root-level styles, `.js` files, or new dependencies when the project uses
   co-located styles, `.ts`, or an existing component system.

If the target cannot be resolved or the project contract is unclear, stop and report
the ambiguity before editing. A polished component in the wrong location is a failed
task.

## Component Direct Lookup Index

| Component Intent Key | Zero-JS / Pure CSS Path | Svelte 5 Rune Path | Primary CUBE Classes |
| :--- | :--- | :--- | :--- |
| **accordion** | [`references/accordion.md`](./references/accordion.md) | [`references/svelte/accordion.md`](./references/svelte/accordion.md) | `[ accordion ] [ box w100 ] [ radius8 bdr ]` |
| **alert** | [`references/alert.md`](./references/alert.md) | N/A (Static HTML) | `[ alert ] [ row xtop gap12 ] [ pad16 radius8 bdr ]` |
| **alert-dialog** | [`references/dialog.md`](./references/dialog.md) | [`references/svelte/alert-dialog.md`](./references/svelte/alert-dialog.md) | `[ alert-dialog ] [ box maxw500 ] [ pad24 radius12 bdr ]` |
| **aspect-ratio** | [`references/aspect-ratio.md`](./references/aspect-ratio.md) | N/A (Static CSS) | `[ aspect-ratio ] [ w100 position-relative ]` |
| **avatar** | [`references/avatar.md`](./references/avatar.md) | N/A (Static HTML) | `[ avatar ] [ row xcenter ycenter ] [ radiusfull ]` |
| **badge** | [`references/badge.md`](./references/badge.md) | N/A (Static HTML) | `[ badge ] [ row ycenter ] [ pad4 padleft10 radiusfull ]` |
| **breadcrumb** | [`references/breadcrumb.md`](./references/breadcrumb.md) | N/A (Static HTML) | `[ breadcrumb__list ] [ row ycenter gap8 text-sm ]` |
| **button** | [`references/button.md`](./references/button.md) | N/A (Callback Prop) | `[ button ] [ row ycenter xcenter gap8 ] [ radius6 bold ]` |
| **button-group** | [`references/button-group.md`](./references/button-group.md) | N/A (Static Flex) | `[ button-group ] [ row ycenter ]` |
| **calendar** | N/A (JS Required) | [`references/svelte/calendar.md`](./references/svelte/calendar.md) | `[ calendar ] [ box maxw320 ] [ pad16 radius8 bdr ]` |
| **card** | [`references/card.md`](./references/card.md) | N/A (Static HTML) | `[ card ] [ box w100 ] [ radius8 bdr ]` |
| **carousel** | [`references/carousel.md`](./references/carousel.md) | [`references/svelte/carousel.md`](./references/svelte/carousel.md) | `[ carousel-track ] [ row gap16 padbot8 ]` |
| **checkbox** | [`references/checkbox.md`](./references/checkbox.md) | N/A (Native Input) | `[ checkbox ] [ row ycenter gap8 text-sm ]` |
| **collapsible** | [`references/collapsible.md`](./references/collapsible.md) | [`references/svelte/accordion.md`](./references/svelte/accordion.md) | `[ collapsible ] [ box w100 ] [ radius6 bdr ]` |
| **combobox** / **command** | N/A (JS Required) | [`references/svelte/combobox.md`](./references/svelte/combobox.md) | `[ combobox ] [ box w100 position-relative ]` |
| **context-menu** | N/A (JS Required) | [`references/svelte/context-menu.md`](./references/svelte/context-menu.md) | `[ context-menu ] [ box pad6 radius8 bdr position-fixed ]` |
| **data-table** | N/A (JS Required) | [`references/svelte/data-table.md`](./references/svelte/data-table.md) | `[ data-table-container ] [ box w100 gap16 ]` |
| **date-picker** | N/A (JS Required) | [`references/svelte/date-picker.md`](./references/svelte/date-picker.md) | `[ date-picker ] [ box position-relative ]` |
| **dialog** / **modal** | [`references/dialog.md`](./references/dialog.md) | [`references/svelte/dialog.md`](./references/svelte/dialog.md) | `[ modal-container ] [ box maxw500 ] [ pad24 radius12 bdr ]` |
| **drawer** / **sheet** | [`references/drawer.md`](./references/drawer.md) | [`references/svelte/drawer.md`](./references/svelte/drawer.md) | `[ drawer ] [ width360 maxw100 h100 ]` |
| **dropdown-menu** | [`references/dropdown-menu.md`](./references/dropdown-menu.md) | [`references/svelte/dropdown-menu.md`](./references/svelte/dropdown-menu.md) | `[ dropdown-menu ] [ pad6 radius8 bdr minw180 ]` |
| **empty** | [`references/empty.md`](./references/empty.md) | N/A (Static HTML) | `[ empty ] [ box xcenter ycenter ] [ pad48 radius12 ]` |
| **field** | [`references/field.md`](./references/field.md) | N/A (Static HTML) | `[ field ] [ box gap6 marginbot20 ]` |
| **hover-card** | [`references/hover-card.md`](./references/hover-card.md) | [`references/svelte/hover-card.md`](./references/svelte/hover-card.md) | `[ hover-card-popover ] [ pad16 radius8 bdr width280 ]` |
| **input** | [`references/input.md`](./references/input.md) | N/A (Native Input) | `[ input ] [ w100 pad8 padleft12 radius6 bdr text-sm ]` |
| **input-group** | [`references/input-group.md`](./references/input-group.md) | N/A (Static Flex) | `[ input-group ] [ row ycenter w100 ]` |
| **input-otp** | N/A (JS Required) | [`references/svelte/input-otp.md`](./references/svelte/input-otp.md) | `[ input-otp ] [ row ycenter gap8 ]` |
| **item** | [`references/item.md`](./references/item.md) | N/A (Static HTML) | `[ item ] [ row ycenter gap12 ] [ pad12 radius6 ]` |
| **kbd** | [`references/kbd.md`](./references/kbd.md) | N/A (Static Tag) | `[ kbd ] [ row ycenter xcenter ] [ pad2 padleft6 radius4 bdr ]` |
| **label** | [`references/label.md`](./references/label.md) | N/A (Static Tag) | `[ label ] [ row ycenter gap4 text-sm bold ]` |
| **menubar** | N/A (JS Required) | [`references/svelte/menubar.md`](./references/svelte/menubar.md) | `[ menubar ] [ row ycenter gap4 pad4 radius8 bdr ]` |
| **navigation-menu** | [`references/navigation-menu.md`](./references/navigation-menu.md) | [`references/svelte/navigation-menu.md`](./references/svelte/navigation-menu.md) | `[ nav-menu__list ] [ row ycenter gap16 ]` |
| **pagination** | [`references/pagination.md`](./references/pagination.md) | [`references/svelte/pagination.md`](./references/svelte/pagination.md) | `[ pagination__list ] [ row ycenter gap4 ]` |
| **popover** | [`references/popover.md`](./references/popover.md) | [`references/svelte/popover.md`](./references/svelte/popover.md) | `[ popover ] [ pad16 radius8 bdr maxw320 ]` |
| **progress** | [`references/progress.md`](./references/progress.md) | N/A (Native Tag) | `[ progress ] [ w100 height10 radiusfull ]` |
| **radio-group** | [`references/radio-group.md`](./references/radio-group.md) | N/A (Native Radio) | `[ radio-group ] [ box ]` |
| **resizable** | N/A (JS Required) | [`references/svelte/resizable.md`](./references/svelte/resizable.md) | `[ resizable-container ] [ row w100 h100 ]` |
| **scroll-area** | [`references/scroll-area.md`](./references/scroll-area.md) | N/A (CSS Overflow) | `[ scroll-area ] [ box w100 padright4 ]` |
| **select** | [`references/select.md`](./references/select.md) | [`references/svelte/select.md`](./references/svelte/select.md) | `[ custom-select ] [ w100 pad8 radius6 bdr text-sm ]` |
| **separator** | [`references/separator.md`](./references/separator.md) | N/A (Static Tag) | `[ separator ] [ margin0 ]` |
| **sidebar** | [`references/sidebar.md`](./references/sidebar.md) | [`references/svelte/sidebar.md`](./references/svelte/sidebar.md) | `[ sidebar ] [ box width260 h100 ]` |
| **skeleton** | [`references/skeleton.md`](./references/skeleton.md) | N/A (CSS Shimmer) | `[ skeleton ] [ radius6 ]` |
| **slider** | [`references/slider.md`](./references/slider.md) | N/A (Native Range) | `[ slider ] [ w100 height6 radiusfull ]` |
| **spinner** | [`references/spinner.md`](./references/spinner.md) | N/A (SVG Animation) | `[ spinner ] [ width24 height24 ]` |
| **switch** | [`references/switch.md`](./references/switch.md) | N/A (Native Switch) | `[ switch ] [ row ycenter gap8 text-sm ]` |
| **table** | [`references/table.md`](./references/table.md) | N/A (Static Table) | `[ table ] [ w100 text-sm ]` |
| **tabs** | [`references/tabs.md`](./references/tabs.md) | [`references/svelte/tabs.md`](./references/svelte/tabs.md) | `[ tabs ] [ box ]` |
| **textarea** | [`references/textarea.md`](./references/textarea.md) | N/A (Native Tag) | `[ textarea ] [ w100 pad10 radius6 bdr text-sm ]` |
| **toast** / **sonner** | N/A (JS Required) | [`references/svelte/toast.md`](./references/svelte/toast.md) | `[ toast-container ] [ box gap8 position-fixed ]` |
| **toggle** | [`references/toggle.md`](./references/toggle.md) | N/A (Native Input) | `[ toggle ] [ row ycenter ]` |
| **toggle-group** | [`references/toggle-group.md`](./references/toggle-group.md) | [`references/svelte/toggle-group.md`](./references/svelte/toggle-group.md) | `[ toggle-group ] [ row ycenter pad4 radius8 ]` |
| **tooltip** | [`references/tooltip.md`](./references/tooltip.md) | [`references/svelte/tooltip.md`](./references/svelte/tooltip.md) | `[ tooltip-wrapper ] [ position-relative ]` |
| **typography** | [`references/typography.md`](./references/typography.md) | N/A (Static Tags) | `[ typography ] [ margin0 text-sm ]` |

---

## 3. CUBE CSS & Fractals-Styler Rules

When outputting Svelte markup:

1. **Bracket Grouping**: Enforce `class="[ block ] [ layout ] [ utilities ]"`.
   Example: `class="[ card ] [ row ycenter gap12 ] [ pad16 radius8 bdr ]"`.
2. **Exception Attributes**: State/variant changes MUST use `data-variant="..."` or `data-state="..."` instead of modifier classes.
3. **External stylesheets**: Keep component markup in `*.svelte` examples and place custom styling in the adjacent indented `*.sass` example (single-tab indentation, no braces, no semicolons). Use semantic attributes such as `data-state` and `aria-expanded` for state selectors.

---

## 4. Verification is broader than `pnpm check`

Never complete a task solely because `pnpm check` passes. Static checks can be green
while the dev server returns a 500, a route fails during rendering, or the browser
logs runtime errors.

For any page, route, component, layout, styling, or browser-visible change:

1. Run the project's type/template check (`pnpm check` or its documented equivalent).
2. Run the project's build when the change can affect production rendering.
3. Start the dev or preview server and exercise every affected route in a browser or
   browser-capable test harness.
4. Inspect the browser console and server output. The qualified result must have no
   uncaught exceptions, failed module loads, hydration errors, unexpected 4xx/5xx
   responses, or missing required assets.
5. Record the exact routes exercised, the commands used, and the console/server result
   separately from the static-check result.

If browser automation is unavailable, say `browser verification: not run`; do not
convert that gap into a passing claim. A console error, route 500, or unverified
browser result makes the task `not-qualified` or `blocked`, even when `pnpm check`
passes.

The final receipt must distinguish:

- static verification (`check`, typecheck, lint),
- build verification (production compilation), and
- runtime verification (route response, rendered page, browser console).

Use `ship` only when all required layers pass. Use `fix-first` when the runtime issue
is bounded and actionable; use `rethink` when the target, architecture, or project
boundary was misunderstood.
