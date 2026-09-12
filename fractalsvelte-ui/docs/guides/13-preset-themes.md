# Preset themes

The preset catalogue in `src/lib/data/themes.ts` supplies the visual starting points used by the documentation theme setter. `theme-families.ts` pairs matching light and dark entries; when a source theme has only one mode, the missing counterpart is derived with coordinated surface and text values while preserving its accent pair.

## Family behavior

Choose a family, then choose the active light or dark mode. The family controls surfaces, text, borders, states, and its default `--theme-color` / `--theme-color-alt` pair.

Preset accents are opt-in at the setter level. Users can instead select custom accent values while keeping the family’s non-accent tokens.

## Adding a preset

Add both variants when possible. Give both entries a stable family relationship, a clear description, readable foreground/background contrast, and a complete raw palette. Do not add private `--color-*` keys; the public palette is the only colour contract.

Validate the pair in light and dark mode, with plain, Aura, Gradient, and Pattern backgrounds.
