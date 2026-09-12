<script lang="ts">
	import type { Snippet } from 'svelte';
	import '$lib/styles/index.sass'
  import { AuraBackground, ThemePicker } from 'fractalthemer';
	let { children }: { children: Snippet } = $props();
</script>

<AuraBackground />
<div class="app">
	<header class="row xbetween">
		<div class="shell__identity">
			<a href="/">Acrolls</a>
		</div>
		<nav class="row gap8 ycenter">
			<a class="blank text-sm fw500" href="/docs">Docs</a>
			<ThemePicker />
		</nav>
	</header>
	<main class="body">
		{@render children()}
	</main>
</div>