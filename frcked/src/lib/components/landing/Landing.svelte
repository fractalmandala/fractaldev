<script lang="ts">
	import {
		Button,
		Card,
		MetricCard,
		ChromeDivider,
		StatusBadge,
		DataTable,
		Carousel
	} from '$lib/components/partials';
	import { NavigationIcons, ThemeIcons, StatusIcons, AccountIcons } from '$lib/components/icons';
	import {
		staggeredAnimation,
		singleElementAnimation,
		staggerPresets,
		safeResolve
	} from '$lib/utilities';
	import { APP_NAME } from '$lib/states/config.svelte';
	import {
		technicalFeatures,
		frameworkFeatures,
		heroData,
		featurePreviewCards,
		frameworkColumns,
		stackOverview,
		gettingStartedCards,
		sectionTitles,
		carouselConfig,
		animationConfigs,
		dataTableConfig,
		checkIconConfig,
		stackFooterText
	} from '$lib/data/landing';

	// Transform frameworkFeatures for DataTable
	const frameworkFeaturesList = frameworkFeatures.flatMap((feature) =>
		feature.items.map((item) => ({
			id: `${feature.title}-${item.text}`,
			feature: item.text,
			category: feature.title,
			status: 'Available',
			color: item.color
		}))
	);

	// Get icon components dynamically
	const getIconComponent = (iconLibrary: string) => {
		switch (iconLibrary) {
			case 'NavigationIcons':
				return NavigationIcons;
			case 'ThemeIcons':
				return ThemeIcons;
			case 'StatusIcons':
				return StatusIcons;
			case 'AccountIcons':
				return AccountIcons;
			default:
				return NavigationIcons;
		}
	};

	// Get animation presets safely
	const getAnimationPreset = (presetName: string) => {
		const preset = staggerPresets[presetName as keyof typeof staggerPresets];
		return preset ? preset() : staggerPresets.fadeInUp();
	};
</script>

