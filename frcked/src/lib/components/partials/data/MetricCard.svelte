<script lang="ts">
	let {
		title,
		value,
		icon,
		iconSnippet,
		color = 'default',
		size = 'md',
		href,
		onclick,
		class: className = ''
	}: {
		title: string;
		value: string | number;
		icon?: string;
		iconSnippet?: import('svelte').Snippet;
		color?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		onclick?: () => void;
		class?: string;
	} = $props();

	const colorVariants = {
		default: {
			value: 'text-primary',
			icon: 'text-secondary',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		},
		blue: {
			value: 'text-theme',
			icon: 'text-theme',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		},
		green: {
			value: 'text-success',
			icon: 'text-success',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		},
		red: {
			value: 'text-danger',
			icon: 'text-danger',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		},
		yellow: {
			value: 'text-warning',
			icon: 'text-warning',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		},
		purple: {
			value: 'text-theme',
			icon: 'text-theme',
			iconBg: 'surface',
			bgGradient: '',
			borderColor: 'border'
		}
	};

	const sizeVariants = {
		sm: {
			padding: 'pad-16',
			iconSize: 'text-lg',
			valueSize: 'text-bs',
			titleSize: 'text-xs',
			spacing: 'marg-left-12',
			iconPadding: 'pad-8'
		},
		md: {
			padding: 'pad-24',
			iconSize: 'text-2xl',
			valueSize: 'text-lg',
			titleSize: 'text-sm',
			spacing: 'marg-left-16',
			iconPadding: 'pad-12'
		},
		lg: {
			padding: 'pad-24',
			iconSize: 'text-3xl',
			valueSize: 'text-xl',
			titleSize: 'text-sm',
			spacing: 'marg-left-24',
			iconPadding: 'pad-12'
		}
	};

	let colors = $derived(colorVariants[color]);
	let sizes = $derived(sizeVariants[size]);
	let isClickable = $derived(!!(href || onclick));

	let cardClasses = $derived(
		`card relative overflow-hidden shadow-md ${colors.bgGradient} ${colors.borderColor} ${isClickable ? 'cursor-pointer' : ''} ${className}`
	);

	function handleClick() {
		if (onclick) {
			onclick();
		}
	}
</script>

{#if href}
	<a {href} class={cardClasses}>
		<!-- Main content -->
		<div class="relative z-10 {sizes.padding}">
			<div class="row ycenter">
				{#if icon || iconSnippet}
					<div class="shrink-0">
						<div class="radius-8 {colors.iconBg} {sizes.iconPadding} border">
							<span class="{sizes.iconSize} {colors.icon}">
								{#if iconSnippet}
									{@render iconSnippet()}
								{:else}
									{icon}
								{/if}
							</span>
						</div>
					</div>
				{/if}
				<div class="{icon || iconSnippet ? sizes.spacing : ''} min0 grow">
					<dl>
						<dt class="truncate {sizes.titleSize} weight-500 text-tight text-secondary">
							{title}
						</dt>
						<dd class="{sizes.valueSize} weight-700 text-tight {colors.value}">
							{value}
						</dd>
					</dl>
				</div>
			</div>
		</div>
	</a>
{:else}
	<div
		class={cardClasses}
		onclick={isClickable ? handleClick : undefined}
		role={isClickable ? 'button' : undefined}
		{...isClickable ? { tabindex: 0 } : {}}
	>
		<!-- Main content -->
		<div class="relative z-10 {sizes.padding}">
			<div class="row ycenter">
				{#if icon || iconSnippet}
					<div class="shrink-0">
						<div class="radius-8 {colors.iconBg} {sizes.iconPadding} border">
							<span class="{sizes.iconSize} {colors.icon}">
								{#if iconSnippet}
									{@render iconSnippet()}
								{:else}
									{icon}
								{/if}
							</span>
						</div>
					</div>
				{/if}
				<div class="{icon || iconSnippet ? sizes.spacing : ''} min0 grow">
					<dl>
						<dt class="truncate {sizes.titleSize} weight-500 text-tight text-secondary">
							{title}
						</dt>
						<dd class="{sizes.valueSize} weight-700 text-tight {colors.value}">
							{value}
						</dd>
					</dl>
				</div>
			</div>
		</div>
	</div>
{/if}
