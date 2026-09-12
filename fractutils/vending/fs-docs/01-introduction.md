---
title: Introduction
description: Welcome to the world of fractals
---

Of the greatest, most deliberate design there ever has been - ṛta, or ऋत, the order of reality - the sacred Upaniṣads tell us:

> yathā piṇḍe tathā brahmāṇḍe | yathā brahmāṇḍe tathā piṇḍe

As above, so below, and vice versa. It is the simplest, most elegant ordering principle of reality. The great design, ṛta, is fractal. And so we ask - can styling systems not be fractal too?

From tokens and dimensions, to layouts and shells, to colors and themes, Fractalstyler2 is a system built around the idea that all styling can be composed as a combination of "fractals" - unitary classes and styling definitions that configure into higher layers retaining the same modularity. It is inspired by responsive styling at [Utopia](https://utopia.fyi/) and by [EveryLayout](https://every-layout.dev/). But before we get into the good stuff, you are most likely asking the obvious:

**Why another styling system? And why in SASS?!**

1. I don't like Tailwind, period. And viable alternatives like StyleX, Bulma or Web Awesome don't do what I want my styling system to do.
2. This entire system ships as plain CSS. SASS is how it is generated, and a personal preference this system does not force on you.

The system is opinionated about a few things -

1. Styling syntax should be human legible and avoid `__`, `&__`, `> *` kind of usage patterns.
2. To know the "value" of something, one should not have to chase upwards a series of variables like `--thisvar` is set to `(--this-other-var)` which is defined by `$this-token`. Reduce cognitive load always.
3. A styling system like this should ensure responsiveness, standards for size, padding, typography etc. and leave the rest- the actual front-end - to the user. Colors, fonts, fixed-configs vs. fully dynamic, these should not be set by the sytem. Maximum consistency with minimum opinionation.


## The Mental Frame

You'll get the feel for Fractalstyler2 quickly, with just one heuristic - 

> everything is a fractal -&gt; fractals group in layers -&gt; one layer seeds the next layer of fractals -&gt; from tokens to appshells.

### L0 fractals

Level 0 fractals are the tokens. colors, sizes, font-sizes, and the like. The color tokens may feel opinionated at first, but they already bloom with 20 preset themes, and are fully compatible with ShadCN themes. Text sizes and space tokens are fluid responsive. All are defined such that they enable various configurations of Level 1.

### L1 fractals

The filling out of space, creating dimensions, is Level 1 of Fractalstyler2. Gaps for flex-boxes and grids, padding for anything and everything, margins, heights, widths - all built from the elementary tokens, all structured for consistent presets and also fully extensible. 

What dimensions do is make genesis possible. Of actual space and volume and structure. In their spreading out, various containers become possible. And that takes us to Level 2.

### L2 Fractals

Everything in [web design is a box](https://www.smashingmagazine.com/2019/05/display-box-generation/), indeed, and boxes are just the fractals that dimensions spread out and create. 

A button is a box created by height, width, padding.   
A flexbox by gaps, padding, sizing.   
Cards, inputs, text areas - boxes all. 

And since they interact with each other, either as parents and children, or as siblings, there's some alignment to manage. That's precisely where a styling system steps in. 

So Fractalstyler2 provides aligners, calibrators, tuners - all from the same family of preceding fractals. 

When these containers learn their roles and inter-relationships, the system organically brings to life the next level.

### L3 Fractals

> Stars and planets and nebulae form galaxies, galaxies cluster.  
> Dimensions and containers form layouts, layouts templatize.

Level 3 of Fractalstyler2 is the simple creation of consistent and responsive grids, sections, page types.   
A responsive grid is easy, but don't we all know that a grid of 6 cards should scale down from 6 columns to 3, then 2, then 1 - but never 5 or 4, for that breaks harmony.  
A grid of 4 cards, or 8, or 12 - when scaling down should jump from 4 columns to 2, never 3 - for the same reason.   
These are ways a styling system is kept both responsive and intelligent.   
And operating here too are the lower fractals - leaving gaps, pads, alignments - all still in your control.

### L4 Fractals

It should be evident enough by now. Once we have layouts and templates, and since we are in the business of making beautiful UI, there's only a couple of things left.

1. how it all looks put together.
2. how it all behaves.

Level 4 resolves the first point here.  
Our inherently responsive system and Sveltekit's native features manage the second point. 

To put it all together, we need shells, colors, and a clamp here or there. And the best part is, if we've been following the modular, fractal construct thus far, there's nothing new to process.

A `page-shell`, to manage landing pages or section heroes. An `app-shell` with `app-header` and `app-main` . A holy-grail docs config that just knows when to contract a right TOC into a dropdown menu, and when to retract a left sidebar nav into a header menu button. Accordions that open when you want them to, accordion parents that regulate what closes when what opens. 

At Level 4, our fractal structure mirrors itself. Tokens and dimensions filled out containers and layouts from within, and using the same syntax shells wrap them up from outside. And since everyone is finally getting together, they decide to dress up well.

### L5 Fractals

Enter backgrounds, text colors, borders - the looks. A `surface` knows to dress in a background of `var(--bg-surface)`, a `popover` pops over in `background: var(--bg-popover)`, and everyone responds well to attention, ie, reacts on hover or click or selection. 
All of it yoked by a themeing system you get to configure, and a studio for even that system for users that want greater control. Fractalstyler2 is in control at all times, but gracefully lets you have the wheel whenever and wherever you want. Various trims and accessories complete the look - classes to truncate, classes to transition, classes to toggle or expand. Ways for you to create an active, vibrant UI with smooth motion, and ways to keep it gentle and minimal. 


## Your Styling System

So Fractalstyler2 isn’t my system or *a* system. It’s actually your system, built to operate the way you want your styling to operate. What it ensures is:

- you don’t have to worry about consistency. discipline and adherence organically gets built into your subjective choices on color, border-radius, layout etc.
- you are not writing the same class definitions again and again, nor straining under a bloating classes registry with redundancies and conflicts that have you sneaking an`!important` every now and then!

> To be clear - if your neural muscles are already shaped to Tailwind, if there is no need in your workflows for a change to begin with, then there is little in this system to add value to your designs.

**Fractalstyler2** is primarily for those looking for alternatives to Tailwind, and seeking the perfect balance of a scaffold + harness. A scaffold gently lifts us up, making a climb easier. A harness holds us safe, keeping our ascent controlled. 

A final point, on personal and subjective leanings. I have no idea why, with the elegant braces and semi-colons free existence of SASS, its not more common and why SCSS has wider adoption. If I recommend anything to people, I tell them - get onto SASS!

But you won't, and that's entirely okay - because there is nothing to adopt. **Fractalstyler2 ships as plain CSS.** One file, one `<link>`, no build step, no preprocessor, no config. Everything in this documentation - every class, every token, all 76 themes, all four preset axes - works exactly the same either way. Themes and presets are classes and attributes, so they hold up with JavaScript disabled too.

SASS is not the product. It is how the stylesheet is *generated*, and the generators are the one thing taking the SASS path buys you: the literal ladder and the responsive seam are configurable before compiling. If you never want to retune those - and most people never will - take the CSS and never think about it again.

```bash
npx fractalstyler2 init --css
```

The compiled CSS is emitted from the very same partials the SASS scaffold gives you, so the two are byte-identical. There is no second-class path here.

Oh, and since it's 2026 - actually you don't have to use this system at all, your agents do. So just point them to it (see [Agent Plugin](./12-agent-plugin.md)) and let them lead the way. Or ask them to orient you. Or use the bundled skills. 

---

## Contents

1. Introduction (you are here)
2. Getting Started
3. Structure
4. Tokens
5. Dimensions
6. Containers
7. Layouts
8. Shells and Markups
9. Visuals and Interactions
10. Presets
11. MCP
12. Agents
13. Cookbook
14. Presets - Color
15. Presets - Layout
16. Presets - Motion
17. Presets - Shape

[Next - Getting Started](./02-getting-started.md)