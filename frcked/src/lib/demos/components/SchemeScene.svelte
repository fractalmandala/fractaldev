<script lang="ts">
	import type { Scheme } from '../scheme-types';
	import type { RoleKey } from '../scheme-types';
	import type { SceneId } from '../playground.svelte';
	import { inkOn, contrastRatio } from '../color-utils';

	/**
	 * SchemeScene — renders one design scheme in one "setting".
	 *
	 * Everything visual inside comes from the scheme's own token layer
	 * (`--ds-*` custom properties set on the sandbox root, see
	 * `playground.svelte.ts > cssVars`). This is the sanctioned exception to
	 * the AGENTS styling rule: the showcased scheme consumes its declared
	 * tokens; the surrounding playground chrome stays on the project's sass
	 * vocabulary.
	 */

	interface Props {
		scheme: Scheme;
		pal: Record<RoleKey, string>;
		scene: SceneId;
	}

	let { scheme, pal, scene }: Props = $props();

	// Reused specimen content so scene switches compare the same story.
	const metrics = [
		{ label: 'Revenue', value: '$48.2k', delta: '+34%' },
		{ label: 'Sessions', value: '12,908', delta: '+12%' },
		{ label: 'Churn', value: '1.9%', delta: '-0.4%' }
	];

	const rows = [
		{ name: 'Aurora Labs', status: 'Active', amount: '$2,400' },
		{ name: 'Northwind Co', status: 'Pending', amount: '$860' },
		{ name: 'Helios Group', status: 'Active', amount: '$5,120' }
	];

	const cart = [
		{ item: 'Forge License ×2', price: '$290.00' },
		{ item: 'Support Plan', price: '$120.00' },
		{ item: 'Asset Pack', price: '$45.00' }
	];

	const onPrimary = $derived(inkOn(pal.primary));
	const onSurface = $derived(inkOn(pal.surface));
	const bodyContrast = $derived(contrastRatio(pal.background, pal['text-primary']));
	const secondaryContrast = $derived(contrastRatio(pal.background, pal['text-secondary']));

	// Style objects composed from the scheme's own tokens (the exception).
	// min-height/overflow keep the scene filling its preview frame; every
	// paint value resolves to a --ds-* token emitted by cssVars().
	const sandboxStyle = $derived.by(() => {
		return `
			background: ${pal.background};
			color: ${pal['text-primary']};
			font-family: var(--ds-font-body);
			font-size: var(--ds-body-size);
			font-weight: var(--ds-body-weight);
			line-height: var(--ds-body-lh);
			padding: var(--ds-section-pad);
			min-height: 100%;
			border-radius: var(--ds-card-radius);
			overflow: hidden;
		`;
	});
</script>

