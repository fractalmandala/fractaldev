import { describe, expect, it } from 'vitest';
import { alternateLocaleHrefs, localizedHref, resolveDocsLocale } from './i18n.js';

const config = {
	baseHref: '/docs',
	defaultLocale: 'en',
	locales: [
		{ id: 'en', label: 'English', lang: 'en' },
		{ id: 'fr', label: 'Français', lang: 'fr' }
	]
} as const;

describe('resolveDocsLocale', () => {
	it('reads the locale prefix', () => {
		const r = resolveDocsLocale('/docs/fr/guides/install', config);
		expect(r.locale.id).toBe('fr');
		expect(r.slugWithinLocale).toBe('guides/install');
		expect(r.isDefault).toBe(false);
	});
});

describe('localizedHref / alternateLocaleHrefs', () => {
	it('builds locale-scoped hrefs and alternates', () => {
		expect(localizedHref('fr', 'intro', config)).toBe('/docs/fr/intro');
		const alts = alternateLocaleHrefs('/docs/en/intro', config);
		expect(alts.map((a) => a.href)).toEqual(['/docs/en/intro', '/docs/fr/intro']);
	});
});
