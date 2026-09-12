export const technicalFeatures = [
	{
		title: 'UI Components',
		description: 'Set of accessible, customizable components built with Svelte 5',
		icon: 'edit',
		status: 'Implemented'
	},
	{
		title: 'Icon System',
		description: 'General purpose SVG icons across 8 categories',
		icon: 'picture',
		status: 'Implemented'
	},
	{
		title: 'Theme System',
		description: 'Dark/light mode with CSS custom properties and smooth transitions',
		icon: 'moon',
		status: 'Implemented'
	},
	{
		title: 'Animation Framework',
		description: 'Built-in animations with staggered effects and transition presets',
		icon: 'refresh',
		status: 'Implemented'
	},
	{
		title: 'Layout System',
		description: 'Responsive layouts with app shell and mobile-first design',
		icon: 'desktop',
		status: 'Implemented'
	},
	{
		title: 'Developer Experience',
		description: 'TypeScript, documentation, and development tools',
		icon: 'code',
		status: 'Implemented'
	}
];

export const frameworkFeatures = [
	{
		title: 'App Shell',
		items: [
			{ text: 'Complete SvelteKit application setup', color: 'bg-green-400' },
			{ text: 'Responsive app shell & navigation', color: 'bg-cyan-400' },
			{ text: 'View-transition page animations', color: 'bg-blue-400' },
			{ text: 'Built-in authentication patterns', color: 'bg-yellow-400' }
		]
	},
	{
		title: 'Dev Stack',
		items: [
			{ text: 'PocketBase for backend', color: 'bg-pink-400' },
			{ text: 'TypeScript for type safety', color: 'bg-indigo-400' },
			{ text: 'Tailwind CSS for styling', color: 'bg-orange-400' },
			{ text: 'Vite for fast development', color: 'bg-rose-400' }
		]
	}
];

export const heroData = {
	subtitle: 'Component Library & App Shell Template',
	buttons: [
		{
			id: 'component-gallery-btn',
			text: 'Component Gallery',
			variant: 'primary' as const,
			size: 'lg' as const,
			href: '/components',
			icon: 'bookmark',
			iconLibrary: 'NavigationIcons'
		},
		{
			id: 'icon-gallery-btn',
			text: 'Icon Gallery',
			variant: 'outline' as const,
			size: 'lg' as const,
			href: '/icons',
			icon: 'notification',
			iconLibrary: 'NavigationIcons'
		}
	]
};

export const featurePreviewCards = [
	{
		id: 'instant-setup',
		icon: 'shield',
		iconLibrary: 'AccountIcons',
		iconColor: 'text-blue-600',
		bgColor: 'bg-blue-100 dark:bg-blue-900/30',
		title: 'Instant Setup',
		description: 'Accessibility, responsive design'
	},
	{
		id: 'fast-development',
		icon: 'refresh',
		iconLibrary: 'NavigationIcons',
		iconColor: 'text-green-600',
		bgColor: 'bg-green-100 dark:bg-green-900/30',
		title: 'Fast Development',
		description: 'Pre-built app shell/template'
	},
	{
		id: 'modern-stack',
		icon: 'globe',
		iconLibrary: 'ThemeIcons',
		iconColor: 'text-purple-600',
		bgColor: 'bg-purple-100 dark:bg-purple-900/30',
		title: 'Modern Stack',
		description: 'Svelte 5, Typescript, Tailwind'
	}
];

export const frameworkColumns = [
	{ key: 'feature', label: 'Feature', sortable: true, width: '50%' },
	{ key: 'category', label: 'Category', align: 'center' as const, width: '25%' },
	{ key: 'status', label: 'Status', align: 'right' as const, width: '25%' }
];

export const stackOverview = [
	{
		id: 'svelte5kit',
		title: 'Svelte5Kit',
		value: 'Framework',
		color: 'default' as const,
		imageUrl:
			'https://raw.githubusercontent.com/sveltejs/branding/refs/heads/master/svelte-logo-square.png',
		alt: 'Svelte Logo'
	},
	{
		id: 'typescript',
		title: 'TypeScript',
		value: 'Types',
		color: 'blue' as const,
		imageUrl: 'https://icon.icepanel.io/Technology/svg/TypeScript.svg',
		alt: 'TypeScript Logo'
	},
	{
		id: 'tailwind',
		title: 'Tailwind',
		value: 'Styling',
		color: 'purple' as const,
		imageUrl: 'https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg',
		alt: 'Tailwind CSS Logo'
	},
	{
		id: 'vite',
		title: 'Vite',
		value: 'Build Tool',
		color: 'green' as const,
		imageUrl:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/615px-Vitejs-logo.svg.png',
		alt: 'Vite Logo'
	}
];

export const gettingStartedCards = [
	{
		id: 'quick-start',
		emoji: '🚀',
		title: 'Quick Start',
		steps: [
			{
				id: 'clone-repo',
				text: 'Clone the repository',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			},
			{
				id: 'app-shell-auth',
				text: 'Complete app shell with auth setup',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			},
			{
				id: 'components-included',
				text: 'All components and icons included',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			}
		],
		button: {
			text: 'View on GitHub',
			variant: 'primary' as const,
			color: 'blue' as const,
			href: 'https://github.com/magooney-loon/svelte-gui',
			target: '_blank',
			icon: 'link',
			iconLibrary: 'NavigationIcons'
		}
	},
	{
		id: 'full-stack',
		emoji: '🔧',
		title: 'Full-Stack',
		steps: [
			{
				id: 'setup-pb-ext',
				text: 'Setup pb-ext for backend',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			},
			{
				id: 'clone-gui',
				text: 'Clone Svelte GUI as frontend',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			},
			{
				id: 'complete-solution',
				text: 'Complete full-stack solution',
				icon: 'check',
				iconLibrary: 'StatusIcons'
			}
		],
		button: {
			text: 'View pb-ext',
			variant: 'outline' as const,
			color: 'purple' as const,
			href: 'https://github.com/magooney-loon/pb-ext',
			target: '_blank',
			icon: 'link',
			iconLibrary: 'NavigationIcons'
		}
	}
];

export const sectionTitles = {
	whatIncluded: "What's Included",
	fullStackShell: 'Full-Stack App Shell',
	fullStackDescription: 'More than just components - get a complete application foundation.',
	getStarted: 'Get Started Today'
};

export const carouselConfig = {
	showArrows: true,
	showDots: true,
	autoplay: true,
	autoplayInterval: 4000,
	itemsVisible: 3
};

export const animationConfigs = {
	heroSection: { preset: 'quickFade' as const },
	technicalFeatures: { preset: 'scaleIn' as const },
	frameworkFeatures: { preset: 'fadeInDown' as const },
	frameworkDescription: { preset: 'fadeInUp' as const },
	frameworkTable: {
		preset: 'fadeInDown' as const,
		selector: 'tbody tr',
		staggerDelay: 69
	},
	gettingStarted: { preset: 'fadeInDown' as const },
	gettingStartedTitle: { preset: 'fadeInUp' as const },
	gettingStartedCards: { preset: 'slideUpScale' as const }
};

export const dataTableConfig = {
	striped: true,
	hoverable: true,
	compact: true,
	emptyState: {
		title: 'No framework features found',
		description: 'Framework features will be displayed here.',
		primaryAction: {
			text: 'Learn More',
			href: '/docs'
		}
	}
};

export const checkIconConfig = {
	bgColor: 'bg-green-100 dark:bg-green-900/30',
	iconColor: 'text-green-600 dark:text-green-400',
	size: 'h-4 w-4'
};

export const stackFooterText = 'Pre-built auth components for PocketBase backend.';
