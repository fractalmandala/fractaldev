import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const resultsDir = resolve(new URL('../testing-results/', import.meta.url).pathname);
const ignored = new Set(['README.md', 'INDEX.md', 'QUEUE.md', '_TEMPLATE.md']);
const requiredFields = ['id', 'title', 'date', 'status', 'verdict', 'skill', 'target', 'attempt'];
const requiredHeadings = [
	'## prompt to agent',
	'## expected outcome',
	'## agent final receipt',
	'## observed outcome',
	'## verification evidence',
	'## assessment',
	'## improvement queue',
	'## retest'
];
const statuses = new Set(['planned', 'running', 'recorded', 'improving', 'retest', 'closed']);
const verdicts = new Set(['qualified', 'not-qualified', 'blocked', 'superseded']);

function readFrontmatter(text, file) {
	const match = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!match) throw new Error(`${file}: missing frontmatter`);
	const fields = {};
	for (const line of match[1].split('\n')) {
		const separator = line.indexOf(':');
		if (separator < 1) continue;
		fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
	}
	return fields;
}

const files = readdirSync(resultsDir)
	.filter((file) => file.endsWith('.md') && !ignored.has(file))
	.sort();
const ids = new Set();
const errors = [];

for (const file of files) {
	const path = join(resultsDir, file);
	const text = readFileSync(path, 'utf8');
	let fields;
	try {
		fields = readFrontmatter(text, file);
	} catch (error) {
		errors.push(error.message);
		continue;
	}
	for (const field of requiredFields) {
		if (!fields[field]) errors.push(`${file}: missing frontmatter field '${field}'`);
	}
	if (fields.id && ids.has(fields.id)) errors.push(`${file}: duplicate test id '${fields.id}'`);
	if (fields.id) ids.add(fields.id);
	if (fields.status && !statuses.has(fields.status)) errors.push(`${file}: invalid status '${fields.status}'`);
	if (fields.verdict && !verdicts.has(fields.verdict)) errors.push(`${file}: invalid verdict '${fields.verdict}'`);
	for (const heading of requiredHeadings) {
		if (!text.includes(`\n${heading}\n`)) errors.push(`${file}: missing heading '${heading}'`);
	}
	if (fields.verdict === 'qualified') {
		if (!text.includes('### Runtime/browser checks')) errors.push(`${file}: qualified result is missing runtime/browser evidence`);
		if (/browser verification:\s*not run/i.test(text)) errors.push(`${file}: qualified result cannot say browser verification was not run`);
		if (!/browser console/i.test(text)) errors.push(`${file}: qualified result is missing browser-console evidence`);
		if (!/server output|HTTP responses|server response/i.test(text)) errors.push(`${file}: qualified result is missing server/runtime evidence`);
	}
}

if (errors.length) {
	console.error(`Testing-results validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`Testing-results validation passed: ${files.length} test result${files.length === 1 ? '' : 's'}.`);
