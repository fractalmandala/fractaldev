---
id: anti-flicker-guide
title: Zero-Flicker SSR & Hydration Guide
type: design
tags: [ssr, anti-flicker, fouc, localstorage, hydration, sveltekit]
summary: In-depth guide explaining how fractalthemer eliminates theme flicker on initial page load and server-side rendering.
relates_to: [quickstart-guide, theme-script-component, state-and-reactivity]
updated: 2026-08-28
---

# Zero-Flicker SSR & Hydration Guide

Flash of Unstyled Content (FOUC) or Flash of Wrong Theme (such as a white flash on a dark-mode website) happens when client-side JavaScript reads stored user preferences *after* the browser has already painted the initial HTML document.

`fractalthemer` solves this problem by using an inline synchronous initialization script executed before first paint.

---

## 🔍 How the Problem Occurs in Standard SPAs

```
1. Server returns HTML with default class="light"
2. Browser renders white background (Frame 1)
3. JavaScript bundle loads and hydrates (e.g. at 200ms)
4. Svelte reads localStorage.getItem('theme') -> 'dark'
5. Svelte mutates <html> to class="dark" (Frame 2 - FLASH OCCURS!)
```

---

## 🛡 How `fractalthemer` Solves It

By inserting a blocking, micro-sized (0.4KB) script synchronously in the HTML `<head>`:

```
1. Server returns HTML
2. Parser encounters inline <script> in <head>
3. Script immediately reads localStorage synchronously
4. Script applies target .theme-* class & colorScheme to <html>
5. Browser paints Frame 1 directly in Dark Mode (ZERO FLASH!)
6. Svelte hydrates seamlessly and assumes state ownership
```

---

## 🛠 Methods to Apply Anti-Flicker

> The script below is the canonical behavior of `getAntiFlickerScript()` (formatted here for readability — generate it programmatically to always stay in sync). It applies, in order: theme class + mode/data attributes, custom theme tokens, and the persistent custom accent.

### Method A: Direct HTML Injection in `src/app.html`

Place the following script directly in `src/app.html`:

```html
<script>
  (function () {
    try {
      var darkThemes = [
        'theme-lagoona-dark', 'theme-frozen-dark', 'theme-night-dark',
        'theme-inkworm-dark', 'theme-monochrono-dark', 'theme-fouram-dark',
        'theme-wintercame-dark', 'theme-sun-dark', 'theme-console-dark',
        'theme-dracula-dark', 'theme-catppuccin-mocha', 'theme-nord-dark',
        'theme-gruvbox-dark', 'theme-onedark-pro', 'theme-rose-pine-dark',
        'theme-midnight-emerald-dark', 'theme-obsidian-crimson-dark',
        'theme-synthwave-dark', 'theme-deep-ocean-dark', 'theme-amethyst-void-dark'
      ];
      var savedTheme = localStorage.getItem('theme') || 'theme-light-default';
      var savedBgStyle = localStorage.getItem('bgStyle') || 'plain';
      var validBgStyles = ['plain', 'aura', 'gradient', 'pattern'];
      if (validBgStyles.indexOf(savedBgStyle) === -1) { savedBgStyle = 'plain'; }
      var isDark = darkThemes.indexOf(savedTheme) !== -1 || savedTheme.indexOf('-dark') !== -1 || savedTheme.indexOf('-mocha') !== -1;
      var mode = isDark ? 'dark' : 'light';
      var root = document.documentElement;
      root.classList.add(savedTheme);
      root.setAttribute('data-theme', mode);
      root.setAttribute('data-mode', mode);
      root.setAttribute('data-theme-id', savedTheme);
      root.setAttribute('data-theme-family', savedTheme);
      root.setAttribute('data-bg-style', savedBgStyle);
      root.style.colorScheme = mode;
      var customTokens = localStorage.getItem('customTokens');
      if (customTokens) {
        try {
          var parsed = JSON.parse(customTokens);
          for (var k in parsed) { root.style.setProperty('--' + k, parsed[k]); }
        } catch (e) {}
      }
      var useAccent = localStorage.getItem('useCustomAccent');
      if (useAccent === 'true') {
        var acc = localStorage.getItem('customAccentColor');
        var accAlt = localStorage.getItem('customAccentAltColor');
        if (acc) { root.style.setProperty('--theme-color', acc); root.style.setProperty('--theme-color', acc); }
        if (accAlt) { root.style.setProperty('--theme-color-alt', accAlt); root.style.setProperty('--theme-color-alt', accAlt); }
      }
    } catch (e) {}
  })();
</script>
```

Storage keys read pre-paint: `theme`, `bgStyle`, `customTokens`, `useCustomAccent`, `customAccentColor`, `customAccentAltColor`.

### Method B: Programmatic Generation via `getAntiFlickerScript()`

In custom build scripts or SSR hooks:

```typescript
import { getAntiFlickerScript } from 'fractalthemer';

const scriptString = getAntiFlickerScript('theme-light-default', 'plain');
```

### Method C: Using `<ThemeScript />` in Layout

```svelte
<script lang="ts">
  import { ThemeScript } from 'fractalthemer';
</script>

<ThemeScript defaultTheme="theme-light-default" defaultBgStyle="plain" />
```

---

## 🔗 Related Documents

- [ThemeScript Component](../components/ThemeScript.md)
- [Quickstart Guide](./01-quickstart.md)
