import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { generateApiReference, type YamlModule } from './api-ref.js';
import { openapiToMarkdown } from './api-ref-openapi.js';
import { asyncapiToMarkdown } from './api-ref-asyncapi.js';
import {
	graphqlIntrospectionToMarkdown,
	graphqlSdlToMarkdown,
	type GraphqlModule
} from './api-ref-graphql.js';
import {
	mdTable,
	frontmatter,
	exampleFromSchema,
	resolveRef,
	schemaType,
	slugify
} from './api-ref-md.js';

// --- Fixtures --------------------------------------------------------------

const openApiSpec = {
	openapi: '3.0.3',
	info: { title: 'Pet Store', version: '1.0.0', description: 'Manage pets', license: { name: 'MIT' } },
	servers: [{ url: 'https://api.example.com', description: 'Prod' }],
	paths: {
		'/pets': {
			get: {
				tags: ['pets'],
				summary: 'List pets',
				operationId: 'listPets',
				parameters: [
					{ name: 'limit', in: 'query', required: false, schema: { type: 'integer' }, description: 'Max items' }
				],
				responses: {
					'200': {
						description: 'A list of pets',
						content: {
							'application/json': {
								schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } }
							}
						}
					}
				}
			},
			post: {
				tags: ['pets'],
				summary: 'Create a pet',
				operationId: 'createPet',
				requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } } },
				responses: { '201': { description: 'Created' } }
			}
		}
	},
	components: {
		schemas: {
			Pet: {
				type: 'object',
				required: ['id'],
				properties: { id: { type: 'integer' }, name: { type: 'string' }, tag: { type: 'string' } }
			}
		}
	}
};

const asyncApiSpec = {
	asyncapi: '2.6.0',
	info: { title: 'User Events', version: '1.0.0', description: 'User domain events' },
	channels: {
		'user/signedup': {
			description: 'A user signed up',
			subscribe: { summary: 'Receive signup', message: { $ref: '#/components/messages/UserSignedUp' } }
		}
	},
	components: {
		messages: {
			UserSignedUp: {
				name: 'UserSignedUp',
				title: 'User signed up',
				contentType: 'application/json',
				payload: { $ref: '#/components/schemas/User' }
			}
		},
		schemas: {
			User: {
				type: 'object',
				required: ['id'],
				properties: { id: { type: 'string' }, email: { type: 'string', format: 'email' } }
			}
		}
	}
};

const introspection = {
	__schema: {
		queryType: { name: 'Query' },
		mutationType: { name: 'Mutation' },
		types: [
			{
				kind: 'OBJECT',
				name: 'Query',
				fields: [
					{
						name: 'user',
						description: 'Get a user',
						args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'ID' } } }],
						type: { kind: 'OBJECT', name: 'User' },
						isDeprecated: false
					}
				]
			},
			{ kind: 'OBJECT', name: 'Mutation', fields: [{ name: 'createUser', args: [], type: { kind: 'OBJECT', name: 'User' } }] },
			{
				kind: 'OBJECT',
				name: 'User',
				description: 'A user',
				fields: [
					{ name: 'id', args: [], type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'ID' } } },
					{ name: 'email', args: [], type: { kind: 'SCALAR', name: 'String' } }
				]
			},
			{ kind: 'ENUM', name: 'Role', enumValues: [{ name: 'ADMIN', description: 'Admin' }, { name: 'USER' }] },
			{ kind: 'INPUT_OBJECT', name: 'UserInput', inputFields: [{ name: 'email', type: { kind: 'SCALAR', name: 'String' } }] },
			{ kind: 'SCALAR', name: 'ID' },
			{ kind: 'SCALAR', name: 'String' },
			{ kind: 'OBJECT', name: '__Schema', fields: [] }
		]
	}
};

const fakeGraphql: GraphqlModule = {
	parse: () => ({
		definitions: [
			{ kind: 'ObjectTypeDefinition', name: { value: 'User' }, description: { value: 'A user' } },
			{ kind: 'EnumTypeDefinition', name: { value: 'Role' } }
		]
	}),
	print: (node: unknown) => {
		const def = node as { name?: { value?: string } };
		return def?.name?.value ? `type ${def.name.value} {}` : 'schema {}';
	}
};

// --- Helpers ---------------------------------------------------------------

async function inTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
	const dir = await mkdtemp(resolve(tmpdir(), 'acrolls-api-ref-'));
	const cwd = process.cwd();
	process.chdir(dir);
	try {
		return await fn(dir);
	} finally {
		process.chdir(cwd);
		await rm(dir, { recursive: true, force: true });
	}
}

// --- Markdown + schema helpers --------------------------------------------

