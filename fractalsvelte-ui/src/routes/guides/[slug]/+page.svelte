<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let container = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!container) return;
		// Re-run whenever guide html updates
		const _html = data.guide.html;
		const pres = container.querySelectorAll<HTMLPreElement>('pre');
		pres.forEach((pre) => {
			if (pre.parentElement?.classList.contains('playground-code-content')) return;

			const wrapper = document.createElement('div');
			wrapper.className = 'playground-code-block';

			const header = document.createElement('div');
			header.className = 'playground-code-header';

			const lang = pre.getAttribute('data-language') || 'code';
			const label = document.createElement('span');
			label.textContent = lang;

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'is-icon';
			btn.setAttribute('aria-label', `Copy ${lang} code`);
			const copySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>`;
			const copiedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /><path d="M4.012 16.737a2 2 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /><path d="M11 14l2 2l4 -4" /></svg>`;

			btn.innerHTML = copySvg;

			btn.onclick = async () => {
				const text = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
				try {
					await navigator.clipboard.writeText(text);
					btn.classList.add('copied');
					btn.innerHTML = copiedSvg;
					setTimeout(() => {
						btn.classList.remove('copied');
						btn.innerHTML = copySvg;
					}, 2000);
				} catch {}
			};

			header.appendChild(label);
			header.appendChild(btn);

			const content = document.createElement('div');
			content.className = 'playground-code-content';

			pre.parentNode?.insertBefore(wrapper, pre);
			content.appendChild(pre);
			wrapper.appendChild(header);
			wrapper.appendChild(content);
		});
	});
</script>

<svelte:head>
	<title>{data.guide.title} — Fractalsvelte UI</title>
	<meta name="description" content={`Fractalsvelte UI guide: ${data.guide.title}`} />
</svelte:head>

<article class="content-section narrow-full box gap-md">
	<a class="button ghost sm" href="/guides">← All guides</a>
	<div class="prose" bind:this={container}>
		{@html data.guide.html}
	</div>
</article>
