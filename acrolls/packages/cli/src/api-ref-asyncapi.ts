// AsyncAPI → Markdown. Supports the 2.x shape (`channels[*].publish|subscribe`)
// and the 3.x shape (`channels[*].messages` + top-level `operations`), rendering
// channels, messages (with payload schemas + examples), operations, and schemas.
import {
	exampleFromSchema,
	fence,
	heading,
	isArr,
	isObj,
	joinBlocks,
	mdTable,
	propertiesTable,
	refName,
	resolveRef,
	singleLine,
	slugify,
	str
} from './api-ref-md.js';
import type { ApiPage } from './api-ref-openapi.js';

export function asyncapiToMarkdown(spec: unknown): ApiPage {
	const info = isObj(spec) && isObj(spec.info) ? spec.info : {};
	const title = str(info.title, 'AsyncAPI Reference');
	const body = joinBlocks([
		overview(spec),
		channels(spec),
		operations(spec),
		messages(spec),
		schemas(spec)
	]);
	return { title, description: str(info.description), slug: slugify(title), body };
}

function components(spec: unknown, key: string): Record<string, unknown> {
	const map = isObj(spec) && isObj(spec.components) ? spec.components[key] : {};
	return isObj(map) ? map : {};
}

function overview(spec: unknown): string {
	const info = isObj(spec) && isObj(spec.info) ? spec.info : {};
	const facts: (string | number | boolean | null | undefined)[][] = [];
	const asyncapiVersion = isObj(spec) ? str(spec.asyncapi) : '';
	if (asyncapiVersion) facts.push(['AsyncAPI', `\`${singleLine(asyncapiVersion)}\``]);
	if (str(info.version)) facts.push(['Version', `\`${singleLine(info.version)}\``]);
	if (isObj(info.license) && str(info.license.name)) facts.push(['License', singleLine(info.license.name)]);
	const servers = isObj(spec) && isObj(spec.servers) ? spec.servers : {};
	const serverRows = Object.entries(servers)
		.map(([name, server]) => {
			const resolved = resolveRef(spec, server);
			if (!isObj(resolved)) return null;
			return [
				`\`${name}\``,
				`\`${str(resolved.url)}\``,
				str(resolved.protocol),
				str(resolved.description)
			];
		})
		.filter((row): row is string[] => row !== null);
	const blocks = [
		facts.length ? mdTable(['Field', 'Value'], facts) : '',
		serverRows.length
			? `${heading(3, 'Servers')}\n\n${mdTable(['Name', 'URL', 'Protocol', 'Description'], serverRows)}`
			: ''
	];
	const inner = joinBlocks(blocks);
	return inner ? `${heading(2, 'Overview')}\n\n${inner}` : '';
}

function channelEntries(spec: unknown): [string, Record<string, unknown>][] {
	const map = isObj(spec) && isObj(spec.channels) ? spec.channels : {};
	return Object.entries(map).filter(([, value]) => isObj(value)) as [string, Record<string, unknown>][];
}

