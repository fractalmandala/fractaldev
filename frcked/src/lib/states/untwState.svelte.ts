// Shared Untw state for the /untw-fd decoder workbench. The Convert/Copy
// toolbar at the top of untw-fd/+page.svelte binds to this module, and both
// panes read from it, so toolbar buttons drive the pasted-code conversion.

import { tick } from 'svelte';
import { decode, type DecodeResult } from '$lib/utilities/untw/decode';

export const SAMPLE = `export function Card() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Title</h2>
      <p className="text-sm text-slate-500 leading-6">Body copy here</p>
      <button className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700">Action</button>
    </div>
  )
}`;

export const SAMPLE_ACCORDION = `<div className="text-sm data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden">
  <div className="pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4">
    hi
  </div>
</div>`;

export const THEME_HINT = `@theme {
  --color-foreground: oklch(0.2 0 0);
  --animate-accordion-down: accordion-down 0.2s ease-out;
}`;

export const untw = $state<{
	input: string;
	themeCss: string;
	result: DecodeResult | null;
	error: string;
	busy: boolean;
	copied: string | null;
}>({
	input: SAMPLE,
	themeCss: '',
	result: null,
	error: '',
	busy: false,
	copied: null
});

export async function runConvert() {
	if (!untw.input.trim() || untw.busy) return;
	untw.busy = true;
	untw.error = '';
	untw.copied = null;
	// yield so the Working…/disabled state paints before the sync decode blocks
	await tick();
	try {
		untw.result = decode(untw.input, untw.themeCss);
	} catch (e) {
		untw.result = null;
		untw.error = String(e);
	} finally {
		untw.busy = false;
	}
}

export function clearAll() {
	untw.input = '';
	untw.themeCss = '';
	untw.result = null;
	untw.error = '';
	untw.copied = null;
}

export async function copyText(
	text: string,
	label: string,
	say: (msg: string, kind?: string) => void
) {
	try {
		await navigator.clipboard.writeText(text);
		untw.copied = label;
		setTimeout(() => {
			untw.copied = null;
		}, 1600);
	} catch {
		say('clipboard unavailable', 'bad');
	}
}
