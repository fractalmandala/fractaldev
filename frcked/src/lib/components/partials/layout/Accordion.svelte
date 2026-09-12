<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { scrollToElementSmooth, animations } from '$lib/utilities';

	export interface AccordionSection {
		id: string;
		title: string;
		icon?: string;
		disabled?: boolean;
		content?: string;
		[key: string]: unknown;
	}

	let {
		sections = [] as AccordionSection[],
		openSections = new SvelteSet<string>(),
		multiple = true,
		disabled = false,
		animationDuration = 350,
		maxHeight = '400px',
		enableScroll = true,
		class: className = '',
		sectionClass = '',
		headerClass = '',
		contentClass = '',
		onToggle,
		onSectionOpen,
		onSectionClose,
		children
	}: {
		sections?: AccordionSection[];
		openSections?: SvelteSet<string>;
		multiple?: boolean;
		disabled?: boolean;
		animationDuration?: number;
		maxHeight?: string;
		enableScroll?: boolean;
		class?: string;
		sectionClass?: string;
		headerClass?: string;
		contentClass?: string;
		onToggle?: (sectionId: string, isOpen: boolean) => void;
		onSectionOpen?: (sectionId: string) => void;
		onSectionClose?: (sectionId: string) => void;
		children?: import('svelte').Snippet<[section: AccordionSection, isOpen: boolean]>;
	} = $props();

	function toggleSection(section: AccordionSection, element?: HTMLElement) {
		if (disabled || section.disabled) return;

		const isCurrentlyOpen = openSections.has(section.id);

		if (isCurrentlyOpen) {
			openSections.delete(section.id);
			onSectionClose?.(section.id);
			onToggle?.(section.id, false);
		} else {
			// If not allowing multiple sections, close others
			if (!multiple) {
				openSections.clear();
			}

			openSections.add(section.id);
			onSectionOpen?.(section.id);
			onToggle?.(section.id, true);

			// Scroll to section when expanding with slight delay to avoid conflicts
			if (element && enableScroll) {
				scrollToElementSmooth(element, {
					delay: animationDuration + 50,
					disableScrollDuration: 400
				});
			}
		}
	}

	function handleKeydown(event: KeyboardEvent, section: AccordionSection) {
		if ((event.key === 'Enter' || event.key === ' ') && !disabled && !section.disabled) {
			event.preventDefault();
			toggleSection(section, (event.target as HTMLElement)?.closest('div') as HTMLElement);
		}
	}

	// Pre-computed static classes to avoid recalculation
	const containerClasses = $derived(`box gap-md ${className}`);
	const baseSectionClasses = $derived(`card overflow-hidden ${sectionClass}`);
	const baseHeaderClasses = $derived(`row ycenter xbetween wfull pad-24 ${headerClass}`);
	const baseContentClasses = $derived(
		`border-top ${enableScroll ? 'scroll-y' : ''} ${contentClass}`
	);

	// Optimized class functions - simplified without caching to avoid crashes
	function getHeaderClasses(section: AccordionSection) {
		let classes = baseHeaderClasses;
		if (disabled || section.disabled) {
			classes += ' cursor-not-allowed opacity-50';
		} else {
			classes += ' cursor-pointer';
		}
		return classes;
	}
</script>

<div class={containerClasses}>
	{#each sections as section (section.id)}
		{@const isOpen = openSections.has(section.id)}

		<div class={baseSectionClasses}>
			<!-- Section Header -->
			<button
				type="button"
				class={getHeaderClasses(section)}
				disabled={disabled || section.disabled}
				onclick={(e) =>
					toggleSection(section, (e.target as HTMLElement)?.closest('div') || undefined)}
				onkeydown={(e) => handleKeydown(e, section)}
				aria-expanded={isOpen}
				aria-controls="accordion-content-{section.id}"
			>
				<div class="row ycenter gap-md">
					{#if section.icon}
						<span class="text-xl">{section.icon}</span>
					{/if}
					<h3 class="text-lg weight-600 text-primary">{section.title}</h3>
				</div>

				<!-- Optimized chevron icon with transform-gpu for hardware acceleration -->
				<svg
					class="square-24 text-muted {isOpen ? 'rotate-180' : 'rotate-0'}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<!-- Section Content with optimized transitions -->
			{#if isOpen}
				<div
					id="accordion-content-{section.id}"
					in:slide={animations.enabled
						? { duration: animationDuration, easing: quintOut }
						: { duration: 0 }}
					out:slide={animations.enabled
						? { duration: Math.floor(animationDuration * 0.85), easing: quintOut }
						: { duration: 0 }}
					class={baseContentClasses}
					style={enableScroll ? `max-height: ${maxHeight}` : ''}
				>
					<div class="pad-24 pad-top-16">
						{#if children}
							<!-- Main content -->
							{@render children(section, isOpen)}
						{:else if section.content}
							<!-- Fallback to section content -->
							<p class="text-secondary">{section.content}</p>
						{:else}
							<!-- Fallback content -->
							<p class="text-muted">No content available</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style lang="sass">
button
	transform: translateZ(0)
	backface-visibility: hidden
	perspective: 1000px

	h3
		text-rendering: optimizeSpeed

[id^='accordion-content-']
	contain: layout style paint
</style>
