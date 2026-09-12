# Accessibility

Accessibility is a library-wide contract shared by component semantics, focus treatment, motion behavior, and theming choices.

## Interaction

Use native buttons, links, inputs, select elements, details, dialog, and progress whenever the component already provides them. Preserve keyboard order and do not hide the only action behind hover. Give every interactive region an accessible name.

## Focus

The shared `focus-ring` recipe uses `--ring`, `--focus-ring-width`, and `--ui-focus-ring-offset`. Keep focus visible in every theme and test it over selected backgrounds, gradients, and patterns.

## Contrast and colour

Check text, controls, borders, and focus indicators against the final background. Theme accents are not automatically valid for body text. Do not communicate status with colour alone; pair it with text, shape, or an accessible state.

## Motion and effects

Respect `prefers-reduced-motion`. Stop or simplify continuous effects, keep content available without animation, and do not use a canvas effect as the only communication channel.

## Verification

Run keyboard-only checks, a screen-reader smoke test for overlays and form controls, automated axe-style checks in the consuming application, and contrast checks for every shipped theme/background pairing.

The repository’s `pnpm a11y:check` command verifies the static contract for native semantics, visible focus, reduced motion, appearance bootstrap, and control colour-scheme inheritance. It complements—not replaces—browser and assistive-technology testing.