describe('api-ref markdown helpers', () => {
	it('escapes pipes/newlines in table cells and fills empties with an em dash', () => {
		const md = mdTable(['A', 'B'], [['x|y', ''], ['line1\nline2', 'ok']]);
		expect(md).toContain('x\\|y');
		expect(md).toContain('line1<br>line2');
		expect(md).toContain('| — |');
	});

	it('quotes frontmatter values with colons and skips empties', () => {
		const fm = frontmatter({ title: 'API: v2', description: '', order: 3 });
		expect(fm.startsWith('---\n')).toBe(true);
		expect(fm).toContain('title: "API: v2"');
		expect(fm).not.toContain('description');
		expect(fm).toContain('order: 3');
	});

	it('synthesizes examples and honours enums', () => {
		const ex = exampleFromSchema(
			{},
			{
				type: 'object',
				properties: {
					id: { type: 'integer' },
					kind: { type: 'string', enum: ['a', 'b'] },
					tags: { type: 'array', items: { type: 'string' } }
				}
			}
		) as Record<string, unknown>;
		expect(ex.id).toBe(0);
		expect(ex.kind).toBe('a');
		expect(ex.tags).toEqual(['string']);
	});

	it('terminates on cyclic $ref schemas', () => {
		const root = {
			components: { schemas: { Node: { type: 'object', properties: { next: { $ref: '#/components/schemas/Node' } } } } }
		};
		const ex = exampleFromSchema(root, { $ref: '#/components/schemas/Node' });
		expect(ex).toEqual({ next: {} });
	});

	it('resolves local $refs and labels types', () => {
		const root = { components: { schemas: { Pet: { type: 'object', properties: { name: { type: 'string' } } } } } };
		expect(schemaType(root, { $ref: '#/components/schemas/Pet' })).toBe('Pet');
		expect(schemaType(root, { type: 'array', items: { $ref: '#/components/schemas/Pet' } })).toBe('array[Pet]');
		expect(schemaType(root, { type: 'integer', format: 'int32' })).toBe('integer (int32)');
		expect(resolveRef(root, { $ref: '#/components/schemas/Pet' })).toMatchObject({ type: 'object' });
	});

	it('slugifies titles', () => {
		expect(slugify('Pet Store API!')).toBe('pet-store-api');
	});
});

// --- Generators ------------------------------------------------------------

describe('openapiToMarkdown', () => {
	const page = openapiToMarkdown(openApiSpec);
	it('derives title, description, and slug from info', () => {
		expect(page.title).toBe('Pet Store');
		expect(page.description).toBe('Manage pets');
		expect(page.slug).toBe('pet-store');
	});
	it('groups operations under their tag and renders method headings', () => {
		expect(page.body).toContain('## pets');
		expect(page.body).toContain('### GET /pets');
		expect(page.body).toContain('### POST /pets');
	});
	it('renders parameters, request body, responses, and a typed example', () => {
		expect(page.body).toContain('| Name | In | Type | Required | Description |');
		expect(page.body).toContain('`limit`');
		expect(page.body).toContain('Request body');
		expect(page.body).toContain('```json');
		expect(page.body).toContain('| Status | Description | Schema |');
		expect(page.body).toContain('`200`');
	});
	it('renders component schemas and the overview', () => {
		expect(page.body).toContain('## Schemas');
		expect(page.body).toContain('### Pet');
		expect(page.body).toContain('| Name | Type | Required | Description |');
		expect(page.body).toContain('## Overview');
		expect(page.body).toContain('https://api.example.com');
	});
	it('emits no leading H1 (the shell renders the frontmatter title)', () => {
		expect(page.body.startsWith('# ')).toBe(false);
	});
});

describe('asyncapiToMarkdown', () => {
	const page = asyncapiToMarkdown(asyncApiSpec);
	it('renders channels, messages, payload schema + example, and schemas', () => {
		expect(page.title).toBe('User Events');
		expect(page.body).toContain('## Channels');
		expect(page.body).toContain('### user/signedup');
		expect(page.body).toContain('## Messages');
		expect(page.body).toContain('### UserSignedUp');
		expect(page.body).toContain('application/json');
		expect(page.body).toContain('## Schemas');
		expect(page.body).toContain('### User');
		expect(page.body).toContain('```json');
	});
});

describe('graphqlIntrospectionToMarkdown', () => {
	const page = graphqlIntrospectionToMarkdown(introspection);
	it('renders root operations and types with field tables', () => {
		expect(page.body).toContain('## Queries');
		expect(page.body).toContain('## Mutations');
		expect(page.body).toContain('| Field | Arguments | Type | Description |');
		expect(page.body).toContain('`user`');
		expect(page.body).toContain('(id: ID!)');
		expect(page.body).toContain('## Types');
		expect(page.body).toContain('### User');
		expect(page.body).toContain('## Enums');
		expect(page.body).toContain('`ADMIN`');
		expect(page.body).toContain('## Inputs');
		expect(page.body).toContain('### UserInput');
	});
	it('omits introspection meta types', () => {
		expect(page.body).not.toContain('__Schema');
	});
	it('throws when there is no __schema', () => {
		expect(() => graphqlIntrospectionToMarkdown({})).toThrow(/__schema/);
	});
});

