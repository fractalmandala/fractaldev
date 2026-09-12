// Playground store — multi-element canvas with fully SCOPED styling.
// Nothing here touches <html>: presets stamp as attributes on the canvas
// wrapper (bare selectors in _00_presets.sass resolve on any element — see
// vitrine.svelte), theme stamps as a class on the same wrapper, vars apply
// as inline style on the wrapper (canvas) or the element (per-element).

import { upsertVar, removeVar, varsToStyle, type TokenOverride } from './tokens.js';

export type ElementTag = 'div' | 'section' | 'p' | 'span' | 'button' | 'img';

export interface PlaygroundElement {
	id: string;
	tag: ElementTag;
	label: string;
	classes: string;
	text: string;
	vars: TokenOverride[];
}

export interface CanvasPresets {
	layout: '' | 'tight' | 'comfortable' | 'sprawling';
	shape: '' | 'round' | 'curved' | 'pro' | 'sharp' | 'zero';
	color: '' | 'clean' | 'vibrant' | 'zero';
	motion: '' | 'reduced' | 'heavy' | 'active' | 'springy';
	mode: 'light' | 'dark';
	theme: string;
}

let n = 0;
function nid(): string {
	n += 1;
	return `el${Date.now().toString(36)}${n}`;
}

function seed(): PlaygroundElement[] {
	return [
		{
			id: nid(),
			tag: 'div',
			label: 'Hero stack',
			classes: 'box ycenter gap-md pad-lg surface border radius-md',
			text: 'Compose in markup. Change a class, watch it move.',
			vars: []
		},
		{
			id: nid(),
			tag: 'div',
			label: 'Card row',
			classes: 'row xbetween ycenter gap-bs pad-md raised border radius-md wrap',
			text: 'Three cards share one row. Swap gap-bs to gap-xl.',
			vars: []
		},
		{
			id: nid(),
			tag: 'div',
			label: 'Grid trio',
			classes: 'grid-3 gap-md pad-md panel border radius-lg',
			text: 'Grid steps 1 → 3 at lg. Narrow the canvas to see it collapse.',
			vars: []
		}
	];
}

export const playground = $state({
	elements: seed() as PlaygroundElement[],
	selectedId: '' as string,
	canvas: {
		layout: '',
		shape: '',
		color: '',
		motion: '',
		mode: 'light',
		theme: 'theme-light-default'
	} as CanvasPresets,
	canvasVars: [] as TokenOverride[],
	width: 0 as number,
	themeQuery: '' as string,
	tokenQuery: '' as string
});

if (!playground.selectedId && playground.elements.length) {
	playground.selectedId = playground.elements[0].id;
}

export function selected(): PlaygroundElement | undefined {
	return playground.elements.find((e) => e.id === playground.selectedId);
}

export function addElement(): void {
	const el: PlaygroundElement = {
		id: nid(),
		tag: 'div',
		label: `Block ${playground.elements.length + 1}`,
		classes: 'box gap-sm pad-md surface border radius-md',
		text: 'New block — type classes on the left.',
		vars: []
	};
	playground.elements = [...playground.elements, el];
	playground.selectedId = el.id;
}

export function duplicateElement(id: string): void {
	const src = playground.elements.find((e) => e.id === id);
	if (!src) return;
	const copy: PlaygroundElement = {
		...src,
		id: nid(),
		label: `${src.label} copy`,
		vars: src.vars.map((v) => ({ ...v }))
	};
	playground.elements = [...playground.elements, copy];
	playground.selectedId = copy.id;
}

export function removeElement(id: string): void {
	playground.elements = playground.elements.filter((e) => e.id !== id);
	if (playground.selectedId === id) playground.selectedId = playground.elements[0]?.id ?? '';
}

export function moveElement(id: string, dir: -1 | 1): void {
	const i = playground.elements.findIndex((e) => e.id === id);
	const j = i + dir;
	if (i < 0 || j < 0 || j >= playground.elements.length) return;
	const next = [...playground.elements];
	[next[i], next[j]] = [next[j], next[i]];
	playground.elements = next;
}

export function setClasses(id: string, classes: string): void {
	playground.elements = playground.elements.map((e) => (e.id === id ? { ...e, classes } : e));
}

export function setText(id: string, text: string): void {
	playground.elements = playground.elements.map((e) => (e.id === id ? { ...e, text } : e));
}

export function setTag(id: string, tag: ElementTag): void {
	playground.elements = playground.elements.map((e) => (e.id === id ? { ...e, tag } : e));
}

export function setLabel(id: string, label: string): void {
	playground.elements = playground.elements.map((e) => (e.id === id ? { ...e, label } : e));
}

export function setElementVar(id: string, token: string, value: string): void {
	playground.elements = playground.elements.map((e) =>
		e.id === id ? { ...e, vars: upsertVar(e.vars, token, value) } : e
	);
}

export function clearElementVar(id: string, token: string): void {
	playground.elements = playground.elements.map((e) =>
		e.id === id ? { ...e, vars: removeVar(e.vars, token) } : e
	);
}

export function setCanvasVar(token: string, value: string): void {
	playground.canvasVars = upsertVar(playground.canvasVars, token, value);
}

export function clearCanvasVar(token: string): void {
	playground.canvasVars = removeVar(playground.canvasVars, token);
}

export function canvasVarValue(token: string): string {
	return playground.canvasVars.find((v) => v.token === token)?.value ?? '';
}

/** Attributes stamped on the canvas wrapper — scoped, absent means default. */
export function canvasAttrs(): Record<string, string> {
	const c = playground.canvas;
	const attrs: Record<string, string> = { 'data-mode': c.mode };
	if (c.layout) attrs['data-layout'] = c.layout;
	if (c.shape) attrs['data-shape'] = c.shape;
	if (c.color) attrs['data-color'] = c.color;
	if (c.motion) attrs['data-motion'] = c.motion;
	return attrs;
}

export function canvasStyle(): string {
	return varsToStyle(playground.canvasVars);
}

export function elementStyle(el: PlaygroundElement): string {
	return varsToStyle(el.vars);
}

/** Copy-ready Svelte for one element. */
export function elementSnippet(el: PlaygroundElement): string {
	const style = elementStyle(el);
	const styleAttr = style ? ` style="${style}"` : '';
	if (el.tag === 'img')
		return `<img class="${el.classes}"${styleAttr} src="/images/fractalstyler.png" alt="${el.label}" />`;
	if (el.tag === 'button') return `<button class="${el.classes}"${styleAttr}>${el.text}</button>`;
	return `<${el.tag} class="${el.classes}"${styleAttr}>${el.text}</${el.tag}>`;
}

/** Copy-ready Svelte for the whole canvas (scoped presets + vars). */
export function canvasSnippet(): string {
	const attrs = canvasAttrs();
	const attrStr = Object.entries(attrs)
		.map(([k, v]) => `${k}="${v}"`)
		.join(' ');
	const style = canvasStyle();
	const styleAttr = style ? ` style="${style}"` : '';
	const theme = playground.canvas.theme ? ` ${playground.canvas.theme}` : '';
	const open = `<div class="box gap-md pad-md border radius-md${theme}" ${attrStr}${styleAttr}>`;
	const body = playground.elements.map((e) => `  ${elementSnippet(e)}`).join('\n');
	return `${open}\n${body}\n</div>`;
}
