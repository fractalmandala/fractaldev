---
title: Motion Scenes
description: Canonical motion and transition scenes for easyuse and zero-setup.
id: 16
type: docs
---

A cookbook of entrance choreographies for the four hero items on `src/routes/+page.svelte`,
built from the motion components in `src/lib/motion/comps/` and, in Family F, the CSS
reveal system in `src/lib/transitions/`. **Scene 21 is the one currently live**; the
other 20 are drop-in alternatives.

## The cast (shorthand used in every scene)

| Role  | Markup                                                                                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ITEM1 | `<div class="font-mono text-sm text-muted"><span class="text-theme weight-700 text-bs">[ </span> STYLING SYSTEM \| LAYOUTS \| PRESETS \| SVELTEKIT <span class="text-theme weight-700 text-bs"> ]</span></div>` |
| ITEM2 | `<img class="marg-auto" style="width: 200px; height: 200px" src="/images/fractalstyler.png" alt="site logo" />`                                                                                                 |
| ITEM3 | `<div class="box xcenter"><Logo /></div>`                                                                                                                                                                       |
| ITEM4 | `<p class="text-xl text-secondary lh15 prose">is a composition styling system with a fluid design, canonical layout scaffolds, a presets architecture and themeable construct.</p>`                             |
| ITEM5 | Seven `<span class="pill themed">` chips — `build step`, `config file`, `purge pass`, `postcss plugin`, `content globs`, `canon layouts`, `skills and scaffolds`                                                |
| ITEM6 | `<span class="row ycenter gap-2xs text-bs">Built with <Heart /> for Sveltekit.</span>`                                                                                                                          |

ITEM3 is wrapped in `.box.xcenter` because `Logo` is a fixed-width 613px SVG with no
centering of its own — the wrapper restores centering and doubles as the clip target.

Import aliases used throughout:

```svelte
import Revealer from '$lib/motion/comps/RevealSvelteMotion.svelte'; import Healso from
'$lib/motion/comps/Reveal.svelte'; import SlideM from '$lib/motion/comps/SlideSvelteMotion.svelte';
import BlurM from '$lib/motion/comps/BlurSvelteMotion.svelte'; import CutM from
'$lib/motion/comps/CutSvelteMotion.svelte'; import LettersM from
'$lib/motion/comps/StackingLettersSvelteMotion.svelte'; import WordsM from
'$lib/motion/comps/StackingWordsSvelteMotion.svelte';
```

## Composition mechanics (read once, applies to all 20)

1. **One conductor, sequenced targets.** `Revealer` / `Healso` turn _multiple direct
   children_ into staggered targets (`delay = i × stagger`). DOM order **is**
   choreography order. Separate component instances have no shared clock (see 3).
2. **`duration` is seconds.** Motion's `animate()` takes seconds. Always pass an
   explicit `duration` with `scrub={false}` — the component default (`400`) is a
   400-second tween, i.e. frozen.
3. **In-view instances fire simultaneously.** `SlideM` / `BlurM` / `CutM` in-view
   mode has no delay prop — every instance on screen animates at once. They are
   _ensembles_, not sequences. True one-by-one needs a single staggered container
   (family A) or staggered scroll bands (family B).
4. **Scrub stagger has a span budget.** In scrub mode, target `i` starts at progress
   `i × stagger` inside a shared 0→1 range, so `stagger < 1 / (n − 1)` is required.
   With 4 items: **stagger ≤ 0.25**, or later targets never open. (The `0.5` default
   is only safe for ≤ 2 targets in scrub.) In-view stagger is a plain second-delay
   with no such constraint.
5. **Direction vocabulary** (`reveal.ts`): `left` = wipe starts at left edge, travels
   right; `right` = starts right, travels left; `up` = starts top, travels down;
   `down` = starts bottom, travels up; `diagonal` = parallelogram sweeping
   bottom-left → top-right. `SlideM` differs: `direction` is the side the element
   slides _from_ (`down` = rises upward, `distance` default 160px).
