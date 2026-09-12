import type { SystemDeck, SystemSlide } from '$site/types.js'
import { initialSpecimen } from '$site/data/specimen.svelte.js'

export const systemDeck: SystemDeck = {
	wordmark: 'Fractalstyler · The Instrument',
	specimen: initialSpecimen()
}

/**
 * ACT II. Act I taught the rule with no class names in it. This hands over the
 * instrument: one specimen, nine screens, real compiled CSS, and a ledger that
 * never records a line of custom stylesheet.
 *
 * Every class named in this file must resolve against registry.json —
 * `node scripts/validate-deck.js` enforces it.
 */
export const systemSlides: SystemSlide[] = [
	{
		id: 'threshold',
		node: 'Glass',
		step: 'The instrument',
		heading: 'You have the rule. Here is the {instrument}.',
		body: [
			'Everything inside the lit frame from here on is the real system — the same stylesheet a project gets on install, not an illustration of one.',
			'That stylesheet ships two ways from one source: a compiled *.css* file for projects with no toolchain, and editable *.sass* partials if you want to retune the generators. Nothing in this deck differs between them.',
			'Everything outside the frame is this page, and touches none of it. Watch that boundary; on the last screen it becomes the whole argument.'
		],
		rig: { kind: 'none' },
		ledger: { label: 'nothing yet', fresh: [] },
		footnote: {
			label: 'The compact',
			text: 'Nine screens. You will not be asked to write a stylesheet, and nowhere will you be offered the chance.'
		}
	},
	{
		id: 'constants',
		node: 'Tokens',
		level: 'L0',
		step: 'First level · the constants',
		source: 'docs/04 · _00_tokens.sass',
		heading: 'Values that {move on their own}.',
		body: [
			'A type step here is not a number. It is a floor, a ceiling, and a line between them — so the same class is correct at 360px and at 1240px, and nothing has to be re-decided in between.',
			'Colour works the same way by a different mechanism: thirty *roles*, never a hex at the call site.'
		],
		rig: { kind: 'ruler' },
		ledger: { label: 'still nothing', fresh: [] },
		footnote: {
			label: 'The one thing to carry',
			text: 'Every token is also a class. If `--space-md` exists, so do `.gap-md`, `.pad-md`, `.marg-md`. You will never have to look up a second vocabulary.'
		}
	},
	{
		id: 'space',
		node: 'Space',
		level: 'L1',
		step: 'Second level · space',
		source: 'docs/05 · _02_dimensions.sass',
		heading: 'You name a {role}, never a number.',
		body: [
			'Two questions, and they are different questions: how far apart are the children, and how far in from the edge does the content start. Gap and pad.',
			'Set them by step, not by pixel — then watch what one density attribute does to both at once, at *different* rates, because scaling them equally would change nothing you can see.'
		],
		footnote: {
			label: 'When you need an exact pixel',
			text: 'There is a literal escape hatch — `.gap-16`, `.radius-4`, `.w-240` — drawn from a discrete ladder rather than any integer: 0, 1, 2, 4, 6, 8, 12, then every multiple of 8. Fine where interfaces need precision, coarse where nothing is served by `.gap-137`.'
		},
		rig: { kind: 'stepwheel' },
		ledger: { label: 'the specimen gains space', fresh: ['gap-*', 'pad-*'] }
	},
	{
		id: 'axis',
		node: 'Axis',
		level: 'L2',
		step: 'Third level · the axis contract',
		source: 'docs/06 · _03_containers.sass',
		heading: 'x is {always} horizontal. Always.',
		body: [
			'Ninety percent of layout is three classes — `.box` down, `.row` across, `.grid` in both. The interesting part is what happens to alignment when you switch between them.',
			'Flip the container below. Your class names do not move. The native properties underneath them trade places — and *that* swap, held in your head on every component you have ever written, is the tax this contract removes.'
		],
		rig: { kind: 'axispad' },
		ledger: { label: 'the specimen learns its axis', fresh: ['box', 'row', 'x*', 'y*'] },
		footnote: {
			label: 'Why it matters more than it sounds',
			text: 'Flexbox names its axes relative to direction. This names them relative to the screen. One of those you can read at a glance six months later.'
		}
	},
	{
		id: 'harmony',
		node: 'Harmony',
		level: 'L3',
		step: 'Fourth level · harmony',
		source: 'docs/07 · _04_layouts.sass',
		heading: 'Six goes to three, then two. {Never five}.',
		body: [
			'A grid of six should never step to four or five on the way down — a row is left holding one card and the composition breaks. So the stepping is built from divisors, and only divisors.',
			'Both grids below are the system. The difference is whether you know the count when you write it.'
		],
		rig: { kind: 'harmony' },
		ledger: { label: 'no change — this screen is a choice, not a class', fresh: [] },
		footnote: {
			label: 'The rule underneath',
			text: 'Harmony is arithmetic before it is taste. Nothing here was tuned by eye.'
		}
	},
	{
		id: 'enclosure',
		node: 'Shell',
		level: 'L4',
		step: 'Fifth level · the enclosure',
		source: 'docs/08 · _05_shells.sass',
		heading: 'The wrapper is made of the {same rule} as the thing it wraps.',
		body: [
			'Everything so far built outward. A shell comes from the other direction — a header, two rails, a footer, closing around content that was already complete.',
			'Narrow the viewport. The right rail retracts at 1280, the left becomes a drawer at 1024, and *you authored none of that*. It is what following the canonical markup buys.'
		],
		rig: { kind: 'shell' },
		ledger: { label: 'the canonical skeleton', fresh: ['app-shell', 'app-main', 'sidebar-*'] },
		footnote: {
			label: 'A shell without its markup is half a class',
			text: 'This is why docs/08 pairs every L4 class with an authored structure. The stylesheet cannot hold up its end alone.'
		}
	},
	{
		id: 'dress',
		node: 'Dress',
		level: 'L5',
		step: 'Sixth level · the dress',
		source: 'docs/09 · _06_visuals.sass',
		heading: 'And only now, {light}.',
		body: [
			'Nothing structural changes on this screen. The specimen was already finished — it simply becomes visible.',
			'This is the correct order, and the easy one to get backwards. Appearance is the *last* layer, which is precisely why it can be replaced wholesale without disturbing anything beneath it.'
		],
		rig: { kind: 'dress' },
		ledger: { label: 'the specimen is dressed', fresh: ['surface', 'border', 'radius-*', 'button'] }
	},
	{
		id: 'compact',
		node: 'Compact',
		step: 'The compact',
		source: 'docs/13 · the cookbook',
		heuristic: [
			'You composed in markup.',
			'You invented no class.',
			'You opened {no stylesheet}.',
			'The ledger is the whole proof.'
		],
		body: [
			'That counter was there from the first screen. It never moved, and nothing was withheld from you to keep it that way — the specimen is a real component, built the way the system intends.',
			'Everything you just did needs one stylesheet and no build step. `npx fractalstyler init --css` and the markup above works — palettes, presets and all, with scripting disabled.',
			'The one discipline that keeps a Fractalstyler codebase from turning into every codebase: before writing a class, ask whether it is already composable. It almost always is.'
		],
		rig: { kind: 'compact' },
		ledger: { label: 'final', fresh: [] }
	}
]
