---
id: state-and-reactivity
title: Svelte 5 Reactive State & Runes Architecture
type: design
tags: [svelte5, runes, state-management, reactivity, localstorage]
summary: Deep dive into the ThemeState class, reactive runes ($state, $derived), storage persistence, and DOM synchronization.
relates_to: [architecture-overview, theme-picker-component, custom-themes-guide]
updated: 2026-08-28
---

# Svelte 5 Reactive State & Runes Architecture

The state architecture of `fractalthemer` is powered entirely by Svelte 5 Runes. All theme modifications, custom themes, background aura toggles, and drawer visibility states are managed through the [`ThemeState`](../../src/lib/state/theme.svelte.ts) class and exported as a reactive singleton `themeState`.

---

## 🧬 Reactive State Fields

Inside [`src/lib/state/theme.svelte.ts`](../../src/lib/state/theme.svelte.ts), the state is defined using Svelte 5 runes:

```typescript
export class ThemeState {
    current = $state<string>(DEFAULT_THEME_ID);
    bgStyle = $state<BgStyle>('plain');
    activeGradient = $state<string | null>(null);
    isOpen = $state<boolean>(false);
    customThemes = $state<ThemeInfo[]>([]);
    activeCustomOverrides = $state<Record<string, string> | null>(null);
    activeCustomAuraLayers = $state<AuraLayer[] | null>(null);
    // Persistent custom accent (override layer above any theme)
    useCustomAccent = $state<boolean>(false);
    customAccentColor = $state<string>('#04825B');
    customAccentAltColor = $state<string>('#047857');
    accentAltTouched = $state<boolean>(false);
}
```

### State Variables

| Field | Type | Description |
|---|---|---|
| `current` | `string` | Active theme identifier (e.g. `'theme-sun-dark'`, `'theme-light-default'`) |
| `bgStyle` | `'plain' \| 'aura' \| 'gradient' \| 'pattern'` | Active backdrop family; the selected preset for each family is retained independently |
| `activeGradient` | `string \| null` | Slug identifier of active gradient preset (e.g. `'omolon'`, `'radioactive-heat'`) |
| `isOpen` | `boolean` | Controls visibility and transition state of the 100vh right off-canvas drawer |
| `customThemes` | `ThemeInfo[]` | User-created custom themes restored from `localStorage` |
| `activeCustomOverrides` | `Record<string, string> \| null` | Runtime CSS variable overrides when a custom theme is active |
| `activePattern` | `string \| null` | Slug identifier of the active CSS pattern preset |
| `activeCustomAuraLayers` | `AuraLayer[] \| null` | Dynamic aura gradient nodes for the active custom theme |
| `useCustomAccent` | `boolean` | Master switch for the persistent custom accent override layer |
| `customAccentColor` | `string` | Current accent override hex, applied to `--theme-color` (+ `--theme-color`) |
| `customAccentAltColor` | `string` | Current alt override hex, applied to `--theme-color-alt` (+ `--theme-color-alt`) |
| `accentAltTouched` | `boolean` | Whether the user has hand-set the alt accent (stops auto-derivation until reset) |

---

## ⚡ Computed Derived State

The class provides instant, reactive getters:

```typescript
get allThemes(): ThemeInfo[] {
    return [...THEMES, ...this.customThemes];
}

get allGradients(): GradientPreset[] {
    return GRADIENT_PRESETS;
}

get currentTheme(): ThemeInfo {
    return this.allThemes.find((t) => t.id === this.current) ?? THEMES[0];
}

get isDark(): boolean {
    return this.currentTheme.mode === 'dark';
}

get isAura(): boolean {
    return this.bgStyle === 'aura';
}

get isGradient(): boolean {
    return this.bgStyle === 'gradient';
}

get activeGradientPreset(): GradientPreset | null {
    return GRADIENT_PRESETS.find((g) => g.id === this.activeGradient) ?? null;
}
```

- **`isDark`**: Accurately reflects whether the active palette is light or dark. Used by the mode toggle icon (Sun vs. Moon) and accessibility attributes.
- **`isAura`**: Flags the [`AuraBackground.svelte`](../../src/lib/components/AuraBackground.svelte) renderer to mount or unmount GPU blend layers.
- **`isGradient`**: Activates full viewport `.aura-gradient-backdrop` with `--bg-gradient`.
- **`activeGradientPreset`**: Resolves the full `GradientPreset` object containing name, hex stops, and CSS `linear-gradient` rule.

---

## 🛠 Core State Methods

