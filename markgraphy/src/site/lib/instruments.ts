// The observatory's filmstrip: eight instruments shown one at a time in the
// vitrine. Live component, props and the copyable snippet come from the docs
// previews so the dossier always shows the same code as /docs/[slug].
import { previews, type PreviewEntry } from '$site/docs/previews';

export type InstrumentKind = 'animated' | 'graph' | 'diagram' | 'player';

export interface Instrument {
	/** Catalog slug; also the key into `previews` and the /docs route. */
	slug: string;
	/** Frame caption shown in the filmstrip and vitrine. */
	title: string;
	kind: InstrumentKind;
	/** One line under the vitrine. */
	caption: string;
	/** "draws" row of the dossier. */
	draws: string;
	/** Exported component name. */
	component: string;
	/** Four-line ASCII thumbnail for the filmstrip. */
	thumb: string;
}

export const instruments: Instrument[] = [
	{
		slug: 'graph-activity',
		title: 'COMMITS',
		kind: 'graph',
		caption: 'a year of contributions',
		draws: 'dated activity grid',
		component: 'GraphActivity',
		thumb: '· ·█· ·\n·█·█·█·\n█·█·█·█\n· · · ·'
	},
	{
		slug: 'graph-bars',
		title: 'DRAFT TO SHIPPED',
		kind: 'graph',
		caption: 'draft → shipped',
		draws: 'two bar groups, side by side',
		component: 'GraphBars',
		thumb: '  ▄  █\n  █  █\n ▄█ ▄█\n ██ ██'
	},
	{
		slug: 'graph-flow',
		title: 'OPTIMISTIC UI',
		kind: 'diagram',
		caption: 'optimistic ui',
		draws: 'process on a dashed arrow',
		component: 'GraphFlow',
		thumb: 'a─▶b─▶c\na─▶c···'
	},
	{
		slug: 'graph-flow-player',
		title: 'PIPELINE',
		kind: 'player',
		caption: 'scaffold → publish',
		draws: 'a stepped flow with playback',
		component: 'GraphFlowPlayer',
		thumb: '[1]──┐\n[2]──┤\n[3]──┘\n[4] ▶'
	},
	{
		slug: 'graph-ticker',
		title: 'FLEET',
		kind: 'animated',
		caption: 'monospace tape',
		draws: 'a rotating status tape',
		component: 'GraphTicker',
		thumb: 'api · db · cdn ·\n[ OK ] [ WARN ]'
	},
	{
		slug: 'graph-scope',
		title: 'RPM',
		kind: 'animated',
		caption: 'scrolling waveform',
		draws: 'a looping oscilloscope',
		component: 'GraphScope',
		thumb: '   ▁▃▅▇\n ▁▅████\n▅██████\n███████'
	},
	{
		slug: 'graph-fire',
		title: 'FURNACE',
		kind: 'animated',
		caption: 'simulated fire',
		draws: 'a cooling cellular burn',
		component: 'GraphFire',
		thumb: '  ░▒▓  \n ░▒██▒ \n▒█████▓\n███████'
	},
	{
		slug: 'graph-rain',
		title: 'RAIN',
		kind: 'animated',
		caption: 'glyph rain',
		draws: 'falling glyph streams',
		component: 'GraphRain',
		thumb: '│█│  │█\n│▓│█ │░\n│░│▓ █ \n  │░ │ '
	}
];

export function instrumentPreview(instrument: Instrument): PreviewEntry {
	const entry = previews[instrument.slug]?.[0];
	if (!entry) {
		throw new Error(`No preview for instrument ${instrument.slug}`);
	}
	return entry;
}