6. **Entrance vs. journey.** `scrub={false}` = plays on view (hero load-ins).
   Scrub = bound to scroll (sections below the fold, re-entry choreography).

---

## Family A — Single-conductor Revealer (true one-by-one)

One `Revealer`, four direct children, one shared direction. Timing for all of family A:
total ≈ `duration + 3 × stagger`.

### Scene 1 — Curtain Drop

The reference. Each mask peels top-edge-first in reading order — calm, editorial.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="up"
	duration={0.9}
	ease="circOut"
	stagger={0.3}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: 0 / 0.3 / 0.6 / 0.9s starts, ≈ 1.8s total. Use when: default hero, docs-first tone.

### Scene 2 — Rise From Below

Same rhythm, opposite gravity. Masks peel bottom-edge-first, so content _rises_.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="down"
	duration={0.9}
	ease="circOut"
	stagger={0.3}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Use when: you want uplift/optimism. Pairs well with `SlideM direction="down"` siblings
elsewhere (same travel language). Watch out: on the wide `Logo`, bottom-up reveals
can feel like a rising curtain — intentional here.

### Scene 3 — Reading Wipe

Horizontal wipe in reading direction (`left` = starts at left edge, travels right).
The eye leads the mask.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="left"
	duration={0.8}
	ease="easeOut"
	stagger={0.28}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 1.6s total. Use when: text-heavy heroes; horizontal motion matches the
`Logo`'s wide aspect. `easeOut` (vs `circOut`) lands a touch firmer.

### Scene 4 — Editorial Diagonal

Parallelogram sweep, bottom-left → top-right. Film-title energy.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="diagonal"
	duration={1.1}
	ease="easeInOut"
	stagger={0.32}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 2.1s total. Use when: launches, announcements, anything with a poster.
Watch out: busiest of the family — keep `gap-2xl` breathing room; tight gaps +
diagonal edges look restless.

### Scene 5 — Staccato

Short, punchy, overlapping. Items chase each other.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="up"
	duration={0.45}
	ease="anticipate"
	stagger={0.12}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 0.8s total. Use when: confident/dev-tool tone, repeat visitors. `anticipate`
adds a tiny wind-up before each reveal — the snap is the point.

### Scene 6 — Procession

Long, stately, non-overlapping. Each item finishes before the next begins.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="up"
	duration={1.4}
	ease="circOut"
	stagger={0.45}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 2.75s total. Use when: first-impression brand moments. Watch out: over ~3s
tests patience on repeat views — consider pairing with `prefers-reduced-motion`
respect (already built into `Revealer`).

### Scene 7 — Spring Ensemble

No `duration` → in-view falls back to spring physics (`stiffness`/`damping`).
Motion has weight instead of a fixed timetable.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="left"
	stiffness={90}
	damping={16}
	stagger={0.35}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Use when: playful/product tone; springs feel alive where tweens feel authored.
Tune: lower `damping` = more overshoot wobble; raise `stiffness` = snappier settle.
Watch out: spring settle time is approximate — don't choreograph anything _after_
this scene against a hard timestamp.

### Scene 8 — Soft Landing

Same conductor, gentlest possible hand: slow tween, wide stagger, softest ease.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="down"
	duration={1.2}
	ease="circInOut"
	stagger={0.4}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 2.4s total. Use when: calm/documentation reading mood. `circInOut` eases
_both_ ends, so each reveal breathes in and out — no abrupt starts.

---

## Family B — Scroll-choreographed (scrub)

Progress bound to scroll. Honest framing: on the hero (visible at load) these start
fully revealed and govern _re-entry_; they shine brightest moved one section down.
Included here so you can feel the journey language on familiar content.

### Scene 9 — Scroll Cascade

