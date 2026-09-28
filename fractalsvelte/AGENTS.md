# Agents


> upstream tests and reference - `/Users/amrit/fractalmandala/fractaldev/affedo`
> upstream components pipeline - `/Users/amrit/fractalmandala/megafolder`

## basic rules

1. publish, don't copy
the moment two apps share a button, stop copying files between them. move the button into a package with a build step and and `exports` map.

2. version like api
ever prop is a contract. renaming 'ghost' to 'subtle' is a breaking change even when nothing on screen looks different
**adopt semver** for tracking. Treat every exposed prop as a contract.

3. docs are the product
every component needs a live page with live example, props table, and notes on keyboard and screen readers
generate the props table from the types
a component not documented is a component not shipped

4. tests and checks
> What separates a production component library from a repo of components?
visual regression checks
automated accessibiltiy check running in CI
published changelogand `deprecated` list
peerDependencies range

### progressive build

dont look to publish a whole system on day one. 
1 package with 3 components, changelog, docs page - start here.

### api design

> The instinct is to add a prop for every variation. A card sprouts `headerTitle`, `headerSubtitle`, `showFooter`, `footerAlign`, and collapses under its own options. Every new design becomes another boolean, until the type signature is a wall nobody reads.
<cite>yep i do this</cite>

Composition is the way out: expose the parts. Ship `Card`, `CardHeader`, `CardContent`, and `CardFooter` and let people arrange them.

Pick a vocabulary and use it in every component. `variant` for visual style — default, ghost, destructive. `size` for scale — sm, default, lg. Two names, learned once, applied to forty components.

### Leave escape hatches

-   `className`, merged with the component’s own classes via tailwind-merge, so a caller can adjust one edge case without forking.
-   `asChild`, which renders your component as its child element through Radix Slot — so a `Button` can become a Next.js `Link` without duplicating a single style.

If someone can render your component with `<Button>Save</Button>` and also bend it to a one-off without editing your source, the API is right.

The best components disappear — you reach for one, it does the obvious thing, and you move on without opening the docs. The worst make you stop and think: twenty props, half of them required, none named the way you’d guess. The gap between them is API design, and it comes down to a few conventions applied without exception.

### Compose, don’t configure

The instinct is to add a prop for every variation. A card sprouts `headerTitle`, `headerSubtitle`, `showFooter`, `footerAlign`, and collapses under its own options. Every new design becomes another boolean, until the type signature is a wall nobody reads.

Composition is the way out: **expose the parts**. Ship `Card`, `CardHeader`, `CardContent`, and `CardFooter` and let people arrange them. You write less, and the layout they need but you never imagined is just JSX.

### Name variants the same way

Pick a vocabulary and use it in every component. `variant` for visual style — default, ghost, destructive. `size` for scale — sm, default, lg. Two names, learned once, applied to forty components.

**Consistency is the whole game here.** When Button, Badge, and Alert all take the same `variant` names, people guess right the first time and stop reading prop tables.

## Leave escape hatches

You won’t predict every use, so build the exits in from the start. Two cover almost everything:

-   `className`, merged with the component’s own classes via tailwind-merge, so a caller can adjust one edge case without forking.
-   `asChild`, which renders your component as its child element through Radix Slot — so a `Button` can become a Next.js `Link` without duplicating a single style.

