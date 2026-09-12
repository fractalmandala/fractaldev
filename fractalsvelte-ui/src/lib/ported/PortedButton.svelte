<script lang="ts" module>
	// Ported from shadcn-svelte Button (tailwind-variants + cn-button* CSS).
	// Tailwind intent mapping — no tailwind, no <style>, tokens only:
	// base: inline-flex items-center justify-center select-none disabled:opacity-50
	//   -> fractal `.button` (inline-flex, centered, user-select none, disabled 0.5 + pointer-events none)
	// .cn-button: rounded-4xl border-transparent text-sm font-medium focus ring svg size-4
	//   -> fractal `.button` (border transparent, radius var(--radius-sm), text-sm weight 500,
	//      focus-visible outline var(--ring)). Pill opt-in covers the rounded-4xl intent.
	// variants: default/outline/secondary/ghost/destructive/link
	//   -> fractal intents primary/outline/secondary/ghost/destructive/link
	// sizes: xs h-6 / sm h-8 / default h-9 / lg h-10 + icon-* squares
	//   -> fractal densities sm (26px) / md (32px) / lg (38px) + icon-sm/icon/icon-lg
	// Dropped deliberately: active translate-y-px (motion-system decision).

	export type PortedButtonVariant =
		| 'default'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'destructive'
		| 'link';
	export type PortedButtonSize =
		| 'default'
		| 'xs'
		| 'sm'
		| 'lg'
		| 'icon'
		| 'icon-xs'
		| 'icon-sm'
		| 'icon-lg';

	export type PortedButtonProps = {
		variant?: PortedButtonVariant;
		size?: PortedButtonSize;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		ref?: HTMLElement | null;
		class?: string;
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import Button from '../components/Button.svelte';

	type FractalVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
	type FractalSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg';

	let {
		variant = 'default',
		size = 'default',
		href = undefined,
		type = 'button',
		disabled = false,
		ref = $bindable(null),
		class: className = '',
		children,
		onclick,
		...rest
	}: PortedButtonProps = $props();

	const variantMap: Record<PortedButtonVariant, FractalVariant> = {
		default: 'primary',
		outline: 'outline',
		secondary: 'secondary',
		ghost: 'ghost',
		destructive: 'destructive',
		link: 'link'
	};

	const sizeMap: Record<PortedButtonSize, FractalSize> = {
		xs: 'sm',
		sm: 'md',
		default: 'md',
		lg: 'lg',
		'icon-xs': 'icon-sm',
		'icon-sm': 'icon',
		icon: 'icon',
		'icon-lg': 'icon-lg'
	};

	const fractalVariant = $derived(variantMap[variant] ?? 'primary');
	const fractalSize = $derived(sizeMap[size] ?? 'md');
</script>

{#if href}
	<!-- Anchor mode delegates to the fractal Button's native href branch,
		so the root stays a single <a> — never <a><button></a>. -->
	<Button
		variant={fractalVariant}
		size={fractalSize}
		class={className}
		{href}
		{onclick}
		data-slot="button"
		data-ported="button"
		data-shadcn-variant={variant}
		data-shadcn-size={size}
		{...rest}
	>
		{@render children?.()}
	</Button>
{:else}
	<button
		bind:this={ref}
		class={`button ${fractalVariant} ${fractalSize} ${className}`.trim()}
		data-slot="button"
		data-ported="button"
		data-shadcn-variant={variant}
		data-shadcn-size={size}
		data-variant={fractalVariant}
		data-size={fractalSize}
		{type}
		{disabled}
		{onclick}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}
