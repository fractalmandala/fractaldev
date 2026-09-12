// GraphQL → Markdown. Two inputs:
//   1. Introspection JSON (`{ __schema }` or `{ data: { __schema } }`) — rendered
//      dependency-free into rich field tables (the primary path).
//   2. SDL (`.graphql`/`.gql`) — parsed with the optional `graphql` peer and
//      emitted as grouped, printed definitions.
import {
	fence,
	heading,
	isArr,
	isObj,
	joinBlocks,
	mdTable,
	singleLine,
	slugify,
	str
} from './api-ref-md.js';
import type { ApiPage } from './api-ref-openapi.js';

/** Minimal shape of the `graphql` package this command drives (optional peer). */
export type GraphqlModule = {
	parse(source: string): unknown;
	print(node: unknown): string;
};

// ---------------------------------------------------------------------------
// Introspection JSON
// ---------------------------------------------------------------------------

function getSchema(doc: unknown): Record<string, unknown> | null {
	if (isObj(doc) && isObj(doc.__schema)) return doc.__schema;
	if (isObj(doc) && isObj(doc.data) && isObj(doc.data.__schema)) return doc.data.__schema;
	return null;
}

function typeRef(type: unknown): string {
	if (!isObj(type)) return 'Unknown';
	const kind = str(type.kind);
	if (kind === 'NON_NULL') return `${typeRef(type.ofType)}!`;
	if (kind === 'LIST') return `[${typeRef(type.ofType)}]`;
	return str(type.name, 'Unknown');
}

function isIntrospection(name: string): boolean {
	return name.startsWith('__');
}

function argsSummary(args: unknown): string {
	if (!isArr(args) || !args.length) return '';
	return args
		.filter(isObj)
		.map((a) => `${str(a.name)}: ${typeRef(a.type)}`)
		.join(', ');
}

function fieldsTable(type: Record<string, unknown>, fieldKey: 'fields' | 'inputFields'): string {
	const fields = isArr(type[fieldKey]) ? (type[fieldKey] as unknown[]).filter(isObj) : [];
	if (!fields.length) return '';
	const rows = fields.map((field) => {
		const args = fieldKey === 'fields' ? argsSummary(field.args) : '';
		const deprecated = field.isDeprecated === true ? ' _(deprecated)_' : '';
		return [
			`\`${str(field.name)}\``,
			args ? `\`(${args})\`` : '',
			`\`${typeRef(field.type)}\``,
			`${str(field.description)}${deprecated}`
		];
	});
	return mdTable(['Field', 'Arguments', 'Type', 'Description'], rows);
}

function operationBlock(
	label: string,
	typeNode: unknown,
	byName: Map<string, Record<string, unknown>>
): string {
	const name = isObj(typeNode) ? str(typeNode.name) : '';
	if (!name) return '';
	const type = byName.get(name);
	if (!type) return '';
	const table = fieldsTable(type, 'fields');
	const description = str(type.description);
	return joinBlocks([heading(2, label), description ? singleLine(description) : '', table]);
}

function typeSection(
	title: string,
	types: Record<string, unknown>[],
	render: (type: Record<string, unknown>) => string
): string {
	if (!types.length) return '';
	const sections = types.map((type) => {
		const name = str(type.name);
		const blocks = [heading(3, name)];
		if (str(type.description)) blocks.push(singleLine(type.description));
		const inner = render(type);
		if (inner) blocks.push(inner);
		return joinBlocks(blocks);
	});
	return `${heading(2, title)}\n\n${sections.join('\n\n')}`;
}