<div class="content-section">
	<!-- Hero Section -->
	<section class="relative ta-c">
		<div
			class="marg-auto max-w-4xl"
			use:staggeredAnimation={getAnimationPreset(animationConfigs.heroSection.preset)}
		>
			<img src="/favicon.png" alt="Svelte GUI Logo" class="marg-auto h-20 w-20" />
			<h1 class="row ycenter xcenter gap-8 text-5xl weight-700 text-primary">
				{APP_NAME}
			</h1>

			<h2 class="marg-top-8 marg-bottom-32 text-lg text-secondary italic">
				{heroData.subtitle}
			</h2>

			<!-- Hero CTA -->
			<div class="marg-bottom-48 box ycenter xcenter gap-16 sm:flex-row">
				{#each heroData.buttons as button (button.id)}
					{@const IconComponent = getIconComponent(button.iconLibrary)}
					<Button
						variant={button.variant}
						size={button.size}
						href={safeResolve(button.href)}
						class={button.variant === 'primary' ? 'relative overflow-hidden' : ''}
					>
						<IconComponent name={button.icon} class="marg-right-8 square-24" />
						{button.text}
					</Button>
				{/each}
			</div>

			<!-- Feature Preview Cards -->
			<div class="grid grid-cols-1 gap-16 md:grid-cols-3">
				{#each featurePreviewCards as card (card.id)}
					{@const IconComponent = getIconComponent(card.iconLibrary)}
					<Card padding="lg" hover={true}>
						<div class="ta-c">
							<div
								class="marg-auto marg-bottom-16 row square-48 ycenter xcenter radius-full {card.bgColor}"
							>
								<IconComponent name={card.icon} size="h-6 w-6" class={card.iconColor} />
							</div>
							<h3 class="marg-bottom-8 weight-600 text-primary">{card.title}</h3>
							<p class="text-sm text-secondary">{card.description}</p>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Technical Features -->
	<section
		class="pad-y-64"
		use:singleElementAnimation={getAnimationPreset(animationConfigs.technicalFeatures.preset)}
	>
		<div class="marg-auto max-w-6xl">
			<h3 class="marg-bottom-48 ta-c text-3xl weight-700 text-primary">
				{sectionTitles.whatIncluded}
			</h3>
			<div class="row xcenter">
				<Carousel
					showArrows={carouselConfig.showArrows}
					showDots={carouselConfig.showDots}
					autoplay={carouselConfig.autoplay}
					autoplayInterval={carouselConfig.autoplayInterval}
					totalItems={technicalFeatures.length}
					itemsVisible={carouselConfig.itemsVisible}
					class="wfull"
				>
					{#each technicalFeatures as feature (feature.title)}
						<div class="carousel-item">
							<Card title={feature.title} padding="md" shadow="sm" hover={true} class="hfull ta-c">
								<div class="box gap-16">
									<p class="text-secondary">{feature.description}</p>
									<StatusBadge
										status={feature.status}
										variant={feature.status === 'Implemented'
											? 'success'
											: feature.status === 'Beta Ready'
												? 'warning'
												: 'info'}
										size="sm"
										class="marg-auto"
									/>
								</div>
							</Card>
						</div>
					{/each}
				</Carousel>
			</div>
		</div>
	</section>

	<ChromeDivider variant="chrome" animated={false} />

	<!-- Framework Features -->
	<section
		use:singleElementAnimation={getAnimationPreset(animationConfigs.frameworkFeatures.preset)}
	>
		<div class="marg-auto max-w-6xl">
			<h3 class="marg-y-48 ta-c text-3xl weight-700 text-primary">
				{sectionTitles.fullStackShell}
			</h3>
			<div
				class="marg-bottom-48 ta-c"
				use:staggeredAnimation={getAnimationPreset(animationConfigs.frameworkDescription.preset)}
			>
				<p class="marg-auto max-w-3xl text-lg text-secondary">
					{sectionTitles.fullStackDescription}
				</p>
			</div>

			<div class="row xcenter">
				<div
					class="wfull max-w-5xl overflow-x-auto"
					use:staggeredAnimation={{
						...getAnimationPreset(animationConfigs.frameworkTable.preset),
						selector: animationConfigs.frameworkTable.selector,
						staggerDelay: animationConfigs.frameworkTable.staggerDelay
					}}
				>
					<div class="min-w-[600px]">
						<DataTable
							data={frameworkFeaturesList}
							columns={frameworkColumns}
							striped={dataTableConfig.striped}
							hoverable={dataTableConfig.hoverable}
							emptyState={dataTableConfig.emptyState}
							compact={dataTableConfig.compact}
						>
							{#snippet children(item)}
								<td class="pad-x-16 pad-y-8 text-sm text-primary" style="vertical-align: middle;">
									<div class="row ycenter xleft">
										<div class="row ycenter gap-8">
											<div class="h-2 w-2 shrink-0 radius-full {item.color}"></div>
											<span class="truncate weight-500">{item.feature}</span>
										</div>
									</div>
								</td>
								<td class="pad-x-16 pad-y-8 text-sm text-primary" style="vertical-align: middle;">
									<div class="row ycenter xcenter">
										<span class="truncate text-xs text-secondary sm:text-sm">{item.category}</span>
									</div>
								</td>
								<td class="pad-x-16 pad-y-8 text-sm text-primary" style="vertical-align: middle;">
									<div class="row ycenter xright">
										<StatusBadge status={item.status} variant="success" size="xs" />
									</div>
								</td>
							{/snippet}
						</DataTable>
					</div>
				</div>
			</div>

			<!-- Stack Overview -->
			<div class="marg-top-48">
				<div class="grid grid-cols-2 gap-16 md:grid-cols-4">
					{#each stackOverview as stack (stack.id)}
						<MetricCard title={stack.title} value={stack.value} color={stack.color} size="sm">
							{#snippet iconSnippet()}
								<img src={stack.imageUrl} alt={stack.alt} class="square-24" />
							{/snippet}
						</MetricCard>
					{/each}
				</div>
				<div class="marg-top-12 ta-c">
					<div class="marg-bottom-8 text-xs text-muted">
						{stackFooterText}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Getting Started -->
	<section
		class="pad-y-64"
		use:singleElementAnimation={getAnimationPreset(animationConfigs.gettingStarted.preset)}
	>
		<div class="marg-auto max-w-6xl">
			<h3
				use:staggeredAnimation={getAnimationPreset(animationConfigs.gettingStartedTitle.preset)}
				class="marg-bottom-32 ta-c text-3xl weight-700 text-primary"
			>
				{sectionTitles.getStarted}
			</h3>

			<div
				class="grid grid-cols-1 gap-32 md:grid-cols-2"
				use:staggeredAnimation={getAnimationPreset(animationConfigs.gettingStartedCards.preset)}
			>
				{#each gettingStartedCards as card (card.id)}
					{@const ButtonIconComponent = getIconComponent(card.button.iconLibrary)}
					<Card padding="xl" shadow="lg" class="edge-wrapper ta-c">
						<div class="box gap-24">
							<div class="ta-c">
								<div class="marg-bottom-16 text-4xl">{card.emoji}</div>
								<h4 class="text-xl weight-600 text-primary">{card.title}</h4>
							</div>
							<div class="box gap-16">
								<ul class="marg-bottom-24 gap-12 text-left">
									{#each card.steps as step (step.id)}
										{@const StepIconComponent = getIconComponent(step.iconLibrary)}
										<li class="row ycenter text-sm text-secondary">
											<div
												class="marg-right-12 row h-6 w-6 shrink-0 ycenter xcenter radius-full {checkIconConfig.bgColor}"
											>
												<StepIconComponent
													name={step.icon}
													size={checkIconConfig.size}
													class={checkIconConfig.iconColor}
												/>
											</div>
											{step.text}
										</li>
									{/each}
								</ul>
							</div>
							<div class="pad-top-16">
								<Button
									variant={card.button.variant}
									color={card.button.color}
									size="lg"
									fullWidth={true}
									href={card.button.href}
									target={card.button.target}
								>
									<ButtonIconComponent name={card.button.icon} class="marg-right-8 square-12" />
									{card.button.text}
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	</section>
</div>
