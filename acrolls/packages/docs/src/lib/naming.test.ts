import { describe, expect, it } from 'vitest';
import { numbered, dated, dateOf, passthroughNaming } from './naming.js';

describe('numbered()', () => {
	const convention = numbered();

	it('strips an NN- prefix and reads it as order', () => {
		expect(convention.segment('03-routing')).toEqual({ slug: 'routing', order: 3 });
		expect(convention.segment('00-overview')).toEqual({ slug: 'overview', order: 0 });
	});

	it('passes an unprefixed segment through unordered', () => {
		expect(convention.segment('routing')).toEqual({ slug: 'routing' });
	});

	it('keeps the raw segment when the prefix is all there is', () => {
		expect(convention.segment('07-')).toEqual({ slug: '07-', order: 7 });
	});

	it('flags a directory that mixes prefixed and unprefixed siblings', () => {
		const issues = convention.verify('guides', ['01-intro', 'setup', '02-deploy']);
		expect(issues).toHaveLength(1);
		expect(issues[0]).toContain('mixed prefixed and unprefixed');
		expect(issues[0]).toContain('setup');
	});

	it('flags a duplicate prefix number by default', () => {
		const issues = convention.verify('guides', ['01-a', '01-b']);
		expect(issues.some((i) => i.includes('duplicate prefix number'))).toBe(true);
	});

	it('allows duplicate prefixes when told to', () => {
		expect(numbered({ duplicates: 'allow' }).verify('g', ['01-a', '01-b'])).toEqual([]);
	});

	it('says nothing about a directory that does not use the convention', () => {
		expect(convention.verify('guides', ['intro', 'setup'])).toEqual([]);
	});
});

describe('dated()', () => {
	const convention = dated();

	it('strips a YYYY-MM-DD prefix and orders chronologically', () => {
		const older = convention.segment('2026-01-02-hello');
		const newer = convention.segment('2026-08-13-release');
		expect(older).toMatchObject({ slug: 'hello' });
		expect(newer).toMatchObject({ slug: 'release' });
		expect(older.order!).toBeLessThan(newer.order!);
	});

	it('passes an undated segment through', () => {
		expect(convention.segment('about')).toEqual({ slug: 'about' });
	});

	it('flags an impossible date prefix', () => {
		const issues = convention.verify('blog', ['2026-13-40-broken']);
		expect(issues).toHaveLength(1);
		expect(issues[0]).toContain('impossible date');
	});

	it('honours a custom format', () => {
		const custom = dated({ format: 'YYYYMMDD' });
		expect(custom.segment('20260813-release')).toMatchObject({ slug: 'release' });
	});
});

describe('dateOf()', () => {
	it('recovers the ISO date from a dated segment', () => {
		expect(dateOf('2026-08-13-release')).toBe('2026-08-13');
	});

	it('returns null for an undated segment', () => {
		expect(dateOf('release')).toBeNull();
	});
});

describe('passthroughNaming', () => {
	it('leaves segments untouched and orders nothing', () => {
		expect(passthroughNaming.segment('03-routing')).toEqual({ slug: '03-routing' });
		expect(passthroughNaming.verify).toBeUndefined();
	});
});
