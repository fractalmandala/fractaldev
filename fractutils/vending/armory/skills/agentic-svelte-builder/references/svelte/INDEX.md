# Modern Svelte 5 Native Components & SvelteKit Integration

This directory contains component implementation guides designed for **Svelte 5** and **SvelteKit**. While basic HTML/CSS handles static display, modern web applications require rich interactivity, controlled states, keyboard accessibility (WAI-ARIA), animation, and SvelteKit routing integration.

These components utilize **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$bindable`, `$props`), Svelte Context (`setContext`/`getContext`), SvelteKit features (`page`, `goto`), TypeScript, and **`fractals-styler` + CUBE CSS** styling.

---

## Component Index (24 Modern Svelte 5 Components)

| Component | Documentation File | Svelte 5 & SvelteKit Native Features |
| :--- | :--- | :--- |
| **Accordion** | [`accordion.md`](./accordion.md) | Controlled open state `$bindable()`, Svelte context, height transitions |
| **Alert Dialog** | [`alert-dialog.md`](./alert-dialog.md) | Confirmation promise resolution, focus trap, Escape key handling |
| **Calendar** | [`calendar.md`](./calendar.md) | Month math `$derived()`, multi-date & range selecting `$state()` |
| **Carousel** | [`carousel.md`](./carousel.md) | Active index `$state()`, auto-play `$effect()`, prev/next slide controls |
| **Combobox / Command** | [`combobox.md`](./combobox.md) | Search filter `$derived()`, keyboard traversal `$state()`, ARIA listbox |
| **Context Menu** | [`context-menu.md`](./context-menu.md) | Pointer position `$state({ x, y })`, `$effect()` window click dismissal |
| **Data Table** | [`data-table.md`](./data-table.md) | Sorting, filtering, selection `$state()`, `$derived()` view pagination |
| **Date Picker** | [`date-picker.md`](./date-picker.md) | Popover toggle `$state()`, input date parsing, calendar sync |
| **Dialog** | [`dialog.md`](./dialog.md) | Controlled `$bindable(open)`, scroll lock `$effect()`, focus management |
| **Drawer / Sheet** | [`drawer.md`](./drawer.md) | Controlled `$bindable(open)`, swipe gestures, backdrop blur |
| **Dropdown Menu** | [`dropdown-menu.md`](./dropdown-menu.md) | Active item index `$state()`, ARIA menu keyboard arrow navigation |
| **Hover Card** | [`hover-card.md`](./hover-card.md) | Hover intent delay `$effect()`, mouseenter/mouseleave state |
| **Input OTP** | [`input-otp.md`](./input-otp.md) | Auto-advancing input array `$effect()`, clipboard paste splitting |
| **Menubar** | [`menubar.md`](./menubar.md) | Multi-level menu active index `$state()`, top-level arrow navigation |
| **Navigation Menu** | [`navigation-menu.md`](./navigation-menu.md) | SvelteKit `page.url.pathname` active route matching & mega-menu |
| **Pagination** | [`pagination.md`](./pagination.md) | SvelteKit `goto()` SPA navigation, query param `$derived()` state |
| **Popover** | [`popover.md`](./popover.md) | Controlled `$bindable(open)`, `$effect()` click-outside listener |
| **Resizable** | [`resizable.md`](./resizable.md) | Drag handle pointer tracking `$state()`, panel ratio `$derived()` |
| **Select (Custom)** | [`select.md`](./select.md) | Custom listbox, keyboard selection, value `$bindable()` |
| **Sidebar** | [`sidebar.md`](./sidebar.md) | SvelteKit active route tracking, `localStorage` `$effect()` persistence |
| **Sonner / Toast** | [`toast.md`](./toast.md) | Notification queue `$state([])`, programmatic `toast()` helper, auto-dismiss |
| **Tabs** | [`tabs.md`](./tabs.md) | Controlled tab `$bindable(value)`, active indicator position `$derived()` |
| **Toggle Group** | [`toggle-group.md`](./toggle-group.md) | Single/multi-select value `$bindable()`, keyboard option cycling |
| **Tooltip** | [`tooltip.md`](./tooltip.md) | Show/hide delay `$effect()`, accessible focus & hover management |
