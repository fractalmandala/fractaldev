import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, '..');

function safeRm(targetPath) {
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			if (fs.existsSync(targetPath)) {
				fs.rmSync(targetPath, { recursive: true, force: true });
			}
			return;
		} catch {
			// Wait 100ms on filesystem lock/race on macOS APFS
			Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
		}
	}
}

if (process.argv.includes('--prune')) {
	// svelte-package copies everything under src/lib into dist, including
	// .DS_Store strays. Strip anything unpublishable after packaging.
	const distDir = path.join(packageDir, 'dist');
	let pruned = 0;
	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.name === '.DS_Store' || entry.name.endsWith('.zip')) {
				fs.rmSync(full, { force: true });
				pruned++;
			}
		}
	};
	if (fs.existsSync(distDir)) walk(distDir);
	console.log(`pruned ${pruned} junk files from dist`);
	process.exit(0);
}

safeRm(path.join(packageDir, '.svelte-kit/__package__'));
safeRm(path.join(packageDir, 'dist'));
