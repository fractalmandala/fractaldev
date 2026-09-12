<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state';
	import { tocItems } from '$site/components/toc.svelte.js';
	import { loadDocRaw } from '$site/docs';
	import { Icon } from 'fractalicons'
	import { phArrowUp } from 'fractalicons/phosphor';
	import { icMapsArrow, icCopy, icSubmitDocument } from 'fractalicons/iconoir';


	/* Scrollspy: the heading nearest the top of the reading band lights up. */
	let active = $state('');

	function toTop(): void {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
	}

	let copied = $state(false);

	async function copyMarkdown(): Promise<void> {
		/* The collection owns the sources — `loadDocRaw` resolves the slug to a
		   file and strips the frontmatter. */
		const raw = await loadDocRaw(page.params.slug ?? '');
		if (!raw) return;
		await navigator.clipboard.writeText(raw);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	$effect(() => {
		const items = tocItems;
		if (!items.length) {
			active = '';
			return;
		}

		let io: IntersectionObserver | null = null;
		const frame = requestAnimationFrame(() => {
			const heads = items
				.map((item) => document.getElementById(item.id))
				.filter((el): el is HTMLElement => el !== null);

			if (!heads.length) {
				active = '';
				return;
			}

			io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							active = (entry.target as HTMLElement).id;
						}
					}
				},
				{ rootMargin: '-15% 0px -75% 0px' }
			);

			for (const h of heads) io.observe(h);
		});

		return () => {
			cancelAnimationFrame(frame);
			if (io) io.disconnect();
		};
	});
</script>

<div class="box gap-md">
	{#if tocItems.length}
		<span class="text-sm text-secondary weight-500">On this page:</span>
		<nav class="box gap-md border-bottom pad-bottom-xl text-muted" aria-label="On this page">
			{#each tocItems as item}
				<a
					href="#{item.id}"
					class="link-plain text-sm lh11 {active === item.id ? 'weight-600 text-primary' : 'text-muted'}"
					class:pad-left-md={item.level === 3}
					aria-current={active === item.id ? 'true' : undefined}
				>
					{item.text}
				</a>
			{/each}
		</nav>
	<div class="box gap-xs pad-top-sm">
		<button class="button small ghost hoverstyle xleft row ycenter gap-sm" onclick={toTop}>
			<span class="text-primary text-xs">Scroll to Top</span>
		</button>
		<button class="button small ghost hoverstyle xleft row ycenter gap-sm" onclick={copyMarkdown}>
			<span class="text-primary text-xs">{copied ? 'Copied' : 'Copy as Markdown'}</span>
		</button>
		<button class="button small ghost hoverstyle xleft row ycenter gap-sm" onclick={() => window.print()}> 
			<span class="text-primary text-xs">Export PDF </span>
		</button>
	</div>
	{/if}
</div>

<style>
	/* Print: the article alone. Shell chrome, both rails, and this rail's own
	   buttons have no business on paper — the PDF is the doc, edge to edge. */
	@media print {
		:global(.app-header),
		:global(.app-footer),
		:global(.sidebar-left),
		:global(.sidebar-right) {
			display: none !important;
		}
		:global(.app-main) {
			display: block;
		}
	}
</style>
