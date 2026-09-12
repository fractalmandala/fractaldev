import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sass = resolve(packageRoot, 'node_modules/.bin/sass');

for (const surface of ['foundation', 'default', 'docs', 'colors', 'theme']) {
	execFileSync(sass, [
		`src/${surface}.sass`,
		`${surface}.css`,
		'--pkg-importer=node',
		'--style=expanded',
		'--no-source-map'
	], { cwd: packageRoot, stdio: 'inherit' });
}
