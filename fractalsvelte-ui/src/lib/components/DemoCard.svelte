<script lang="ts">
	import type { Snippet } from 'svelte';
	import DemoSurface from './DemoSurface.svelte';
	import SegmentedControl, { type SegmentOption } from './SegmentedControl.svelte';

	export type DemoOption<T extends string = string> = {
		value: T;
		label: string;
		code?: string;
	};

	/**
	 * A single-variation example card: a variation selector, the live surface and
	 * the code for the selected variation. For components whose docs page wants a
	 * multi-prop playground, use `Playground` instead.
	 */
	type Props = {
		title: string;
		description?: string;
		code?: string;
		options?: Array<DemoOption | string>;
		selected?: string;
		onSelect?: (value: string) => void;
		children?: Snippet<[selected: string]>;
		class?: string;
		styleProps?: { selector?: string } | boolean;
	};

	let {
		title,
		description,
		code = '',
		options,
		selected = $bindable(''),
		onSelect,
		children,
		class: className = '',
		styleProps = false
	}: Props = $props();

	const rootClass = $derived(['demo-card', className].filter(Boolean).join(' '));

	const normalizedOptions = $derived<SegmentOption[]>(
		(options ?? []).map((opt) =>
			typeof opt === 'string'
				? { value: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }
				: { value: opt.value, label: opt.label }
		)
	);

	let internalSelected = $state<string>('');

	const currentSelected = $derived(
		internalSelected || selected || (options && options.length > 0 ? (typeof options[0] === 'string' ? options[0] : options[0].value) : '')
	);

	const activeCode = $derived.by(() => {
		if (options && options.length > 0) {
			const match = options.find((opt) => (typeof opt === 'string' ? opt : opt.value) === currentSelected);
			if (match && typeof match !== 'string' && match.code) {
				return match.code;
			}
		}
		return code;
	});

	function handleSelect(val: string) {
		internalSelected = val;
		selected = val;
		onSelect?.(val);
	}
</script>

{#snippet preview()}
	{@render children?.(currentSelected)}
{/snippet}

<figure class={rootClass}>
	<figcaption class="box gap-xs">
		<div class="box gap-3xs grow">
			{#if description}
				<p class="text-secondary text-sm">{description}</p>
			{/if}
		</div>
		{#if normalizedOptions.length > 0}
			<div class="row shrink-0">
				<SegmentedControl
					options={normalizedOptions}
					value={currentSelected}
					onValueChange={handleSelect}
					label="{title} variation selector"
				/>
			</div>
		{/if}
	</figcaption>
	<DemoSurface code={activeCode} {styleProps} children={preview} />
</figure>

<style lang="sass">
.demo-card
	display: flex
	flex-direction: column
	overflow: hidden
	gap: var(--space-md)
</style>
