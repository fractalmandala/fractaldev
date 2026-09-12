<script lang="ts">
	import type { Scheme } from '../scheme-types';
	import { ROLE_KEYS, ROLE_LABELS, type RoleKey } from '../scheme-types';
	import { playground } from '../playground.svelte';
	import { contrastGrade, contrastRatio } from '../color-utils';

	/**
	 * PaletteEditor — live color controls for the active scheme.
	 *
	 * Chrome only: every class comes from the project's sass vocabulary
	 * (surfaces, borders, buttons, badges, inputs). The scheme's own colors
	 * appear only as `value` on native color inputs.
	 */

	interface Props {
		scheme: Scheme;
	}

	let { scheme }: Props = $props();

	const id = $derived(scheme.id);
	const pal = $derived(playground.palette(id));

	const roleRows = $derived(
		ROLE_KEYS.map((role) => ({
			role,
			value: pal[role],
			grade: contrastGrade(pal[role])
		}))
	);

	const bodyInkRatio = $derived(contrastRatio(pal.background, pal['text-primary']));
	const surfaceInkRatio = $derived(contrastRatio(pal.surface, pal['text-primary']));
	const pairRatio = $derived(contrastRatio(pal.primary, pal.background));

	function ratioBadge(ratio: number): string {
		if (ratio >= 7) return 'AAA';
		if (ratio >= 4.5) return 'AA';
		if (ratio >= 3) return 'UI';
		return 'LOW';
	}

	function badgeClasses(ratio: number): string {
		if (ratio >= 4.5) return 'badge text-success';
		if (ratio >= 3) return 'badge text-warning';
		return 'badge text-danger';
	}
</script>

<div class="box gap-md">
	<div class="row ycenter xbetween">
		<h3 class="text-sm weight-600 text-primary">Palette</h3>
		<div class="row gap-sm">
			<button
				class="button small ghost"
				onclick={() => playground.undo(id)}
				disabled={!playground.canUndo(id)}
				title="Undo last change"
			>
				Undo
			</button>
			<button
				class="button small ghost"
				onclick={() => playground.shuffle(id)}
				title="Deal a fresh random palette"
			>
				🎲 Shuffle
			</button>
			<button
				class="button small ghost"
				onclick={() => playground.reset(id)}
				title="Restore the scheme's canonical colors"
			>
				Reset
			</button>
		</div>
	</div>

	<div class="box gap-xs">
		{#each roleRows as { role, value, grade } (role)}
			<div class="row ycenter gap-sm pad-right-4">
				<input
					type="color"
					aria-label="Edit {ROLE_LABELS[role]}"
					title="Edit {ROLE_LABELS[role]}"
					value={value}
					oninput={(e) => playground.setRole(id, role as RoleKey, e.currentTarget.value)}
					class="square-24 shrink-0 bord0"
				/>
				<div class="grow min0">
					<div class="text-xs weight-500 text-primary">{ROLE_LABELS[role]}</div>
					<code class="text-xs text-muted">{value}</code>
				</div>
				<span
					class="badge {grade === 'LOW' || grade === 'UI' ? 'text-warning' : 'text-success'}"
					title="Best-case contrast against black or white"
				>
					{grade}
				</span>
				<button
					class="button small ghost"
					onclick={() => playground.spinRole(id, role as RoleKey, 36)}
					title="Spin hue +36°"
				>
					↻
				</button>
				<button
					class="button small ghost"
					onclick={() => playground.spinRole(id, role as RoleKey, -36)}
					title="Spin hue −36°"
				>
					↺
				</button>
			</div>
		{/each}
	</div>

	<div class="border-top pad-top-8 box gap-xs">
		<div class="row ycenter xbetween">
			<span class="text-xs text-secondary">body ink on background</span>
			<span class={badgeClasses(bodyInkRatio)}>{ratioBadge(bodyInkRatio)} {bodyInkRatio.toFixed(1)}</span>
		</div>
		<div class="row ycenter xbetween">
			<span class="text-xs text-secondary">primary on background</span>
			<span class={badgeClasses(pairRatio)}>{ratioBadge(pairRatio)} {pairRatio.toFixed(1)}</span>
		</div>
		<div class="row ycenter xbetween">
			<span class="text-xs text-secondary">ink on surface</span>
			<span class={badgeClasses(surfaceInkRatio)}>{ratioBadge(surfaceInkRatio)} {surfaceInkRatio.toFixed(1)}</span>
		</div>
	</div>

	<p class="text-xs text-muted">
		Edits repaint every scene of this scheme instantly. They are session-local — reload to
		restore the canonical palette.
	</p>
</div>
