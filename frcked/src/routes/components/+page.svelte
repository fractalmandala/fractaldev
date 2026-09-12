<script lang="ts">
	import { Button } from '$lib/components/partials';
	import {
		successToast,
		errorToast,
		warningToast,
		infoToast,
		startViewTransition
	} from '$lib/utils';
	import { NavigationIcons, ThemeIcons, ActionIcons, FileIcons } from '$lib/components/icons';
	import FormComponents from './partials/FormComponents.svelte';
	import DataComponents from './partials/DataComponents.svelte';
	import LayoutComponents from './partials/LayoutComponents.svelte';
	import FeedbackComponents from './partials/FeedbackComponents.svelte';

	let selectedCategory = $state('form');

	const categories = [
		{ id: 'form', name: 'Form Components', icon: 'edit' },
		{ id: 'data', name: 'Data Display', icon: 'spreadsheet' },
		{ id: 'layout', name: 'Layout', icon: 'sliders' },
		{ id: 'feedback', name: 'Feedback', icon: 'notification' }
	] as const;

	function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
		switch (type) {
			case 'success':
				successToast(message);
				break;
			case 'error':
				errorToast(message);
				break;
			case 'warning':
				warningToast(message);
				break;
			case 'info':
				infoToast(message);
				break;
		}
	}

	async function switchCategory(categoryId: string) {
		if (selectedCategory === categoryId) return;

		await startViewTransition(() => {
			selectedCategory = categoryId;
		});
	}
</script>

<svelte:head>
	<title>Component Gallery</title>
	<meta name="description" content="Explore our comprehensive UI component library" />
</svelte:head>

<div class="main-section">
	<div class="content-section xcenter box">
		<div style="view-transition-name: page-title">
			<h1 class="sr-only">Component Gallery</h1>
		</div>

		<div class="box xcenter">
			<header class="box xcenter">
				<h1 class="text-primary">Component Gallery</h1>
				<p class="mb-6 text-lg text-secondary">General purpose UI components.</p>

				<div class="marg-bottom-32 row wrap xcenter gap-8">
					{#each categories as category (category.id)}
						<Button
							variant={selectedCategory === category.id ? 'primary' : 'outline'}
							onclick={() => switchCategory(category.id)}
							class="row ycenter"
						>
							{#if category.id === 'form'}
								<ActionIcons name={category.icon} size="square-16" class="marg-right-8" />
							{:else if category.id === 'data'}
								<FileIcons name={category.icon} size="square-16" class="marg-right-8" />
							{:else if category.id === 'layout'}
								<ThemeIcons name={category.icon} size="square-16" class="marg-right-8" />
							{:else}
								<NavigationIcons name={category.icon} size="square-16" class="marg-right-8" />
							{/if}
							{category.name}
						</Button>
					{/each}
				</div>
			</header>

			<div data-transition="category-content box xcenter">
				{#if selectedCategory === 'form'}
					<FormComponents />
				{:else if selectedCategory === 'data'}
					<DataComponents />
				{:else if selectedCategory === 'layout'}
					<LayoutComponents />
				{:else if selectedCategory === 'feedback'}
					<FeedbackComponents {showToast} />
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="sass">
:global(.grid)
	display: grid
</style>
