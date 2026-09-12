<script lang="ts">
	import { onMount } from 'svelte';
	import { Modal } from '$lib/components/main';
	import { NavigationIcons } from '$lib/components/icons';
	import { Button } from '$lib/components/partials';
	import { disableUserScroll } from '$lib/utilities';
	import type { LoadedDocSection, DocHeader } from '../types';

	interface SearchResult {
		type: 'section' | 'header';
		section: LoadedDocSection;
		header?: DocHeader;
		contentMatch?: string;
		matchType: 'title' | 'category' | 'content' | 'header';
		relevanceScore: number;
	}

	interface Props {
		sections: LoadedDocSection[];
		open?: boolean;
		onClose?: () => void;
		onSectionSelect?: (section: LoadedDocSection) => void;
		loadedContent?: Record<string, string>;
	}

	let { sections, open = false, onClose, onSectionSelect, loadedContent = {} }: Props = $props();

	let searchInput: HTMLInputElement | undefined = $state();
	let searchQuery = $state('');
	let selectedIndex = $state(0);

	// Calculate relevance score for better search ranking
	function getRelevanceScore(
		matchType: string,
		text: string,
		query: string,
		headerLevel?: number
	): number {
		const textLower = text.toLowerCase();
		const queryLower = query.toLowerCase();

		let score = 0;

		// Base score by match type
		switch (matchType) {
			case 'title':
				score = 10;
				break;
			case 'header':
				score = 20 + (headerLevel || 1) * 5; // Higher header levels get higher scores
				break;
			case 'category':
				score = 30;
				break;
			case 'content':
				score = 40;
				break;
		}

		// Bonus for exact match
		if (textLower === queryLower) {
			score -= 20;
		}
		// Bonus for starting with query
		else if (textLower.startsWith(queryLower)) {
			score -= 10;
		}
		// Bonus for word boundary match
		else if (textLower.includes(' ' + queryLower)) {
			score -= 5;
		}

		return score;
	}

	// Enhanced search that includes headers and content - using $derived.by for better performance
	let searchResults = $derived.by((): SearchResult[] => {
		if (!searchQuery.trim()) {
			// Show all sections when no query
			return sections.map((section) => ({
				type: 'section' as const,
				section,
				matchType: 'title' as const,
				relevanceScore: section.sectionOrder
			}));
		}

		const query = searchQuery.toLowerCase();
		const results: SearchResult[] = [];

		sections.forEach((section) => {
			let hasMatched = false;

			// Check section title match
			if (section.title.toLowerCase().includes(query)) {
				results.push({
					type: 'section',
					section,
					matchType: 'title',
					relevanceScore: getRelevanceScore('title', section.title, query)
				});
				hasMatched = true;
			}

			// Check category match
			if (!hasMatched && section.category.toLowerCase().includes(query)) {
				results.push({
					type: 'section',
					section,
					matchType: 'category',
					relevanceScore: getRelevanceScore('category', section.category, query)
				});
				hasMatched = true;
			}

			// Check headers match
			if (section.headers) {
				section.headers.forEach((header) => {
					if (header.title.toLowerCase().includes(query)) {
						results.push({
							type: 'header',
							section,
							header,
							matchType: 'header',
							relevanceScore: getRelevanceScore('header', header.title, query, header.level)
						});
					}
				});
			}

			// Check content match if available
			if (!hasMatched) {
				const content = loadedContent[section.id];
				if (content) {
					const contentLower = content.toLowerCase();
					if (contentLower.includes(query)) {
						// Extract a snippet around the match
						const matchIndex = contentLower.indexOf(query);
						const start = Math.max(0, matchIndex - 60);
						const end = Math.min(content.length, matchIndex + query.length + 60);
						let snippet = content.slice(start, end);

						// Clean up the snippet (remove HTML/markdown syntax)
						snippet = snippet
							.replace(/<[^>]*>/g, '')
							.replace(/[#*`_[\]]/g, '')
							.replace(/\n+/g, ' ')
							.replace(/\s+/g, ' ')
							.trim();

						results.push({
							type: 'section',
							section,
							matchType: 'content',
							contentMatch: snippet,
							relevanceScore: getRelevanceScore('content', snippet, query)
						});
					}
				}
			}
		});

		// Sort by relevance score (lower is better)
		return results.sort((a, b) => a.relevanceScore - b.relevanceScore);
	});

	// Update selected index when results change - using derived for better reactivity
	let validatedSelectedIndex = $derived.by(() => {
		return Math.min(selectedIndex, Math.max(0, searchResults.length - 1));
	});

	// Safe text highlighting - returns array of text segments with highlight info
	function getHighlightedSegments(
		text: string,
		query: string
	): Array<{ text: string; highlighted: boolean }> {
		if (!query.trim()) return [{ text, highlighted: false }];

		const segments: Array<{ text: string; highlighted: boolean }> = [];
		const queryLower = query.toLowerCase();
		const textLower = text.toLowerCase();

		let lastIndex = 0;
		let searchIndex = 0;

		while (searchIndex < textLower.length) {
			const foundIndex = textLower.indexOf(queryLower, searchIndex);
			if (foundIndex === -1) break;

			// Add text before match
			if (foundIndex > lastIndex) {
				segments.push({ text: text.slice(lastIndex, foundIndex), highlighted: false });
			}

			// Add highlighted match
			segments.push({
				text: text.slice(foundIndex, foundIndex + query.length),
				highlighted: true
			});

			lastIndex = foundIndex + query.length;
			searchIndex = lastIndex;
		}

		// Add remaining text
		if (lastIndex < text.length) {
			segments.push({ text: text.slice(lastIndex), highlighted: false });
		}

		return segments;
	}

	// Reset state when modal opens - using proper effect for side effects
	$effect(() => {
		if (open) {
			// Reset search state
			setTimeout(() => {
				searchQuery = '';
				selectedIndex = 0;
				searchInput?.focus();
			}, 100);
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1);
				scrollToSelected();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				scrollToSelected();
				break;
			case 'Enter':
				event.preventDefault();
				if (searchResults[validatedSelectedIndex]) {
					selectResult(searchResults[validatedSelectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				handleClose();
				break;
		}
	}

	function scrollToSelected() {
		const selectedElement = document.querySelector(
			`[data-search-index="${validatedSelectedIndex}"]`
		) as HTMLElement;
		if (selectedElement) {
			selectedElement.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth'
			});
		}
	}

	function selectResult(result: SearchResult) {
		// First navigate to the section
		onSectionSelect?.(result.section);

		// If it's a header result, scroll to that specific header after a delay
		if (result.type === 'header' && result.header) {
			// Disable user scrolling during smooth scroll animation
			disableUserScroll(700);
			setTimeout(() => {
				const element = document.getElementById(result.header!.anchor);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 200);
		}

		handleClose();
	}

	function handleClose() {
		searchQuery = '';
		selectedIndex = 0;
		onClose?.();
	}

	function getCategoryIcon(category: string): string {
		const categoryIcons: Record<string, string> = {
			general: '📚',
			components: '⚙️',
			partials: '🧩',
			utils: '🔧',
			api: '📡'
		};
		return categoryIcons[category] || '📄';
	}

	function getCategoryTitle(category: string): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	function getMatchTypeLabel(matchType: string): string {
		switch (matchType) {
			case 'title':
				return 'Title';
			case 'category':
				return 'Category';
			case 'content':
				return 'Content';
			case 'header':
				return 'Section';
			default:
				return 'Match';
		}
	}

	function getMatchTypeColor(matchType: string): string {
		switch (matchType) {
			case 'title':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
			case 'category':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
			case 'header':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
			case 'content':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
		}
	}

	function getHeaderLevelPrefix(level: number): string {
		return '#'.repeat(Math.min(level, 4));
	}

	onMount(() => {
		// Cleanup if needed
		return () => {};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<Modal {open} onclose={handleClose} size="xl" title="Search Documentation">
	<!-- Mobile-first minimal search interface -->
	<div class="gap-12 sm:gap-4">
		<!-- Search Input -->
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 row ycenter pad-left-12">
				<NavigationIcons name="search" class="h-4 w-4 text-muted sm:h-5 sm:w-5" />
			</div>
			<input
				bind:this={searchInput}
				bind:value={searchQuery}
				type="text"
				placeholder="Search documentation..."
				class="block w-full radius-8 border bg pad-y-12 pr-3 pl-9 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:py-3 sm:pl-10 sm:text-base dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400"
			/>
		</div>

		<!-- Results count - mobile minimal -->
		<div class="row ycenter xbetween">
			<span class="text-sm text-secondary">
				{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
			</span>
			<!-- Desktop shortcuts only -->
			<div class="hidden ycenter gap-12 text-xs text-muted sm:flex">
				<div class="row ycenter gap-16">
					<kbd class="kbd">↑↓</kbd>
					<span>Navigate</span>
				</div>
				<div class="row ycenter gap-16">
					<kbd class="kbd">Enter</kbd>
					<span>Select</span>
				</div>
			</div>
		</div>

		<!-- Search Results -->
		<div class="max-h-[60vh] overflow-y-auto radius-8 border surface sm:max-h-96">
			{#if searchResults.length === 0}
				<div class="pad-24 ta-c sm:p-8">
					<div
						class="marg-auto marg-bottom-12 square-40 radius-full surface pad-8 sm:mb-4 sm:h-12 sm:w-12 sm:p-3"
					>
						<NavigationIcons name="search" class="h-6 w-6 text-muted" />
					</div>
					<h3 class="mb-2 text-bs weight-500 text-primary sm:text-lg">
						{searchQuery.trim() ? 'No results found' : 'Start searching'}
					</h3>
					<p class="text-sm text-muted">
						{searchQuery.trim() ? `No matches for "${searchQuery}"` : 'Search docs and headers'}
					</p>
				</div>
			{:else}
				<div class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each searchResults as result, index (result.section.id + '-' + (result.type === 'header' && result.header ? result.header.id : 'main'))}
						<button
							data-search-index={index}
							onclick={() => selectResult(result)}
							class="group w-full cursor-pointer px-3 pad-y-12 text-left transition-all duration-200 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset sm:px-4 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:focus:ring-blue-400 {index ===
							validatedSelectedIndex
								? 'bg-white shadow-sm ring-2 ring-blue-500 ring-inset dark:bg-gray-800 dark:ring-blue-400'
								: ''}"
						>
							<div class="row ytop gap-32 sm:gap-3">
								<!-- Icon - smaller on mobile -->
								<div class="mt-0.5 shrink-0 sm:mt-1">
									<span class="text-bs sm:text-lg">{result.section.icon}</span>
								</div>

								<!-- Content -->
								<div class="min0 grow">
									<!-- Title with highlighting -->
									<div class="mb-1 sm:mb-2">
										<p class="text-sm weight-500 text-primary sm:text-base">
											{#each getHighlightedSegments(result.section.title, searchQuery) as segment, segmentIndex (segmentIndex)}
												{#if segment.highlighted}
													<mark
														class="radius-2 bg-yellow-200 px-0.5 py-0.5 weight-500 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
														>{segment.text}</mark
													>
												{:else}
													{segment.text}
												{/if}
											{/each}
										</p>

										<!-- Header title (if it's a header result) -->
										{#if result.type === 'header' && result.header}
											<p class="row ycenter text-xs text-secondary sm:text-sm">
												<span class="mr-1.5 text-xs text-muted">
													{getHeaderLevelPrefix(result.header.level)}
												</span>
												{#each getHighlightedSegments(result.header.title, searchQuery) as segment, segmentIndex (segmentIndex)}
													{#if segment.highlighted}
														<mark
															class="radius-2 bg-yellow-200 px-0.5 py-0.5 weight-500 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
															>{segment.text}</mark
														>
													{:else}
														{segment.text}
													{/if}
												{/each}
											</p>
										{/if}
									</div>

									<!-- Match type badge - minimal on mobile -->
									<div class="row ycenter gap-16">
										<span class="badge sm:px-2">
											<span class="marg-right-4 hidden sm:inline"
												>{getCategoryIcon(result.section.category)}</span
											>
											<span class="sm:hidden">{getMatchTypeLabel(result.matchType)}</span>
											<span class="hidden sm:inline"
												>{getCategoryTitle(result.section.category)}</span
											>
										</span>
										<span
											class="hidden ycenter radius-full pad-x-8 py-0.5 text-xs weight-500 sm:flex {getMatchTypeColor(
												result.matchType
											)}"
										>
											{getMatchTypeLabel(result.matchType)}
										</span>
									</div>
								</div>

								<!-- Selection indicator -->
								{#if index === validatedSelectedIndex}
									<div class="marg-top-4 shrink-0 sm:mt-2">
										<NavigationIcons
											name="chevron-right"
											class="square-12 text-theme sm:h-4 sm:w-4"
										/>
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#snippet footer()}
		<!-- Desktop-only footer -->
		<div class="hidden sm:flex sm:items-center sm:justify-between">
			<p class="text-sm text-muted">
				Search across {sections.length} documentation sections
			</p>
			<Button variant="secondary" size="md" onclick={handleClose}>Close</Button>
		</div>
	{/snippet}
</Modal>

<style lang="sass">
@media (max-width: 640px)
	:global(.modal-container)
		margin: 0.25rem
		max-height: calc(100dvh - 0.5rem)

	[data-search-index]
		min-height: 56px

	:global(.desktop-only)
		display: none

.max-h-96,
.max-h-\[60vh\]
	-webkit-overflow-scrolling: touch
	overscroll-behavior: contain

[data-search-index]:focus
	transform: translateX(1px)

:global(mark)
	font-weight: 600
	text-decoration: none
	border-radius: 2px

@media (max-width: 640px)
	:global(.modal-container .gap-12)
		gap: 0.5rem
</style>
