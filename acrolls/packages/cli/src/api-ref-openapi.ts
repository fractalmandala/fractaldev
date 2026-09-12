// OpenAPI → Markdown. Handles OpenAPI 3.x and degrades gracefully for Swagger
// 2.0 (`definitions`, body parameters). Operations are grouped by tag so they
// land at heading level 3 — inside the shell's default TOC range (levels 2–3).
import {
	exampleFromSchema,
	fence,
	heading,
	isArr,
	isObj,
	joinBlocks,
	mdTable,
	propertiesTable,
	resolveRef,
	schemaType,
	singleLine,
	slugify,
	str
} from './api-ref-md.js';

export type ApiPage = { title: string; description: string; slug: string; body: string };

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

export function openapiToMarkdown(spec: unknown): ApiPage {
	const info = isObj(spec) && isObj(spec.info) ? spec.info : {};
	const title = str(info.title, 'API Reference');
	const body = joinBlocks([
		overview(spec),
		operations(spec),
		schemas(spec),
		security(spec)
	]);
	return {
		title,
		description: str(info.summary) || str(info.description),
		slug: slugify(title),
		body
	};
}

function pickContainer(spec: unknown, ...keys: string[]): Record<string, unknown> {
	// OpenAPI 3.x nests under `components`; Swagger 2.0 keeps maps at the root.
	if (!isObj(spec)) return {};
	const components = isObj(spec.components) ? spec.components : {};
	for (const key of keys) {
		const fromComponents = components[key];
		if (isObj(fromComponents)) return fromComponents;
		const fromRoot = spec[key];
		if (isObj(fromRoot)) return fromRoot;
	}
	return {};
}

function overview(spec: unknown): string {
	if (!isObj(spec)) return '';
	const info = isObj(spec.info) ? spec.info : {};
	const facts: (string | number | boolean | null | undefined)[][] = [];
	if (str(info.version)) facts.push(['Version', `\`${singleLine(info.version)}\``]);
	if (isObj(info.license) && str(info.license.name)) {
		const url = str(info.license.url);
		facts.push(['License', url ? `[${singleLine(info.license.name)}](${url})` : singleLine(info.license.name)]);
	}
	if (str(info.termsOfService)) facts.push(['Terms', `[${str(info.termsOfService)}](${str(info.termsOfService)})`]);
	if (isObj(info.contact) && str(info.contact.email)) facts.push(['Contact', singleLine(info.contact.email)]);

	const servers = isArr(spec.servers)
		? (spec.servers as unknown[])
		: typeof spec.host === 'string'
			? [{ url: `${(isArr(spec.schemes) ? str(spec.schemes[0]) : '') || 'https'}://${spec.host}${str(spec.basePath)}` }]
			: [];
	const serverRows = servers
		.filter(isObj)
		.map((server) => [`\`${singleLine(server.url)}\``, str(server.description)]);

	const blocks = [
		facts.length ? mdTable(['Field', 'Value'], facts) : '',
		serverRows.length ? `${heading(3, 'Servers')}\n\n${mdTable(['URL', 'Description'], serverRows)}` : ''
	];
	const inner = joinBlocks(blocks);
	return inner ? `${heading(2, 'Overview')}\n\n${inner}` : '';
}

type Operation = { path: string; method: string; tag: string; op: Record<string, unknown> };

function collectOperations(spec: unknown): Operation[] {
	const paths = isObj(spec) && isObj(spec.paths) ? spec.paths : {};
	const out: Operation[] = [];
	for (const [path, item] of Object.entries(paths)) {
		if (!isObj(item)) continue;
		for (const method of METHODS) {
			const op = item[method];
			if (!isObj(op)) continue;
			const tags = isArr(op.tags) && op.tags.length ? op.tags.map((t) => String(t)) : ['Operations'];
			for (const tag of tags) out.push({ path, method, tag, op });
		}
	}
	return out;
}

function operations(spec: unknown): string {
	const all = collectOperations(spec);
	if (!all.length) return '';
	const byTag = new Map<string, Operation[]>();
	for (const entry of all) {
		const list = byTag.get(entry.tag) ?? [];
		list.push(entry);
		byTag.set(entry.tag, list);
	}
	const sections = [...byTag.entries()].map(([tag, list]) => {
		const rendered = list.map((entry) => renderOperation(spec, entry)).join('\n\n');
		return `${heading(2, tag)}\n\n${rendered}`;
	});
	return sections.join('\n\n');
}

function renderOperation(spec: unknown, { path, method, op }: Operation): string {
	const blocks: string[] = [];
	blocks.push(heading(3, `${method.toUpperCase()} ${path}`));
	const summary = str(op.summary);
	const description = str(op.description);
	if (summary) blocks.push(`**${singleLine(summary)}**`);
	if (description && description !== summary) blocks.push(singleLine(description));
	if (str(op.operationId)) blocks.push(`\`operationId: ${singleLine(op.operationId)}\``);
	if (op.deprecated === true) blocks.push('> **Deprecated.**');

	const params = parametersTable(spec, op);
	if (params) blocks.push(params);

	const body = requestBody(spec, op);
	if (body) blocks.push(body);

	const responses = responseSection(spec, op);
	if (responses) blocks.push(responses);

	return joinBlocks(blocks);
}

