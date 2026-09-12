<script lang="ts">
	import {
		NavigationIcons,
		AccountIcons,
		StatusIcons,
		ActionIcons,
		ThemeIcons,
		SocialIcons
	} from '$lib/components/icons';
	import { transitionLink } from '$lib/utils';

	let {
		variant = 'primary',
		color = 'blue',
		size = 'md',
		disabled = false,
		loading = false,
		href,
		target,
		icon,
		iconSnippet,
		iconComponent,
		iconName,
		iconClass = 'square-16',
		iconPosition = 'left',
		fullWidth = false,
		onclick,
		type = 'button',
		class: className = '',
		children
	}: {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
		color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'white' | 'purple';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		target?: string;
		icon?: string;
		iconSnippet?: import('svelte').Snippet;
		iconComponent?: 'navigation' | 'account' | 'status' | 'action' | 'theme' | 'social';
		iconName?: string;
		iconClass?: string;
		iconPosition?: 'left' | 'right';
		fullWidth?: boolean;
		onclick?: () => void;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children?: import('svelte').Snippet;
	} = $props();

	const iconComponents = {
		navigation: NavigationIcons,
		account: AccountIcons,
		status: StatusIcons,
		action: ActionIcons,
		theme: ThemeIcons,
		social: SocialIcons
	};

	let IconComponent = $derived(iconComponent ? iconComponents[iconComponent] : null);

	const baseStyles =
		'row ycenter xcenter relative overflow-hidden radius-sm weight-500 border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50';

	const sizeVariants = {
		xs: 'pad-x-8 pad-y-4 text-xs',
		sm: 'pad-x-12 pad-y-6 text-xs',
		md: 'pad-x-16 pad-y-8 text-sm',
		lg: 'pad-x-24 pad-y-12 text-bs',
		xl: 'pad-x-32 pad-y-16 text-lg'
	};

	const variantStyles = {
		primary: {
			blue: 'border-blue-300/60 bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 hover:border-blue-400/70 focus:ring-blue-400/50 dark:border-blue-600/60 dark:bg-blue-600/20 dark:text-blue-300 dark:hover:bg-blue-600/30 dark:hover:border-blue-500/70 hover:shadow-blue-500/25 active:shadow-blue-500/10',
			green:
				'border-emerald-300/60 bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 hover:border-emerald-400/70 focus:ring-emerald-400/50 dark:border-emerald-600/60 dark:bg-emerald-600/20 dark:text-emerald-300 dark:hover:bg-emerald-600/30 dark:hover:border-emerald-500/70 hover:shadow-emerald-500/25 active:shadow-emerald-500/10',
			red: 'border-red-300/60 bg-red-500/20 text-red-700 hover:bg-red-500/30 hover:border-red-400/70 focus:ring-red-400/50 dark:border-red-600/60 dark:bg-red-600/20 dark:text-red-300 dark:hover:bg-red-600/30 dark:hover:border-red-500/70 hover:shadow-red-500/25 active:shadow-red-500/10',
			yellow:
				'border-amber-300/60 bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 hover:border-amber-400/70 focus:ring-amber-400/50 dark:border-amber-600/60 dark:bg-amber-600/20 dark:text-amber-300 dark:hover:bg-amber-600/30 dark:hover:border-amber-500/70 hover:shadow-amber-500/25 active:shadow-amber-500/10',
			gray: 'border-gray-300/60 bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 hover:border-gray-400/70 focus:ring-gray-400/50 dark:border-gray-600/60 dark:bg-gray-600/20 dark:text-gray-300 dark:hover:bg-gray-600/30 dark:hover:border-gray-500/70 hover:shadow-gray-500/25 active:shadow-gray-500/10',
			white:
				'border-gray-300/60 bg-white/40 text-gray-900 hover:bg-gray-50/60 hover:border-gray-400/70 focus:ring-gray-400/50 dark:bg-gray-800/40 dark:border-gray-600/60 dark:text-gray-100 dark:hover:bg-gray-700/50 dark:hover:border-gray-500/70 hover:shadow-gray-500/25 active:shadow-gray-500/10',
			purple:
				'border-violet-300/60 bg-violet-500/20 text-violet-700 hover:bg-violet-500/30 hover:border-violet-400/70 focus:ring-violet-400/50 dark:border-violet-600/60 dark:bg-violet-600/20 dark:text-violet-300 dark:hover:bg-violet-600/30 dark:hover:border-violet-500/70 hover:shadow-violet-500/25 active:shadow-violet-500/10'
		},
		secondary: {
			blue: 'border-blue-200/70 bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 hover:border-blue-300/80 focus:ring-blue-400/50 dark:border-blue-600/60 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 dark:hover:border-blue-500/70',
			green:
				'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/80 hover:border-emerald-300/80 focus:ring-emerald-400/50 dark:border-emerald-600/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40 dark:hover:border-emerald-500/70',
			red: 'border-red-200/70 bg-red-50/80 text-red-700 hover:bg-red-100/80 hover:border-red-300/80 focus:ring-red-400/50 dark:border-red-600/60 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 dark:hover:border-red-500/70',
			yellow:
				'border-amber-200/70 bg-amber-50/80 text-amber-700 hover:bg-amber-100/80 hover:border-amber-300/80 focus:ring-amber-400/50 dark:border-amber-600/60 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:border-amber-500/70',
			gray: 'border-gray-200/70 bg-gray-50/80 text-gray-700 hover:bg-gray-100/80 hover:border-gray-300/80 focus:ring-gray-400/50 dark:border-gray-600/60 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:border-gray-500/70',
			white:
				'border-gray-200/70 bg-white/80 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300/80 focus:ring-gray-400/50 dark:border-gray-600/60 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:border-gray-500/70',
			purple:
				'border-violet-200/70 bg-violet-50/80 text-violet-700 hover:bg-violet-100/80 hover:border-violet-300/80 focus:ring-violet-400/50 dark:border-violet-600/60 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40 dark:hover:border-violet-500/70'
		},
		outline: {
			blue: 'border-blue-300/70 bg-transparent text-blue-700 hover:bg-blue-50/60 hover:border-blue-400/80 focus:ring-blue-400/50 dark:border-blue-600/60 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-500/70',
			green:
				'border-emerald-300/70 bg-transparent text-emerald-700 hover:bg-emerald-50/60 hover:border-emerald-400/80 focus:ring-emerald-400/50 dark:border-emerald-600/60 dark:text-emerald-300 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-500/70',
			red: 'border-red-300/70 bg-transparent text-red-700 hover:bg-red-50/60 hover:border-red-400/80 focus:ring-red-400/50 dark:border-red-600/60 dark:text-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-500/70',
			yellow:
				'border-amber-300/70 bg-transparent text-amber-700 hover:bg-amber-50/60 hover:border-amber-400/80 focus:ring-amber-400/50 dark:border-amber-600/60 dark:text-amber-300 dark:hover:bg-amber-900/20 dark:hover:border-amber-500/70',
			gray: 'border-gray-300/70 bg-transparent text-gray-700 hover:bg-gray-50/60 hover:border-gray-400/80 focus:ring-gray-400/50 dark:border-gray-600/60 dark:text-gray-300 dark:hover:bg-gray-900/20 dark:hover:border-gray-500/70',
			white:
				'border-gray-300/70 bg-transparent text-gray-700 hover:bg-gray-50/60 hover:border-gray-400/80 focus:ring-gray-400/50 dark:border-gray-600/60 dark:text-gray-300 dark:hover:bg-gray-900/20 dark:hover:border-gray-500/70',
			purple:
				'border-violet-300/70 bg-transparent text-violet-700 hover:bg-violet-50/60 hover:border-violet-400/80 focus:ring-violet-400/50 dark:border-violet-600/60 dark:text-violet-300 dark:hover:bg-violet-900/20 dark:hover:border-violet-500/70'
		},
		ghost: {
			blue: 'border-transparent bg-transparent text-blue-700 hover:bg-blue-50/60 focus:ring-blue-400/50 dark:text-blue-300 dark:hover:bg-blue-900/20',
			green:
				'border-transparent bg-transparent text-emerald-700 hover:bg-emerald-50/60 focus:ring-emerald-400/50 dark:text-emerald-300 dark:hover:bg-emerald-900/20',
			red: 'border-transparent bg-transparent text-red-700 hover:bg-red-50/60 focus:ring-red-400/50 dark:text-red-300 dark:hover:bg-red-900/20',
			yellow:
				'border-transparent bg-transparent text-amber-700 hover:bg-amber-50/60 focus:ring-amber-400/50 dark:text-amber-300 dark:hover:bg-amber-900/20',
			gray: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-50/60 focus:ring-gray-400/50 dark:text-gray-300 dark:hover:bg-gray-900/20',
			white:
				'border-transparent bg-transparent text-gray-700 hover:bg-gray-50/60 focus:ring-gray-400/50 dark:text-gray-300 dark:hover:bg-gray-900/20',
			purple:
				'border-transparent bg-transparent text-violet-700 hover:bg-violet-50/60 focus:ring-violet-400/50 dark:text-violet-300 dark:hover:bg-violet-900/20'
		},
		link: {
			blue: 'border-transparent bg-transparent text-blue-700 hover:text-blue-900 focus:ring-blue-400/50 underline-offset-4 hover:underline dark:text-blue-300 dark:hover:text-blue-100',
			green:
				'border-transparent bg-transparent text-emerald-700 hover:text-emerald-900 focus:ring-emerald-400/50 underline-offset-4 hover:underline dark:text-emerald-300 dark:hover:text-emerald-100',
			red: 'border-transparent bg-transparent text-red-700 hover:text-red-900 focus:ring-red-400/50 underline-offset-4 hover:underline dark:text-red-300 dark:hover:text-red-100',
			yellow:
				'border-transparent bg-transparent text-amber-700 hover:text-amber-900 focus:ring-amber-400/50 underline-offset-4 hover:underline dark:text-amber-300 dark:hover:text-amber-100',
			gray: 'border-transparent bg-transparent text-gray-700 hover:text-gray-900 focus:ring-gray-400/50 underline-offset-4 hover:underline dark:text-gray-300 dark:hover:text-gray-100',
			white:
				'border-transparent bg-transparent text-gray-700 hover:text-gray-900 focus:ring-gray-400/50 underline-offset-4 hover:underline dark:text-gray-200 dark:hover:text-white',
			purple:
				'border-transparent bg-transparent text-violet-700 hover:text-violet-900 focus:ring-violet-400/50 underline-offset-4 hover:underline dark:text-violet-300 dark:hover:text-violet-100'
		}
	};

	const iconSpacing = {
		xs: { left: 'mr-1', right: 'ml-1' },
		sm: { left: 'mr-1.5', right: 'ml-1.5' },
		md: { left: 'mr-2', right: 'ml-2' },
		lg: { left: 'mr-2.5', right: 'ml-2.5' },
		xl: { left: 'mr-3', right: 'ml-3' }
	};

	let buttonClasses = $derived(
		[
			baseStyles,
			sizeVariants[size],
			variantStyles[variant][color],
			fullWidth ? 'w-full' : '',
			className
		]
			.filter(Boolean)
			.join(' ')
	);

	let isDisabled = $derived(disabled || loading);

	function handleClick() {
		if (!isDisabled && onclick) {
			onclick();
		}
	}
