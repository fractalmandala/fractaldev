export type Prop = {
	name: string;
	type: string;
	defaultValue: string;
	description: string;
};

export type ComponentDoc = {
	slug: string;
	name: string;
	description: string;
	category: 'Actions' | 'Inputs' | 'Feedback' | 'Layout' | 'Overlay' | 'Motion' | 'Foundation' | 'Canvas' | 'Navigation' | 'Showcase' | 'Typography';
	props: Prop[];
	usage: string;
};

export const components: ComponentDoc[] = [
	{ slug: 'button', name: 'Button', description: 'A clear action control with seven visual intents, six sizes, loading and anchor modes.', category: 'Actions', props: [{ name: 'variant', type: "'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'soft'", defaultValue: "'primary'", description: "Visual intent. 'danger' is accepted as an alias of 'destructive'." }, { name: 'size', type: "'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg'", defaultValue: "'md'", description: 'Density; icon sizes render square controls.' }, { name: 'shape', type: "'default' | 'pill'", defaultValue: "'default'", description: 'Corner treatment.' }, { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows a spinner, sets aria-busy, and blocks interaction.' }, { name: 'href', type: 'string', defaultValue: '—', description: 'When set, renders an anchor instead of a button.' }, { name: 'type', type: "'button' | 'submit' | 'reset'", defaultValue: "'button'", description: 'Native button type (ignored for anchors).' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents interaction.' }, { name: 'children', type: 'Snippet', defaultValue: 'required', description: 'Content; compose icons via the fractalicons Icon component.' }, { name: 'onclick', type: '(event: MouseEvent) => void', defaultValue: '—', description: 'Click handler.' }, { name: 'class', type: 'string', defaultValue: "''", description: 'Extra classes merged onto the root element.' }], usage: "<script>\n\timport { Button } from '$lib/components';\n</script>\n\n<Button variant=\"primary\" onclick={() => save()}>Save changes</Button>\n<Button variant=\"outline\" href=\"/docs\">Documentation</Button>" },
	{ slug: 'badge', name: 'Badge', description: 'A compact label for status, categories, and count-like metadata.', category: 'Feedback', props: [{ name: 'variant', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'", defaultValue: "'neutral'", description: 'The semantic color treatment.' }], usage: "<script>\n\timport { Badge } from '$lib/components';\n</script>\n\n<Badge variant=\"success\">Published</Badge>" },
	{ slug: 'alert', name: 'Alert', description: 'An accessible inline status message for information and important feedback.', category: 'Feedback', props: [{ name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", defaultValue: "'info'", description: 'Message importance and color.' }, { name: 'title', type: 'string', defaultValue: '—', description: 'Optional concise heading.' }], usage: "<script>\n\timport { Alert } from '$lib/components';\n</script>\n\n<Alert title=\"Changes saved\" variant=\"success\">Your profile is up to date.</Alert>" },
	{ slug: 'avatar', name: 'Avatar', description: 'An image or initials-based identity marker with predictable size options.', category: 'Layout', props: [{ name: 'src', type: 'string', defaultValue: '—', description: 'Image URL; omit to show initials.' }, { name: 'name', type: 'string', defaultValue: "''", description: 'Used to derive initials and accessible label.' }, { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Avatar diameter.' }], usage: "<script>\n\timport { Avatar } from '$lib/components';\n</script>\n\n<Avatar name=\"Maya Chen\" size=\"lg\" />" },
	{ slug: 'card', name: 'Card', description: 'A neutral surface for grouping related content without imposing layout.', category: 'Layout', props: [{ name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Internal spacing scale.' }], usage: "<script>\n\timport { Card } from '$lib/components';\n</script>\n\n<Card padding=\"lg\">\n\t<h2>Project notes</h2>\n\t<p>Keep content focused and scannable.</p>\n</Card>" },
	{ slug: 'accordion', name: 'Accordion', description: 'A native disclosure region for optional or progressively revealed content.', category: 'Layout', props: [{ name: 'title', type: 'string', defaultValue: 'required', description: 'Visible summary text.' }, { name: 'open', type: 'boolean', defaultValue: 'false', description: 'Bind to control its disclosure state.' }], usage: "<script>\n\timport { Accordion } from '$lib/components';\n\tlet open = $state(false);\n</script>\n\n<Accordion title=\"Is this accessible?\" bind:open>\n\tYes. It uses the native details element.\n</Accordion>" },
	{ slug: 'tabs', name: 'Tabs', description: 'A compact tab interface for switching between short, related content panels.', category: 'Layout', props: [{ name: 'tabs', type: 'Array<{ id; label; content }>', defaultValue: 'required', description: 'Ordered tab definitions.' }, { name: 'active', type: 'string', defaultValue: 'first tab', description: 'Bind to control selected tab.' }], usage: "<script>\n\timport { Tabs } from '$lib/components';\n\n\tconst tabs = [\n\t\t{ id: 'one', label: 'Overview', content: 'A concise overview.' },\n\t\t{ id: 'two', label: 'Activity', content: 'Recent project activity.' }\n\t];\n</script>\n\n<Tabs {tabs} />" },
	{ slug: 'input', name: 'Input', description: 'A text-like field with consistent focus, disabled, and placeholder states.', category: 'Inputs', props: [{ name: 'value', type: 'string', defaultValue: "''", description: 'Bind for two-way input state.' }, { name: 'type', type: "'text' | 'email' | 'password' | 'search' | 'number'", defaultValue: "'text'", description: 'Native input type.' }, { name: 'placeholder', type: 'string', defaultValue: "''", description: 'Hint displayed when empty.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents editing.' }], usage: "<script>\n\timport { Input } from '$lib/components';\n\tlet email = $state('');\n</script>\n\n<Input type=\"email\" placeholder=\"you@example.com\" bind:value={email} />" },
	{ slug: 'textarea', name: 'Textarea', description: 'A resizable multiline input matching the library control styling.', category: 'Inputs', props: [{ name: 'value', type: 'string', defaultValue: "''", description: 'Bind for two-way input state.' }, { name: 'rows', type: 'number', defaultValue: '4', description: 'Initial visible line count.' }, { name: 'placeholder', type: 'string', defaultValue: "''", description: 'Hint displayed when empty.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents editing.' }], usage: "<script>\n\timport { Textarea } from '$lib/components';\n\tlet note = $state('');\n</script>\n\n<Textarea placeholder=\"Leave a note\" bind:value={note} />" },
	{ slug: 'checkbox', name: 'Checkbox', description: 'A labeled boolean control with a large, keyboard-visible target.', category: 'Inputs', props: [{ name: 'checked', type: 'boolean', defaultValue: 'false', description: 'Bind to the checked state.' }, { name: 'label', type: 'string', defaultValue: '—', description: 'Text label when no snippet is provided.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents changes.' }], usage: "<script>\n\timport { Checkbox } from '$lib/components';\n\tlet accepted = $state(false);\n</script>\n\n<Checkbox label=\"I accept the terms\" bind:checked={accepted} />" },
	{ slug: 'switch', name: 'Switch', description: 'A binary control for immediate settings and preferences.', category: 'Inputs', props: [{ name: 'checked', type: 'boolean', defaultValue: 'false', description: 'Bind to the setting state.' }, { name: 'label', type: 'string', defaultValue: '—', description: 'Visible control label.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents changes.' }], usage: "<script>\n\timport { Switch } from '$lib/components';\n\tlet enabled = $state(true);\n</script>\n\n<Switch label=\"Email notifications\" bind:checked={enabled} />" },
	{ slug: 'select', name: 'Select', description: 'A styled native select with the accessibility and platform behavior users expect.', category: 'Inputs', props: [{ name: 'value', type: 'string', defaultValue: "''", description: 'Bind to the chosen option value.' }, { name: 'options', type: 'Array<{ label; value; disabled? }>', defaultValue: 'required', description: 'Native option definitions.' }, { name: 'placeholder', type: 'string', defaultValue: "'Select an option'", description: 'Disabled empty option label.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents selection.' }], usage: "<script>\n\timport { Select } from '$lib/components';\n\tlet role = $state('');\n\tconst roles = [{ label: 'Designer', value: 'design' }];\n</script>\n\n<Select options={roles} bind:value={role} />" },
	{ slug: 'dialog', name: 'Dialog', description: 'A native modal dialog with focus containment, Escape handling, and an accessible title.', category: 'Overlay', props: [{ name: 'open', type: 'boolean', defaultValue: 'false', description: 'Bind to open or close the modal.' }, { name: 'title', type: 'string', defaultValue: 'required', description: 'Accessible modal heading.' }, { name: 'description', type: 'string', defaultValue: '—', description: 'Optional supporting text.' }], usage: "<script>\n\timport { Button, Dialog } from '$lib/components';\n\tlet open = $state(false);\n</script>\n\n<Button onclick={() => open = true}>Open dialog</Button>\n<Dialog bind:open title=\"Invite teammate\">\n\t<p>Choose a role before sending an invitation.</p>\n</Dialog>" },
	{ slug: 'tooltip', name: 'Tooltip', description: 'A contextual label that appears on hover or keyboard focus without JavaScript.', category: 'Overlay', props: [{ name: 'content', type: 'string', defaultValue: 'required', description: 'Brief explanation displayed in the bubble.' }, { name: 'position', type: "'top' | 'bottom'", defaultValue: "'top'", description: 'Bubble placement.' }], usage: "<script>\n\timport { Button, Tooltip } from '$lib/components';\n</script>\n\n<Tooltip content=\"Create a new project\">\n\t<Button size=\"sm\">New</Button>\n</Tooltip>" },
	{ slug: 'progress', name: 'Progress', description: 'A determinate progress indicator with accessible current and maximum values.', category: 'Feedback', props: [{ name: 'value', type: 'number', defaultValue: '0', description: 'Current progress.' }, { name: 'max', type: 'number', defaultValue: '100', description: 'The value representing completion.' }, { name: 'label', type: 'string', defaultValue: '—', description: 'Visible and accessible progress label.' }], usage: "<script>\n\timport { Progress } from '$lib/components';\n</script>\n\n<Progress value={68} label=\"Uploading files\" />" },
	{ slug: 'skeleton', name: 'Skeleton', description: 'An animated placeholder that preserves space while data loads.', category: 'Feedback', props: [{ name: 'width', type: 'string', defaultValue: "'100%'", description: 'CSS width of the placeholder.' }, { name: 'height', type: 'string', defaultValue: "'1rem'", description: 'CSS height of the placeholder.' }, { name: 'circle', type: 'boolean', defaultValue: 'false', description: 'Makes the placeholder round.' }], usage: "<script>\n\timport { Skeleton } from '$lib/components';\n</script>\n\n<Skeleton width=\"12rem\" height=\"1.25rem\" />" },
	{ slug: 'toast', name: 'Toast', description: 'A dismissible notification surface for non-blocking status updates.', category: 'Feedback', props: [{ name: 'open', type: 'boolean', defaultValue: 'true', description: 'Bind to display or dismiss the notice.' }, { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", defaultValue: "'info'", description: 'The notification severity.' }, { name: 'title', type: 'string', defaultValue: 'required', description: 'Brief notification heading.' }], usage: "<script>\n\timport { Toast } from '$lib/components';\n</script>\n\n<Toast title=\"Saved\" variant=\"success\">Your changes are now live.</Toast>" },
	{ slug: 'separator', name: 'Separator', description: 'A low-emphasis visual divider for adjacent content groups.', category: 'Layout', props: [{ name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Direction of the divider.' }], usage: "<script>\n\timport { Separator } from '$lib/components';\n</script>\n\n<p>Account</p>\n<Separator />\n<p>Billing</p>" },
	{ slug: 'slider', name: 'Slider', description: 'A native range input with a token-filled track, optional live value bubble, and full keyboard support.', category: 'Inputs', props: [{ name: 'value', type: 'number', defaultValue: '50', description: 'Bind to the current value.' }, { name: 'min', type: 'number', defaultValue: '0', description: 'Lower bound.' }, { name: 'max', type: 'number', defaultValue: '100', description: 'Upper bound.' }, { name: 'step', type: 'number', defaultValue: '1', description: 'Increment between values.' }, { name: 'showValue', type: 'boolean', defaultValue: 'false', description: 'Shows a live value bubble beside the label.' }, { name: 'label', type: 'string', defaultValue: "'Slider'", description: 'Visible and accessible field label.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents changes.' }, { name: 'onValueChange', type: '(value: number) => void', defaultValue: '—', description: 'Change callback.' }], usage: "<script>\n\timport { Slider } from '$lib/components';\n\tlet volume = $state(50);\n</script>\n\n<Slider label=\"Volume\" bind:value={volume} showValue />" },
	{ slug: 'dropdown-menu', name: 'Dropdown Menu', description: 'A button-triggered menu with full keyboard navigation, danger and disabled items, and optional custom triggers.', category: 'Overlay', props: [{ name: 'items', type: 'MenuItem[]', defaultValue: 'required', description: 'Menu entries with label, onSelect, danger?, disabled?, shortcut?, leading?.' }, { name: 'label', type: 'Snippet', defaultValue: "'Menu'", description: 'Trigger content when no custom trigger is given.' }, { name: 'trigger', type: 'Snippet', defaultValue: '—', description: 'Custom trigger element; overrides label.' }, { name: 'align', type: "'start' | 'end'", defaultValue: "'start'", description: 'Menu alignment against the trigger.' }, { name: 'open', type: 'boolean', defaultValue: 'false', description: 'Bind to control open state programmatically.' }, { name: 'onOpenChange', type: '(open: boolean) => void', defaultValue: '—', description: 'Open-state change callback.' }], usage: "<script>\n\timport { DropdownMenu } from '$lib/components';\n\n\tconst items = [\n\t\t{ label: 'Duplicate', shortcut: '⌘D', onSelect: () => duplicate() },\n\t\t{ label: 'Delete', danger: true, onSelect: () => remove() }\n\t];\n</script>\n\n<DropdownMenu {items} label=\"Actions\" />" },
	{ slug: 'context-menu', name: 'Context Menu', description: 'A right-click (and long-press) menu family with pointer-origin morph, checkbox and radio items, keyboard typeahead, and reduced-motion fallbacks.', category: 'Overlay', props: [{ name: 'open', type: 'boolean', defaultValue: 'uncontrolled', description: 'Optional controlled open state on <ContextMenu>.' }, { name: 'checked', type: 'boolean', defaultValue: 'false', description: 'ContextMenuCheckboxItem state; pass onCheckedChange.' }, { name: 'value', type: 'string', defaultValue: '—', description: 'ContextMenuRadioGroup selection; RadioItem picks by value.' }, { name: 'tone', type: "'default' | 'destructive'", defaultValue: "'default'", description: 'Item emphasis; destructive items render in the danger color.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables a trigger or item.' }], usage: "<script>\n\timport { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuShortcut } from '$lib/components';\n</script>\n\n<ContextMenu>\n\t<ContextMenuTrigger><div class=\"card\">Right-click me</div></ContextMenuTrigger>\n\t<ContextMenuContent>\n\t\t<ContextMenuLabel>Canvas</ContextMenuLabel>\n\t\t<ContextMenuItem onSelect={rename}>Rename<ContextMenuShortcut>⌘R</ContextMenuShortcut></ContextMenuItem>\n\t\t<ContextMenuSeparator />\n\t\t<ContextMenuItem tone=\"destructive\" onSelect={remove}>Delete</ContextMenuItem>\n\t</ContextMenuContent>\n</ContextMenu>" }
	,
	{ slug: 'animated-button', name: 'Animated Button', description: 'A Button with restrained spring feedback for hover and press, respecting the user’s reduced-motion preference.', category: 'Motion', props: [{ name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: "'primary'", description: 'The visual emphasis.' }, { name: 'animated', type: 'boolean', defaultValue: 'true', description: 'Disables gesture motion while preserving button behavior.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Prevents interaction and feedback motion.' }, { name: 'onclick', type: '(event: MouseEvent) => void', defaultValue: '—', description: 'Click handler.' }], usage: "<script>\n\timport { AnimatedButton } from '$lib/components';\n</script>\n\n<AnimatedButton onclick={() => save()}>Save changes</AnimatedButton>" },
	{ slug: 'animated-card', name: 'Animated Card', description: 'A Card that uses FLIP layout and subtle spring feedback when marked interactive.', category: 'Motion', props: [{ name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Internal spacing scale.' }, { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Enables hover, tap, and layout feedback.' }], usage: "<script>\n\timport { AnimatedCard } from '$lib/components';\n</script>\n\n<AnimatedCard interactive>\n\t<strong>Project plan</strong>\n\t<p>Click targets belong inside the card.</p>\n</AnimatedCard>" },
	{ slug: 'reveal', name: 'Reveal', description: 'A viewport-driven content reveal for sections and supporting content, using opacity and a short vertical transition.', category: 'Motion', props: [{ name: 'delay', type: 'number', defaultValue: '0', description: 'Additional delay in seconds; keep stack delays below 400ms.' }], usage: "<script>\n\timport { Reveal } from '$lib/components';\n</script>\n\n<Reveal delay={0.08}>\n\t<h2>What changed</h2>\n\t<p>This content reveals as it enters the viewport.</p>\n</Reveal>" },
	{ slug: 'motion-list', name: 'Motion List', description: 'A keyed, staggered list for concise status or summary rows.', category: 'Motion', props: [{ name: 'items', type: 'Array<{ id; title; description? }>', defaultValue: 'required', description: 'Stable-ID list content.' }, { name: 'label', type: 'string', defaultValue: "'Animated list'", description: 'Accessible list label.' }], usage: "<script>\n\timport { MotionList } from '$lib/components';\n\n\tconst items = [\n\t\t{ id: 'setup', title: 'Set up your project', description: 'Ready to go' },\n\t\t{ id: 'invite', title: 'Invite your team' }\n\t];\n</script>\n\n<MotionList {items} label=\"Project checklist\" />" },
	{ slug: 'presence', name: 'Presence', description: 'An AnimatePresence-backed wrapper for content that should enter and exit smoothly rather than disappear abruptly.', category: 'Motion', props: [{ name: 'present', type: 'boolean', defaultValue: 'false', description: 'Controls whether the wrapped content is mounted.' }], usage: "<script>\n\timport { Presence } from '$lib/components';\n\tlet visible = $state(true);\n</script>\n\n<Presence present={visible}>\n\t<p>Your changes are saved.</p>\n</Presence>" },
	{ slug: 'theme', name: 'Theme', description: 'A layout-neutral wrapper for a scoped light, dark, or system theme plus raw theme-token overrides.', category: 'Foundation', props: [{ name: 'theme', type: "'system' | 'light' | 'dark'", defaultValue: "'system'", description: 'Color-scheme preference for this subtree.' }, { name: 'tokens', type: 'Record<ThemeTokenName, string | number>', defaultValue: '{}', description: 'Supported theme-token overrides scoped to children.' }], usage: "<script>\n\timport { Button, Card, Theme } from '$lib/components';\n\n\tconst brandTheme = {\n\t\t'--theme-color': '#0f766e',\n\t\t'--theme-color-alt': '#115e59',\n\t\t'--radius-6': '1.5rem'\n\t};\n</script>\n\n<Theme theme=\"light\" tokens={brandTheme}>\n\t<Card><Button>Branded action</Button></Card>\n</Theme>" },
	{ slug: 'magnetic', name: 'Magnetic', description: 'A pointer-responsive wrapper with small spring movement, inspired by Motion Core’s Magnetic pattern.', category: 'Motion', props: [{ name: 'strength', type: 'number', defaultValue: '0.16', description: 'How strongly the child follows a mouse pointer.' }, { name: 'maxOffset', type: 'number', defaultValue: '12', description: 'Maximum movement in pixels.' }, { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables pointer response.' }], usage: "<script>\n\timport { Button, Magnetic } from '$lib/components';\n</script>\n\n<Magnetic strength={0.14} maxOffset={10}>\n\t<Button>Magnetic action</Button>\n</Magnetic>" },
	{ slug: 'text-loop', name: 'Text Loop', description: 'A restrained rotating phrase component inspired by Motion Core’s Text Loop; it pauses for reduced-motion users.', category: 'Motion', props: [{ name: 'texts', type: 'string[]', defaultValue: 'required', description: 'Phrases to cycle through.' }, { name: 'interval', type: 'number', defaultValue: '2200', description: 'Milliseconds each phrase remains visible.' }, { name: 'label', type: 'string', defaultValue: "'Rotating text'", description: 'Accessible label for the changing content.' }], usage: "<script>\n\timport { TextLoop } from '$lib/components';\n</script>\n\n<p>Build <TextLoop texts={['faster', 'calmer', 'together']} />.</p>" },
	{ slug: 'marquee', name: 'Marquee', description: 'A pause-on-hover, reduced-motion-aware continuous content row inspired by Motion Core’s Marquee.', category: 'Motion', props: [{ name: 'items', type: 'string[]', defaultValue: 'required', description: 'Repeated content labels.' }, { name: 'speed', type: 'number', defaultValue: '22', description: 'Duration of one full loop, in seconds.' }, { name: 'direction', type: "'left' | 'right'", defaultValue: "'left'", description: 'Motion direction.' }, { name: 'label', type: 'string', defaultValue: "'Scrolling content'", description: 'Accessible region label.' }], usage: "<script>\n\timport { Marquee } from '$lib/components';\n\tconst items = ['Svelte 5', 'Sass', 'Accessible', 'Themeable'];\n</script>\n\n<Marquee {items} speed={24} />" },
	{ slug: 'carousel', name: 'Carousel', description: 'A keyboard-operable, controlled content carousel adapted from the SvelteBits component pattern.', category: 'Layout', props: [{ name: 'items', type: 'Array<{ id; title; description?; image? }>', defaultValue: 'required', description: 'Stable-ID slide content.' }, { name: 'index', type: 'number', defaultValue: '0', description: 'Bind to control the selected slide.' }, { name: 'label', type: 'string', defaultValue: "'Carousel'", description: 'Accessible carousel label.' }], usage: "<script>\n\timport { Carousel } from '$lib/components';\n\tlet index = $state(0);\n\tconst slides = [{ id: 'one', title: 'First slide', description: 'A short supporting description.' }];\n</script>\n\n<Carousel items={slides} bind:index />" },
	{ slug: 'stepper', name: 'Stepper', description: 'An accessible progress sequence adapted from SvelteBits’ Stepper pattern.', category: 'Layout', props: [{ name: 'steps', type: 'Array<{ id; title; description? }>', defaultValue: 'required', description: 'Ordered, stable-ID steps.' }, { name: 'current', type: 'number', defaultValue: '0', description: 'Bind to the active step index.' }, { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Allows users to select a step.' }], usage: "<script>\n\timport { Stepper } from '$lib/components';\n\tlet current = $state(1);\n\tconst steps = [{ id: 'account', title: 'Create account' }, { id: 'profile', title: 'Complete profile' }];\n</script>\n\n<Stepper {steps} bind:current interactive />" },
	{ slug: 'counter', name: 'Counter', description: 'A finite animated number adapted from SvelteBits’ Counter pattern.', category: 'Motion', props: [{ name: 'value', type: 'number', defaultValue: 'required', description: 'The target number.' }, { name: 'from', type: 'number', defaultValue: '0', description: 'Value used on the first animation.' }, { name: 'duration', type: 'number', defaultValue: '700', description: 'Animation duration in milliseconds.' }, { name: 'locale', type: 'string', defaultValue: 'browser default', description: 'Optional Intl number-format locale.' }], usage: "<script>\n\timport { Counter } from '$lib/components';\n</script>\n\n<Counter value={12800} duration={800} locale=\"en-US\" />" }
];

const motionCoreAdditions: Array<[string, string, string, ComponentDoc['category'], string]> = [
	['ascii-renderer', 'ASCII Renderer', 'AsciiRenderer', 'Canvas', 'An animated WebGL surface for character-like, retro visual treatments.'],
	['card-3d', 'Card 3D', 'Card3D', 'Canvas', 'A WebGL-driven dimensional media surface ready for optional vision-driven extensions.'],
	['dithered-image', 'Dithered Image', 'DitheredImage', 'Canvas', 'A configurable procedural canvas treatment for image-focused compositions.'],
	['fake-3d-image', 'Fake 3D Image', 'Fake3DImage', 'Canvas', 'A dimensional canvas surface for depth-map style media treatments.'],
	['fluid-image-reveal', 'Fluid Image Reveal', 'FluidImageReveal', 'Canvas', 'A fluid-looking WebGL reveal surface that takes its palette from the chosen pattern.'],
	['fluid-simulation', 'Fluid Simulation', 'FluidSimulation', 'Canvas', 'A compact animated canvas field for fluid-like ambient visual feedback.'],
	['glass-logo', 'Glass Logo', 'GlassLogo', 'Canvas', 'A refractive-looking animated canvas surface for logo and brand moments.'],
	['glass-pane', 'Glass Pane', 'GlassPane', 'Canvas', 'A shimmering WebGL panel for ornamental glass-like layers.'],
	['glass-slideshow', 'Glass Slideshow', 'GlassSlideshow', 'Canvas', 'A WebGL slideshow treatment with an unopinionated, token-compatible frame.'],
	['glitter-cloth', 'Glitter Cloth', 'GlitterCloth', 'Canvas', 'An ambient cloth-like shader surface for expressive backgrounds.'],
	['globe', 'Globe', 'Globe', 'Canvas', 'A WebGL globe-oriented visual foundation for data storytelling surfaces.'],
	['god-rays', 'God Rays', 'GodRays', 'Canvas', 'A configurable animated ray field for atmospheric backgrounds.'],
	['halo', 'Halo', 'Halo', 'Canvas', 'An atmospheric animated halo surface for focal content.'],
	['infinite-gallery', 'Infinite Gallery', 'InfiniteGallery', 'Canvas', 'A canvas-driven visual gallery foundation for media-forward pages.'],
	['interactive-grid', 'Interactive Grid', 'InteractiveGrid', 'Canvas', 'A reactive-looking grid treatment built on the shared OGL renderer.'],
	['lava-lamp', 'Lava Lamp', 'LavaLamp', 'Canvas', 'An organic, animated canvas surface for decorative use.'],
	['liquid-metal', 'Liquid Metal', 'LiquidMetal', 'Canvas', 'A high-contrast liquid-like canvas treatment.'],
	['neural-noise', 'Neural Noise', 'NeuralNoise', 'Canvas', 'A generative animated noise surface for rich but contained backgrounds.'],
	['pixelated-image', 'Pixelated Image', 'PixelatedImage', 'Canvas', 'A pixel-oriented canvas treatment for media reveals.'],
	['plasma-grid', 'Plasma Grid', 'PlasmaGrid', 'Canvas', 'A dynamic plasma-style grid surface.'],
	['rubiks-cube', 'Rubiks Cube', 'RubiksCube', 'Canvas', 'A colorful animated canvas primitive for three-dimensional visual storytelling.'],
	['specular-band', 'Specular Band', 'SpecularBand', 'Canvas', 'A moving highlight-band surface for embellished content regions.'],
	['water-ripple', 'Water Ripple', 'WaterRipple', 'Canvas', 'An animated ripple-oriented canvas treatment.'],
	['watercolor-image', 'Watercolor Image', 'WatercolorImage', 'Canvas', 'A painterly animated canvas treatment for media surfaces.'],
	['card-stack', 'Card Stack', 'CardStack', 'Showcase', 'A spring-animated stacked content pattern.'],
	['flip-card-stack', 'Flip Card Stack', 'FlipCardStack', 'Motion', 'A draggable stack pattern that uses Svelte Motion drag physics.'],
	['flip-grid', 'Flip Grid', 'FlipGrid', 'Layout', 'A layout-aware grid with FLIP-based movement between positions.'],
	['floating-menu', 'Floating Menu', 'FloatingMenu', 'Navigation', 'A compact animated navigation list with accessible links.'],
	['image-trail', 'Image Trail', 'ImageTrail', 'Motion', 'A motion showcase surface for pointer-responsive trails.'],
	['infinite-physics-gallery', 'Infinite Physics Gallery', 'InfinitePhysicsGallery', 'Showcase', 'A drag-ready gallery composition powered by Svelte Motion.'],
	['logo-carousel', 'Logo Carousel', 'LogoCarousel', 'Showcase', 'A compact animated logo and partner showcase.'],
	['macos-dock', 'MacOS Dock', 'MacosDock', 'Navigation', 'A keyboard-accessible dock with spring hover magnification.'],
	['preloader', 'Preloader', 'Preloader', 'Motion', 'A motion-first preloading surface for narrative transitions.'],
	['radial-gallery', 'Radial Gallery', 'RadialGallery', 'Showcase', 'A gallery composition with restrained layout motion.'],
	['slideshow', 'Slideshow', 'Slideshow', 'Showcase', 'An animated multi-item slideshow foundation.'],
	['split-hover', 'Split Hover', 'SplitHover', 'Typography', 'A character-aware hover treatment for short display text.'],
	['split-reveal', 'Split Reveal', 'SplitReveal', 'Typography', 'A character-aware reveal treatment for display text.'],
	['stacking-words', 'Stacking Words', 'StackingWords', 'Typography', 'A staggered text reveal for headings and narrative content.'],
	['text-repel', 'Text Repel', 'TextRepel', 'Typography', 'A pointer-reactive display-text treatment.'],
	['text-scramble', 'Text Scramble', 'TextScramble', 'Typography', 'A character-level animated text treatment.'],
	['underlay-navigation', 'Underlay Navigation', 'UnderlayNavigation', 'Navigation', 'A progressively revealed navigation surface.'],
	['video-player', 'Video Player', 'VideoPlayer', 'Showcase', 'A refined, accessible video-player visual foundation.'],
	['weight-wave', 'Weight Wave', 'WeightWave', 'Typography', 'A wave-like character emphasis treatment for display text.']
];

components.push(...motionCoreAdditions.map(([slug, name, component, category, description]) => {
	const typography = category === 'Typography';
	const canvas = category === 'Canvas';
	return {
		slug,
		name,
		description,
		category,
		props: canvas
			? [{ name: 'label', type: 'string', defaultValue: 'component name', description: 'Accessible label for the animated canvas.' }]
			: typography
				? [{ name: 'text', type: 'string', defaultValue: "'Motion that belongs to your interface'", description: 'Display text split into motion-aware characters.' }, { name: 'label', type: 'string', defaultValue: 'text', description: 'Accessible label for the effect.' }]
				: [{ name: 'items', type: 'string[]', defaultValue: "['Explore', 'Compose', 'Share']", description: 'Stable labels used to compose the pattern.' }, { name: 'label', type: 'string', defaultValue: 'component name', description: 'Accessible label for the component region.' }],
		usage: canvas
			? `<script>\n\timport { ${component} } from '$lib/components';\n</script>\n\n<${component} label=\"Decorative animated canvas\" />`
			: typography
				? `<script>\n\timport { ${component} } from '$lib/components';\n</script>\n\n<${component} text=\"Motion with purpose\" />`
				: `<script>\n\timport { ${component} } from '$lib/components';\n</script>\n\n<${component} items={['Explore', 'Compose', 'Share']} />`
	};
}));

const toKebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();
const toTitle = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

const svelteBitsFamilies = [
	{ category: 'Motion' as const, recipe: 'animation', names: ['AnimatedContent', 'Antigravity', 'BlobCursor', 'ClickSpark', 'Crosshair', 'Cubes', 'CursorGrid', 'ElectricBorder', 'FadeContent', 'GhostCursor', 'GlareHover', 'GradualBlur', 'LaserFlow', 'LogoLoop', 'MagicRings', 'Magnet', 'MagnetLines', 'MetaBalls', 'MetallicPaint', 'Noise', 'OrbitImages', 'PixelTrail', 'PixelTransition', 'Ribbons', 'ShapeBlur', 'SplashCursor', 'StarBorder', 'StickerPeel', 'TargetCursor'] },
	{ category: 'Canvas' as const, recipe: 'background', names: ['Aurora', 'Balatro', 'Ballpit', 'Beams', 'ColorBends', 'DarkVeil', 'Dither', 'DotField', 'DotGrid', 'EvilEye', 'FaultyTerminal', 'FloatingLines', 'Galaxy', 'GradientBlinds', 'Grainient', 'GridDistortion', 'GridMotion', 'GridScan', 'Hyperspeed', 'Iridescence', 'LetterGlitch', 'LightPillar', 'LightRays', 'Lightning', 'LineWaves', 'LiquidChrome', 'LiquidEther', 'Orb', 'Particles', 'PixelBlast', 'PixelSnow', 'Plasma', 'PlasmaWave', 'Prism', 'PrismaticBurst', 'Radar', 'RippleGrid', 'ShapeGrid', 'Silk', 'SoftAurora', 'Threads', 'Waves'] },
	{ category: 'Showcase' as const, recipe: 'component', names: ['AnimatedList', 'BorderGlow', 'BounceCards', 'BubbleMenu', 'CardNav', 'CardSwap', 'ChromaGrid', 'CircularGallery', 'DecayCard', 'Dock', 'DomeGallery', 'ElasticSlider', 'FlowingMenu', 'FlyingPosters', 'Folder', 'GlassIcons', 'GlassSurface', 'GooeyNav', 'InfiniteMenu', 'MagicBento', 'Masonry', 'ModelViewer', 'PillNav', 'PixelCard', 'ProfileCard', 'ReflectiveCard', 'ScrollStack', 'SpotlightCard', 'Stack', 'StaggeredMenu', 'TiltedCard'] },
	{ category: 'Typography' as const, recipe: 'text', names: ['ASCIIText', 'BlurText', 'CircularText', 'CountUp', 'CurvedLoop', 'DecryptedText', 'FallingText', 'FuzzyText', 'GlitchText', 'GradientText', 'RotatingText', 'ScrambledText', 'ScrollFloat', 'ScrollReveal', 'ScrollVelocity', 'ShinyText', 'Shuffle', 'SplitText', 'TextCursor', 'TextPressure', 'TextType', 'TrueFocus', 'VariableProximity'] }
];

export const svelteBitsCategoryBySlug = Object.fromEntries(svelteBitsFamilies.flatMap((family) => family.names.map((name) => [toKebab(name), family.recipe])));
export const svelteBitsSlugs = new Set(Object.keys(svelteBitsCategoryBySlug));

components.push(...svelteBitsFamilies.flatMap((family) => family.names.map((component) => {
	const slug = toKebab(component);
	const name = toTitle(component);
	const textRecipe = family.recipe === 'text';
	const backgroundRecipe = family.recipe === 'background';
	return {
		slug,
		name,
		description: `A Sass-first, themeable ${family.recipe} equivalent inspired by the SvelteBits ${name} pattern.`,
		category: family.category,
		props: [{ name: 'pattern', type: 'string', defaultValue: `'${slug}'`, description: 'Selects the named Sass-first recipe.' }, { name: 'category', type: "'animation' | 'background' | 'component' | 'text'", defaultValue: `'${family.recipe}'`, description: 'Chooses the appropriate recipe family.' }, ...(textRecipe ? [{ name: 'text', type: 'string', defaultValue: "'Make every interaction intentional'", description: 'Text displayed by the animation.' }] : [{ name: 'items', type: 'string[]', defaultValue: "['Explore', 'Compose', 'Share']", description: 'Content labels used by the pattern.' }]), { name: 'label', type: 'string', defaultValue: 'component name', description: 'Accessible label for the rendered effect.' }],
		usage: `<script>\n\timport { ${component} } from '$lib/components';\n</script>\n\n<${component} pattern=\"${slug}\" category=\"${family.recipe}\"${textRecipe ? ' text="Motion with purpose"' : ''} />`
	};
})));

// These two exports are part of the public package surface as well as the
// documentation implementation, so keep them in the live catalogue.
components.push(
	{
		slug: 'bits-effect',
		name: 'Bits Effect',
		description: 'The shared Sass-first adapter behind the SvelteBits-inspired pattern exports.',
		category: 'Motion',
		props: [
			{ name: 'pattern', type: 'string', defaultValue: 'required', description: 'Selects the named pattern.' },
			{ name: 'category', type: "'animation' | 'background' | 'component' | 'text'", defaultValue: "'animation'", description: 'Chooses the rendering recipe.' },
			{ name: 'items', type: 'string[]', defaultValue: "['Explore', 'Compose', 'Share']", description: 'Labels used by list, component, or animation recipes.' },
			{ name: 'text', type: 'string', defaultValue: "'Make every interaction intentional'", description: 'Text used by text recipes.' },
			{ name: 'label', type: 'string', defaultValue: '—', description: 'Accessible label for the rendered effect.' }
		],
		usage: "<script>\n\timport { BitsEffect } from 'fractalsvelte/components';\n</script>\n\n<BitsEffect pattern=\"animated-content\" category=\"animation\" label=\"Animated content preview\" />"
	},
	{
		slug: 'theme-setter',
		name: 'Theme Setter',
		description: 'An optional responsive appearance drawer for mode, preset, accent, Aura, Gradient, and Pattern selection.',
		category: 'Foundation',
		props: [
			{ name: 'open', type: 'boolean', defaultValue: 'false', description: 'Bind to show or hide the drawer.' },
			{ name: 'mode', type: "'light' | 'dark'", defaultValue: "'light'", description: 'Bind to the active global color mode.' },
			{ name: 'children', type: 'Snippet', defaultValue: '—', description: 'Application content rendered behind the drawer.' }
		],
		usage: "<script>\n\timport { Button, ThemeSetter } from 'fractalsvelte/components';\n\tlet open = $state(false);\n\tlet mode = $state<'light' | 'dark'>('light');\n</script>\n\n<ThemeSetter bind:open bind:mode>\n\t<Button onclick={() => open = true}>Open appearance settings</Button>\n</ThemeSetter>"
	}
);

const snippetPropSlugs = new Set([
	'button', 'animated-button', 'card', 'animated-card', 'accordion', 'badge', 'alert',
	'checkbox', 'dialog', 'tooltip', 'toast', 'reveal', 'presence', 'magnetic', 'theme'
]);
const propAdditions: Record<string, Prop[]> = {
	'button': [
		{ name: 'type', type: "'button' | 'submit' | 'reset'", defaultValue: "'button'", description: 'Native button type.' }
	],
	'animated-button': [
		{ name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'The button density.' },
		{ name: 'type', type: "'button' | 'submit' | 'reset'", defaultValue: "'button'", description: 'Native button type.' }
	],
	'avatar': [
		{ name: 'alt', type: 'string', defaultValue: "''", description: 'Image alternative text; falls back to name for the accessible label.' }
	],
	'input': [
		{ name: 'name', type: 'string', defaultValue: '—', description: 'Native form field name.' },
		{ name: 'id', type: 'string', defaultValue: '—', description: 'Native form field ID for an external label.' },
		{ name: 'ariaLabel', type: 'string', defaultValue: '—', description: 'Explicit accessible name when no visible label is available.' }
	],
	'textarea': [
		{ name: 'name', type: 'string', defaultValue: '—', description: 'Native form field name.' },
		{ name: 'id', type: 'string', defaultValue: '—', description: 'Native form field ID for an external label.' },
		{ name: 'ariaLabel', type: 'string', defaultValue: '—', description: 'Explicit accessible name when no visible label is available.' }
	]
};

for (const component of components) {
	if (snippetPropSlugs.has(component.slug)) {
		component.props.push({ name: 'children', type: 'Snippet', defaultValue: '—', description: 'Svelte 5 snippet rendered inside the component.' });
	}
	for (const prop of propAdditions[component.slug] ?? []) {
		if (!component.props.some((existing) => existing.name === prop.name)) component.props.push(prop);
	}
}

// Usage snippets are copy-ready for consumers. The docs app can still import
// source components through the documentation app's internal `#lib` map in ComponentPreview.svelte.
for (const component of components) component.usage = component.usage.replaceAll('$lib/components', 'fractalsvelte/components');

export const componentBySlug = (slug: string) => components.find((component) => component.slug === slug);

export const categories = [...new Set(components.map((component) => component.category))];