function channels(spec: unknown): string {
	const entries = channelEntries(spec);
	if (!entries.length) return '';
	const sections = entries.map(([key, channel]) => {
		const blocks = [heading(3, key)];
		// 3.x uses `address`; 2.x uses the channel key as the address.
		const address = str(channel.address) || key;
		if (address !== key) blocks.push(`Address: \`${singleLine(address)}\``);
		if (str(channel.description)) blocks.push(singleLine(channel.description));

		// 2.x publish/subscribe operations inline on the channel.
		const opRows: (string | null | undefined)[][] = [];
		for (const action of ['publish', 'subscribe'] as const) {
			const op = channel[action];
			if (!isObj(op)) continue;
			const message = resolveRef(spec, op.message);
			const messageName = isObj(message) ? str(message.name) || str(message.title) : '';
			opRows.push([`\`${action}\``, str(op.summary) || str(op.operationId), messageName ? `[${messageName}](#${slugify(messageName)})` : '']);
		}
		if (opRows.length) {
			blocks.push(`${heading(4, 'Operations')}\n\n${mdTable(['Action', 'Summary', 'Message'], opRows)}`);
		}

		// 3.x messages map inline on the channel.
		if (isObj(channel.messages)) {
			const names = Object.entries(channel.messages).map(
				([name, value]) => str(isObj(value) ? value.name : '') || name
			);
			if (names.length) blocks.push(`Messages: ${names.map((n) => `\`${n}\``).join(', ')}`);
		}
		return joinBlocks(blocks);
	});
	return `${heading(2, 'Channels')}\n\n${sections.join('\n\n')}`;
}

function operations(spec: unknown): string {
	// AsyncAPI 3.x: top-level `operations` map.
	const map = isObj(spec) && isObj(spec.operations) ? spec.operations : {};
	const entries = Object.entries(map).filter(([, value]) => isObj(value));
	if (!entries.length) return '';
	const rows = entries.map(([key, op]) => {
		const operation = op as Record<string, unknown>;
		const channelRef = isObj(operation.channel) ? str(operation.channel.$ref) : '';
		const channel = channelRef ? refName(channelRef) : '';
		const msgs = isArr(operation.messages)
			? (operation.messages as unknown[])
					.map((m) => (isObj(m) && typeof m.$ref === 'string' ? refName(m.$ref) : ''))
					.filter(Boolean)
					.join(', ')
			: '';
		return [`\`${key}\``, `\`${str(operation.action)}\``, channel ? `\`${channel}\`` : '', msgs];
	});
	return `${heading(2, 'Operations')}\n\n${mdTable(['Operation', 'Action', 'Channel', 'Messages'], rows)}`;
}

type Message = { name: string; message: Record<string, unknown> };

function collectMessages(spec: unknown): Message[] {
	const out = new Map<string, Record<string, unknown>>();
	const add = (name: string, node: unknown) => {
		const message = resolveRef(spec, node);
		if (isObj(message) && !out.has(name)) out.set(name, message);
	};
	// components.messages
	for (const [name, value] of Object.entries(components(spec, 'messages'))) {
		const resolved = resolveRef(spec, value);
		add(isObj(resolved) ? str(resolved.name) || name : name, value);
	}
	// 2.x inline channel messages
	for (const [, channel] of channelEntries(spec)) {
		for (const action of ['publish', 'subscribe'] as const) {
			const op = channel[action];
			if (isObj(op) && op.message) {
				const resolved = resolveRef(spec, op.message);
				const name = isObj(resolved) ? str(resolved.name) || str(resolved.title) : '';
				add(name || `${action}-message`, op.message);
			}
		}
		// 3.x inline channel messages
		if (isObj(channel.messages)) {
			for (const [name, value] of Object.entries(channel.messages)) {
				const resolved = resolveRef(spec, value);
				add(isObj(resolved) ? str(resolved.name) || name : name, value);
			}
		}
	}
	return [...out.entries()].map(([name, message]) => ({ name, message }));
}

function messages(spec: unknown): string {
	const all = collectMessages(spec);
	if (!all.length) return '';
	const sections = all.map(({ name, message }) => {
		const blocks = [heading(3, name)];
		const summary = str(message.summary) || str(message.title);
		const description = str(message.description);
		if (summary) blocks.push(`**${singleLine(summary)}**`);
		if (description && description !== summary) blocks.push(singleLine(description));
		if (str(message.contentType)) blocks.push(`Content type: \`${singleLine(message.contentType)}\``);
		if (isObj(message.headers)) {
			const table = propertiesTable(spec, message.headers);
			if (table) blocks.push(`${heading(4, 'Headers')}\n\n${table}`);
		}
		if (message.payload !== undefined) {
			const payloadBlocks = [heading(4, 'Payload')];
			const table = propertiesTable(spec, message.payload);
			if (table) payloadBlocks.push(table);
			const example = exampleFromSchema(spec, message.payload);
			if (example !== null && !(isObj(example) && !Object.keys(example).length)) {
				payloadBlocks.push(fence('json', JSON.stringify(example, null, 2)));
			}
			blocks.push(joinBlocks(payloadBlocks));
		}
		return joinBlocks(blocks);
	});
	return `${heading(2, 'Messages')}\n\n${sections.join('\n\n')}`;
}

function schemas(spec: unknown): string {
	const map = components(spec, 'schemas');
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