One scrubbed `Revealer`, four targets, span-safe stagger. Scrolling peels items open
in order; scrolling back reverses the film.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	direction="up"
	stagger={0.2}
	offset={['start 0.95', 'start 0.45']}
	stiffness={120}
	damping={25}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Span check: 1 − 3 × 0.2 = 0.4 > 0 ✓. Use when: the hero should _respond_ to scroll
rather than perform on load. Wide offset (`0.95 → 0.45`) gives a long, forgiving Eagles
gesture; narrow it (`0.9 → 0.6`) for a quicker payoff.

### Scene 10 — Scroll Bands (per-item offsets, per-item directions)

Four independent scrubbed Revealers, each owning a scroll band via `offset` — the
only way to give each item its _own direction_ while staying truly sequenced.
Offsets descend down the page: ITEM1 completes before ITEM2 begins.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<Revealer
		propClass="box xcenter"
		direction="up"
		duration={0.9}
		offset={['start 1.0', 'start 0.8']}
	>
		<!-- ITEM1 -->
	</Revealer>
	<Revealer
		propClass="box xcenter"
		direction="left"
		duration={0.9}
		offset={['start 0.8', 'start 0.6']}
	>
		<!-- ITEM2 -->
	</Revealer>
	<Revealer
		propClass="box xcenter"
		direction="right"
		duration={0.9}
		offset={['start 0.6', 'start 0.4']}
	>
		<!-- ITEM3 -->
	</Revealer>
	<Revealer
		propClass="box xcenter"
		direction="down"
		duration={0.9}
		offset={['start 0.4', 'start 0.2']}
	>
		<!-- ITEM4 -->
	</Revealer>
</div>
```

(`duration` is inert in scrub mode — listed only to keep the props self-documenting;
remove if you prefer strictness.)
Use when: you want directional contrast _and_ order. Watch out: single-target
Revealers ignore `stagger`; the sequencing here comes purely from non-overlapping
`offset` bands — keep them adjacent, not overlapping, or items double up.

### Scene 11 — Healso Anchors (manual Reveal, no spring)

`Healso` (`Reveal.svelte`) is the springless, anchor-driven sibling: linear scroll
progress between `start`/`end`, `display: contents` wrapper (invisible to layout —
no extra boxes), optional `scrub` damping seconds.

```svelte
<Healso
	propClass="box pad-y-3xl gap-2xl"
	direction="diagonal"
	ease="power2.out"
	start="top 95%"
	end="top 35%"
	scrub={2}
	stagger={0.2}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Healso>
```

Span check: 1 − 3 × 0.2 = 0.4 > 0 ✓. Use when: you want deterministic,
physics-free scrubbing (demos, reduced-motion-adjacent journeys). `ease` names here
are GSAP-flavored strings (`power2.out`, `expo.out`), not motion's `EaseDef`.

### Scene 12 — Underwater

Scrub + loose spring = everything lags behind the scroll finger, dreamlike.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	direction="up"
	stagger={0.2}
	offset={['start 0.95', 'start 0.45']}
	stiffness={45}
	damping={12}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Use when: ambient/calm brands. The low stiffness (45 vs default 120) is the whole
trick — masks trail scroll by a beat. Watch out: low stiffness + fast flick-scrolls
can leave masks visibly mid-travel; that's the aesthetic, but test on trackpads.

---

## Family C — Mixed-material ensembles (simultaneous by design)

Different movers per item. Per mechanics §3 these fire _together_ — the composition
is textural (slide vs. mask vs. bloom), not sequential. If you need order _and_
mixed materials, combine with family B bands.

### Scene 13 — Slide Text, Mask Images

Words travel; images unveil. `SlideM` moves text through space (`direction` = side it
slides _from_), `Revealer` keeps the logo/mark locked while masks peel.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<SlideM direction="down" distance={40}><!-- ITEM1 --></SlideM>
	<Revealer propClass="box xcenter" scrub={false} direction="up" duration={0.9} ease="circOut">
		<!-- ITEM2 -->
	</Revealer>
	<Revealer propClass="box xcenter" scrub={false} direction="left" duration={1.1} ease="circOut">
		<!-- ITEM3 -->
	</Revealer>
	<SlideM direction="down" distance={60}><!-- ITEM4 --></SlideM>
</div>
```

