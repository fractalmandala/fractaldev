<script lang="ts">
	// Lightweight "was this helpful?" prompt. Purely presentational: it reports
	// the vote through `onVote` so a host can wire it to analytics or an
	// endpoint. Renders a thank-you state after voting and is hidden from search.
	type Props = {
		question?: string;
		thanks?: string;
		yesLabel?: string;
		noLabel?: string;
		onVote?: (value: 'yes' | 'no') => void;
	};

	let {
		question = 'Was this page helpful?',
		thanks = 'Thanks for your feedback!',
		yesLabel = 'Yes',
		noLabel = 'No',
		onVote
	}: Props = $props();

	let voted = $state(false);

	function vote(value: 'yes' | 'no') {
		voted = true;
		onVote?.(value);
	}
</script>

<section aria-label={question} class="acrolls-docs-feedback" data-acrolls-page-feedback data-pagefind-ignore>
	<p>{voted ? thanks : question}</p>
	{#if !voted}
		<div class="acrolls-docs-feedback-actions">
			<button class="acrolls-docs-feedback-btn" type="button" onclick={() => vote('yes')}>
				<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88M7 10v12" />
				</svg>
				{yesLabel}
			</button>
			<button class="acrolls-docs-feedback-btn" type="button" onclick={() => vote('no')}>
				<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88M17 14V2" />
				</svg>
				{noLabel}
			</button>
		</div>
	{/if}
</section>
