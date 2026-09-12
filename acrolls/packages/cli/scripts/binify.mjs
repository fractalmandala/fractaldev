import { readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const p = join(dir, '../dist/index.js');
let src = readFileSync(p, 'utf8');
src = src.replace(/^#!.*\n/, '');
writeFileSync(p, `#!/usr/bin/env node\n${src}`);
chmodSync(p, 0o755);
