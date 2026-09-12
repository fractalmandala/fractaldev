<script lang="ts">
	import {
		Button,
		Card,
		Accordion,
		Carousel,
		Window,
		ChromeDivider
	} from '$lib/components/partials';
	import { infoToast } from '$lib/states/toast.svelte';
	import { ThemeIcons } from '$lib/components/icons';
	import { Modal } from '$lib/components/main';

	let modalOpen = $state(false);
	let modalSize = $state<'sm' | 'md' | 'lg' | 'xl'>('md');

	// Enhanced carousel items with variety
	const enhancedCarouselItems = [
		{
			id: 1,
			title: 'Drag & Drop',
			description: 'Intuitive drag and drop file uploads with preview functionality.',
			icon: 'upload',
			color: 'blue'
		},
		{
			id: 2,
			title: 'Responsive Design',
			description: 'Components that adapt seamlessly to any screen size.',
			icon: 'desktop',
			color: 'green'
		},
		{
			id: 3,
			title: 'Dark Mode',
			description: 'Beautiful dark mode support across all components.',
			icon: 'moon',
			color: 'purple'
		},
		{
			id: 4,
			title: 'TypeScript',
			description: 'Full TypeScript support with proper type definitions.',
			icon: 'code',
			color: 'orange'
		},
		{
			id: 5,
			title: 'Animations',
			description: 'Smooth, performant animations and transitions.',
			icon: 'sparkles',
			color: 'yellow'
		},
		{
			id: 6,
			title: 'Accessibility',
			description: 'Built with accessibility in mind from the start.',
			icon: 'shield',
			color: 'red'
		}
	];

	// Comprehensive accordion sections with icons
	const enhancedAccordionSections = [
		{
			id: 'svelte-intro',
			title: 'What is Svelte?',
			icon: '💡',
			content:
				'Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the browser, Svelte shifts that work into a compile step that happens when you build your app.'
		},
		{
			id: 'ecosystem',
			title: 'Ecosystem',
			icon: '🌍',
			content:
				'Rich ecosystem with SvelteKit for full-stack applications, hundreds of components, and active community support.',
			disabled: true
		}
	];

	// Window boundary configurations
	const windowConfigs = [
		{
			title: 'Viewport Constrained',
			description: 'Constrained to browser viewport (excluding nav and footer).',
			boundary: 'viewport' as const,
			x: 50,
			y: 50,
			width: 400,
			height: 250
		},
		{
			title: 'Parent Constrained',
			description: 'Constrained to parent container (the dashed box).',
			boundary: 'parent' as const,
			x: 20,
			y: 40,
			width: 300,
			height: 200
		},
		{
			title: 'Manual Boundaries',
			description: 'Uses manually defined boundaries.',
			boundary: 'manual' as const,
			boundaries: { top: 100, right: 800, bottom: 500, left: 50 },
			x: 100,
			y: 100,
			width: 350,
			height: 220
		},
		{
			title: 'Custom Sized Window',
			description: 'Custom dimensions and styling.',
			boundary: 'viewport',
			x: 200,
			y: 200,
			width: 500,
			height: 300,
			resizable: true,
			draggable: true,
			minWidth: 300,
			minHeight: 200
		}
	];
</script>

