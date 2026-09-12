import type { Deck, Slide } from '$site/types.js'

export const deck: Deck = {
	wordmark: 'Fractalstyler · Orientation',
	seed: { sides: 6, ratio: 1.42 },
	dialLabels: { sides: 'Seed', ratio: 'Ratio' },
	dialNote:
		'Both dials stay live for the rest of the ascent. Move them at any level and watch every level move.'
}

export const slides: Slide[] = [
	{
		id: 'bindu',
		node: 'Bindu',
		step: 'Orientation',
		sanskrit: 'यथा पिण्डे तथा ब्रह्माण्डे',
		translit: 'yathā piṇḍe tathā brahmāṇḍe',
		heading: 'As in the microcosm, so in the macrocosm.',
		body: [
			'The oldest description of order we have is not a hierarchy. It is a repetition — the same rule, holding at every scale.',
			'This is what *ṛta* means, and it is the only idea you need in order to understand this system.',
			'Six accretions. No syntax yet.'
		],
		dials: false,
		graphic: { kind: 'mandala', level: 0 },
		caption: 'a point, and a rule'
	},
	{
		id: 'seed',
		node: 'Seed',
		step: 'First accretion · the seed',
		heading: 'A fractal is a thing that contains its {own rule}.',
		body: [
			'Not a shape. A shape plus the instruction for making more of itself.',
			'Two numbers here: how many sides the unit has, and the ratio by which it will grow. Set them however you like — they are yours, and nothing else in the figure will be asked of you.'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 0 },
		caption: 'the unit that contains its own rule',
		footnote: {
			label: 'In the styling system',
			text: 'Tokens. Colour, size, type-scale. The smallest things, from which the rest has no choice but to follow.'
		},
		example: {
			label: 'L0',
			code: `[[ two or three real token declarations from src/lib/styles ]]`
		}
	},
	{
		id: 'spread',
		node: 'Spread',
		step: 'Second accretion · the spreading',
		heading: 'Nothing exists until something {spreads out}.',
		body: [
			'The seed repeats outward at your ratio. Notice what did *not* happen: no new shape was introduced. Distance is the only new information.',
			'Pull the ratio down and the rings crowd inward; push it up and they breathe. One number governs all five.'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 1 },
		caption: 'the same unit, further out',
		footnote: {
			label: 'In the styling system',
			text: 'Dimensions. Gaps, padding, margins, heights, widths — space made from the tokens, and from nothing else.'
		},
		example: {
			label: 'L1',
			code: `[[ a real gap / pad class or two, showing they read from L0 ]]`
		}
	},
	{
		id: 'echo',
		node: 'Echo',
		step: 'Third accretion · self-similarity',
		heading: 'Look at any vertex. It is the {whole}, smaller.',
		body: [
			'Here is the move that makes the whole thing work. The unit is placed at each point of itself, at a smaller scale, following the same rule.',
			'This is why the figure never looks assembled. Nothing was added to it — it was *folded*.'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 2 },
		caption: 'look closely at any vertex',
		footnote: {
			label: 'In the styling system',
			text: 'Containers. A card, a button, an input — all one box, differing only in which dimensions they claim.'
		},
		example: {
			label: 'L2',
			code: `[[ a real container class plus the aligner or tuner it pairs with ]]`
		}
	},
	{
		id: 'cluster',
		node: 'Cluster',
		step: 'Fourth accretion · the cluster',
		heading: 'Stars form galaxies. Galaxies {cluster}.',
		body: [
			'Once a form is stable, it becomes a unit for the next scale up. What was the whole figure a moment ago is now a single point in a larger arrangement.',
			'The count is not arbitrary. Arrangements hold together when their number divides cleanly — harmony is arithmetic before it is taste.'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 3 },
		caption: 'motifs orbiting motifs',
		footnote: {
			label: 'In the styling system',
			text: 'Layouts. Grids and sections that step down through counts that keep their rhythm, and never strand a row.'
		},
		example: {
			label: 'L3',
			code: `[[ a real grid class, ideally the one that encodes 6 -> 3 -> 2 -> 1 ]]`
		}
	},
	{
		id: 'enclose',
		node: 'Enclose',
		step: 'Fifth accretion · the enclosure',
		heading: 'Now the figure turns {inside out}.',
		body: [
			'Everything so far built outward from a point. The last structural move comes from the other direction — a boundary, drawn from the same seed count, closing the whole thing.',
			'Count the marks on the outer ring. They are your number. *The wrapper is made of the same rule as the thing it wraps.*'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 4 },
		caption: 'the same grammar, from outside in',
		footnote: {
			label: 'In the styling system',
			text: 'Shells. Page, app, docs — enclosures that know when to expand and when to retract, built from the same grammar as their contents.'
		},
		example: {
			label: 'L4',
			code: `[[ the real app-shell or docs-shell skeleton, three or four lines ]]`
		}
	},
	{
		id: 'light',
		node: 'Light',
		step: 'Sixth accretion · the light',
		heading: 'And only now, {light}.',
		body: [
			'Nothing structural changed on this screen. The figure was already complete — it simply became visible.',
			'This is the correct order and the easy one to get backwards. Appearance is the *last* layer, which is exactly why it can be swapped wholesale without disturbing anything beneath it.'
		],
		dials: true,
		graphic: { kind: 'mandala', level: 5 },
		caption: 'now it is seen',
		footnote: {
			label: 'In the styling system',
			text: 'Looks. Surfaces, borders, states, themes — the outermost skin, and the only one you should ever have to change your mind about.'
		},
		example: {
			label: 'L5',
			code: `[[ a real surface / popover class, plus a theme swap line ]]`
		}
	},
	{
		id: 'whole',
		node: 'Whole',
		step: 'The heuristic',
		heuristic: [
			'Everything is a fractal.',
			'Fractals group in layers.',
			'One layer {seeds} the next.',
			'From tokens to appshells.'
		],
		body: [
			'That is the entire system. Every class you will meet is one of these six accretions wearing a name.',
			'You did not learn a framework. You learned a rule, and the rule holds at every scale — which is the only reason a stylesheet built this way stays consistent without anyone enforcing it.'
		],
		dials: false,
		graphic: { kind: 'mandala', level: 5 },
		caption: 'yathā brahmāṇḍe tathā piṇḍe',
		footnote: {
			label: 'Where to go',
			text: 'Getting started, or hand the agent plugin to your assistant and let it lead.'
		}
	}
]
