import type { StandardSchemaV1 } from './collection.js';

/**
 * The blessed frontmatter schemas — a ready-made Standard Schema for the fields every Acrolls docs
 * surface reads, so a host does not hand-write one and does not annotate 65 files to get titles.
 *
 * Hand-written (no Zod/Valibot/Arktype), so `@acrolls/docs` stays dependency-free. Each schema is a
 * *passthrough*: it validates and normalizes the fields it owns and spreads the rest of the
 * frontmatter through untouched, so SEO/search/AI keys the engine and add-ons read still survive.
 *
 * A genre is a layered stack — `content({ schema: acrollsFields.post })` is `[page, postOnly]` — and
 * `content()` merges the layers left→right. Layer your own fields on top:
 *
 * ```ts
 * content({ loader, config, schema: [acrollsFields.page, mySchema] })
 * ```
 */

/** Nav-only IA hints (P20): `sidebar.{order,label}` is the canonical spelling; flat `order` remains a working alias. */
export type AcrollsSidebarFields = {
	order?: number;
	label?: string;
};

/** The fields every Acrolls docs surface reads off a page. `title` is required; the rest carry defaults. */
export type AcrollsPageFields = {
	title: string;
	description?: string;
	order?: number;
	sidebar?: AcrollsSidebarFields;
	hidden: boolean;
	draft: boolean;
	badge?: string;
	related: string[];
	redirect_from?: string | string[];
};

/** Extra fields a blog post carries beyond a page. */
export type AcrollsPostFields = {
	date: string;
	author?: string;
	tags: string[];
};

/** Extra fields a changelog entry carries beyond a page. */
export type AcrollsChangeFields = {
	version: string;
	date: string;
};

const isString = (value: unknown): value is string => typeof value === 'string';

const stringArray = (value: unknown, field: string): string[] => {
	if (value === undefined) return [];
	if (isString(value)) return [value];
	if (Array.isArray(value) && value.every(isString)) return value;
	throw new Error(`\`${field}\` must be a string or an array of strings`);
};

/**
 * Build a hand-written Standard Schema from a `(rawFrontmatter) => normalizedFields` function.
 * `run` throws a plain `Error` on invalid input; the message becomes the single validation issue.
 * The output spreads the raw frontmatter first so unrecognized keys pass through unchanged.
 */
function schema<Output extends Record<string, unknown>>(
	vendor: string,
	run: (data: Record<string, unknown>) => Output
): StandardSchemaV1<unknown, Output> {
	return {
		'~standard': {
			version: 1,
			vendor,
			validate(value: unknown) {
				const data = (value ?? {}) as Record<string, unknown>;
				try {
					return { value: { ...data, ...run(data) } as Output };
				} catch (error) {
					return { issues: [{ message: error instanceof Error ? error.message : String(error) }] };
				}
			}
		}
	};
}

const page = schema<AcrollsPageFields>('acrolls/page', (data) => {
	if (!isString(data.title) || data.title.trim() === '') {
		throw new Error('frontmatter needs a non-empty `title`');
	}

	const description = isString(data.description)
		? data.description
		: isString(data.brief)
			? data.brief
			: undefined;

	if (data.order !== undefined && typeof data.order !== 'number') {
		throw new Error('`order` must be a number');
	}
	if (data.hidden !== undefined && typeof data.hidden !== 'boolean') {
		throw new Error('`hidden` must be a boolean');
	}
	if (data.draft !== undefined && typeof data.draft !== 'boolean') {
		throw new Error('`draft` must be a boolean');
	}
	if (data.badge !== undefined && !isString(data.badge)) {
		throw new Error('`badge` must be a string');
	}
	const sidebar = data.sidebar === null ? undefined : (data.sidebar as Record<string, unknown> | undefined);
	if (sidebar !== undefined && (typeof sidebar !== 'object' || Array.isArray(sidebar))) {
		throw new Error('`sidebar` must be an object');
	}
	if (sidebar?.order !== undefined && typeof sidebar.order !== 'number') {
		throw new Error('`sidebar.order` must be a number');
	}
	if (sidebar?.label !== undefined && !isString(sidebar.label)) {
		throw new Error('`sidebar.label` must be a string');
	}

	const fields: AcrollsPageFields = {
		title: data.title,
		hidden: data.hidden === true,
		draft: data.draft === true,
		related: stringArray(data.related, 'related')
	};
	if (description !== undefined) fields.description = description;
	if (typeof data.order === 'number') fields.order = data.order;
	if (sidebar && (sidebar.order !== undefined || sidebar.label !== undefined)) {
		fields.sidebar = {};
		if (typeof sidebar.order === 'number') fields.sidebar.order = sidebar.order;
		if (isString(sidebar.label)) fields.sidebar.label = sidebar.label;
	}
	if (isString(data.badge)) fields.badge = data.badge;
	if (data.redirect_from !== undefined) {
		fields.redirect_from = isString(data.redirect_from)
			? data.redirect_from
			: stringArray(data.redirect_from, 'redirect_from');
	}
	return fields;
});

const postOnly = schema<AcrollsPostFields>('acrolls/post', (data) => {
	if (!isString(data.date) || data.date.trim() === '') {
		throw new Error('a post needs a `date`');
	}
	if (data.author !== undefined && !isString(data.author)) {
		throw new Error('`author` must be a string');
	}
	const fields: AcrollsPostFields = { date: data.date, tags: stringArray(data.tags, 'tags') };
	if (isString(data.author)) fields.author = data.author;
	return fields;
});

const changeOnly = schema<AcrollsChangeFields>('acrolls/change', (data) => {
	if (!isString(data.version) || data.version.trim() === '') {
		throw new Error('a changelog entry needs a `version`');
	}
	if (!isString(data.date) || data.date.trim() === '') {
		throw new Error('a changelog entry needs a `date`');
	}
	return { version: data.version, date: data.date };
});

/**
 * The blessed schema family. `page` is the universal base; `post` and `change` are pre-layered genre
 * stacks (base + genre extras) that `content({ schema })` merges left→right.
 */
export const acrollsFields = {
	/** Docs/page frontmatter — the universal base. */
	page,
	/** Blog-post frontmatter — `page` plus `date`/`author`/`tags`. */
	post: [page, postOnly] as [typeof page, typeof postOnly],
	/** Changelog frontmatter — `page` plus `version`/`date`. */
	change: [page, changeOnly] as [typeof page, typeof changeOnly]
};
