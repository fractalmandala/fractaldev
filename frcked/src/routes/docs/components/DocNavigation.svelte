<script lang="ts">
	import { NavigationIcons } from '$lib/components/icons';
	import { disableUserScroll } from '$lib/utilities';
	import type { LoadedDocSection } from '../types';

	interface Props {
		sections: LoadedDocSection[];
		currentSectionId: string;
		onSectionSelect: (section: LoadedDocSection) => void;
		class?: string;
	}

	let { sections, currentSectionId, onSectionSelect, class: className = '' }: Props = $props();

	// Find current section index
	let currentIndex = $derived(() => {
		return sections.findIndex((section) => section.id === currentSectionId);
	});

	// Get previous section
	let previousSection = $derived(() => {
		const prevIndex = currentIndex() - 1;
		return prevIndex >= 0 ? sections[prevIndex] : null;
	});

	// Get next section
	let nextSection = $derived(() => {
		const nextIndex = currentIndex() + 1;
		return nextIndex < sections.length ? sections[nextIndex] : null;
	});

	// Handle navigation
	function navigateTo(section: LoadedDocSection | null) {
		if (section) {
			onSectionSelect(section);
			// Disable user scrolling during smooth scroll animation
			disableUserScroll(650);
			// Add slight delay before scrolling to top for smoother transition
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 150);
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.target !== document.body) return; // Only handle if no input is focused

		switch (event.key) {
			case 'ArrowLeft':
				if (previousSection()) {
					event.preventDefault();
					navigateTo(previousSection());
				}
				break;
			case 'ArrowRight':
				if (nextSection()) {
					event.preventDefault();
					navigateTo(nextSection());
				}
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if previousSection() || nextSection()}
	<div class="border-top {className}">
		<div class="marg-auto max-w-4xl pad-x-24 pad-y-32 lg:px-8">
			<!-- Desktop Layout (hidden on mobile) -->
			<div class="hidden sm:flex sm:items-center sm:justify-between">
				<!-- Previous Section -->
				{#if previousSection()}
					<button
						onclick={() => navigateTo(previousSection())}
						class="group row ycenter grow cursor-pointer gap-12 radius-8 border surface pad-16 text-left transition-all hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
					>
						<div
							class="row square-40 ycenter xcenter radius-full surface transition-colors group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
						>
							<NavigationIcons name="chevron-left" class="h-5 w-5 text-secondary" />
						</div>
						<div class="min0 grow">
							<p class="text-sm weight-500 text-muted">Previous</p>
							<p
								class="row ycenter gap-8 text-bs weight-500 text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400"
							>
								<span>{previousSection()?.icon}</span>
								<span class="truncate">{previousSection()?.title}</span>
							</p>
						</div>
					</button>
				{:else}
					<div class="grow"></div>
				{/if}

				<!-- Spacer -->
				<div class="marg-x-16">
					<div class="h-px w-48 raised"></div>
				</div>

				<!-- Next Section -->
				{#if nextSection()}
					<button
						onclick={() => navigateTo(nextSection())}
						class="group row ycenter grow cursor-pointer gap-12 radius-8 border surface pad-16 text-right transition-all hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
					>
						<div class="min0 grow">
							<p class="text-sm weight-500 text-muted">Next</p>
							<p
								class="row ycenter xright gap-8 text-bs weight-500 text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400"
							>
								<span class="truncate">{nextSection()?.title}</span>
								<span>{nextSection()?.icon}</span>
							</p>
						</div>
						<div
							class="row square-40 ycenter xcenter radius-full surface transition-colors group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
						>
							<NavigationIcons name="chevron-right" class="h-5 w-5 text-secondary" />
						</div>
					</button>
				{:else}
					<div class="grow"></div>
				{/if}
			</div>

			<!-- Mobile Layout (only on small screens) -->
			<div class="gap-12 sm:hidden">
				{#if previousSection()}
					<button
						onclick={() => navigateTo(previousSection())}
						class="group row wfull cursor-pointer ycenter xbetween radius-8 border bg pad-16 transition-all hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
					>
						<div class="row ycenter gap-12">
							<NavigationIcons name="chevron-left" class="h-5 w-5 text-muted" />
							<div class="text-left">
								<p class="text-xs weight-500 text-muted">Previous</p>
								<p
									class="row ycenter gap-8 text-sm weight-500 text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400"
								>
									<span>{previousSection()?.icon}</span>
									<span class="truncate">{previousSection()?.title}</span>
								</p>
							</div>
						</div>
					</button>
				{/if}

				{#if nextSection()}
					<button
						onclick={() => navigateTo(nextSection())}
						class="group row wfull cursor-pointer ycenter xbetween radius-8 border bg pad-16 transition-all hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600"
					>
						<div class="row ycenter gap-12">
							<NavigationIcons name="chevron-right" class="h-5 w-5 text-muted" />
							<div class="text-left">
								<p class="text-xs weight-500 text-muted">Next</p>
								<p
									class="row ycenter gap-8 text-sm weight-500 text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400"
								>
									<span>{nextSection()?.icon}</span>
									<span class="truncate">{nextSection()?.title}</span>
								</p>
							</div>
						</div>
					</button>
				{/if}
			</div>

			<!-- Progress indicator -->
			{#if sections.length > 1}
				<div class="marg-top-24 border-top pad-top-16">
					<div class="marg-bottom-8 row ycenter xcenter gap-32">
						<div class="max-w-xs grow ta-c">
							<span class="text-xs weight-500 text-muted">
								{currentIndex() + 1} of {sections.length}
							</span>
							<div class="h-6 overflow-hidden radius-full raised">
								<div
									class="hfull radius-full bg-theme transition-all duration-300"
									style="width: {((currentIndex() + 1) / sections.length) * 100}%"
								></div>
							</div>
						</div>
					</div>
					<p class="ta-c text-xs text-muted">Use ← → arrow keys to navigate</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