Use when: classic hero grammar — small travel distances (40–60px, not the 160 default)
keep text elegant. Watch out: each `SlideM` renders a wrapping `div`; inside the flex
column that box stretches full-width — text inside stays centered via inherited `ta-c`.

### Scene 14 — Bloom Mark

The logo arrives through defocus (`BlurM`: blur + scale + fade), everything else wipes.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<Revealer propClass="box xcenter" scrub={false} direction="up" duration={0.7} ease="easeOut">
		<!-- ITEM1 -->
	</Revealer>
	<Revealer propClass="box xcenter" scrub={false} direction="up" duration={0.9} ease="circOut">
		<!-- ITEM2 -->
	</Revealer>
	<BlurM scrub={false} radius={14} initialScale={1.08} stiffness={90} damping={18}>
		<div class="box xcenter"><!-- ITEM3 inner Logo --></div>
	</BlurM>
	<Revealer propClass="box xcenter" scrub={false} direction="up" duration={0.9} ease="circOut">
		<!-- ITEM4 -->
	</Revealer>
</div>
```

Use when: the mark deserves a hero moment — optical bloom reads as "coming into
focus." The `1.08` scale sells the defocus (real lenses bloom outward).

### Scene 15 — Hard Cut Paragraph

`CutM` with `opacity` on the closing sentence: the description snaps in with a crisp
edge + fade while the brand above wipes softly. Contrast of edge qualities.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<Revealer
		propClass="box xcenter"
		scrub={false}
		direction="up"
		duration={0.9}
		ease="circOut"
		stagger={0.3}
	>
		<!-- ITEM1 -->
		<!-- ITEM2 -->
		<!-- ITEM3 -->
	</Revealer>
	<CutM scrub={false} direction="up" opacity stiffness={140} damping={20}><!-- ITEM4 --></CutM>
</div>
```

A hybrid: staggered trio + solo closer. Use when: the tagline should land like a
punchline. `opacity` defaults false on `CutM` — the flag is what makes the snap.

---

## Family D — Typography (letters & words)

`LettersM` / `WordsM` split text into staggered fly-in units. They take a `text` prop
(simplest) or extract from children.

### Scene 16 — Letter Rain Label

The mono kicker assembles letter by letter.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<LettersM
		text="STYLING SYSTEM | LAYOUTS | PRESETS | SVELTEKIT"
		scrub={false}
		direction="right"
		distance={60}
		stagger={0.045}
		class="font-mono text-sm text-muted"
	/>
	<Revealer
		propClass="box xcenter"
		scrub={false}
		direction="up"
		duration={0.9}
		ease="circOut"
		stagger={0.3}
	>
		<!-- ITEM2 -->
		<!-- ITEM3 -->
		<!-- ITEM4 -->
	</Revealer>
</div>
```

In-view letter delay = `stagger × 0.5` per child. Tradeoff (be deliberate): the `text`
prop renders plain — the green `[ ]` span styling from ITEM1 is lost. To keep it,
render ITEM1 as children and let the component extract `innerText` (styling still
lost on split — extraction is text-only either way). Typography scenes cost inline
styling; spend it where the motion earns it.

### Scene 17 — Word Stack Paragraph

The closing sentence builds word by word while the brand wipes above.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<Revealer
		propClass="box xcenter"
		scrub={false}
		direction="up"
		duration={0.9}
		ease="circOut"
		stagger={0.3}
	>
		<!-- ITEM1 -->
		<!-- ITEM2 -->
		<!-- ITEM3 -->
	</Revealer>
	<WordsM
		text="is a composition styling system with a fluid design, canonical layout scaffolds, a presets architecture and themeable construct."
		scrub={false}
		direction="right"
		distance={80}
		stagger={0.18}
		class="text-xl text-secondary lh15 prose"
	/>
</div>
```