export function graphqlIntrospectionToMarkdown(doc: unknown): ApiPage {
	const schema = getSchema(doc);
	if (!schema) throw new Error('No GraphQL introspection schema (`__schema`) found.');
	const allTypes = isArr(schema.types) ? (schema.types as unknown[]).filter(isObj) : [];
	const byName = new Map<string, Record<string, unknown>>();
	for (const type of allTypes) byName.set(str(type.name), type);
	const named = allTypes.filter((t) => !isIntrospection(str(t.name)));

	const rootNames = new Set(
		[
			isObj(schema.queryType) ? str(schema.queryType.name) : '',
			isObj(schema.mutationType) ? str(schema.mutationType.name) : '',
			isObj(schema.subscriptionType) ? str(schema.subscriptionType.name) : ''
		].filter(Boolean)
	);

	const objects = named.filter((t) => str(t.kind) === 'OBJECT' && !rootNames.has(str(t.name)));
	const inputs = named.filter((t) => str(t.kind) === 'INPUT_OBJECT');
	const interfaces = named.filter((t) => str(t.kind) === 'INTERFACE');
	const unions = named.filter((t) => str(t.kind) === 'UNION');
	const enums = named.filter((t) => str(t.kind) === 'ENUM');
	const scalars = named.filter(
		(t) => str(t.kind) === 'SCALAR' && !['String', 'Int', 'Float', 'Boolean', 'ID'].includes(str(t.name))
	);

	const body = joinBlocks([
		operationBlock('Queries', schema.queryType, byName),
		operationBlock('Mutations', schema.mutationType, byName),
		operationBlock('Subscriptions', schema.subscriptionType, byName),
		typeSection('Types', objects, (t) => fieldsTable(t, 'fields')),
		typeSection('Inputs', inputs, (t) => fieldsTable(t, 'inputFields')),
		typeSection('Interfaces', interfaces, (t) => fieldsTable(t, 'fields')),
		typeSection('Unions', unions, (t) => {
			const possible = isArr(t.possibleTypes)
				? (t.possibleTypes as unknown[]).filter(isObj).map((p) => `\`${str(p.name)}\``)
				: [];
			return possible.length ? `Possible types: ${possible.join(', ')}` : '';
		}),
		typeSection('Enums', enums, (t) => {
			const values = isArr(t.enumValues) ? (t.enumValues as unknown[]).filter(isObj) : [];
			if (!values.length) return '';
			return mdTable(
				['Value', 'Description'],
				values.map((v) => [`\`${str(v.name)}\``, str(v.description)])
			);
		}),
		typeSection('Scalars', scalars, () => '')
	]);

	return { title: 'GraphQL Reference', description: '', slug: slugify('graphql-api'), body };
}

// ---------------------------------------------------------------------------
// SDL (requires the `graphql` peer)
// ---------------------------------------------------------------------------

const SDL_GROUPS: [string, string[]][] = [
	['Schema', ['SchemaDefinition']],
	['Types', ['ObjectTypeDefinition', 'ObjectTypeExtension']],
	['Inputs', ['InputObjectTypeDefinition']],
	['Interfaces', ['InterfaceTypeDefinition']],
	['Unions', ['UnionTypeDefinition']],
	['Enums', ['EnumTypeDefinition']],
	['Scalars', ['ScalarTypeDefinition']],
	['Directives', ['DirectiveDefinition']]
];

export function graphqlSdlToMarkdown(sdl: string, graphql: GraphqlModule): ApiPage {
	const document = graphql.parse(sdl);
	const definitions = isObj(document) && isArr(document.definitions) ? document.definitions : [];
	const title = 'GraphQL Reference';

	const sections = SDL_GROUPS.map(([groupTitle, kinds]) => {
		const matched = definitions.filter(
			(def): def is Record<string, unknown> => isObj(def) && kinds.includes(str(def.kind))
		);
		if (!matched.length) return '';
		const blocks = matched.map((def) => {
			const name = isObj(def.name) ? str(def.name.value) : str(def.kind);
			const description = isObj(def.description) ? str(def.description.value) : '';
			const printed = graphql.print(def);
			return joinBlocks([
				heading(3, name),
				description ? singleLine(description) : '',
				fence('graphql', printed)
			]);
		});
		return `${heading(2, groupTitle)}\n\n${blocks.join('\n\n')}`;
	});

	return { title, description: '', slug: slugify('graphql-api'), body: joinBlocks(sections) };
}
