import type { DocSection, DocHeader, LoadedDocSection } from './types';
import { marked } from 'marked';
import { browser } from '$app/environment';

// Configure marked with default options
marked.setOptions({
	breaks: true,
	gfm: true
});

// Function to parse headers from markdown content
function parseMarkdownHeaders(markdownContent: string): DocHeader[] {
	const headers: DocHeader[] = [];
	const lines = markdownContent.split('\n');
	const anchorCounts = new Map<string, number>();
	const hierarchyStack: string[] = []; // Track hierarchy for context

	for (const line of lines) {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const title = match[2].trim();

			// Clean the hierarchy stack to current level
			while (hierarchyStack.length >= level) {
				hierarchyStack.pop();
			}

			// Create base anchor from title
			const titleAnchor = title
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();

			// Build contextual anchor with hierarchy
			let contextualAnchor = titleAnchor;
			if (hierarchyStack.length > 0) {
				// For sub-headers, include parent context
				const parentContext = hierarchyStack[hierarchyStack.length - 1];
				contextualAnchor = `${parentContext}-${titleAnchor}`;
			}

			// Make anchor globally unique by adding counter if needed
			let finalAnchor = contextualAnchor;
			if (anchorCounts.has(contextualAnchor)) {
				const count = anchorCounts.get(contextualAnchor)! + 1;
				anchorCounts.set(contextualAnchor, count);
				finalAnchor = `${contextualAnchor}-${count}`;
			} else {
				anchorCounts.set(contextualAnchor, 1);
			}

			// Add current title to hierarchy stack for children
			hierarchyStack.push(titleAnchor);

			headers.push({
				id: `header-${finalAnchor}`,
				title,
				level,
				anchor: finalAnchor
			});
		}
	}

	return headers;
}

// Function to add anchor IDs to HTML headers
function addHeaderAnchors(html: string, headers: DocHeader[]): string {
	let htmlWithAnchors = html;
	let headerIndex = 0;

	// Replace h1-h6 tags with anchor IDs
	htmlWithAnchors = htmlWithAnchors.replace(
		/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g,
		(match, level, attrs, content) => {
			if (headerIndex < headers.length) {
				const header = headers[headerIndex];
				headerIndex++;
				return `<h${level}${attrs} id="${header.anchor}">${content}</h${level}>`;
			}
			return match;
		}
	);

	return htmlWithAnchors;
}

export const load = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {
	try {
		// Load sections configuration
		const response = await fetch('/docs/sections.json');
		if (!response.ok) {
			throw new Error(`Failed to fetch sections: ${response.status}`);
		}

		const sections: DocSection[] = await response.json();
		if (!Array.isArray(sections) || sections.length === 0) {
			return { sections: [], error: 'No documentation sections found' };
		}

		// Load all content in parallel
		const loadPromises = sections.map(async (section): Promise<LoadedDocSection> => {
			if (!section.file) {
				return {
					...section,
					content: '',
					headers: [],
					error: 'No file specified'
				};
			}

			try {
				const contentResponse = await fetch(`/docs/${section.file}`);
				if (!contentResponse.ok) {
					throw new Error(`${contentResponse.status} ${contentResponse.statusText}`);
				}

				const rawContent = await contentResponse.text();

				// Parse headers from markdown before converting to HTML
				const headers = parseMarkdownHeaders(rawContent);

				// Convert to HTML
				const html = marked.parse(rawContent);
				let content = typeof html === 'string' ? html.trim() : '';

				// Sanitize HTML only in browser environment
				const win = typeof window !== 'undefined' ? (window as unknown as { DOMPurify?: { sanitize: (s: string) => string } }) : null;
				if (browser && win?.DOMPurify) {
					content = win.DOMPurify.sanitize(content);
				}

				// Add anchor IDs to headers
				content = addHeaderAnchors(content, headers);

				return { ...section, content, headers };
			} catch (error) {
				console.error(`Failed to load ${section.id}:`, error);
				const errorHtml = marked.parse(`# Error Loading ${section.title}\n\n${error}`);
				let content = typeof errorHtml === 'string' ? errorHtml.trim() : '';

				// Sanitize HTML only in browser environment
				const win = typeof window !== 'undefined' ? (window as unknown as { DOMPurify?: { sanitize: (s: string) => string } }) : null;
				if (browser && win?.DOMPurify) {
					content = win.DOMPurify.sanitize(content);
				}

				return {
					...section,
					content,
					headers: [],
					error: String(error)
				};
			}
		});

		const loadedSections = await Promise.all(loadPromises);

		// Sort sections
		const sortedSections = loadedSections.sort((a, b) => {
			if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
			return a.sectionOrder - b.sectionOrder;
		});

		// Group by category
		const groupedSections = sortedSections.reduce(
			(groups, section) => {
				if (!groups[section.category]) groups[section.category] = [];
				groups[section.category].push(section);
				return groups;
			},
			{} as Record<string, LoadedDocSection[]>
		);

		// Get sorted categories
		const categoryOrder = new Map<string, number>();
		sections.forEach((section) => {
			if (!categoryOrder.has(section.category)) {
				categoryOrder.set(section.category, section.categoryOrder);
			}
		});

		const sortedCategories = Object.keys(groupedSections).sort(
			(a, b) => (categoryOrder.get(a) || 0) - (categoryOrder.get(b) || 0)
		);

		return {
			sections: sortedSections,
			groupedSections,
			sortedCategories,
			selectedSection: sortedSections[0] || null
		};
	} catch (error) {
		console.error('Failed to load documentation:', error);
		return {
			sections: [],
			error: `Failed to load documentation: ${error}`
		};
	}
};
