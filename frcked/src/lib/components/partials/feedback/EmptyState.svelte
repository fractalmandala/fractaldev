<script lang="ts">
	import { Button } from '$lib/components/partials';

	let {
		icon,
		iconSnippet,
		title,
		description,
		primaryAction,
		secondaryText,
		size = 'md',
		class: className = ''
	}: {
		icon?: string;
		iconSnippet?: import('svelte').Snippet;
		title: string;
		description?: string;
		primaryAction?: {
			text: string;
			onclick?: () => void;
			href?: string;
			variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
			color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'white' | 'purple';
		};
		secondaryText?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const sizeVariants = {
		sm: {
			container: 'pad-y-xl',
			icon: 'text-3xl marg-bottom-12',
			title: 'text-bs',
			description: 'text-sm',
			spacing: 'gap-sm'
		},
		md: {
			container: 'pad-y-2xl',
			icon: 'text-4xl marg-bottom-16',
			title: 'text-lg',
			description: 'text-bs',
			spacing: 'gap-md'
		},
		lg: {
			container: 'pad-y-3xl',
			icon: 'text-5xl marg-bottom-24',
			title: 'text-xl',
			description: 'text-lg',
			spacing: 'gap-bs'
		}
	};

	let sizeConfig = $derived(sizeVariants[size]);
</script>

<div class="box xcenter {sizeConfig.container} {className}">
	{#if icon || iconSnippet}
		<div class="row xcenter text-muted {sizeConfig.icon}">
			{#if iconSnippet}
				{@render iconSnippet()}
			{:else}
				{icon}
			{/if}
		</div>
	{/if}

	<div class="box {sizeConfig.spacing}">
		<h3 class="weight-600 text-primary {sizeConfig.title}">
			{title}
		</h3>

		{#if description}
			<p class="text-secondary {sizeConfig.description}">
				{description}
			</p>
		{/if}

		{#if primaryAction}
			<div class="marg-top-16">
				<Button
					variant={primaryAction.variant || 'primary'}
					color={primaryAction.color || 'blue'}
					size={size === 'sm' ? 'md' : 'lg'}
					href={primaryAction.href}
					onclick={primaryAction.onclick}
				>
					{primaryAction.text}
				</Button>
			</div>
		{/if}

		{#if secondaryText}
			<p class="marg-top-12 text-xs text-muted">
				{secondaryText}
			</p>
		{/if}
	</div>
</div>