{#snippet navShell()}
	<div
		style="
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--ds-gap);
			padding: calc(var(--ds-base) * 1.5) var(--ds-card-pad);
			background: ${pal.surface};
			color: ${onSurface};
			border-bottom: 1px solid ${pal.border};
			border-radius: var(--ds-card-radius) var(--ds-card-radius) 0 0;
		"
	>
		<span
			style="font-family: var(--ds-font-label); font-size: var(--ds-label-size); font-weight: var(--ds-label-weight); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9;"
		>
			{scheme.name}
		</span>
		<span style="display: flex; gap: calc(var(--ds-base) * 1.5); align-items: center;">
			{#each ['Product', 'Pricing', 'Docs'] as link}
				<span style="opacity: 0.75; font-size: var(--ds-label-size);">{link}</span>
			{/each}
			<span
				style="
					background: ${pal.primary};
					color: ${onPrimary};
					padding: calc(var(--ds-base) * 0.75) calc(var(--ds-base) * 2);
					border-radius: var(--ds-control-radius);
					font-size: var(--ds-label-size);
					font-weight: var(--ds-label-weight);
				"
			>
				Sign in
			</span>
		</span>
	</div>
{/snippet}

{#snippet metricCard(metric: (typeof metrics)[number])}
	<div
		style="
			background: ${pal.surface};
			color: ${onSurface};
			border: 1px solid ${pal.border};
			border-radius: var(--ds-card-radius);
			padding: var(--ds-card-pad);
			display: flex;
			flex-direction: column;
			gap: calc(var(--ds-base) * 0.5);
		"
	>
		<span
			style="font-family: var(--ds-font-label); font-size: var(--ds-label-size); font-weight: var(--ds-label-weight); opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em;"
		>
			{metric.label}
		</span>
		<span style="font-family: var(--ds-font-display); font-size: 1.6em; font-weight: var(--ds-display-weight); line-height: 1.1;">
			{metric.value}
		</span>
		<span
			style="
				color: ${metric.delta.startsWith('-') ? pal.secondary : pal.primary};
				font-family: var(--ds-font-label);
				font-size: var(--ds-label-size);
			"
		>
			{metric.delta} this period
		</span>
	</div>
{/snippet}

{#snippet primaryButton(label: string, bg: string, ink: string)}
	<span
		style="
			display: inline-block;
			background: ${bg};
			color: ${ink};
			padding: calc(var(--ds-base) * 1.25) calc(var(--ds-base) * 3);
			border-radius: var(--ds-control-radius);
			font-family: var(--ds-font-label);
			font-size: var(--ds-label-size);
			font-weight: var(--ds-label-weight);
			border: 1px solid ${pal.border};
		"
	>
		{label}
	</span>
{/snippet}

{#if scene === 'app'}
	<div class="hfull" style={sandboxStyle}>
		{@render navShell()}
		<div style="display: flex; gap: var(--ds-gap); padding-top: var(--ds-card-pad); align-items: stretch; flex-wrap: wrap;">
			{#each metrics as metric}
				<div style="flex: 1 1 160px; min-width: 150px;">
					{@render metricCard(metric)}
				</div>
			{/each}
		</div>
		<div
			style="
				margin-top: var(--ds-gap);
				background: ${pal.surface};
				border: 1px solid ${pal.border};
				border-radius: var(--ds-card-radius);
				overflow: hidden;
			"
		>
			<div style="padding: var(--ds-card-pad) var(--ds-card-pad) calc(var(--ds-base) * 1.5); font-family: var(--ds-font-display); font-size: 1.2em; font-weight: var(--ds-display-weight);">
				Recent activity
			</div>
			{#each rows as row, i}
				<div
					style="
						display: flex;
						justify-content: space-between;
						align-items: center;
						gap: var(--ds-gap);
						padding: calc(var(--ds-base) * 1.5) var(--ds-card-pad);
						${i % 2 === 1 ? `background: ${pal.neutral};` : ''}
						border-top: 1px solid ${pal.border};
					"
				>
					<span style="display: flex; align-items: center; gap: calc(var(--ds-base) * 1.5);">
						<span style="width: 10px; height: 10px; border-radius: var(--ds-pill-radius); background: ${row.status === 'Active' ? pal.primary : pal.accent};"></span>
						<span>{row.name}</span>
					</span>
					<span style="opacity: 0.7; font-size: var(--ds-label-size);">{row.status}</span>
					<span style="font-family: var(--ds-font-label); font-size: var(--ds-label-size);">{row.amount}</span>
				</div>
			{/each}
		</div>
	</div>
{:else if scene === 'landing'}
	<div class="hfull" style={sandboxStyle}>
		{@render navShell()}
		<div style="display: flex; flex-direction: column; gap: var(--ds-gap); align-items: flex-start; padding-top: var(--ds-section-pad); max-width: 56ch;">
			<span
				style="
					font-family: var(--ds-font-label);
					font-size: var(--ds-label-size);
					font-weight: var(--ds-label-weight);
					text-transform: uppercase;
					letter-spacing: 0.12em;
					background: ${pal.tertiary};
					color: ${inkOn(pal.tertiary)};
					padding: calc(var(--ds-base) * 0.5) calc(var(--ds-base) * 1.5);
					border-radius: var(--ds-pill-radius);
				"
			>
				New · v9.2.4
			</span>
			<h2
				style="
					font-family: var(--ds-font-display);
					font-size: var(--ds-display-size);
					font-weight: var(--ds-display-weight);
					line-height: var(--ds-display-lh);
					letter-spacing: var(--ds-display-tracking);
					margin: 0;
				"
			>
				Algorithmic generation for modern creators.
			</h2>
			<p style="color: ${pal['text-secondary']}; margin: 0; max-width: 44ch;">
				{scheme.description.slice(0, 140)}…
			</p>
			<span style="display: flex; gap: calc(var(--ds-base) * 2); flex-wrap: wrap;">
				{@render primaryButton('Start building', pal.primary, onPrimary)}
				{@render primaryButton('View docs', pal.neutral, inkOn(pal.neutral))}
			</span>
			<span style="display: flex; gap: calc(var(--ds-base) * 1.5); flex-wrap: wrap; margin-top: var(--ds-base);">
				{#each ['Bento', 'Charts', 'WebGL', 'Motion'] as tag}
					<span
						style="
							font-family: var(--ds-font-label);
							font-size: var(--ds-label-size);
							padding: calc(var(--ds-base) * 0.5) calc(var(--ds-base) * 1.5);
							border: 1px solid ${pal.border};
							border-radius: var(--ds-pill-radius);
							color: ${pal['text-secondary']};
						"
					>
						{tag}
					</span>
				{/each}
			</span>
		</div>
	</div>
{:else if scene === 'checkout'}
	<div class="hfull" style={sandboxStyle}>
		{@render navShell()}
		<div style="display: flex; gap: var(--ds-gap); flex-wrap: wrap; padding-top: var(--ds-card-pad);">
			<div
				style="
					flex: 2 1 280px;
					background: ${pal.surface};
					border: 1px solid ${pal.border};
					border-radius: var(--ds-card-radius);
					padding: var(--ds-card-pad);
					color: ${onSurface};
					display: flex;
					flex-direction: column;
					gap: var(--ds-gap);
				"
			>
				<span style="font-family: var(--ds-font-display); font-size: 1.2em; font-weight: var(--ds-display-weight);">Payment</span>
				{#each ['Cardholder name', 'Card number'] as field}
					<div style="display: flex; flex-direction: column; gap: calc(var(--ds-base) * 0.5); font-family: var(--ds-font-label); font-size: var(--ds-label-size); opacity: 0.85;">
						{field}
						<span
							style="
								display: block;
								height: 36px;
								background: ${pal.background};
								border: 1px solid ${pal.border};
								border-radius: var(--ds-control-radius);
							"
						></span>
					</div>
				{/each}
				<span style="display: flex; gap: calc(var(--ds-base) * 1.5);">
					{@render primaryButton('Pay $455.00', pal.primary, onPrimary)}
					{@render primaryButton('Cancel', 'transparent', onSurface)}
				</span>
			</div>
			<div
				style="
					flex: 1 1 220px;
					background: ${pal.neutral};
					border: 1px solid ${pal.border};
					border-radius: var(--ds-card-radius);
					padding: var(--ds-card-pad);
					display: flex;
					flex-direction: column;
					gap: calc(var(--ds-base) * 1.5);
				"
			>
				<span style="font-family: var(--ds-font-label); font-size: var(--ds-label-size); text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.75;">Order summary</span>
				{#each cart as line}
					<span style="display: flex; justify-content: space-between; gap: var(--ds-gap);">
						<span>{line.item}</span>
						<span style="font-family: var(--ds-font-label);">{line.price}</span>
					</span>
				{/each}
				<span style="display: flex; justify-content: space-between; border-top: 1px solid ${pal.border}; padding-top: calc(var(--ds-base) * 1.5); font-weight: var(--ds-label-weight);">
					<span>Total</span>
					<span>$455.00</span>
				</span>
			</div>
		</div>
	</div>
{:else if scene === 'article'}
	<div class="hfull" style={sandboxStyle}>
		{@render navShell()}
		<div style="max-width: 62ch; padding-top: var(--ds-card-pad); display: flex; flex-direction: column; gap: var(--ds-gap);">
			<span
				style="
					font-family: var(--ds-font-label);
					font-size: var(--ds-label-size);
					color: ${pal.primary};
					text-transform: uppercase;
					letter-spacing: 0.1em;
				"
			>
				Field notes
			</span>
			<h2
				style="
					font-family: var(--ds-font-display);
					font-size: calc(var(--ds-display-size) * 0.62);
					font-weight: var(--ds-display-weight);
					line-height: var(--ds-display-lh);
					margin: 0;
				"
			>
				Design tokens are a contract, not a palette.
			</h2>
			<p style="margin: 0;">
				Every swatch in this ground is a live custom property. Change one role and the
				entire page re-tunes itself — surfaces, ink, borders and accents all keep the
				relationships the scheme declared.
			</p>
			<p style="margin: 0; color: ${pal['text-secondary']};">
				Secondary copy sits a step down in contrast ({secondaryContrast.toFixed(1)}:1 against
				the background) while body text holds {bodyContrast.toFixed(1)}:1. The scheme's
				spacing rhythm ({scheme.spacing.base ?? '8px'} base) drives every gap you see.
			</p>
			<blockquote
				style="
					margin: 0;
					padding: calc(var(--ds-base) * 1.5) var(--ds-card-pad);
					border-left: 3px solid ${pal.accent};
					background: ${pal.surface};
					color: ${onSurface};
					border-radius: 0 var(--ds-card-radius) var(--ds-card-radius) 0;
				"
			>
				A scheme is a system of relationships. Change the inputs, keep the relationships.
			</blockquote>
			<span style="display: flex; gap: calc(var(--ds-base) * 1.5); flex-wrap: wrap;">
				{@render primaryButton('Share', pal.primary, onPrimary)}
				{@render primaryButton('Save', pal.surface, onSurface)}
			</span>
		</div>
	</div>
{/if}