function parametersTable(spec: unknown, op: Record<string, unknown>): string {
	const raw = isArr(op.parameters) ? (op.parameters as unknown[]) : [];
	const rows = raw
		.map((p) => resolveRef(spec, p))
		.filter(isObj)
		// Swagger 2.0 body params are rendered in the request-body section instead.
		.filter((p) => str(p.in) !== 'body')
		.map((p) => {
			const schema = isObj(p.schema) ? p.schema : p; // 2.0 puts type on the parameter
			return [
				`\`${str(p.name)}\``,
				str(p.in),
				schemaType(spec, schema),
				p.required === true ? 'yes' : 'no',
				str(p.description)
			];
		});
	if (!rows.length) return '';
	return `${heading(4, 'Parameters')}\n\n${mdTable(['Name', 'In', 'Type', 'Required', 'Description'], rows)}`;
}

function primaryMedia(content: unknown): { type: string; media: Record<string, unknown> } | null {
	if (!isObj(content)) return null;
	const entries = Object.entries(content).filter(([, value]) => isObj(value));
	if (!entries.length) return null;
	const json = entries.find(([type]) => type.includes('json'));
	const [type, media] = json ?? entries[0]!;
	return { type, media: media as Record<string, unknown> };
}

function requestBody(spec: unknown, op: Record<string, unknown>): string {
	// OpenAPI 3.x
	const rb = resolveRef(spec, op.requestBody);
	if (isObj(rb) && isObj(rb.content)) {
		const picked = primaryMedia(rb.content);
		if (picked) return renderBodySchema(spec, picked.type, picked.media, str(rb.description));
	}
	// Swagger 2.0: a parameter with `in: body`
	const raw = isArr(op.parameters) ? (op.parameters as unknown[]) : [];
	for (const p of raw) {
		const param = resolveRef(spec, p);
		if (isObj(param) && str(param.in) === 'body' && isObj(param.schema)) {
			return renderBodySchema(spec, 'application/json', { schema: param.schema }, str(param.description));
		}
	}
	return '';
}

function renderBodySchema(
	spec: unknown,
	mediaType: string,
	media: Record<string, unknown>,
	description: string
): string {
	const schema = media.schema;
	const blocks = [
		`${heading(4, 'Request body')} — \`${mediaType}\`${description ? ` — ${singleLine(description)}` : ''}`
	];
	const example = 'example' in media ? media.example : exampleFromSchema(spec, schema);
	if (example !== undefined && example !== null) blocks.push(fence('json', JSON.stringify(example, null, 2)));
	const table = propertiesTable(spec, schema);
	if (table) blocks.push(table);
	return joinBlocks(blocks);
}

function responseSection(spec: unknown, op: Record<string, unknown>): string {
	const responses = isObj(op.responses) ? op.responses : {};
	const statuses = Object.keys(responses);
	if (!statuses.length) return '';
	const rows: (string | number | boolean | null | undefined)[][] = [];
	let exampleBlock = '';
	for (const status of statuses) {
		const response = resolveRef(spec, responses[status]);
		if (!isObj(response)) continue;
		const picked = primaryMedia(response.content) ??
			(isObj(response.schema) ? { type: 'application/json', media: { schema: response.schema } } : null);
		const type = picked ? schemaType(spec, picked.media.schema) : '';
		rows.push([`\`${status}\``, str(response.description), type ? `\`${type}\`` : '']);
		// Show one example, for the first success response that has a schema.
		if (!exampleBlock && status.startsWith('2') && picked) {
			const media = picked.media;
			const example = 'example' in media ? media.example : exampleFromSchema(spec, media.schema);
			if (example !== undefined && example !== null) {
				exampleBlock = `${heading(4, `${status} example`)}\n\n${fence('json', JSON.stringify(example, null, 2))}`;
			}
		}
	}
	const table = mdTable(['Status', 'Description', 'Schema'], rows);
	return joinBlocks([`${heading(4, 'Responses')}\n\n${table}`, exampleBlock]);
}

function schemas(spec: unknown): string {
	const map = pickContainer(spec, 'schemas', 'definitions');
	const entries = Object.entries(map);
	if (!entries.length) return '';
	const sections = entries.map(([name, schema]) => {
		const resolved = resolveRef(spec, schema);
		const blocks = [heading(3, name)];
		const description = isObj(resolved) ? str(resolved.description) : '';
		if (description) blocks.push(singleLine(description));
		const table = propertiesTable(spec, schema);
		if (table) blocks.push(table);
		const example = exampleFromSchema(spec, schema);
		if (example !== null && !(isObj(example) && !Object.keys(example).length)) {
			blocks.push(`${heading(4, 'Example')}\n\n${fence('json', JSON.stringify(example, null, 2))}`);
		}
		return joinBlocks(blocks);
	});
	return `${heading(2, 'Schemas')}\n\n${sections.join('\n\n')}`;
}

function security(spec: unknown): string {
	const map = pickContainer(spec, 'securitySchemes', 'securityDefinitions');
	const entries = Object.entries(map);
	if (!entries.length) return '';
	const rows = entries.map(([name, scheme]) => {
		const resolved = resolveRef(spec, scheme);
		const type = isObj(resolved) ? str(resolved.type) : '';
		const detail = isObj(resolved)
			? str(resolved.scheme) || str(resolved.in) || str(resolved.flow) || str(resolved.name)
			: '';
		const description = isObj(resolved) ? str(resolved.description) : '';
		return [`\`${name}\``, type, detail, description];
	});
	return `${heading(2, 'Security')}\n\n${mdTable(['Scheme', 'Type', 'Detail', 'Description'], rows)}`;
}