</script>

{#if href}
	<a
		{href}
		{target}
		use:transitionLink
		class={buttonClasses}
		class:opacity-50={isDisabled}
		class:cursor-not-allowed={isDisabled}
		class:pointer-events-none={isDisabled}
	>
		<div class="shimmer-overlay"></div>
		<span class="relative z-10 row xcenter wfull">
			{#if loading}
				<span class={iconSpacing[size].left}>
					<div class="square-16 animate-spin radius-full border-b-2 border-current"></div>
				</span>
			{:else if (icon || iconSnippet || (iconComponent && iconName)) && iconPosition === 'left'}
				<span class={iconSpacing[size].left}>
					{#if iconSnippet}
						{@render iconSnippet()}
					{:else if IconComponent && iconName}
						<IconComponent name={iconName} class={iconClass} />
					{:else}
						{icon}
					{/if}
				</span>
			{/if}

			{#if children}
				{@render children()}
			{/if}

			{#if !loading && (icon || iconSnippet || (iconComponent && iconName)) && iconPosition === 'right'}
				<span class={iconSpacing[size].right}>
					{#if iconSnippet}
						{@render iconSnippet()}
					{:else if IconComponent && iconName}
						<IconComponent name={iconName} class={iconClass} />
					{:else}
						{icon}
					{/if}
				</span>
			{/if}
		</span>
	</a>
{:else}
	<button {type} class={buttonClasses} disabled={isDisabled} onclick={handleClick}>
		<div class="shimmer-overlay"></div>
		<span class="relative z-10 row xcenter wfull">
			{#if loading}
				<span class={iconSpacing[size].left}>
					<div class="square-16 animate-spin radius-full border-b-2 border-current"></div>
				</span>
			{:else if (icon || iconSnippet || (iconComponent && iconName)) && iconPosition === 'left'}
				<span class={iconSpacing[size].left}>
					{#if iconSnippet}
						{@render iconSnippet()}
					{:else if IconComponent && iconName}
						<IconComponent name={iconName} class={iconClass} />
					{:else}
						{icon}
					{/if}
				</span>
			{/if}

			{#if children}
				{@render children()}
			{/if}

			{#if !loading && (icon || iconSnippet || (iconComponent && iconName)) && iconPosition === 'right'}
				<span class={iconSpacing[size].right}>
					{#if iconSnippet}
						{@render iconSnippet()}
					{:else if IconComponent && iconName}
						<IconComponent name={iconName} class={iconClass} />
					{:else}
						{icon}
					{/if}
				</span>
			{/if}
		</span>
	</button>
{/if}

<style lang="sass">
.shimmer-overlay
	position: absolute
	inset: 0
	border-radius: inherit
	opacity: 0
	transition: opacity 0.3s ease
	pointer-events: none
	overflow: hidden

	&::before
		content: ''
		position: absolute
		top: 50%
		left: 50%
		width: 300%
		height: 300%
		background: radial-gradient(circle, transparent 30%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.3) 60%, transparent 70%)
		transform: translate(-50%, -50%) scale(0)
		transition: transform 0.6s ease-out
		border-radius: 50%
		mask: radial-gradient(circle, black 0%, black 45%, transparent 50%)
		-webkit-mask: radial-gradient(circle, black 0%, black 45%, transparent 50%)

button:hover,
a:hover
	.shimmer-overlay
		opacity: 1

		&::before
			transform: translate(-50%, -50%) scale(1)

button:disabled:hover
	.shimmer-overlay
		opacity: 0

:global([data-theme='dark']) .shimmer-overlay::before
	background: radial-gradient(circle, transparent 30%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.15) 60%, transparent 70%)
</style>