### 1. `init()`
Executed on `onMount` in browser contexts. Reads `localStorage` for `theme`, `bgStyle`, `gradient`, `aura`, `pattern`, `customThemes`, and the custom accent keys (`useCustomAccent`, `customAccentColor`, `customAccentAltColor`), validates against known schemas, and synchronizes the DOM attributes. Background picks that don't fit the restored theme's mode are re-homed (`normalizePick`: archived under their own fitting mode, slot refilled with a pick that fits), so restored state always matches the restored mode:

```typescript
init(): void
```

### 2. `setTheme(id: string)`
Switches the active palette to `id`. Removes prior `.theme-*` classes from `<html>`, adds the new class, updates `data-theme`, `data-mode`, and `colorScheme`, and stores the preference. When the switch flips light/dark, it also **refits the mode-classified backgrounds** (`refitBackgrounds`): each family's current pick is archived under the leaving mode, the target mode's remembered pick is restored, and persistence is re-synced — the visible backdrop always fits the new mode:

```typescript
setTheme(id: string): void
```

### 3. `setGradient(id: string)` & `clearGradient()`
Selects a gradient preset by ID, sets `bgStyle = 'gradient'`, writes `--bg-gradient` to `<html>`, and saves to `localStorage`:

```typescript
setGradient(id: string): void
clearGradient(): void
```

### 4. `toggleMode()`
Toggles between Light and Dark mode by switching to the current theme's twin (or the first theme of the target mode). The mode flip inside `setTheme()` re-homes the mode-classified backgrounds — picks are archived for the leaving mode and restored for the target mode — so gradients, patterns, and auras always fit the active mode and per-mode picks survive toggles and refreshes:

```typescript
toggleMode(): void
```

### 5. `setBgStyle(style: 'plain' | 'aura' | 'gradient' | 'pattern')` and `toggleBgStyle()`
Switches background styling. Updates the `data-bg-style` attribute on `<html>` and persists to `localStorage`. Each family keeps its most recently selected preset, so changing families never loses the user’s last choice. `toggleBgStyle()` cycles between plain, aura, gradient, and pattern.

### 6. `cycleNext()` and `cycleRandom()`
Iterates sequentially or picks a random theme from the 41 built-in and custom theme pool.

### 6. `saveCustomTheme(...)` and `deleteCustomTheme(id: string)`
Creates and persists custom user-defined themes with custom token key-value pairs and aura gradient layer specifications.

### 7. Custom Accent Methods
The accent is an **override layer**, not a theme property: it is applied last in `apply()`, wins over every theme's own accents, survives theme switches and refreshes, and is cleared only by an explicit reset.

```typescript
setCustomAccentColor(color: string): void   // applies + persists; auto-derives alt until touched
setCustomAccentAltColor(color: string): void // hand-set the hover accent; stops auto-derivation
resetCustomAccent(): void                    // the only manual path that clears the layer
```

`alt` starts as an auto-derived shade (−12% lightness) of the accent. `init()` detects a hand-tuned alt by comparing the saved value against the derived one, so the touched flag survives reloads without extra storage.

The drawer's header **Reset** (`resetDefault()`) intentionally does **not** touch this layer — it resets the theme and background style only. Accent colors persist until the user clears them via the accent row's undo (`resetCustomAccent`).

---

## 🌐 DOM Mutation Model

When `apply(id, style)` executes, `themeState` performs atomic, layout-shift-free DOM updates:

```typescript
apply(id: string, style?: BgStyle) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const currentStyle = style ?? this.bgStyle;

    this.clearCustomOverrides();

    for (const theme of this.allThemes) {
        root.classList.remove(theme.id);
    }
    root.classList.add(id);

    const theme = this.allThemes.find((t) => t.id === id);
    if (theme) {
        root.setAttribute('data-theme', theme.mode);
        root.setAttribute('data-mode', theme.mode);
        root.setAttribute('data-bg-style', currentStyle);
        root.style.colorScheme = theme.mode;

        // 1. Theme's own token values (+ --theme-color / --theme-color-alt aliases)
        if (theme.tokens) { /* set --<key> for each token */ }

        // 2. Custom theme overrides
        if (theme.isCustom && theme.tokens) {
            this.applyCustomOverrides(theme.tokens, theme.customAura?.layers);
        }

        // 3. Accent override layer — applied LAST so it wins over any theme
        if (this.useCustomAccent) { /* set --theme-color, --theme-color-alt, --theme-color, --theme-color-alt */ }

        // 4. Glass regime — vivid backdrops turn -bg-* surfaces translucent
        if (currentStyle !== 'plain') { /* re-emit each -bg-* as color-mix(in srgb, <literal> N%, transparent) + --glass-blur */ }
        else { root.style.removeProperty('--glass-blur'); }
    }
}
```

---

## 🔗 Related Documents

- [System Architecture](./01-overview.md)
- [ThemePicker Component](../components/ThemePicker.md)
- [Custom Themes Guide](../guides/03-custom-themes.md)
