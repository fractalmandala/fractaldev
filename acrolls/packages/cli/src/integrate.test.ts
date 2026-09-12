import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cmdIntegrate, detectHost } from './integrate.js';

const roots: string[] = [];

async function host(packageJson: Record<string, unknown>) {
  const root = await mkdtemp(join(tmpdir(), 'acrolls-cli-'));
  roots.push(root);
  await writeFile(join(root, 'package.json'), JSON.stringify(packageJson), 'utf8');
  return root;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('integrate', () => {
  it('detects Vite-based SvelteKit configuration', async () => {
    const root = await host({ devDependencies: { '@sveltejs/kit': '^3.0.0' } });
    await writeFile(join(root, 'vite.config.ts'), 'export default {};', 'utf8');

    const detected = await detectHost(root);

    expect(detected.kind).toBe('sveltekit');
    expect('viteConfig' in detected && detected.viteConfig).toBe('vite.config.ts');
    expect('svelteConfig' in detected && detected.svelteConfig).toBeNull();
  });

  it('refuses to mutate an existing Vite config', async () => {
    const root = await host({ devDependencies: { '@sveltejs/kit': '^3.0.0' } });
    const config = 'export default { plugins: [customPlugin()] };';
    await writeFile(join(root, 'vite.config.ts'), config, 'utf8');
    const previous = process.cwd();
    process.chdir(root);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      await expect(cmdIntegrate({ _: ['integrate'], flags: { yes: true } })).resolves.toBe(1);
    } finally {
      process.chdir(previous);
    }

    expect(await readFile(join(root, 'vite.config.ts'), 'utf8')).toBe(config);
  });

  it('refuses a non-SvelteKit host without creating files', async () => {
    const root = await host({ name: 'plain-node-host' });
    const previous = process.cwd();
    process.chdir(root);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      await expect(cmdIntegrate({ _: ['integrate'], flags: { yes: true } })).resolves.toBe(1);
    } finally {
      process.chdir(previous);
    }

    await expect(readFile(join(root, 'vite.config.ts'), 'utf8')).rejects.toThrow();
  });

  it('creates a Vite config without choosing the host adapter', async () => {
    const root = await host({ devDependencies: { '@sveltejs/kit': '^3.0.0' } });
    await mkdir(join(root, 'src/routes'), { recursive: true });
    const previous = process.cwd();
    process.chdir(root);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await expect(cmdIntegrate({ _: ['integrate'], flags: { yes: true } })).resolves.toBe(0);
    } finally {
      process.chdir(previous);
    }

    const config = await readFile(join(root, 'vite.config.ts'), 'utf8');
    expect(config).toContain('sveltekit({');
    expect(config).toContain('createAcrollsMdsvexPreprocessor');
    expect(config).not.toContain('adapter-auto');
  });

  it('adds the Sass entrypoint to a generated layout when requested', async () => {
    const root = await host({ devDependencies: { '@sveltejs/kit': '^3.0.0' } });
    await mkdir(join(root, 'src/routes'), { recursive: true });
    const previous = process.cwd();
    process.chdir(root);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await expect(
        cmdIntegrate({ _: ['integrate'], flags: { yes: true, style: 'sass', mode: 'default' } })
      ).resolves.toBe(0);
    } finally {
      process.chdir(previous);
    }

    expect(await readFile(join(root, 'src/routes/+layout.svelte'), 'utf8')).toContain(
      "import 'acrolls/styles/default.sass';"
    );
  });
});
