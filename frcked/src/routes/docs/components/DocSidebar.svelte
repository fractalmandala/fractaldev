<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { FileIcons, NavigationIcons } from '$lib/components/icons';
	import { disableUserScroll } from '$lib/utilities';
	import type { LoadedDocSection, DocHeader } from '../types';

	interface Props {
		sections: LoadedDocSection[];
		groupedSections: Record<string, LoadedDocSection[]>;
		sortedCategories: string[];
		selectedSectionId: string;
		onSectionSelect: (section: LoadedDocSection) => void;
		isOpen?: boolean;
		onToggle?: () => void;
		showFooter?: boolean;
		selectedSection?: LoadedDocSection | null;
		isMobile?: boolean;
	}

	let {
		sections,
		groupedSections,
		sortedCategories,
		selectedSectionId,
		onSectionSelect,
		isOpen = true,
		onToggle,
		showFooter = false,
		selectedSection,
		isMobile = false
	}: Props = $props();

	// State for expandable sections - initialize with smart defaults
	const initExpandedSections = () => {
		const expanded: Record<string, boolean> = {};

		// Always expand first category by default
		if (sortedCategories.length > 0) {
			expanded[sortedCategories[0]] = true;
		}

		// Also expand the category containing the currently selected section
		if (selectedSectionId && sections.length > 0) {
			const currentSection = sections.find((s) => s.id === selectedSectionId);
			if (currentSection) {
				expanded[currentSection.category] = true;
			}
		}

		return expanded;
	};

	let expandedSections = $state<Record<string, boolean>>(initExpandedSections());

	// Update expanded sections when selected section changes (but only once initialized)
	$effect(() => {
		if (selectedSectionId && sections.length > 0) {
			const currentSection = sections.find((s) => s.id === selectedSectionId);
			if (currentSection && !expandedSections[currentSection.category]) {
				expandedSections[currentSection.category] = true;
			}
		}
	});

	function handleSectionClick(section: LoadedDocSection) {
		onSectionSelect(section);
	}

	function handleHeaderClick(header: DocHeader) {
		// Disable user scrolling during smooth scroll animation
		disableUserScroll(650);
		// Scroll to the header element
		const element = document.getElementById(header.anchor);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function toggleSection(category: string) {
		expandedSections = { ...expandedSections, [category]: !expandedSections[category] };
	}

	function handleCategoryKeydown(event: KeyboardEvent, category: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleSection(category);
		}
	}

	function getCategoryTitle(category: string) {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	function getCategoryIcon(category: string) {
		// Get icon from first section in category
		const firstSection = groupedSections[category]?.[0];
		return firstSection?.icon || '📄';
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onToggle?.();
		}
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && e.target === e.currentTarget) {
			onToggle?.();
		}
	}

	function handleEscapeKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onToggle?.();
		}
	}
</script>

<svelte:window onkeydown={handleEscapeKey} />

