---
id: theme-toggle-component
title: ThemeToggle Component Reference
type: design
tags: [components, toggle, dark-mode, light-mode, svelte5]
summary: Standalone Sun/Moon quick toggle button component for compact toolbars and navigation bars.
relates_to: [theme-picker-component, state-and-reactivity]
source: src/lib/components/ThemeToggle.svelte
updated: 2026-08-28
---

# ThemeToggle Component Reference

[`ThemeToggle.svelte`](../../src/lib/components/ThemeToggle.svelte) is a lightweight, standalone button component designed for compact headers, toolbars, or floating utility bars where only binary Light/Dark mode toggling is required without the full theme drawer.

---

## 🎯 Functional Specification

- **Role**: Toggles between Light mode and Dark mode with one click.
- **Icon Feedback**: Dynamically displays [`Sun.svelte`](../../src/lib/icons/Sun.svelte) when the active theme is Dark, and [`Moon.svelte`](../../src/lib/icons/Moon.svelte) when the active theme is Light.
- **Accessibility**: Includes dynamic `aria-label` and `title` attributes reflecting the upcoming target mode ("Switch to Light Mode" or "Switch to Dark Mode").

---

## ⚙️ Component Props

```typescript
interface Props {
    class?: string;   // Optional additional CSS class names to apply to the button
    title?: string;   // Optional custom tooltip title
}
```

---

## 💻 Usage Example

```svelte
<script lang="ts">
  import { ThemeToggle } from 'fractalthemer';
</script>

<nav class="navbar">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <ThemeToggle class="my-custom-toggle" />
</nav>
```

**Building your own instead?** The entire behavior is two reactive reads: `onclick={() => themeState.toggleMode()}` plus `{#if themeState.isDark}` for the icon. See [Recipe D: Build Your Own Mode & Picker Toggles](../guides/05-api-guide.md) for a copy-paste version with any markup or icon set.

---

## 🔗 Related Documents

- [ThemePicker Component](./ThemePicker.md)
- [State & Reactivity](../architecture/02-state-and-reactivity.md)
