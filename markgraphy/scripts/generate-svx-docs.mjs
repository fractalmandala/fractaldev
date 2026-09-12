/**
 * Auto-generate .svx documentation files from component metadata.
 *
 * Run after extract-component-metadata.mjs to regenerate all docs.
 *
 * Usage:
 *   node scripts/generate-svx-docs.mjs
 */

import fs from 'fs';
import path from 'path';

const metadata = JSON.parse(fs.readFileSync('./src/docs/component-metadata.json', 'utf-8'));

const OUTPUT_DIR = 'src/docs/content';

// Components that are NOT in the docs catalog — skip these.
const SKIP = new Set([
	'GraphArrow',
	'GraphBody',
	'GraphRule',
	'GraphTick',
	'GraphTrack',
	'TextTyping'
]);

/**
 * Generate a .svx file for a component.
 */
function generateSvx(componentName, info) {
	const lines = [];

	// Script import
	lines.push('<script lang="ts">');
	lines.push(`\timport { ${componentName} } from '$lib';`);
	lines.push('</script>');
	lines.push('');

	// Title
	lines.push(`# ${componentName}`);
	lines.push('');

	// Description
	if (info.description) {
		lines.push(info.description);
		lines.push('');
	}

	// Import section
	lines.push('## Import');
	lines.push('');
	lines.push('```svelte');
	lines.push(`import { ${componentName} } from 'markgraphy';`);
	lines.push('```');
	lines.push('');

	// Basic usage
	lines.push('## Basic usage');
	lines.push('');
	lines.push('```svelte');

	// Generate a basic example with default props
	const basicProps = info.props
		.filter((p) => p.name !== 'class' && p.name !== 'children')
		.slice(0, 3)
		.map((p) => {
			if (p.default) {
				return `  ${p.name}={${p.default}}`;
			}
			if (p.type === 'string') {
				return `  ${p.name}="example"`;
			}
			if (p.type === 'number') {
				return `  ${p.name}={0}`;
			}
			if (p.type === 'boolean') {
				return `  ${p.name}`;
			}
			// Skip complex types in basic example
			return null;
		})
		.filter(Boolean)
		.join('\n');

	if (basicProps) {
		lines.push(`<${componentName}`);
		lines.push(basicProps);
		lines.push('/>');
	} else {
		lines.push(`<${componentName} />`);
	}
	lines.push('```');
	lines.push('');

	// Live preview — only for components that can render without complex required props.
	// Components needing arrays/objects as required props would crash SSR.
	const hasRequiredComplex = info.props.some(
		(p) =>
			p.name !== 'class' &&
			p.name !== 'children' &&
			!p.optional &&
			!p.default &&
			p.type !== 'string' &&
			p.type !== 'number' &&
			p.type !== 'boolean'
	);

	if (!hasRequiredComplex) {
		lines.push('<div class="live">');
		if (basicProps) {
			lines.push(`<${componentName}`);
			lines.push(basicProps);
			lines.push('/>');
		} else {
			lines.push(`<${componentName} />`);
		}
		lines.push('</div>');
		lines.push('');
	}

	// Props table
	if (info.props.length > 0) {
		lines.push('## Props');
		lines.push('');
		lines.push('| Prop | Type | Default | Description |');
		lines.push('|------|------|---------|-------------|');

		for (const prop of info.props) {
			const name = prop.optional ? `${prop.name}?` : prop.name;
			const type = prop.type || '—';
			const defaultVal = prop.default || '—';
			const description = (prop.description || '—').replace(/\|/g, '\\|');
			lines.push(`| \`${name}\` | \`${type}\` | \`${defaultVal}\` | ${description} |`);
		}
		lines.push('');
	}

	// Exported types
	if (info.moduleExports.length > 0) {
		lines.push('## Exported types');
		lines.push('');
		for (const exp of info.moduleExports) {
			lines.push(`- \`${exp.name}\``);
		}
		lines.push('');
	}

	// Reduced motion note for animated components
	if (info.file.startsWith('animated/')) {
		lines.push('## Reduced motion');
		lines.push('');
		lines.push('Animation is disabled under `prefers-reduced-motion`.');
		lines.push('');
	}

	return lines.join('\n');
}

// Convert CamelCase to kebab-case
function toKebabCase(str) {
	return str
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

// Main
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [name, info] of Object.entries(metadata)) {
	if (SKIP.has(name)) continue;
	// Special case: the Graph component (frame wrapper) uses slug "graph-frame"
	const slug = name === 'Graph' ? 'graph-frame' : toKebabCase(name);
	const outputPath = path.join(OUTPUT_DIR, `${slug}.svx`);
	const content = generateSvx(name, info);
	fs.writeFileSync(outputPath, content);
	console.log(`Generated ${outputPath}`);
}

console.log(`\nDone → ${OUTPUT_DIR}`);