<div class="box gap-32">
	<!-- Card Component -->
	<Card
		title="Card"
		subtitle="Flexible container component with various styles, padding, shadows, and interactive states."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- Card Variants -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Card Variants</h3>
			<div class="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
				<Card class="pad-16" title="Default Card" subtitle="Basic styling">
					<p class="text-secondary">Basic card with default styling.</p>
				</Card>

				<Card class="pad-16 border" title="Outlined Card">
					<p class="text-secondary">Card with outline border.</p>
				</Card>

				<Card class="pad-16 shadow-lg" title="Elevated Card" subtitle="With shadow">
					<p class="text-secondary">Card with shadow elevation.</p>
				</Card>
			</div>
		</div>

		<!-- Padding Variants -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Padding Options</h3>
			<div class="grid gap-16 md:grid-cols-2 lg:grid-cols-4">
				<Card padding="none" class="border" title="No Padding">
					<p class="pad-x-16 pad-y-8 text-secondary">No padding</p>
				</Card>

				<Card padding="sm" class="border" title="Small Padding">
					<p class="text-secondary">Small padding</p>
				</Card>

				<Card padding="md" class="border" title="Medium Padding">
					<p class="text-secondary">Medium padding</p>
				</Card>

				<Card padding="xl" class="border" title="Extra Large Padding">
					<p class="text-secondary">Extra large padding</p>
				</Card>
			</div>
		</div>

		<!-- Shadow Variants -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Shadow Options</h3>
			<div class="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
				<Card shadow="none" class="border pad-16" title="No Shadow">
					<p class="text-secondary">No shadow</p>
				</Card>

				<Card shadow="sm" class="pad-16" title="Small Shadow">
					<p class="text-secondary">Small shadow</p>
				</Card>

				<Card shadow="xl" class="pad-16" title="Extra Large Shadow">
					<p class="text-secondary">Extra large shadow</p>
				</Card>
			</div>
		</div>

		<!-- Interactive Cards -->
		<div>
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Interactive Cards</h3>
			<div class="grid gap-16 md:grid-cols-2">
				<Card hover={true} class="cursor-pointer pad-16" onclick={() => infoToast('Card clicked!')}>
					<h3 class="marg-bottom-8 text-lg weight-600 text-primary">Hover Effect</h3>
					<p class="text-secondary">Card with hover animation and click handler.</p>
				</Card>

				<Card clickable={true} href="#" class="pad-16" title="Link Card">
					<h3 class="marg-bottom-8 text-lg weight-600 text-primary">Clickable Link</h3>
					<p class="text-secondary">Card that acts as a link.</p>
				</Card>
			</div>
		</div>
	</Card>

	<!-- Modal Component -->
	<Card
		title="Modal"
		subtitle="Overlay dialogs for important user interactions with multiple size options."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="box gap-24">
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Modal Sizes</h3>
				<div class="row wrap gap-8">
					<Button
						onclick={() => {
							modalSize = 'sm';
							modalOpen = true;
						}}>Small Modal</Button
					>
					<Button
						onclick={() => {
							modalSize = 'md';
							modalOpen = true;
						}}>Medium Modal</Button
					>
					<Button
						onclick={() => {
							modalSize = 'lg';
							modalOpen = true;
						}}>Large Modal</Button
					>
					<Button
						onclick={() => {
							modalSize = 'xl';
							modalOpen = true;
						}}>Extra Large Modal</Button
					>
				</div>
			</div>
		</div>
	</Card>

	<!-- Accordion Component -->
	<Card
		title="Accordion"
		subtitle="Collapsible content sections with icons, animations, and configuration options."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- Standard Accordion -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Multiple Sections (Default)</h3>
			<Accordion sections={enhancedAccordionSections} multiple={true} animationDuration={200} />
		</div>
	</Card>

	<!-- Carousel Component -->
	<Card
		title="Carousel"
		subtitle="Image and content carousel with navigation, autoplay, and responsive layouts."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- Multiple Items Visible -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Multiple Items Visible</h3>
			<Carousel
				totalItems={enhancedCarouselItems.length}
				itemsVisible={3}
				showArrows={true}
				showDots={false}
				autoplay={false}
				class="marg-auto wfull max-w-4xl"
			>
				{#each enhancedCarouselItems as item (item.id)}
					<div class="carousel-item pad-x-8">
						<Card class="pad-24 ta-c" hover={true}>
							<ThemeIcons
								name={item.icon}
								size="square-48"
								class={`marg-auto marg-bottom-12 text-${item.color}-500 dark:text-${item.color}-400`}
							/>
							<h4 class="weight-600 text-primary">{item.title}</h4>
						</Card>
					</div>
				{/each}
			</Carousel>
		</div>

		<!-- Minimal Carousel -->
		<div>
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Minimal Carousel</h3>
			<Carousel
				totalItems={enhancedCarouselItems.length}
				itemsVisible={2}
				showArrows={false}
				showDots={true}
				autoplay={true}
				autoplayInterval={2000}
				class="marg-auto wfull max-w-3xl"
			>
				{#each enhancedCarouselItems as item (item.id)}
					<div class="carousel-item pad-x-8">
						<Card class="border pad-16" hover={true}>
							<div class="row ycenter gap-12">
								<ThemeIcons
									name={item.icon}
									size="square-32"
									class={`text-${item.color}-500 dark:text-${item.color}-400`}
								/>
								<div>
									<h4 class="weight-500 text-primary">{item.title}</h4>
									<p class="text-sm text-secondary">{item.description}</p>
								</div>
							</div>
						</Card>
					</div>
				{/each}
			</Carousel>
		</div>
	</Card>

	<!-- Window Component -->
	<Card
		title="Window"
		subtitle="Draggable, resizable window modal component with boundary constraints and customization options."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="marg-bottom-24 block radius-8 border surface pad-16 sm:hidden">
			<p class="text-sm text-theme">
				<strong>Note:</strong> Window components are disabled on mobile devices (≤768px). Use on desktop/tablet
				only.
			</p>
		</div>

		<div class="box gap-32">
			<!-- Viewport Boundary (Default) -->
			<div>
				<h4 class="marg-bottom-12 hidden text-lg weight-500 text-primary sm:block">
					Viewport Boundary (Default)
				</h4>
				<Window
					title={windowConfigs[0].title}
					width={windowConfigs[0].width}
					height={windowConfigs[0].height}
					x={windowConfigs[0].x}
					y={windowConfigs[0].y}
					open={true}
					boundary={'viewport' as const}
					resizable={true}
					draggable={true}
					minWidth={250}
					minHeight={150}
				>
					<div class="pad-16">
						<p class="text-secondary">{windowConfigs[0].description}</p>
					</div>
				</Window>
			</div>

			<!-- Parent Boundary -->
			<div
				class="relative hidden h-96 radius-8 border-2 border-dashed border-gray-300 sm:block dark:border-gray-600"
			>
				<div class="absolute top-2 left-2 text-sm text-muted">Parent Boundary</div>
				<Window
					title={windowConfigs[1].title}
					width={windowConfigs[1].width}
					height={windowConfigs[1].height}
					x={windowConfigs[1].x}
					y={windowConfigs[1].y}
					open={true}
					boundary={'parent' as const}
					resizable={true}
					draggable={true}
				>
					<div class="pad-16">
						<p class="text-secondary">{windowConfigs[1].description}</p>
					</div>
				</Window>
			</div>

			<!-- Manual Boundary -->
			<div>
				<Window
					title={windowConfigs[2].title}
					width={windowConfigs[2].width}
					height={windowConfigs[2].height}
					x={windowConfigs[2].x}
					y={windowConfigs[2].y}
					open={true}
					boundary={'manual' as const}
					boundaries={windowConfigs[2].boundaries}
					resizable={true}
					draggable={true}
				>
					<div class="pad-16">
						<p class="text-secondary">{windowConfigs[2].description}</p>
					</div>
				</Window>
			</div>

			<!-- Disabled Window -->
			<div>
				<Window
					title="Disabled Window"
					width={300}
					height={200}
					x={600}
					y={300}
					open={true}
					resizable={false}
					draggable={false}
					closable={false}
				>
					<div class="pad-16">
						<p class="text-secondary">This window has drag, resize, and close disabled.</p>
					</div>
				</Window>
			</div>
		</div>
	</Card>

	<!-- ChromeDivider Component -->
	<Card
		title="ChromeDivider"
		subtitle="Browser-style divider components with shimmer and flow animations."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="box gap-32">
			<!-- Variants -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Variants</h3>
				<div class="box gap-24">
					<div class="box gap-32">
						<p class="text-sm text-secondary">Content above Chrome Divider</p>
						<ChromeDivider variant="chrome" />
						<p class="text-sm text-secondary">Content below Chrome Divider</p>
					</div>

					<div class="box gap-32">
						<p class="text-sm text-secondary">Content above Gradient Divider</p>
						<ChromeDivider variant="gradient" />
						<p class="text-sm text-secondary">Content below Gradient Divider</p>
					</div>
				</div>
			</div>

			<!-- Heights -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Height Options</h3>
				<div class="box gap-24">
					<div class="box gap-32">
						<p class="text-sm text-secondary">Small Height (1px)</p>
						<ChromeDivider variant="chrome" height="sm" />
						<p class="text-sm text-secondary">Content below</p>
					</div>

					<div class="box gap-32">
						<p class="text-sm text-secondary">Medium Height (2px - Default)</p>
						<ChromeDivider variant="chrome" height="md" />
						<p class="text-sm text-secondary">Content below</p>
					</div>

					<div class="box gap-32">
						<p class="text-sm text-secondary">Large Height (4px)</p>
						<ChromeDivider variant="chrome" height="lg" />
						<p class="text-sm text-secondary">Content below</p>
					</div>
				</div>
			</div>

			<!-- Animation Control -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Animation Control</h3>
				<div class="box gap-24">
					<div class="box gap-32">
						<p class="text-sm text-secondary">Animated (Default)</p>
						<ChromeDivider variant="chrome" animated={true} />
						<p class="text-sm text-secondary">Content below</p>
					</div>

					<div class="box gap-32">
						<p class="text-sm text-secondary">Not Animated</p>
						<ChromeDivider variant="chrome" animated={false} />
						<p class="text-sm text-secondary">Content below</p>
					</div>
				</div>
			</div>
		</div>
	</Card>
</div>

<Modal
	open={modalOpen}
	size={modalSize}
	title="Component Information"
	onclose={() => (modalOpen = false)}
>
	<div class="box gap-16">
		<p class="text-secondary">
			This modal demonstrates the different size options available for our Modal component.
		</p>
		<div class="grid gap-16 md:grid-cols-2">
			<div class="radius-8 border pad-16">
				<h4 class="marg-bottom-8 weight-500 text-primary">Available Sizes:</h4>
				<ul class="box gap-4 text-sm text-secondary">
					<li>• Small (sm) - Compact dialogs</li>
					<li>• Medium (md) - Standard dialogs</li>
					<li>• Large (lg) - Detailed content</li>
					<li>• Extra Large (xl) - Complex layouts</li>
				</ul>
			</div>
			<div class="radius-8 border pad-16">
				<h4 class="marg-bottom-8 weight-500 text-primary">Features:</h4>
				<ul class="box gap-4 text-sm text-secondary">
					<li>• Responsive design</li>
					<li>• Keyboard navigation</li>
					<li>• Customizable content</li>
					<li>• Smooth animations</li>
				</ul>
			</div>
		</div>
	</div>

	{#snippet footer()}
		<div class="row xright gap-8">
			<Button variant="outline" onclick={() => (modalOpen = false)}>Close</Button>
			<Button onclick={() => (modalOpen = false)}>Got it</Button>
		</div>
	{/snippet}
</Modal>