This is why copy-paste libraries feel so flexible. [Spectrum UI](https://ui.spectrumhq.in/components) wires `className` and `asChild` in by default, so the hatch is there before you reach for it. You inherit the flexibility without having to design for it.

### The rule

Design the common case to need zero props, and make the rare case possible without a fork. If someone can render your component with `<Button>Save</Button>` and also bend it to a one-off without editing your source, the API is right.

Ship that, and people stop rebuilding what you already gave them — which is the only metric a component API really has. The best compliment yours gets is silence: no issues, no forks, no Slack thread asking how it works.

## Frequently asked questions

What makes a good component API?

A good component API favors composition over configuration: instead of piling props like headerTitle and showFooter onto one component, expose parts like Card, CardHeader, CardContent, and CardFooter and let people arrange them. This keeps type signatures small and lets callers build layouts you never imagined with plain JSX.

How do you keep component props consistent across a library?

Pick one vocabulary and use it everywhere: variant for visual style (default, ghost, destructive) and size for scale (sm, default, lg). When Button, Badge, and Alert all take the same variant names, people guess right the first time and stop reading prop tables. Two names, learned once, applied across every component.

What are escape hatches in component design?

Escape hatches let callers handle cases you didn't predict without forking your source. The two that cover almost everything are a className prop merged via tailwind-merge, so a caller can adjust one edge case, and asChild, which renders your component as its child through Radix Slot, so a Button can become a Next.js Link.
## fractalsvelte conventions (as built)

Styling system: fractalthemer, EJECTED — `src/lib/styles/` (system layers 00–08),
`src/lib/palette/`, `scripts/build-registry.mjs`, `src/lib/data/registry.json`.
The package also keeps `fractalthemer` as a runtime dependency (mode store, motion).

1. Component anatomy — one directory per component:
   `src/lib/components/<Name>/<Name>.svelte` + `<Name>/index.ts`
   (`export { default as <Name> } from './<Name>.svelte';`).
   Sub-parts live in the same directory and are re-exported from `index.ts`
   (e.g. `Select` + `SelectOption`). All public components re-exported from
   `src/lib/index.ts`, grouped Interactive / Surfaces & feedback / Utilities /
   Complex layout.

2. No component skins — the styling system is the only stylesheet. There is
   no `src/lib/styles/components/` layer; components compose exclusively from
   registry classes and the canonical anatomy patterns in `_06_visuals.sass`.

3. Class vocabulary — compose registry classes only:
   `.btn` + paint `primary|outline|soft|ghost` + size `sm|bs|lg` + shape
   `round|square|curved`; `field`, `switch-track/-thumb`, `card`, `badge`,
   `accordion-*`, `tab-list/-trigger`, `surface`, `panel`, `raised`, spacing
   (`gp-*`, `pad-*`, `mar-*`), text (`text-*`), `radius-*`, `shadow-*`.
   Prop mapping (kept 1:1 with the affedo API): variant `secondary` → `soft`,
   size `md` → `bs`. Anything the registry genuinely lacks becomes a canonical
   anatomy pattern promoted into `_06_visuals.sass` (component-specific needs)
   or a declared class in `_08_own.sass` (project-level extension vocabulary,
   e.g. `.docs-code`) — never ad-hoc CSS, never scoped styles, never a local
   skin, never inline `style=` attributes. State rides the element's own
   attributes (`data-size`, `data-appearance`, `aria-checked`,
   `aria-expanded`, `aria-invalid`); dynamic values ride Svelte
   custom-property directives (`style:--fs-slider-pct={value}`) consumed with
   calc() in the canonical pattern.

4. Lintable class attributes — the class attribute must be a static prefix plus
   `{simpleVar}` interpolations or `class:name` directives. No `??`, ternaries,
   or indexing inside the attribute (the ft-linter mis-parses them). Anything
   computed is resolved in the script with `$derived`.

5. Status tokens — `--danger`, `--success`, `--warning`, `--info` are defined
   per-mode in `_00_tokens.sass` (themes deliberately carry no status opinions).

6. Gates — every change must keep all five green:
   `pnpm registry` (registry fresh), `pnpm docs:build` (docs.json fresh + every
   component has example/meta — a component not documented is a component not
   shipped), `pnpm check` (0 errors), `pnpm lint:ft` (0 contract violations),
   `pnpm build` (vite + svelte-package + publint).

7. Upstream reference — the affedo repo at `/Users/amrit/fractalmandala/fractaldev/affedo`
   holds the generated originals (anatomy/recipes/generators). fractalsvelte is
   now the canonical home; changes land here, not upstream.

8. Docs layer — every component is documented at `/docs/<slug>` (live example
   rendered + its source, props table generated from the types by
   `scripts/build-docs.mjs`, keyboard and screen-reader notes). Authoring a
   component means authoring three files: the component, plus
   `src/lib/docs/examples/<slug>.svelte` (demo; imports only from `$lib`, no
   invented classes) and `src/lib/docs/meta/<slug>.ts` (ComponentMeta —
   description, keyboard, screenReader grounded in the actual aria/keydown
   behavior of the source). Props/defaults/JSDoc come from the component
   source automatically. The docs chrome is composed from registry classes;
   its three genuinely-missing vocabulary items (`.docs-code` with the
   fractalpop highlighter palette, `.docs-table` cell rhythm,
   `.docs-measure`) are declared in `_08_own.sass`.
