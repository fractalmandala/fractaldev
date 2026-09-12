<script lang="ts">
	import {
		Accordion,
		Alert,
		AnimatedButton,
		AnimatedCard,
		Avatar,
		Badge,
		BitsEffect,
		Button,
		Card,
		Card3D,
		CardStack,
		Carousel,
		Checkbox,
		Counter,
		Dialog,
		Input,
		MacosDock,
		Magnetic,
		Marquee,
		MotionList,
		Presence,
		Progress,
		Reveal,
		Select,
		Separator,
		Skeleton,
		Stepper,
		Switch,
		Tabs,
		Textarea,
		TextLoop,
		TextScramble,
		Theme,
		Toast,
		Tooltip
	} from '#lib/components/index.ts';
	import { Icon } from 'fractalicons';
	import { luBell } from 'fractalicons/lucide';
	import MotionCore from './MotionCore.svelte';
	import { svelteBitsCategoryBySlug, svelteBitsSlugs } from '#lib/docs/catalogue.ts';

	let { slug }: { slug: string } = $props();

	// Standalone Components Knobs State
	let card3dMaxTilt = $state(18);
	let card3dGlare = $state(true);
	let card3dPerspective = $state(1000);
	let card3dScale = $state(1.02);

	let macosDockMagnification = $state(1.6);
	let macosDockDistance = $state(120);

	let cardStackMaxVisible = $state(3);

	let textScrambleText = $state('Decentralized Future');
	let textScrambleTrigger = $state<'hover' | 'click' | 'mount'>('hover');
	let textScrambleSpeed = $state(30);

	// Stage controls
	let viewportWidth = $state<'100%' | '768px' | '375px'>('100%');
	let bgMode = $state<'surface' | 'grid' | 'checker'>('surface');
	let copied = $state(false);

	// Core UI Knobs State
	let btnVariant = $state<'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'soft'>('primary');
	let btnSize = $state<'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg'>('md');
	let btnShape = $state<'default' | 'pill'>('default');
	let btnDisabled = $state(false);
	let btnLoading = $state(false);
	let btnLabel = $state('Save changes');

	let badgeVariant = $state<'neutral' | 'accent' | 'success' | 'warning' | 'danger'>('accent');
	let badgeText = $state('Featured');

	let alertVariant = $state<'info' | 'success' | 'warning' | 'danger'>('info');
	let alertTitle = $state('A thoughtful default');
	let alertContent = $state('This alert puts context where it is needed.');

	let avatarName = $state('Maya Chen');
	let avatarSize = $state<'sm' | 'md' | 'lg'>('md');
	let avatarSrc = $state('');

	let cardPadding = $state<'none' | 'sm' | 'md' | 'lg'>('md');

	let accordionTitle = $state('How does it work?');
	let accordionOpen = $state(true);

	let inputType = $state<'text' | 'email' | 'password' | 'search' | 'number'>('email');
	let inputPlaceholder = $state('you@example.com');
	let inputDisabled = $state(false);
	let inputValue = $state('');

	let textareaPlaceholder = $state('Leave a note for the team...');
	let textareaRows = $state(4);
	let textareaDisabled = $state(false);
	let textareaValue = $state('');

	let checkboxChecked = $state(true);
	let checkboxLabel = $state('I agree to product updates');
	let checkboxDisabled = $state(false);

	let switchChecked = $state(true);
	let switchLabel = $state('Enable notifications');
	let switchDisabled = $state(false);

	let selectValue = $state('team');
	let selectPlaceholder = $state('Select plan');
	let selectDisabled = $state(false);
	const selectOptions = [
		{ label: 'Starter', value: 'starter' },
		{ label: 'Team', value: 'team' },
		{ label: 'Enterprise', value: 'enterprise' }
	];

	let dialogOpen = $state(false);
	let dialogTitle = $state('Invite a teammate');
	let dialogDescription = $state('They will receive an email invitation.');

	let tooltipContent = $state('Create a new workspace');
	let tooltipPosition = $state<'top' | 'bottom'>('top');

	let progressValue = $state(68);
	let progressMax = $state(100);
	let progressLabel = $state('Uploading files');

	let skeletonWidth = $state('100%');
	let skeletonHeight = $state('1.5rem');
	let skeletonCircle = $state(false);

	let toastOpen = $state(true);
	let toastVariant = $state<'info' | 'success' | 'warning' | 'danger'>('success');
	let toastTitle = $state('Changes saved');

	let separatorOrientation = $state<'horizontal' | 'vertical'>('horizontal');

	let animBtnVariant = $state<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
	let animBtnSize = $state<'sm' | 'md' | 'lg'>('md');
	let animBtnAnimated = $state(true);
	let animBtnDisabled = $state(false);

	let animCardPadding = $state<'none' | 'sm' | 'md' | 'lg'>('md');
	let animCardInteractive = $state(true);

	let revealDelay = $state(0.08);

	let presenceOpen = $state(true);

	let magneticStrength = $state(0.16);
	let magneticMaxOffset = $state(12);
	let magneticDisabled = $state(false);

	let textLoopInterval = $state(2200);

	let marqueeSpeed = $state(18);
	let marqueeDirection = $state<'left' | 'right'>('left');

	let carouselIndex = $state(0);
	const carouselItems = [
		{ id: 'tokens', title: 'Start with tokens', description: 'Choose the colors, typography, and radius that fit your product.' },
		{ id: 'components', title: 'Compose primitives', description: 'Use accessible building blocks without inheriting a rigid brand.' },
		{ id: 'motion', title: 'Add considered motion', description: 'Keep every effect purposeful, subtle, and easy to disable.' }
	];

	let stepperCurrent = $state(1);
	let stepperInteractive = $state(true);
	const stepperSteps = [
		{ id: 'plan', title: 'Plan', description: 'Set component contracts' },
		{ id: 'build', title: 'Build', description: 'Compose the interface' },
		{ id: 'ship', title: 'Ship', description: 'Verify before release' }
	];

	let counterValue = $state(12800);
	let counterDuration = $state(850);

	const tabs = [
		{ id: 'overview', label: 'Overview', content: 'A concise overview of your project architecture.' },
		{ id: 'activity', label: 'Activity', content: 'Nothing new since your last visit.' }
	];
	const motionItems = [
		{ id: 'tokens', title: 'Configure tokens', description: 'Foundation complete' },
		{ id: 'components', title: 'Compose components', description: '18 base primitives ready' },
		{ id: 'ship', title: 'Ship with confidence', description: 'Checked and built' }
	];
	const brandTokens = { '--theme-color': '#0f766e', '--theme-color-alt': '#115e59', '--radius-6': '1.5rem' };

	function resetKnobs() {
		btnVariant = 'primary';
		btnSize = 'md';
		btnShape = 'default';
		btnDisabled = false;
		btnLoading = false;
		btnLabel = 'Save changes';
		badgeVariant = 'accent';
		badgeText = 'Featured';
		alertVariant = 'info';
		alertTitle = 'A thoughtful default';
		avatarSize = 'md';
		cardPadding = 'md';
		accordionOpen = true;
		inputDisabled = false;
		inputValue = '';
		checkboxChecked = true;
		switchChecked = true;
		selectValue = 'team';
		dialogOpen = false;
		toastOpen = true;
		toastVariant = 'success';
		animBtnVariant = 'primary';
		animBtnSize = 'md';
		animBtnAnimated = true;
		magneticDisabled = false;
		stepperCurrent = 1;
		carouselIndex = 0;
	}

	const generatedCode = $derived.by(() => {
		switch (slug) {
			case 'button': {
				const isIcon = btnSize.startsWith('icon');
				const iconImports = isIcon ? "\n\timport { Icon } from 'fractalicons';\n\timport { luBell } from 'fractalicons/lucide';" : '';
				const shapeAttr = btnShape === 'pill' ? '\n\tshape="pill"' : '';
				const stateAttrs = `${btnLoading ? '\n\tloading' : ''}${btnDisabled ? '\n\tdisabled' : ''}`;
				const labelAttr = isIcon ? `aria-label="${btnLabel}"` : `onclick={() => alert('Clicked')}`;
				const body = isIcon ? '<Icon icon={luBell} />' : btnLabel;
				return `<script>\n\timport { Button } from 'fractalsvelte/components';${iconImports}\n<\/script>\n\n<Button\n\tvariant="${btnVariant}"\n\tsize="${btnSize}"${shapeAttr}${stateAttrs}\n\t${labelAttr}\n>\n\t${body}\n</Button>`;
			}
			case 'badge':
				return `<script>\n\timport { Badge } from 'fractalsvelte/components';\n<\/script>\n\n<Badge variant="${badgeVariant}">\n\t${badgeText}\n</Badge>`;
			case 'alert':
				return `<script>\n\timport { Alert } from 'fractalsvelte/components';\n<\/script>\n\n<Alert title="${alertTitle}" variant="${alertVariant}">\n\t${alertContent}\n</Alert>`;
			case 'avatar':
				return `<script>\n\timport { Avatar } from 'fractalsvelte/components';\n<\/script>\n\n<Avatar\n\tname="${avatarName}"\n\tsize="${avatarSize}"${avatarSrc ? `\n\tsrc="${avatarSrc}"` : ''}\n/>`;
			case 'card':
				return `<script>\n\timport { Card } from 'fractalsvelte/components';\n<\/script>\n\n<Card padding="${cardPadding}">\n\t<strong>Design decision</strong>\n\t<p>Use a Card to group content without imposing visual noise.</p>\n</Card>`;
			case 'accordion':
				return `<script>\n\timport { Accordion } from 'fractalsvelte/components';\n\tlet open = $state(${accordionOpen});\n<\/script>\n\n<Accordion title="${accordionTitle}" bind:open>\n\tIt uses the native details element, so disclosure and keyboard support come built in.\n</Accordion>`;
			case 'tabs':
				return `<script>\n\timport { Tabs } from 'fractalsvelte/components';\n\tconst tabs = [\n\t\t{ id: 'overview', label: 'Overview', content: 'A concise overview.' },\n\t\t{ id: 'activity', label: 'Activity', content: 'Recent activity.' }\n\t];\n<\/script>\n\n<Tabs {tabs} />`;
			case 'input':
				return `<script>\n\timport { Input } from 'fractalsvelte/components';\n\tlet value = $state('${inputValue}');\n<\/script>\n\n<Input\n\ttype="${inputType}"\n\tplaceholder="${inputPlaceholder}"${inputDisabled ? '\n\tdisabled' : ''}\n\tbind:value\n/>`;
			case 'textarea':
				return `<script>\n\timport { Textarea } from 'fractalsvelte/components';\n\tlet value = $state('${textareaValue}');\n<\/script>\n\n<Textarea\n\trows={${textareaRows}}\n\tplaceholder="${textareaPlaceholder}"${textareaDisabled ? '\n\tdisabled' : ''}\n\tbind:value\n/>`;
			case 'checkbox':
				return `<script>\n\timport { Checkbox } from 'fractalsvelte/components';\n\tlet checked = $state(${checkboxChecked});\n<\/script>\n\n<Checkbox\n\tlabel="${checkboxLabel}"${checkboxDisabled ? '\n\tdisabled' : ''}\n\tbind:checked\n/>`;
			case 'switch':
				return `<script>\n\timport { Switch } from 'fractalsvelte/components';\n\tlet checked = $state(${switchChecked});\n<\/script>\n\n<Switch\n\tlabel="${switchLabel}"${switchDisabled ? '\n\tdisabled' : ''}\n\tbind:checked\n/>`;
			case 'select':
				return `<script>\n\timport { Select } from 'fractalsvelte/components';\n\tlet value = $state('${selectValue}');\n\tconst options = [\n\t\t{ label: 'Starter', value: 'starter' },\n\t\t{ label: 'Team', value: 'team' },\n\t\t{ label: 'Enterprise', value: 'enterprise' }\n\t];\n<\/script>\n\n<Select\n\t{options}\n\tplaceholder="${selectPlaceholder}"${selectDisabled ? '\n\tdisabled' : ''}\n\tbind:value\n/>`;
			case 'dialog':
				return `<script>\n\timport { Button, Dialog } from 'fractalsvelte/components';\n\tlet open = $state(false);\n<\/script>\n\n<Button onclick={() => open = true}>Open dialog</Button>\n\n<Dialog\n\tbind:open\n\ttitle="${dialogTitle}"\n\tdescription="${dialogDescription}"\n>\n\t<p>Choose their project role before continuing.</p>\n</Dialog>`;
			case 'tooltip':
				return `<script>\n\timport { Button, Tooltip } from 'fractalsvelte/components';\n<\/script>\n\n<Tooltip content="${tooltipContent}" position="${tooltipPosition}">\n\t<Button size="sm" variant="secondary">Hover me</Button>\n</Tooltip>`;
			case 'progress':
				return `<script>\n\timport { Progress } from 'fractalsvelte/components';\n<\/script>\n\n<Progress value={${progressValue}} max={${progressMax}} label="${progressLabel}" />`;
			case 'skeleton':
				return `<script>\n\timport { Skeleton } from 'fractalsvelte/components';\n<\/script>\n\n<Skeleton width="${skeletonWidth}" height="${skeletonHeight}"${skeletonCircle ? ' circle' : ''} />`;
			case 'toast':
				return `<script>\n\timport { Toast } from 'fractalsvelte/components';\n\tlet open = $state(${toastOpen});\n<\/script>\n\n<Toast bind:open title="${toastTitle}" variant="${toastVariant}">\n\tYour project configuration is up to date.\n</Toast>`;
			case 'separator':
				return `<script>\n\timport { Separator } from 'fractalsvelte/components';\n<\/script>\n\n<Separator orientation="${separatorOrientation}" />`;
			case 'animated-button':
				return `<script>\n\timport { AnimatedButton } from 'fractalsvelte/components';\n<\/script>\n\n<AnimatedButton\n\tvariant="${animBtnVariant}"\n\tsize="${animBtnSize}"\n\tanimated={${animBtnAnimated}}${animBtnDisabled ? '\n\tdisabled' : ''}\n>\n\tHover and press\n</AnimatedButton>`;
			case 'animated-card':
				return `<script>\n\timport { AnimatedCard } from 'fractalsvelte/components';\n<\/script>\n\n<AnimatedCard padding="${animCardPadding}" interactive={${animCardInteractive}}>\n\t<strong>Project plan</strong>\n\t<p>Lifts gently on hover and settles on press.</p>\n</AnimatedCard>`;
			case 'magnetic':
				return `<script>\n\timport { Button, Magnetic } from 'fractalsvelte/components';\n<\/script>\n\n<Magnetic strength={${magneticStrength}} maxOffset={${magneticMaxOffset}}${magneticDisabled ? ' disabled' : ''}>\n\t<Button>Magnetic action</Button>\n</Magnetic>`;
			case 'carousel':
				return `<script>\n\timport { Carousel } from 'fractalsvelte/components';\n\tlet index = $state(0);\n<\/script>\n\n<Carousel {items} bind:index />`;
			case 'stepper':
				return `<script>\n\timport { Stepper } from 'fractalsvelte/components';\n\tlet current = $state(${stepperCurrent});\n<\/script>\n\n<Stepper {steps} bind:current interactive={${stepperInteractive}} />`;
			case 'counter':
				return `<script>\n\timport { Counter } from 'fractalsvelte/components';\n<\/script>\n\n<Counter value={${counterValue}} duration={${counterDuration}} locale="en-US" />`;
			case 'card-3d':
				return `<script>\n\timport { Card3D } from 'fractalsvelte/components';\n<\/script>\n\n<Card3D maxTilt={${card3dMaxTilt}} glare={${card3dGlare}} perspective={${card3dPerspective}} scale={${card3dScale}}>\n\t<h3>Interactive 3D Surface</h3>\n\t<p>Move your pointer across this card to experience real-time parallax tilt and specular glare.</p>\n</Card3D>`;
			case 'macos-dock':
				return `<script>\n\timport { MacosDock } from 'fractalsvelte/components';\n\tconst items = [\n\t\t{ id: 'finder', label: 'Finder', icon: '📁' },\n\t\t{ id: 'browser', label: 'Browser', icon: '🌐' },\n\t\t{ id: 'terminal', label: 'Terminal', icon: '💻' },\n\t\t{ id: 'editor', label: 'Editor', icon: '⚡' },\n\t\t{ id: 'settings', label: 'Settings', icon: '⚙️' }\n\t];\n<\/script>\n\n<MacosDock {items} magnification={${macosDockMagnification}} distance={${macosDockDistance}} />`;
			case 'card-stack':
				return `<script>\n\timport { CardStack } from 'fractalsvelte/components';\n\tconst items = [\n\t\t{ id: '1', title: 'Design System', description: 'Composable Sass-first design contracts' },\n\t\t{ id: '2', title: 'Theming Engine', description: 'Real-time custom accent and GPU auras' },\n\t\t{ id: '3', title: 'Svelte 5 Primitives', description: 'Fully accessible UI building blocks' }\n\t];\n<\/script>\n\n<CardStack {items} maxVisible={${cardStackMaxVisible}} onswipe={(item, dir) => console.log(item, dir)} />`;
			case 'text-scramble':
				return `<script>\n\timport { TextScramble } from 'fractalsvelte/components';\n<\/script>\n\n<TextScramble text="${textScrambleText}" trigger="${textScrambleTrigger}" speed={${textScrambleSpeed}} />`;
			default:
				return `<script>\n\timport { ${slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')} } from 'fractalsvelte/components';\n<\/script>\n\n<${slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')} />`;
		}
	});

	function copySnippet() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(generatedCode);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div class="playground">
	<!-- Stage Control Bar -->
	<div class="playground__stage-bar">
		<div class="playground__control-group">
			<span class="text-xs weight-600 muted mr-xs">Viewport:</span>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={viewportWidth === '100%'}
				onclick={() => (viewportWidth = '100%')}
				title="Desktop viewport (100%)"
			>
				Desktop
			</button>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={viewportWidth === '768px'}
				onclick={() => (viewportWidth = '768px')}
				title="Tablet viewport (768px)"
			>
				Tablet
			</button>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={viewportWidth === '375px'}
				onclick={() => (viewportWidth = '375px')}
				title="Mobile viewport (375px)"
			>
				Mobile
			</button>
		</div>

		<div class="playground__control-group">
			<span class="text-xs weight-600 muted mr-xs">Canvas:</span>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={bgMode === 'surface'}
				onclick={() => (bgMode = 'surface')}
				title="Default surface background"
			>
				Surface
			</button>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={bgMode === 'grid'}
				onclick={() => (bgMode = 'grid')}
				title="Subtle grid background"
			>
				Grid
			</button>
			<button
				type="button"
				class="playground__pill-btn"
				class:active={bgMode === 'checker'}
				onclick={() => (bgMode = 'checker')}
				title="Transparency checkerboard"
			>
				Checker
			</button>
			<button
				type="button"
				class="playground__pill-btn ml-s"
				onclick={resetKnobs}
				title="Reset knobs to defaults"
			>
				Reset
			</button>
		</div>
	</div>

	<!-- Stage Canvas -->
	<div class="playground__stage-wrapper">
		<div
			class="playground__stage"
			data-bg={bgMode}
			style="max-width: {viewportWidth};"
		>
			<div class="component-preview" style="width: 100%; display: grid; place-items: center;">
				{#if slug === 'button'}
					{#if btnSize.startsWith('icon')}
						<Button variant={btnVariant} size={btnSize} shape={btnShape} disabled={btnDisabled} loading={btnLoading} aria-label={btnLabel}>
							<Icon icon={luBell} />
						</Button>
					{:else}
						<Button variant={btnVariant} size={btnSize} shape={btnShape} disabled={btnDisabled} loading={btnLoading}>
							{btnLabel}
						</Button>
					{/if}
				{:else if slug === 'badge'}
					<Badge variant={badgeVariant}>
						{badgeText}
					</Badge>
				{:else if slug === 'alert'}
					<Alert title={alertTitle} variant={alertVariant}>
						{alertContent}
					</Alert>
				{:else if slug === 'avatar'}
					<Avatar name={avatarName} size={avatarSize} src={avatarSrc || undefined} />
				{:else if slug === 'card'}
					<Card padding={cardPadding}>
						<strong>Design decision</strong>
						<p class="preview-copy">Use a Card to group content, not to create every visual boundary.</p>
					</Card>
				{:else if slug === 'accordion'}
					<Accordion title={accordionTitle} bind:open={accordionOpen}>
						It uses the native details element, so disclosure and keyboard support come built in.
					</Accordion>
				{:else if slug === 'tabs'}
					<Tabs {tabs} />
				{:else if slug === 'input'}
					<Input type={inputType} placeholder={inputPlaceholder} disabled={inputDisabled} bind:value={inputValue} ariaLabel="Input demo" />
				{:else if slug === 'textarea'}
					<Textarea rows={textareaRows} placeholder={textareaPlaceholder} disabled={textareaDisabled} bind:value={textareaValue} ariaLabel="Textarea demo" />
				{:else if slug === 'checkbox'}
					<Checkbox label={checkboxLabel} disabled={checkboxDisabled} bind:checked={checkboxChecked} />
				{:else if slug === 'switch'}
					<Switch label={switchLabel} disabled={switchDisabled} bind:checked={switchChecked} />
				{:else if slug === 'select'}
					<Select options={selectOptions} disabled={selectDisabled} placeholder={selectPlaceholder} bind:value={selectValue} />
				{:else if slug === 'dialog'}
					<div class="row gap-s ycenter">
						<Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
						<Dialog bind:open={dialogOpen} title={dialogTitle} description={dialogDescription}>
							<p class="preview-copy">Choose their project role before you continue.</p>
						</Dialog>
					</div>
				{:else if slug === 'tooltip'}
					<Tooltip content={tooltipContent} position={tooltipPosition}>
						<Button size="sm" variant="secondary">Hover me</Button>
					</Tooltip>
				{:else if slug === 'progress'}
					<Progress value={progressValue} max={progressMax} label={progressLabel} />
				{:else if slug === 'skeleton'}
					<div class="skeleton-stack" style="width: 100%; max-width: 320px;">
						<Skeleton width={skeletonCircle ? '3.5rem' : skeletonWidth} height={skeletonCircle ? '3.5rem' : skeletonHeight} circle={skeletonCircle} />
					</div>
				{:else if slug === 'toast'}
					<div class="stack gap-s ycenter">
						<Button size="sm" variant="secondary" onclick={() => (toastOpen = !toastOpen)}>
							{toastOpen ? 'Dismiss toast' : 'Trigger toast'}
						</Button>
						<Toast bind:open={toastOpen} title={toastTitle} variant={toastVariant}>
							Your project configuration is up to date.
						</Toast>
					</div>
				{:else if slug === 'separator'}
					<div class="separator-sample row ycenter gap-m" style="width: 100%; max-width: 320px;">
						<span>Account</span>
						<Separator orientation={separatorOrientation} />
						<span>Billing</span>
					</div>
				{:else if slug === 'animated-button'}
					<AnimatedButton variant={animBtnVariant} size={animBtnSize} animated={animBtnAnimated} disabled={animBtnDisabled}>
						Hover and press
					</AnimatedButton>
				{:else if slug === 'animated-card'}
					<AnimatedCard padding={animCardPadding} interactive={animCardInteractive}>
						<strong>Project plan</strong>
						<p class="preview-copy">This surface lifts gently on hover and settles on press.</p>
					</AnimatedCard>
				{:else if slug === 'reveal'}
					<Reveal delay={revealDelay}>
						<div class="motion-reveal-sample">
							<span class="eyebrow">Viewport motion</span>
							<strong>Content enters with quiet intent.</strong>
							<span>Scroll this sample into view to replay the reveal.</span>
						</div>
					</Reveal>
				{:else if slug === 'motion-list'}
					<MotionList items={motionItems} label="Build progress" />
				{:else if slug === 'presence'}
					<div class="presence-sample stack gap-s ycenter">
						<Button size="sm" variant="secondary" onclick={() => (presenceOpen = !presenceOpen)}>
							{presenceOpen ? 'Hide message' : 'Show message'}
						</Button>
						<Presence present={presenceOpen}>
							<Alert title="Changes saved" variant="success">The exit completes before this message is removed.</Alert>
						</Presence>
					</div>
				{:else if slug === 'theme'}
					<Theme theme="light" tokens={brandTokens}>
						<Card>
							<div class="theme-sample stack gap-xs">
								<Badge variant="accent">Custom tokens</Badge>
								<strong>Your brand, your radius, your accent.</strong>
								<Button>Branded action</Button>
							</div>
						</Card>
					</Theme>
				{:else if slug === 'theme-setter' || slug === 'theme-picker'}
					<div class="card pad-m" style="width: 100%; max-width: 480px;">
						<p class="text-sm muted mb-s">Explore the modern <strong>fractalthemer</strong> theme and background engine:</p>
					</div>
				{:else if slug === 'bits-effect'}
					<BitsEffect pattern="animated-content" category="animation" label="Bits effect preview" />
				{:else if slug === 'magnetic'}
					<Magnetic strength={magneticStrength} maxOffset={magneticMaxOffset} disabled={magneticDisabled}>
						<Button>Move your pointer here</Button>
					</Magnetic>
				{:else if slug === 'text-loop'}
					<p class="text-loop-sample">
						Make interfaces <TextLoop texts={['expressive', 'calm', 'memorable']} interval={textLoopInterval} />.
					</p>
				{:else if slug === 'marquee'}
					<Marquee items={['Svelte 5', 'Sass', 'Accessible', 'Themeable']} speed={marqueeSpeed} direction={marqueeDirection} />
				{:else if slug === 'carousel'}
					<Carousel items={carouselItems} bind:index={carouselIndex} />
				{:else if slug === 'stepper'}
					<Stepper steps={stepperSteps} bind:current={stepperCurrent} interactive={stepperInteractive} />
				{:else if slug === 'counter'}
					<div class="counter-sample row ycenter gap-xs">
						<Counter value={counterValue} duration={counterDuration} locale="en-US" />
						<span>projects configured</span>
					</div>
				{:else if slug === 'card-3d'}
					<Card3D maxTilt={card3dMaxTilt} glare={card3dGlare} perspective={card3dPerspective} scale={card3dScale}>
						<div class="stack gap-xs">
							<Badge variant="accent">3D Perspective</Badge>
							<strong class="text-lg">Interactive Tilt Surface</strong>
							<p class="text-sm muted">Move pointer across this card to experience real-time 3D parallax tilt and specular glare.</p>
						</div>
					</Card3D>
				{:else if slug === 'macos-dock'}
					<div class="pad-m row center">
						<MacosDock magnification={macosDockMagnification} distance={macosDockDistance} />
					</div>
				{:else if slug === 'card-stack'}
					<div class="pad-m row center">
						<CardStack maxVisible={cardStackMaxVisible} />
					</div>
				{:else if slug === 'text-scramble'}
					<div class="pad-l row center">
						<span class="text-2xl weight-700">
							<TextScramble text={textScrambleText} trigger={textScrambleTrigger} speed={textScrambleSpeed} />
						</span>
					</div>
				{:else if svelteBitsSlugs.has(slug)}
					<BitsEffect pattern={slug} category={svelteBitsCategoryBySlug[slug] as 'animation' | 'background' | 'component' | 'text'} />
				{:else}
					<MotionCore pattern={slug} />
				{/if}
			</div>
		</div>
	</div>

	<!-- Interactive Prop Knobs Panel -->
	{#if ['button', 'badge', 'alert', 'avatar', 'card', 'accordion', 'input', 'textarea', 'checkbox', 'switch', 'select', 'dialog', 'tooltip', 'progress', 'skeleton', 'toast', 'separator', 'animated-button', 'animated-card', 'reveal', 'magnetic', 'text-loop', 'marquee', 'stepper', 'counter', 'card-3d', 'macos-dock', 'card-stack', 'text-scramble'].includes(slug)}
		<div class="playground__knobs">
			{#if slug === 'button'}
				<div class="playground__knob-item">
					<label for="btn-variant">Variant</label>
					<select id="btn-variant" bind:value={btnVariant}>
						<option value="primary">primary</option>
						<option value="secondary">secondary</option>
						<option value="soft">soft</option>
						<option value="outline">outline</option>
						<option value="ghost">ghost</option>
						<option value="link">link</option>
						<option value="destructive">destructive</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="btn-size">Size</label>
					<select id="btn-size" bind:value={btnSize}>
						<option value="sm">sm (compact)</option>
						<option value="md">md (default)</option>
						<option value="lg">lg (large)</option>
						<option value="icon-sm">icon-sm</option>
						<option value="icon">icon</option>
						<option value="icon-lg">icon-lg</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="btn-shape">Shape</label>
					<select id="btn-shape" bind:value={btnShape}>
						<option value="default">default</option>
						<option value="pill">pill</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="btn-label">Label</label>
					<input id="btn-label" type="text" bind:value={btnLabel} />
				</div>
				<div class="playground__knob-item">
					<label for="btn-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="btn-disabled" type="checkbox" bind:checked={btnDisabled} />
						<span>Disabled</span>
					</div>
					<div class="playground__knob-toggle">
						<input id="btn-loading" type="checkbox" bind:checked={btnLoading} />
						<span>Loading</span>
					</div>
				</div>
			{:else if slug === 'badge'}
				<div class="playground__knob-item">
					<label for="badge-variant">Variant</label>
					<select id="badge-variant" bind:value={badgeVariant}>
						<option value="neutral">neutral</option>
						<option value="accent">accent</option>
						<option value="success">success</option>
						<option value="warning">warning</option>
						<option value="danger">danger</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="badge-text">Text</label>
					<input id="badge-text" type="text" bind:value={badgeText} />
				</div>
			{:else if slug === 'alert'}
				<div class="playground__knob-item">
					<label for="alert-variant">Variant</label>
					<select id="alert-variant" bind:value={alertVariant}>
						<option value="info">info</option>
						<option value="success">success</option>
						<option value="warning">warning</option>
						<option value="danger">danger</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="alert-title">Title</label>
					<input id="alert-title" type="text" bind:value={alertTitle} />
				</div>
				<div class="playground__knob-item">
					<label for="alert-content">Content</label>
					<input id="alert-content" type="text" bind:value={alertContent} />
				</div>
			{:else if slug === 'avatar'}
				<div class="playground__knob-item">
					<label for="avatar-size">Size</label>
					<select id="avatar-size" bind:value={avatarSize}>
						<option value="sm">sm</option>
						<option value="md">md</option>
						<option value="lg">lg</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="avatar-name">Name (Initials derivation)</label>
					<input id="avatar-name" type="text" bind:value={avatarName} />
				</div>
				<div class="playground__knob-item">
					<label for="avatar-src">Image URL (optional)</label>
					<input id="avatar-src" type="text" placeholder="https://..." bind:value={avatarSrc} />
				</div>
			{:else if slug === 'card'}
				<div class="playground__knob-item">
					<label for="card-padding">Padding</label>
					<select id="card-padding" bind:value={cardPadding}>
						<option value="none">none</option>
						<option value="sm">sm</option>
						<option value="md">md (default)</option>
						<option value="lg">lg</option>
					</select>
				</div>
			{:else if slug === 'accordion'}
				<div class="playground__knob-item">
					<label for="accordion-title">Title</label>
					<input id="accordion-title" type="text" bind:value={accordionTitle} />
				</div>
				<div class="playground__knob-item">
					<label for="accordion-open">State</label>
					<div class="playground__knob-toggle">
						<input id="accordion-open" type="checkbox" bind:checked={accordionOpen} />
						<span>Open (Expanded)</span>
					</div>
				</div>
			{:else if slug === 'input'}
				<div class="playground__knob-item">
					<label for="input-type">Type</label>
					<select id="input-type" bind:value={inputType}>
						<option value="text">text</option>
						<option value="email">email</option>
						<option value="password">password</option>
						<option value="search">search</option>
						<option value="number">number</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="input-placeholder">Placeholder</label>
					<input id="input-placeholder" type="text" bind:value={inputPlaceholder} />
				</div>
				<div class="playground__knob-item">
					<label for="input-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="input-disabled" type="checkbox" bind:checked={inputDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'textarea'}
				<div class="playground__knob-item">
					<label for="textarea-rows">Rows</label>
					<input id="textarea-rows" type="number" min="2" max="10" bind:value={textareaRows} />
				</div>
				<div class="playground__knob-item">
					<label for="textarea-placeholder">Placeholder</label>
					<input id="textarea-placeholder" type="text" bind:value={textareaPlaceholder} />
				</div>
				<div class="playground__knob-item">
					<label for="textarea-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="textarea-disabled" type="checkbox" bind:checked={textareaDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'checkbox'}
				<div class="playground__knob-item">
					<label for="cb-label">Label</label>
					<input id="cb-label" type="text" bind:value={checkboxLabel} />
				</div>
				<div class="playground__knob-item">
					<label for="cb-checked">Checked</label>
					<div class="playground__knob-toggle">
						<input id="cb-checked" type="checkbox" bind:checked={checkboxChecked} />
						<span>Checked</span>
					</div>
				</div>
				<div class="playground__knob-item">
					<label for="cb-disabled">Disabled</label>
					<div class="playground__knob-toggle">
						<input id="cb-disabled" type="checkbox" bind:checked={checkboxDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'switch'}
				<div class="playground__knob-item">
					<label for="sw-label">Label</label>
					<input id="sw-label" type="text" bind:value={switchLabel} />
				</div>
				<div class="playground__knob-item">
					<label for="sw-checked">Checked</label>
					<div class="playground__knob-toggle">
						<input id="sw-checked" type="checkbox" bind:checked={switchChecked} />
						<span>Checked</span>
					</div>
				</div>
				<div class="playground__knob-item">
					<label for="sw-disabled">Disabled</label>
					<div class="playground__knob-toggle">
						<input id="sw-disabled" type="checkbox" bind:checked={switchDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'select'}
				<div class="playground__knob-item">
					<label for="sel-val">Selected Value</label>
					<select id="sel-val" bind:value={selectValue}>
						<option value="starter">Starter</option>
						<option value="team">Team</option>
						<option value="enterprise">Enterprise</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="sel-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="sel-disabled" type="checkbox" bind:checked={selectDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'dialog'}
				<div class="playground__knob-item">
					<label for="dlg-title">Title</label>
					<input id="dlg-title" type="text" bind:value={dialogTitle} />
				</div>
				<div class="playground__knob-item">
					<label for="dlg-desc">Description</label>
					<input id="dlg-desc" type="text" bind:value={dialogDescription} />
				</div>
			{:else if slug === 'tooltip'}
				<div class="playground__knob-item">
					<label for="tip-content">Content</label>
					<input id="tip-content" type="text" bind:value={tooltipContent} />
				</div>
				<div class="playground__knob-item">
					<label for="tip-pos">Position</label>
					<select id="tip-pos" bind:value={tooltipPosition}>
						<option value="top">top</option>
						<option value="bottom">bottom</option>
					</select>
				</div>
			{:else if slug === 'progress'}
				<div class="playground__knob-item">
					<label for="prog-val">Value ({progressValue}%)</label>
					<input id="prog-val" type="range" min="0" max="100" bind:value={progressValue} />
				</div>
				<div class="playground__knob-item">
					<label for="prog-label">Label</label>
					<input id="prog-label" type="text" bind:value={progressLabel} />
				</div>
			{:else if slug === 'skeleton'}
				<div class="playground__knob-item">
					<label for="skel-width">Width</label>
					<input id="skel-width" type="text" bind:value={skeletonWidth} />
				</div>
				<div class="playground__knob-item">
					<label for="skel-height">Height</label>
					<input id="skel-height" type="text" bind:value={skeletonHeight} />
				</div>
				<div class="playground__knob-item">
					<label for="skel-circle">Shape</label>
					<div class="playground__knob-toggle">
						<input id="skel-circle" type="checkbox" bind:checked={skeletonCircle} />
						<span>Circle</span>
					</div>
				</div>
			{:else if slug === 'toast'}
				<div class="playground__knob-item">
					<label for="toast-variant">Variant</label>
					<select id="toast-variant" bind:value={toastVariant}>
						<option value="info">info</option>
						<option value="success">success</option>
						<option value="warning">warning</option>
						<option value="danger">danger</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="toast-title">Title</label>
					<input id="toast-title" type="text" bind:value={toastTitle} />
				</div>
			{:else if slug === 'animated-button'}
				<div class="playground__knob-item">
					<label for="animbtn-variant">Variant</label>
					<select id="animbtn-variant" bind:value={animBtnVariant}>
						<option value="primary">primary</option>
						<option value="secondary">secondary</option>
						<option value="ghost">ghost</option>
						<option value="danger">danger</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="animbtn-size">Size</label>
					<select id="animbtn-size" bind:value={animBtnSize}>
						<option value="sm">sm</option>
						<option value="md">md</option>
						<option value="lg">lg</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="animbtn-anim">Animation</label>
					<div class="playground__knob-toggle">
						<input id="animbtn-anim" type="checkbox" bind:checked={animBtnAnimated} />
						<span>Animated</span>
					</div>
				</div>
				<div class="playground__knob-item">
					<label for="animbtn-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="animbtn-disabled" type="checkbox" bind:checked={animBtnDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'animated-card'}
				<div class="playground__knob-item">
					<label for="animcard-padding">Padding</label>
					<select id="animcard-padding" bind:value={animCardPadding}>
						<option value="none">none</option>
						<option value="sm">sm</option>
						<option value="md">md</option>
						<option value="lg">lg</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="animcard-int">Interactive</label>
					<div class="playground__knob-toggle">
						<input id="animcard-int" type="checkbox" bind:checked={animCardInteractive} />
						<span>Interactive</span>
					</div>
				</div>
			{:else if slug === 'magnetic'}
				<div class="playground__knob-item">
					<label for="mag-strength">Strength ({magneticStrength})</label>
					<input id="mag-strength" type="range" min="0.05" max="0.5" step="0.01" bind:value={magneticStrength} />
				</div>
				<div class="playground__knob-item">
					<label for="mag-offset">Max Offset ({magneticMaxOffset}px)</label>
					<input id="mag-offset" type="range" min="4" max="30" step="1" bind:value={magneticMaxOffset} />
				</div>
				<div class="playground__knob-item">
					<label for="mag-disabled">State</label>
					<div class="playground__knob-toggle">
						<input id="mag-disabled" type="checkbox" bind:checked={magneticDisabled} />
						<span>Disabled</span>
					</div>
				</div>
			{:else if slug === 'stepper'}
				<div class="playground__knob-item">
					<label for="step-curr">Active Step ({stepperCurrent})</label>
					<input id="step-curr" type="range" min="0" max="2" step="1" bind:value={stepperCurrent} />
				</div>
				<div class="playground__knob-item">
					<label for="step-int">Interactive</label>
					<div class="playground__knob-toggle">
						<input id="step-int" type="checkbox" bind:checked={stepperInteractive} />
						<span>Interactive (Clickable)</span>
					</div>
				</div>
			{:else if slug === 'counter'}
				<div class="playground__knob-item">
					<label for="count-val">Target Number</label>
					<input id="count-val" type="number" step="500" bind:value={counterValue} />
				</div>
				<div class="playground__knob-item">
					<label for="count-dur">Duration ({counterDuration}ms)</label>
					<input id="count-dur" type="range" min="200" max="2000" step="50" bind:value={counterDuration} />
				</div>
			{:else if slug === 'card-3d'}
				<div class="playground__knob-item">
					<label for="c3d-tilt">Max Tilt ({card3dMaxTilt}°)</label>
					<input id="c3d-tilt" type="range" min="5" max="40" step="1" bind:value={card3dMaxTilt} />
				</div>
				<div class="playground__knob-item">
					<label for="c3d-persp">Perspective ({card3dPerspective}px)</label>
					<input id="c3d-persp" type="range" min="400" max="2000" step="50" bind:value={card3dPerspective} />
				</div>
				<div class="playground__knob-item">
					<label for="c3d-glare">Specular Glare</label>
					<div class="playground__knob-toggle">
						<input id="c3d-glare" type="checkbox" bind:checked={card3dGlare} />
						<span>Enabled</span>
					</div>
				</div>
			{:else if slug === 'macos-dock'}
				<div class="playground__knob-item">
					<label for="dock-mag">Magnification ({macosDockMagnification}x)</label>
					<input id="dock-mag" type="range" min="1.2" max="2.4" step="0.1" bind:value={macosDockMagnification} />
				</div>
				<div class="playground__knob-item">
					<label for="dock-dist">Influence Distance ({macosDockDistance}px)</label>
					<input id="dock-dist" type="range" min="60" max="200" step="10" bind:value={macosDockDistance} />
				</div>
			{:else if slug === 'card-stack'}
				<div class="playground__knob-item">
					<label for="cstack-vis">Visible Cards ({cardStackMaxVisible})</label>
					<input id="cstack-vis" type="range" min="2" max="5" step="1" bind:value={cardStackMaxVisible} />
				</div>
			{:else if slug === 'text-scramble'}
				<div class="playground__knob-item">
					<label for="tsc-text">Text</label>
					<input id="tsc-text" type="text" bind:value={textScrambleText} />
				</div>
				<div class="playground__knob-item">
					<label for="tsc-trig">Trigger Mode</label>
					<select id="tsc-trig" bind:value={textScrambleTrigger}>
						<option value="hover">hover</option>
						<option value="click">click</option>
						<option value="mount">mount</option>
					</select>
				</div>
				<div class="playground__knob-item">
					<label for="tsc-spd">Speed ({textScrambleSpeed}ms)</label>
					<input id="tsc-spd" type="range" min="10" max="100" step="5" bind:value={textScrambleSpeed} />
				</div>
			{/if}
		</div>
	{/if}

	<!-- Live Svelte 5 Code Snippet Block -->
	<div class="playground__code-block">
		<div class="playground__code-header">
			<span>Interactive Svelte 5 Code</span>
			<button
				type="button"
				class="playground__copy-btn"
				class:copied
				onclick={copySnippet}
			>
				{#if copied}
					✓ Copied!
				{:else}
					📋 Copy Code
				{/if}
			</button>
		</div>
		<pre class="playground__code-content"><code>{generatedCode}</code></pre>
	</div>
</div>