{#if isMobile}
	<!-- Mobile Overlay -->
	{#if isOpen}
		<div
			class="fixed inset-0 z-50 cursor-pointer bg-black/50"
			onclick={handleBackdropClick}
			onkeydown={handleBackdropKeydown}
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Documentation sidebar"
			transition:slide={{ duration: 250, axis: 'x', easing: quintOut }}
		>
			<!-- Mobile Sidebar Panel -->
			<div
				class="fixed inset-y-0 left-0 w-100 max-w-[100vw] box bg-white/80 shadow-xl dark:bg-gray-900/80"
				role="document"
				transition:slide={{ duration: 250, axis: 'x', easing: quintOut }}
			>
				<!-- Mobile Header -->
				<div class="row h-64 ycenter xbetween border-bottom pad-x-16">
					<h2 class="text-lg weight-600 text-primary">Documentation</h2>
					<button
						onclick={onToggle}
						class="cursor-pointer touch-manipulation radius-6 pad-8 text-muted hover:bg-gray-100 hover:text-gray-500 active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:active:bg-gray-700"
						aria-label="Close sidebar"
					>
						<NavigationIcons name="close" size="h-6 w-6" />
					</button>
				</div>

				<!-- Mobile Navigation -->
				<nav
					class="grow touch-pan-y overflow-y-auto overscroll-contain pad-x-16 pad-y-16"
					style="height: calc(100dvh - 8rem); -webkit-overflow-scrolling: touch; scroll-behavior: smooth; overscroll-behavior-y: contain;"
				>
					<div class="box gap-16">
						{#each sortedCategories as category (category)}
							{@const categorySections = groupedSections[category] || []}
							{@const isExpanded = expandedSections[category] ?? category === sortedCategories[0]}

							<div>
								<!-- Category Header - Clickable -->
								<button
									onclick={() => toggleSection(category)}
									onkeydown={(e) => handleCategoryKeydown(e, category)}
									class="marg-bottom-12 row w-full cursor-pointer ycenter xbetween radius-6 pad-x-8 pad-y-4 text-left transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none active:bg-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-400 dark:active:bg-gray-700"
									aria-expanded={isExpanded}
									aria-controls="category-{category}"
								>
									<div class="row ycenter">
										<span class="marg-right-8 text-lg">{getCategoryIcon(category)}</span>
										<h3 class="text-sm weight-600 tracking-wide text-primary tt-u">
											{getCategoryTitle(category)}
										</h3>
									</div>
									<NavigationIcons
										name="chevron-right"
										size="square-16"
										class="text-muted transition-transform duration-200 {isExpanded
											? 'rotate-90'
											: ''}"
									/>
								</button>

								<!-- Category Items - Expandable -->
								{#if isExpanded}
									<ul class="box gap-16" id="category-{category}" role="group">
										{#each categorySections as section (section.id)}
											<li>
												<!-- Main Section Button -->
												<button
													onclick={() => handleSectionClick(section)}
													class="row wfull cursor-pointer touch-manipulation ycenter radius-8 pad-x-12 pad-y-12 text-left text-sm transition-colors {selectedSectionId ===
													section.id
														? 'surface text-theme'
														: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:active:bg-gray-700'}"
												>
													<span class="marg-right-12 text-bs">{section.icon}</span>
													<span class="grow truncate weight-500">{section.title}</span>
													{#if selectedSectionId === section.id}
														<div class="marg-left-8 h-2 w-2 radius-full bg-theme"></div>
													{/if}
												</button>

												<!-- Headers Sub-navigation -->
												{#if selectedSectionId === section.id && section.headers && section.headers.length > 0}
													<ul class="box marg-top-8 marg-left-24 gap-4 border-left pad-left-16">
														{#each section.headers.filter((h) => h.level <= 3) as header (header.id)}
															<li>
																<button
																	onclick={() => handleHeaderClick(header)}
																	class="row w-full cursor-pointer ycenter radius-4 pad-x-8 pad-y-6 text-left text-xs transition-colors hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white {header.level ===
																	1
																		? 'weight-600 text-primary'
																		: header.level === 2
																			? 'weight-500 text-secondary'
																			: 'text-secondary'}"
																	style="padding-left: {(header.level - 1) * 0.5}rem"
																>
																	<span class="marg-right-8 text-xs opacity-60">
																		{'#'.repeat(header.level)}
																	</span>
																	<span class="truncate">{header.title}</span>
																</button>
															</li>
														{/each}
													</ul>
												{/if}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/each}
					</div>
				</nav>

				<!-- Mobile Footer -->
				{#if showFooter}
					<div class="shrink-0 border-top pad-x-16 pad-y-12">
						<div class="row ycenter xbetween text-xs text-muted">
							<div class="row ycenter">
								<FileIcons name="document" class="marg-right-6 square-16" />
								<span>{sections.length} docs</span>
							</div>
							{#if selectedSection}
								<div class="row ycenter">
									<span class="marg-right-4 text-sm">{selectedSection.icon}</span>
									<span class="max-w-32 truncate weight-500">{selectedSection.title}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
{:else}
	<!-- Desktop Sidebar -->
	<div class="sticky top-0 hfull-vh w-80 box border-right surface">
		<!-- Desktop Header -->
		<div class="shrink-0 border-bottom pad-16">
			<h2 class="text-lg weight-600 text-primary">Documentation</h2>
		</div>

		<!-- Desktop Navigation -->
		<nav class="grow overflow-y-auto pad-x-16 pad-y-24" style="scroll-behavior: smooth;">
			<div class="box gap-24">
				{#each sortedCategories as category (category)}
					{@const categorySections = groupedSections[category] || []}
					{@const isExpanded = expandedSections[category] ?? category === sortedCategories[0]}

					<div>
						<!-- Category Header - Clickable -->
						<button
							onclick={() => toggleSection(category)}
							onkeydown={(e) => handleCategoryKeydown(e, category)}
							class="marg-bottom-12 row w-full cursor-pointer ycenter xbetween radius-6 pad-x-8 pad-y-4 text-left transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none active:bg-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-400 dark:active:bg-gray-700"
							aria-expanded={isExpanded}
							aria-controls="category-{category}-desktop"
						>
							<div class="row ycenter">
								<span class="marg-right-8 text-lg">{getCategoryIcon(category)}</span>
								<h3 class="text-xs weight-600 tracking-wide text-muted tt-u">
									{getCategoryTitle(category)}
								</h3>
							</div>
							<NavigationIcons
								name="chevron-right"
								size="square-16"
								class="text-muted transition-transform duration-200 {isExpanded ? 'rotate-90' : ''}"
							/>
						</button>

						<!-- Category Items - Expandable -->
						{#if isExpanded}
							<ul class="box gap-16" id="category-{category}-desktop" role="group">
								{#each categorySections as section (section.id)}
									<li>
										<!-- Main Section Button -->
										<button
											onclick={() => handleSectionClick(section)}
											class="group row wfull cursor-pointer touch-manipulation ycenter radius-6 pad-x-12 pad-y-8 text-left text-sm transition-colors {selectedSectionId ===
											section.id
												? 'surface text-theme'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:active:bg-gray-700'}"
										>
											<span class="marg-right-12 text-bs opacity-75 group-hover:opacity-100"
												>{section.icon}</span
											>
											<span class="grow truncate weight-500">{section.title}</span>
											{#if selectedSectionId === section.id}
												<div class="ml-auto h-1.5 w-1.5 radius-full bg-theme"></div>
											{/if}
										</button>

										<!-- Headers Sub-navigation -->
										{#if selectedSectionId === section.id && section.headers && section.headers.length > 0}
											<ul class="box marg-top-4 marg-left-24 gap-2 border-left pad-left-12">
												{#each section.headers.filter((h) => h.level <= 3) as header (header.id)}
													<li>
														<button
															onclick={() => handleHeaderClick(header)}
															class="row w-full cursor-pointer ycenter radius-4 pad-x-8 pad-y-4 text-left text-xs transition-colors hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white {header.level ===
															1
																? 'weight-600 text-secondary'
																: header.level === 2
																	? 'weight-500 text-secondary'
																	: 'text-muted'}"
															style="padding-left: {(header.level - 1) * 0.375}rem"
														>
															<span class="marg-right-6 text-xs opacity-50">
																{'#'.repeat(header.level)}
															</span>
															<span class="truncate">{header.title}</span>
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/each}
			</div>
		</nav>

		<!-- Desktop Footer -->
		{#if showFooter}
			<div class="shrink-0 border-top pad-16">
				<div class="space-y-3 text-xs text-muted">
					<!-- Combined Stats and Current Section -->
					<div class="box gap-32">
						<div class="row ycenter xbetween">
							<div class="row ycenter">
								<FileIcons name="document" class="marg-right-8 square-16" />
								<span>{sections.length} sections</span>
							</div>
							<div class="row ycenter gap-6">
								<span class="text-xs">
									{new Date().toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="row gap-16 border-top pt-3">
						<button
							class="row touch-manipulation ycenter text-left transition-colors hover:text-gray-700 dark:hover:text-gray-300"
							disabled
							title="Coming soon"
						>
							<span class="marg-right-8">📝</span>
							<span class="opacity-75">Report an issue</span>
						</button>
						<button
							class="row touch-manipulation ycenter text-left transition-colors hover:text-gray-700 dark:hover:text-gray-300"
							disabled
							title="Coming soon"
						>
							<span class="marg-right-8">✏️</span>
							<span class="opacity-75">Edit this page</span>
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Minimal Footer -->
			<div class="shrink-0 border-top pad-16">
				<div class="row ycenter text-xs text-muted">
					<FileIcons name="document" class="marg-right-8 square-16" />
					<span>{sections.length} sections available</span>
				</div>
			</div>
		{/if}
	</div>
{/if}
