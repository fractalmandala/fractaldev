<script lang="ts">
	import PhilosophyDeck from '$lib/components/marketing/PhilosophyDeck.svelte';

	// This page wants a bare shell — no rails, no footer. scopePreset applies it
	// for this route only: the user's saved shell is untouched and comes back
	// when they navigate away (the returned restore fn is the effect's cleanup).
</script>

<!--
	The deck falls back to 100dvh standalone; inside the shell it gives back the
	header, footer and PageShell's block padding. --footer-height resolves to 0
	on its own under a composition without `f`, so this holds for any shell.
-->
<PhilosophyDeck />