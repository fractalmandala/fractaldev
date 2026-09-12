---
title: Structure & Hierarchy
description: File and folder anatomy, the canonical 12-file physical scale, import surfaces, and cascade order.
---

Everything below describes the SASS source. If you took the CSS path
(`init --css`) you have one compiled file instead — `fractalstyler.css`, emitted
from exactly these partials — and this chapter is background rather than
instruction.

All stylesheets in live inside a single, unified directory (`src/lib/styles/`). Files are numbered sequentially from token fractals up to layouts and visuals.

```
src/lib/styles/
├── _00_tokens.sass ──► Raw tokens set. Everything builds from these.
├── _00_themes.sass ──► 76 curated palettes, each remapping that token set.
├── _00_presets.sass ──► The four preset axes, as pure token remaps.
├── _01_config.sass ──► Some base settings for body, html, responsiveness.
├── _02_dimensions.sass ──► Sets up a cascade of classes for gaps, pads, margins and more. 
├── _03_containers.sass ──► Actually all you need for 90% of styling and web layouts.
├── _04_layouts.sass  ──► Stop worrying over harmony and order in your grids.
├── _05_shells.sass* ──► A fool-proof method for consistent pages and layouts.
├── _06_visuals.sass ──► The dressage - colors, shadows, fitments.
├── _07_interactions.sass ──► Buttons and links, inputs and selects.
├── _08_own.sass  ──► Empty, leave for you to fill however you like.
└── index.sass  ──► Master Stylesheet
```

* Shells styling is meaningless without a canonical markup for how to use them. If you use the canonical markups given in [Canonical Markups](./08-shells-and-markups.md) with the recommended classes, you have great layouts and pages 100% of the time.

The three `_00_*` files are ordered deliberately and should not be reshuffled:

```
:root defaults  →  [data-mode]  →  .theme-*  →  [data-shape|layout|color|motion]
```

A theme beats the light/dark default; a preset tunes whatever theme is active.
Reversing the last two would let a chosen theme silently cancel the colour axis,
since both write the same three surface tokens.

> Remember, at all layers Fractalstyler2 sets consistent, modular styling and gives you guidelines for usage. But it is never restrictive. You can eschew `space-xs` and use `gap-2` and `gap-20` if you like. Nothing stops you. And if you find good layouts, consistent component fits - send `em back to us! They can join the fractals. Also remember - best not to tell your agents working with this system that they have such freedom! Agents working in a styling system need tight rules.

## Registry

Use `registry.md` as an index to find what class to use, for what use case. This is arguably the hardest part in adopting a new styling system - learning its internal language and its classes. So the recommendation is to simply familiarize yourself with the tokens, and usage of 	`.box`, `.row` and `.grid`. For the rest, use your prefered AI agent liberally. Point it to the registry custom built for agents, and ask it anything. It knows to get the answer quickly. And once you are familiar with `.box`, `.row` and `.grid`, dive into shells and layouts. 

The bundled `fractal-styler` skill gives additional chops to your agents.

[Next - Tokens](./04-tokens.md)