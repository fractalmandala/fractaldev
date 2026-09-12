<script lang="ts">
	interface Props {
		content: string; // Now expects pre-parsed HTML content
		class?: string;
	}

	let { content, class: className = '' }: Props = $props();
</script>

<div class="markdown-content {className}">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html content}
</div>

<style lang="sass">
:global(.markdown-content)
	line-height: 1.7
	font-size: 1rem
	color: #374151

	> *:first-child
		margin-top: 0 !important

	> *:last-child
		margin-bottom: 0 !important

	h1
		font-size: 1.5rem
		font-weight: 700
		color: #111827
		margin-bottom: 1.5rem
		margin-top: 0

	h2
		font-size: 1.25rem
		font-weight: 600
		color: #111827
		margin-bottom: 1rem
		margin-top: 2rem

	h3
		font-size: 1.125rem
		font-weight: 600
		color: #111827
		margin-bottom: 0.75rem
		margin-top: 1.5rem

	h4
		font-size: 1rem
		font-weight: 600
		color: #111827
		margin-bottom: 0.5rem
		margin-top: 1.25rem

	h5
		font-size: 0.875rem
		font-weight: 600
		color: #111827
		margin-bottom: 0.5rem
		margin-top: 1rem

	h6
		font-size: 0.875rem
		font-weight: 500
		color: #111827
		margin-bottom: 0.5rem
		margin-top: 1rem

	p
		margin-bottom: 1rem
		line-height: 1.625
		color: #374151

	a
		color: #2563eb
		font-weight: 500
		text-decoration: underline
		text-decoration-thickness: 1px
		text-underline-offset: 2px
		cursor: pointer
		transition: all 0.2s

		&:hover
			color: #1d4ed8
			text-decoration-thickness: 2px

	code
		background-color: #f3f4f6
		border: 1px solid #e5e7eb
		border-radius: 0.375rem
		padding: 0.25rem 0.5rem
		font-size: 0.875rem
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace
		color: #ec4899
		font-weight: 500

	pre
		background-color: #1f2937
		border-radius: 0.5rem
		padding: 1rem
		margin: 0
		overflow-x: auto
		border: 1px solid #374151

		code
			background: none
			border: none
			padding: 0
			color: #e5e7eb
			font-size: 0.875rem
			line-height: 1.5

	ul, ol
		margin-bottom: 1rem
		padding-left: 1.5rem

	ul
		list-style-type: disc

	ol
		list-style-type: decimal

	li
		margin-bottom: 0.25rem
		color: #374151
		line-height: 1.625

	ul ul, ol ol
		margin-top: 0.5rem
		margin-bottom: 0.5rem
		padding-left: 1rem

	table
		width: 100%
		border-collapse: collapse
		margin: 1.5rem 0
		border: 1px solid #e5e7eb
		border-radius: 0.5rem
		overflow: hidden

	th, td
		padding: 0.75rem 1rem
		text-align: left
		border-bottom: 1px solid #e5e7eb
		font-size: 0.875rem

	th
		background-color: #f9fafb
		font-weight: 600
		color: #111827

	td
		color: #374151

	tr:hover td
		background-color: #f9fafb
		transition: background-color 0.2s

	tr:last-child td
		border-bottom: none

	blockquote
		border-left: 4px solid #d1d5db
		background-color: #f9fafb
		padding: 1rem
		margin: 1.5rem 0
		font-style: italic

		p
			margin: 0
			color: #374151

	hr
		border: none
		border-top: 1px solid #e5e7eb
		margin: 2rem 0

	strong
		font-weight: 600
		color: #111827

	em
		font-style: italic
		color: #374151

	img
		max-width: 100%
		height: auto
		border-radius: 0.5rem
		margin: 1rem 0

	button, [onclick], [role='button']
		cursor: pointer

:global([data-theme='dark'])
	.markdown-content
		color: #d1d5db

		h1, h2, h3, h4, h5, h6
			color: #f9fafb

		p
			color: #d1d5db

		a
			color: #60a5fa

			&:hover
				color: #93c5fd

		code
			background-color: #1f2937
			border-color: #374151
			color: #fbbf24

		pre
			background-color: #0f172a
			border-color: #1e293b

		li
			color: #d1d5db

		table
			border-color: #374151

		th, td
			border-bottom-color: #374151

		th
			background-color: #1f2937
			color: #f9fafb

		td
			color: #d1d5db

		tr:hover td
			background-color: #1f2937

		blockquote
			border-left-color: #4b5563
			background-color: rgba(55, 65, 81, 0.5)

			p
				color: #d1d5db

		hr
			border-top-color: #374151

		strong
			color: #f9fafb

		em
			color: #d1d5db
</style>
