/**
 * Extract complete component metadata from Svelte 5 components.
 *
 * Parses each .svelte file in src/lib/ and extracts:
 * - Props (from $props() destructuring AND interface definitions) with types, defaults, JSDoc
 * - Events (from createEventDispatcher or on: handlers)
 * - Slots (from <slot> elements)
 * - Component description (from first JSDoc block)
 *
 * Outputs a JSON file at src/docs/component-metadata.json
 */

import { parse } from 'svelte/compiler';
import fs from 'fs';
import path from 'path';

const LIB_DIR = 'src/lib';
const OUTPUT = 'src/docs/component-metadata.json';

/**
 * Extract JSDoc comment immediately preceding a line.
 */
function getJSDoc(lines, lineIndex) {
	const jsdoc = [];
	let i = lineIndex - 1;
	while (i >= 0) {
		const line = lines[i].trim();
		if (line.startsWith('/**')) {
			jsdoc.unshift(line.replace(/^\/\*\*\s?/, ''));
			break;
		} else if (line.startsWith('*') || line.startsWith('*/')) {
			jsdoc.unshift(line.replace(/^\*?\s?/, '').replace(/\*\/$/, ''));
			i--;
		} else if (line === '') {
			i--;
		} else {
			break;
		}
	}
	return jsdoc.join('\n').trim();
}

/**
 * Extract props from an interface definition.
 */
