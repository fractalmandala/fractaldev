import { describe, expect, it } from 'vitest';
import {
	alternateVersionHrefs,
	defaultDocsVersion,
	resolveDocsVersion,
	versionedHref
} from './versions.js';

const config = {
	baseHref: '/docs',
	defaultVersion: 'v1',
	versions: [
		{ id: 'v1', label: '1.x' },
		{ id: 'v2', label: '2.x', badge: 'next' }
	]
} as const;

describe('resolveDocsVersion', () => {
	it('reads the version prefix', () => {
		const r = resolveDocsVersion('/docs/v2/guides/install', config);
		expect(r.version.id).toBe('v2');
		expect(r.slugWithinVersion).toBe('guides/install');
		expect(r.unversionedPath).toBe('/docs/guides/install');
		expect(r.isDefault).toBe(false);
	});

	it('falls back to default when unprefixed', () => {
		const r = resolveDocsVersion('/docs/guides/install', config);
		expect(r.version.id).toBe('v1');
		expect(r.isDefault).toBe(true);
		expect(r.slugWithinVersion).toBe('guides/install');
	});
});

describe('versionedHref / alternateVersionHrefs', () => {
	it('builds version-scoped hrefs', () => {
		expect(versionedHref('v2', 'api/ref', config)).toBe('/docs/v2/api/ref');
		expect(versionedHref('v1', '', config)).toBe('/docs/v1');
	});

	it('preserves the slug across versions', () => {
		const alts = alternateVersionHrefs('/docs/v1/guides/install', config);
		expect(alts.map((a) => a.href)).toEqual(['/docs/v1/guides/install', '/docs/v2/guides/install']);
		expect(alts.find((a) => a.current)?.version.id).toBe('v1');
	});

	it('defaultDocsVersion picks the configured default', () => {
		expect(defaultDocsVersion(config).id).toBe('v1');
	});
});
