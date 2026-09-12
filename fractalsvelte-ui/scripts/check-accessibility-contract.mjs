import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const failures = [];

const requiredFiles = [
	'src/app.html',
	'src/routes/+layout.svelte',
	'src/lib/styles/_08_blocks.sass',
	'src/lib/styles/_07_base.sass',
	'src/lib/components/Dialog.svelte',
	'src/lib/components/Accordion.svelte',
	'src/lib/components/Tooltip.svelte'
];
for (const file of requiredFiles) if (!existsSync(resolve(root, file))) failures.push(`Missing accessibility source: ${file}`);

const app = read('src/app.html');
const layout = read('src/routes/+layout.svelte');
const blocks = read('src/lib/styles/_08_blocks.sass');
const base = read('src/lib/styles/_07_base.sass');
const dialog = read('src/lib/components/Dialog.svelte');
const accordion = read('src/lib/components/Accordion.svelte');
const tooltip = read('src/lib/components/Tooltip.svelte');

const assertions = [
	[app.includes('body.setAttribute') && app.includes("data-mode"), 'app.html must mirror appearance state to body'],
	[app.includes("localStorage.getItem('fractalsvelte.mode')"), 'app.html must read the persisted mode before hydration'],
	[layout.includes('MotionConfig reducedMotion="user"'), 'root layout must opt into user reduced-motion preferences'],
	[blocks.includes('@media (prefers-reduced-motion: reduce)'), 'blocks must define reduced-motion behavior'],
	[base.includes(':focus-visible') && base.includes('var(--ring)'), 'base styles must provide a visible token-based focus style'],
	[dialog.includes('<dialog') && dialog.includes('aria-labelledby'), 'Dialog must retain native dialog semantics and a labelled relationship'],
	[accordion.includes('<details'), 'Accordion must retain native details semantics'],
	[tooltip.includes('role="tooltip"'), 'Tooltip must expose a tooltip role for its supplemental content'],
	[!read('src/lib/styles/_08_blocks.sass').includes('color-scheme: light dark'), 'components must not force a conflicting dual colour scheme']
];
for (const [passed, message] of assertions) if (!passed) failures.push(message);

if (failures.length) {
	for (const failure of failures) console.error(`Accessibility contract: ${failure}`);
	process.exitCode = 1;
} else {
	console.log('Accessibility contract passed: semantics, focus, reduced motion, appearance bootstrap, and control colour-scheme checks are present.');
}