function extractPropsFromInterface(scriptContent, interfaceName) {
	const props = [];
	const lines = scriptContent.split('\n');

	// Find the interface block
	const interfaceRegex = new RegExp(`(?:export\\s+)?interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
	const match = interfaceRegex.exec(scriptContent);
	if (!match) return props;

	const interfaceBody = match[1];
	const interfaceLines = interfaceBody.split('\n');

	// Find the starting line of the interface in the full script
	const interfaceStart = scriptContent.indexOf(`interface ${interfaceName}`);
	const linesBefore = scriptContent.substring(0, interfaceStart).split('\n');
	const startLine = linesBefore.length - 1;

	for (let i = 0; i < interfaceLines.length; i++) {
		const line = interfaceLines[i].trim();
		if (!line || line === '{' || line === '}') continue;

		// Match: propName?: Type; or propName: Type;
		const propMatch = line.match(/^(\w+)(\?)?:\s*(.+?);?$/);
		if (propMatch) {
			const [, name, optional, type] = propMatch;
			const jsdoc = getJSDoc(lines, startLine + i);
			props.push({
				name,
				type: type.replace(/;$/, '').trim(),
				optional: optional === '?',
				default: undefined, // Will be filled from $props() destructuring
				description: jsdoc ? jsdoc.replace(/\s*\*\/$/, '') : undefined
			});
		}
	}

	return props;
}

/**
 * Extract default values from $props() destructuring.
 */
function extractDefaults(scriptContent) {
	const defaults = {};

	// Match: let { ... }: InterfaceName = $props();
	const propsMatch = scriptContent.match(/let\s+\{([^}]+)\}\s*(?::\s*\w+)?\s*=\s*\$props\(\)/s);
	if (!propsMatch) return defaults;

	const destructured = propsMatch[1];
	
	// Split by commas, but be careful with nested structures
	const propAssignments = destructured.split(',').map(s => s.trim()).filter(Boolean);

	for (const assignment of propAssignments) {
		// Match: name = defaultValue or name: newName = defaultValue
		const match = assignment.match(/^(\w+)(?:\s*:\s*\w+)?\s*=\s*(.+)$/);
		if (match) {
			const [, name, defaultValue] = match;
			defaults[name] = defaultValue.trim();
		}
	}

	return defaults;
}

/**
 * Extract props from $props() destructuring (without interface).
 */
function extractPropsFromDestructuring(scriptContent) {
	const props = [];
	const lines = scriptContent.split('\n');

	// Find the $props() call
	const propsMatch = scriptContent.match(/let\s+\{([^}]+)\}\s*(?::\s*(\w+))?\s*=\s*\$props\(\)/s);
	if (!propsMatch) return props;

	const destructured = propsMatch[1];
	const interfaceName = propsMatch[2];
	const propLines = destructured.split('\n');

	// Find the line number of the $props() call in the full script
	const propsCallLine = scriptContent.indexOf('$props()');
	const linesBefore = scriptContent.substring(0, propsCallLine).split('\n');
	const startLine = linesBefore.length - 1;

	for (let i = 0; i < propLines.length; i++) {
		const line = propLines[i].trim();
		if (!line || line === '{' || line === '}') continue;

		// Match: name, name = default, name: Type, name: Type = default
		const match = line.match(/^(\w+)(?:\s*:\s*(\w+))?(?:\s*=\s*(.+?))?$/);
		if (match) {
			const [, name, type, defaultValue] = match;
			const jsdoc = getJSDoc(lines, startLine + i);
			props.push({
				name,
				type: type || undefined,
				optional: !defaultValue && !type,
				default: defaultValue ? defaultValue.trim().replace(/,?$/, '') : undefined,
				description: jsdoc || undefined
			});
		}
	}

	return props;
}

/**
 * Extract exported types from <script module> block.
 */
function extractModuleExports(moduleContent) {
	const exports = [];
	if (!moduleContent) return exports;
	const typeMatches = moduleContent.matchAll(/export\s+(?:type|interface)\s+(\w+)/g);
	for (const match of typeMatches) {
		exports.push({ name: match[1], kind: 'type' });
	}
	return exports;
}

/**
 * Extract events from the template (on: handlers).
 */
function extractEvents(htmlContent) {
	const events = new Set();
	if (!htmlContent) return [];
	const eventMatches = htmlContent.matchAll(/on:(\w+)/g);
	for (const match of eventMatches) {
		events.add(match[1]);
	}
	return Array.from(events);
}

/**
 * Extract slots from the template.
 */
function extractSlots(htmlContent) {
	const slots = [];
	if (!htmlContent) return slots;
	const slotMatches = htmlContent.matchAll(/<slot(?:\s+name="(\w+)")?/g);
	for (const match of slotMatches) {
		slots.push({ name: match[1] || 'default' });
	}
	return slots;
}

/**
 * Extract component description from the first JSDoc block in the script.
 */
function extractDescription(scriptContent) {
	const match = scriptContent.match(/\/\*\*([\s\S]*?)\*\//);
	if (!match) return undefined;
	return match[1]
		.split('\n')
		.map(line => line.replace(/^\s*\*?\s?/, '').trim())
		.filter(Boolean)
		.join('\n');
}

/**
 * Process a single .svelte file.
 */
function processComponent(filePath) {
	const source = fs.readFileSync(filePath, 'utf-8');
	const ast = parse(source);

	// Extract script content using AST positions
	let scriptContent = '';
	if (ast.instance?.start !== undefined && ast.instance?.end !== undefined) {
		scriptContent = source.substring(ast.instance.start, ast.instance.end);
	}

	let moduleContent = '';
	if (ast.module?.start !== undefined && ast.module?.end !== undefined) {
		moduleContent = source.substring(ast.module.start, ast.module.end);
	}

	// Extract HTML content
	let htmlContent = '';
	if (ast.html?.start !== undefined && ast.html?.end !== undefined) {
		htmlContent = source.substring(ast.html.start, ast.html.end);
	}

	// Check if there's an interface for props (search in both module and instance)
	const fullScriptContent = moduleContent + '\n' + scriptContent;
	// Match both `export interface GraphProps` and `interface Props`
	const interfaceMatch = fullScriptContent.match(/(?:export\s+)?interface\s+(\w*(?:Props|Properties))/);
	const interfaceName = interfaceMatch ? interfaceMatch[1] : null;

	let props;
	if (interfaceName) {
		// Extract props from interface (search in full script content)
		props = extractPropsFromInterface(fullScriptContent, interfaceName);
		// Extract defaults from $props() destructuring
		const defaults = extractDefaults(scriptContent);
		// Merge defaults into props
		for (const prop of props) {
			if (defaults[prop.name] !== undefined) {
				prop.default = defaults[prop.name];
			}
		}
	} else {
		// Extract props from destructuring
		props = extractPropsFromDestructuring(scriptContent);
	}

	const moduleExports = extractModuleExports(moduleContent);
	const events = extractEvents(htmlContent);
	const slots = extractSlots(htmlContent);
	const description = extractDescription(scriptContent);

	return {
		props,
		moduleExports,
		events,
		slots,
		description
	};
}

/**
 * Find all .svelte files in src/lib/ recursively.
 */
function findComponents(dir) {
	const components = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			components.push(...findComponents(fullPath));
		} else if (entry.name.endsWith('.svelte')) {
			components.push(fullPath);
		}
	}

	return components;
}

// Main
const components = findComponents(LIB_DIR);
const metadata = {};

for (const compPath of components) {
	const relativePath = path.relative('src/lib', compPath);
	const componentName = path.basename(compPath, '.svelte');

	try {
		const info = processComponent(compPath);
		metadata[componentName] = {
			file: relativePath,
			...info
		};
	} catch (err) {
		console.error(`Error processing ${componentName}:`, err.message);
	}
}

fs.writeFileSync(OUTPUT, JSON.stringify(metadata, null, 2));
console.log(`Extracted metadata for ${Object.keys(metadata).length} components → ${OUTPUT}`);