describe('graphqlSdlToMarkdown', () => {
	it('groups and prints definitions via the graphql peer', () => {
		const page = graphqlSdlToMarkdown('type User { id: ID }', fakeGraphql);
		expect(page.body).toContain('## Types');
		expect(page.body).toContain('### User');
		expect(page.body).toContain('A user');
		expect(page.body).toContain('```graphql');
		expect(page.body).toContain('## Enums');
		expect(page.body).toContain('### Role');
	});
});

// --- Orchestration ---------------------------------------------------------

describe('generateApiReference', () => {
	it('fails when the spec is missing', async () => {
		await inTempDir(async () => {
			const res = await generateApiReference({ input: 'nope.json' });
			expect(res.ok).toBe(false);
			if (!res.ok) expect(res.message).toMatch(/not found/i);
		});
	});

	it('writes a Markdown page from a JSON OpenAPI spec', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'petstore.json'), JSON.stringify(openApiSpec));
			const res = await generateApiReference({ input: 'petstore.json', out: 'docs/api' });
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.written).toBe(true);
				expect(res.pages).toHaveLength(1);
				expect(res.pages[0].format).toBe('openapi');
				const md = await readFile(resolve(dir, 'docs/api/pet-store.md'), 'utf8');
				expect(md.startsWith('---\n')).toBe(true);
				expect(md).toContain('title: Pet Store');
				expect(md).toContain('### GET /pets');
			}
		});
	});

	it('honours dry-run and writes nothing', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'petstore.json'), JSON.stringify(openApiSpec));
			const res = await generateApiReference({ input: 'petstore.json', dryRun: true });
			expect(res.ok).toBe(true);
			if (res.ok) expect(res.written).toBe(false);
			await expect(readFile(resolve(dir, 'content/api/pet-store.md'), 'utf8')).rejects.toBeTruthy();
		});
	});

	it('walks a directory and generates one page per spec', async () => {
		await inTempDir(async (dir) => {
			await mkdir(resolve(dir, 'specs'));
			await writeFile(resolve(dir, 'specs/petstore.json'), JSON.stringify(openApiSpec));
			await writeFile(resolve(dir, 'specs/events.json'), JSON.stringify(asyncApiSpec));
			const res = await generateApiReference({ input: 'specs' });
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.pages).toHaveLength(2);
				expect(res.pages.map((p) => p.format).sort()).toEqual(['asyncapi', 'openapi']);
			}
		});
	});

	it('uses an injected YAML parser for .yaml specs', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'spec.yaml'), 'openapi: 3.0.0\ninfo:\n  title: YAML API\n');
			const yaml: YamlModule = { parse: () => openApiSpec };
			const res = await generateApiReference({ input: 'spec.yaml', yaml });
			expect(res.ok).toBe(true);
			if (res.ok) expect(res.pages[0].format).toBe('openapi');
		});
	});

	it('returns install guidance when YAML is needed but unavailable', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'spec.yaml'), 'openapi: 3.0.0\n');
			const res = await generateApiReference({ input: 'spec.yaml', yaml: null });
			expect(res.ok).toBe(false);
			if (!res.ok) expect(res.message).toMatch(/yaml/i);
		});
	});

	it('detects GraphQL introspection JSON without any dependency', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'schema.json'), JSON.stringify(introspection));
			const res = await generateApiReference({ input: 'schema.json' });
			expect(res.ok).toBe(true);
			if (res.ok) expect(res.pages[0].format).toBe('graphql');
		});
	});

	it('uses an injected graphql parser for .graphql SDL', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'schema.graphql'), 'type User { id: ID }');
			const res = await generateApiReference({ input: 'schema.graphql', graphql: fakeGraphql });
			expect(res.ok).toBe(true);
			if (res.ok) expect(res.pages[0].format).toBe('graphql');
		});
	});

	it('returns install guidance when SDL needs graphql but it is unavailable', async () => {
		await inTempDir(async (dir) => {
			await writeFile(resolve(dir, 'schema.graphql'), 'type User { id: ID }');
			const res = await generateApiReference({ input: 'schema.graphql', graphql: null });
			expect(res.ok).toBe(false);
			if (!res.ok) expect(res.message).toMatch(/graphql/i);
		});
	});
});
