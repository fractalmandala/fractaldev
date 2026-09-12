# Fractals Styling System

A SASS styling system designed for consistency and configurability, built around the idea that all styling can be composed as a combination of "fractals" - unitary classes and styling definitions that configure into higher layers retaining the same modularity. The system is inspired by responsive styling at [Utopia](https://utopia.fyi/) and by [EveryLayout](https://every-layout.dev/). Its primary expression language is SASS, single-tab indented, no curly-braces and no semi-colons. But pure CSS variant is also available. It is built on and used primarily in Sveltekit projects, powering the Fractalsvelte UI library. 

token definitions configure into dimensions - gaps, pads, sizes, margins - fractals level 0
the dimensions fill up containers to create fractals level 2 - boxes, rows, buttons, inputs etc.
containers configure into grids and layouts - level 3
which configure up to shells - level 4



## Base Behavior

The base layer of Fractals is defined in `_base.sass`. Sets box sizing, root font families, body background and foreground, native control font inheritance, code font inheritance, link colour, and media sizing. In personal use, I add debugging classes like `.bdr` here (border: 1px solid red - amazingly nifty!). As a general rule the definitions here should be limited, to keep the base clean.

Import the complete system once through `system.sass`.

## Import Order

`system.sass` is the supported composition boundary and loads layers in this order:

1. `tokens` — raw defaults and light/dark selectors.
2. `base` — box sizing, root/body colors, native font inheritance, media sizing, and links, typography rhythm, placeholder treatment, visually hidden content, and reduced motion.
3. `primitives` — opt-in layout classes.
5. `contracts` — component geometry and overlay override variables.
6. `components` — component selectors and state styles.

Later layers may consume earlier tokens and contracts. Consumer Sass belongs before or after the system import depending on whether you want normal cascade overrides; put explicit overrides after the import when you need them to win.

## Typography

Use `--font-sans` and `--font-mono` for stacks and the fluid `--text-*` scale for headings and body copy. The foundations set the default heading weight and line height but do not prevent application-specific type styles.

## Motion baseline

The foundation disables long transitions and animations when `prefers-reduced-motion: reduce` is active. Motion components add their own behavior on top of this baseline; see [Motion](17-motion.md).

The foundation does not impose a page grid, fixed brand colors, or a component-specific font. Replace the raw tokens or add application selectors for those decisions.
