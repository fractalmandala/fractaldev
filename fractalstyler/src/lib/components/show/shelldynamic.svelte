<script lang="ts">
	/**
	 * The live shell composer — the eight sanctioned shells as buttons, above a
	 * wireframe that animates between them. Styling lives in `_12_deck.sass`
	 * (scoped to `.solodeck`).
	 *
	 * The buttons come from the REAL sanctioned axis and write through
	 * `setPreset`, so this cannot drift from the grammar it advertises — and any
	 * other shell control on the page moves this wireframe too.
	 */
	import { presetAxes, presets, setPreset } from '$lib/presets/presets.svelte';
	import { type Snippet } from 'svelte';

	interface Props {
		/** Extra classes on the root. */
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();

	const shellLabels: Record<string, string> = {
		lrf: 'Full',
		lrfa: 'Docs',
		lr: 'No Footer',
		lra: 'Docs, No Footer',
		lf: 'No TOC',
		lfa: 'No TOC, tight',
		l: 'Nav Only',
		la: 'Nav Only, tight',
		f: 'No Rails',
		fa: 'No Rails, tight',
		c: 'Bare',
		ca: 'Bare, tight',
		nh: 'No Header'
	};

	// The preset axis is the ONLY source of truth. The wireframe reads whatever
	// `data-shell` the document is actually on, so the shell buttons anywhere on
	// the page — this component's included — drive the same animation.
	// Every region letter is distinct, and `c` contains none of them.
	const value = $derived(presets.shell);
	const shell = $derived({
		l: value.includes('l'),
		r: value.includes('r'),
		f: value.includes('f'),
		a: value.includes('a')
	} as Record<string, boolean>);
	const valueName = $derived(shellLabels[value] ?? value);
</script>

<div class="solodeck box gap-sm wfull ta-c {className}">
	<div class="pd-wire box gap-sm center-item hfull">
		<div class="pd-head box ycenter gap0 border hfull" class:off={shell.nh}>
			<span>HEADER COMPONENT</span>
		</div>
		<div class="pd-bodyrow row gap-sm hfull">
			<div class="pd-rail" class:off={!shell.l}>nav</div>
			<div class="pd-mainrow pad-sm">
				<div class="pd-art wfull" style="background: var(--bg)" class:wide={!shell.a}>
					{#if shell.a}
						<div class="pd-art-title text-theme">
							<div class="box gap-xs text-primary">
								<span class="center-item text-secondary">data-shell: {value} | {valueName} </span>
								{@render children()}
								<div class="row ycenter center-item gap-sm">
									{#each presetAxes.shell as option}
										<button
											type="button"
											class="button small outline"
											class:active={value === option}
											aria-pressed={value === option}
											title={shellLabels[option] ?? option}
											onclick={() => setPreset('shell', option)}
										>
											{shellLabels[option] ?? option}
										</button>
									{/each}
								</div>
							</div>
						</div>
					{:else}
						<div class="box gap-xs text-primary wfull xcenter">
							<span class="center-item text-secondary">data-shell: {value} | {valueName} </span>
							{@render children()}
							<div class="row wrap ycenter xcenter center-item gap-sm marg-auto ta-c">
								{#each presetAxes.shell as option}
									<button
										type="button"
										class="button small outline"
										class:active={value === option}
										aria-pressed={value === option}
										title={shellLabels[option] ?? option}
										onclick={() => setPreset('shell', option)}
									>
										{shellLabels[option] ?? option}
									</button>
								{/each}
									<button type="button" class="button small outline" class:active={value === 'nh'} aria-pressed={value === 'nh'} title="noheader" onclick={() => setPreset('shell', 'nh')}>No Header</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="pd-rail r" class:off={!shell.r}>toc</div>
		</div>
		<div class="pd-foot text-theme hfull" class:off={!shell.f}><span>FOOTER COMPONENT</span></div>
	</div>
</div>

<style lang="sass">

.solodeck
	height: calc(100vh - var(--header-height) - var(--footer-height))
	.pd-wire
		width: 100%

.pd-head, .pd-foot
	background: var(--bg-dialog)
	border: 1px solid var(--border-strong)

.pd-mainrow
	background: var(--bg-dialog)

</style>