In-view word delay = `stagger × 0.4` per word (~0.07s → sentence assembles in ~1.5s).
No styling tradeoff here — ITEM4 has no inner markup. `distance={80}` (vs 180 default)
keeps word travel inside the text column instead of flying across the viewport.

### Scene 18 — Full Typographic Hero

Letters on the kicker, masks on the marks, words on the sentence. Maximum craft,
maximum moving parts — all simultaneous (mechanics §3), unified by shared physics.

```svelte
<div class="box pad-y-3xl gap-2xl">
	<LettersM
		text="[ STYLING SYSTEM | LAYOUTS | PRESETS | SVELTEKIT ]"
		scrub={false}
		direction="right"
		distance={60}
		stagger={0.045}
		stiffness={120}
		damping={25}
		class="font-mono text-sm text-muted"
	/>
	<Revealer
		propClass="box xcenter"
		scrub={false}
		direction="up"
		duration={0.9}
		ease="circOut"
		stagger={0.3}
	>
		<!-- ITEM2 -->
		<!-- ITEM3 -->
	</Revealer>
	<WordsM
		text="is a composition styling system with a fluid design, canonical layout scaffolds, a presets architecture and themeable construct."
		scrub={false}
		direction="right"
		distance={80}
		stagger={0.18}
		stiffness={120}
		damping={25}
		class="text-xl text-secondary lh15 prose"
	/>
</div>
```

The glue: identical `stiffness`/`damping` (120/25) across all three movers, same
`right` travel language on the text units. Shared physics is what makes simultaneous
motion read as _one scene_ instead of three accidents.

---

## Family E — Physics studies (feel before form)

Same notes, different instruments. Take Scene 1's structure; only the physics change.

### Scene 19 — Floaty Dream

Everything drifts: low stiffness, low damping, long soft tween. Anti-marketing calm.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="down"
	duration={1.6}
	ease="circInOut"
	stagger={0.5}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 3.1s. In-view stagger has no span budget (mechanics §4), so `0.5` is legal
here — each start simply waits half a second. Pair with `BlurM`-style softness
elsewhere if the page continues the mood.

### Scene 20 — Punchy Pop

High stiffness spring, `backOut` overshoot, tight stagger. Items _snap_ into place
with a barely-there bounce.

```svelte
<Revealer
	propClass="box pad-y-3xl gap-2xl"
	scrub={false}
	direction="up"
	duration={0.5}
	ease="backOut"
	stagger={0.14}
>
	<!-- ITEM1 -->
	<!-- ITEM2 -->
	<!-- ITEM3 -->
	<!-- ITEM4 -->
</Revealer>
```

Timing: ≈ 0.9s. `backOut` overshoots the mask edge past fully-open then settles —
on clip-paths this reads as a snap rather than a bounce (masks can't overshoot
_position_, only timing). Use when: dev-tool confidence, launch pages.

---

## Family F — Two-system hand-off (sequencing past the clock limit)

Mechanics §3 is the wall: separate in-view instances have no shared clock, so a
second `Revealer` cannot be told to wait for the first. Family B buys sequencing
with scroll bands, which only works for content below the fold. A hero is above
it.

This family buys it a different way — let `Revealer` conduct the opening, then
hand off to the CSS reveal system (`$lib/transitions/reveal.css` + `use:inview`),
where each item's start time is an explicit `transition-delay` rather than a
position in someone else's stagger. The two systems never learn about each other;
they simply agree on a number.

### Scene 21 — Relay ✅ live

Three phases. `Revealer` runs the trio, the pills arrive as a fast ripple once it
has settled, and the sign-off lands last.

```svelte
<script lang="ts">
	const pills = [
		'build step', 'config file', 'purge pass', 'postcss plugin',
		'content globs', 'canon layouts', 'skills and scaffolds'
	];
	const PILLS_AT = 1.45;
	const PILL_STEP = 0.07;
	const SIGNOFF_AT = PILLS_AT + PILL_STEP * pills.length + 0.15;
</script>

<Revealer propClass="box pad-bottom-xl" scrub={false} direction="down" duration={0.9} ease="easeOut" stagger={0.3}>
	<!-- ITEM2 --> <!-- ITEM3 --> <!-- ITEM4 -->
</Revealer>

<div class="row wrap ycenter gap-md marg-auto xcenter rv-reveal" use:inview>
	{#each pills as pill, i}
		<span class="pill themed" style="transition-delay: {PILLS_AT + i * PILL_STEP}s">{pill}</span>
	{/each}
</div>

<div class="row ycenter xcenter marg-auto rv-reveal" use:inview>
	<span class="row ycenter gap-2xs text-bs" style="transition-delay: {SIGNOFF_AT}s">
		<!-- ITEM6 -->
	</span>
</div>
```

Timing: 0 / 0.3 / 0.6s for the trio (≈1.5s to settle) → pills 1.45 → 1.87s in 0.07s
steps → sign-off 2.09s. Use when: a hero has more rows than a single conductor can
stagger legibly, and you want the tail to feel like a consequence of the opening
rather than part of it.

**Why the delays are inline rather than `--rv-base` / `--rv-step`.** `reveal.css`
only defines stagger through `:nth-child(6)`. There are seven pills, and a seventh
child matches no delay rule — it would inherit `0s` and fire *before* the six that
are supposed to precede it. Writing the delay per item sidesteps the ceiling and
keeps working if the list grows.

**The seam to watch.** `PILLS_AT` is open-loop: it encodes when the `Revealer`
finishes, but nothing enforces that. Change its `duration` or `stagger` and the
constant has to move with it, or the pills overlap the description. The three
constants sit together at the top of the component so that stays one edit.

**What it degrades to.** `use:inview` arms the container on mount, so with
JavaScript off nothing is ever hidden — the full hero renders. Under
`prefers-reduced-motion`, `reveal.ts` adds `active` immediately and `reveal.css`
zeroes the transitions, so every phase lands at once with no motion.

## Quick-pick guide

| Want…                    | Scene                             |
| ------------------------ | --------------------------------- |
| Default, editorial, safe | 1 Curtain Drop                    |
| Optimism / uplift        | 2 Rise, 8 Soft Landing            |
| Text-forward reading     | 3 Reading Wipe, 17 Word Stack     |
| Drama / launch           | 4 Diagonal, 20 Punchy Pop         |
| Speed / confidence       | 5 Staccato                        |
| Ceremony / brand         | 6 Procession, 18 Typographic Hero |
| Alive / playful          | 7 Spring Ensemble                 |
| Scroll-driven story      | 9 Cascade, 10 Bands, 11 Healso    |
| Ambient / calm           | 12 Underwater, 19 Floaty          |
| Logo hero moment         | 14 Bloom Mark                     |
| Punchline tagline        | 15 Hard Cut                       |
| Texture contrast         | 13 Slide+Mask                     |
| More rows than one conductor can stagger | 21 Relay          |
| A tail that reads as a consequence | 21 Relay                |

## Open issues worth fixing (found while composing)

1. `RevealSvelteMotion` default `duration = 400` = a 400-second tween. Any
   `scrub={false}` use without explicit `duration` looks frozen. Suggest default `0.9`.
2. `stagger` default `0.5` is span-illegal for scrub mode with 3+ targets
   (mechanics §4) — targets stick shut. Suggest default `0.15` with a dev-time
   clamp/warning.
3. `SlideM` / `BlurM` / `CutM` in-view entrances have no `delay`/`stagger` props,
   so cross-component sequencing is impossible without scroll bands. A `delay`
   prop on each would unlock true multi-mover choreography (Scene 13–15, done right).
   Family F works around this rather than fixing it: the CSS reveal system takes an
   arbitrary per-item `transition-delay`, so it can be handed a start time a JS
   component has no way to accept.
