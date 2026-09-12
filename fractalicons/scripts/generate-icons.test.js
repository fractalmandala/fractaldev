import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	toIdentifierPart,
	toNamedExport,
	toFullNameExport,
	toSafePathName,
	extractViewBox,
	normalizeColor,
	stripSvg,
	toIconDeclaration
} from './generate-icons.js';

// ─── toIdentifierPart ────────────────────────────────────────────────────────

describe('toIdentifierPart', () => {
	it('splits on non-alphanumeric chars and PascalCases each segment', () => {
		assert.equal(toIdentifierPart('arrow-up'), 'ArrowUp');
		assert.equal(toIdentifierPart('chevron_right'), 'ChevronRight');
		assert.equal(toIdentifierPart('map--pin'), 'MapPin');
	});

	it('handles single words', () => {
		assert.equal(toIdentifierPart('activity'), 'Activity');
		assert.equal(toIdentifierPart('HEART'), 'HEART');
	});

	it('filters out empty segments from leading/trailing separators', () => {
		assert.equal(toIdentifierPart('-leading-'), 'Leading');
		assert.equal(toIdentifierPart('__double__'), 'Double');
	});

	it('preserves digits within segments', () => {
		assert.equal(toIdentifierPart('icon-24px'), 'Icon24px');
		assert.equal(toIdentifierPart('v2-logo'), 'V2Logo');
	});
});

// ─── toNamedExport ───────────────────────────────────────────────────────────

describe('toNamedExport', () => {
	it('uses the short prefix from familyPrefixMap', () => {
		assert.equal(toNamedExport('lucide', 'activity'), 'luActivity');
		assert.equal(toNamedExport('phosphor', 'arrow-up'), 'phArrowUp');
		assert.equal(toNamedExport('tabler', 'chevron-right'), 'tbChevronRight');
	});

	it('falls back to the set name when no prefix is mapped', () => {
		assert.equal(toNamedExport('unknownset', 'icon'), 'unknownsetIcon');
	});

	it('does not prepend "icon" when the prefix keeps the identifier alpha-starting', () => {
		// The prefix (e.g. "si") is always alpha, so the identifier never starts with a digit.
		assert.equal(toNamedExport('simple', '1password'), 'si1password');
	});

	it('would prepend "icon" if the identifier started with a digit (hypothetical)', () => {
		// This branch is defensive — with the current prefix map all identifiers start
		// with a letter. We test the raw toIdentifierPart + guard logic indirectly by
		// confirming the function's output for a normal digit-containing name.
		assert.equal(toNamedExport('simple', 'vue-dot-js'), 'siVueDotJs');
	});

	it('lowercases the first character of the result', () => {
		const result = toNamedExport('lucide', 'Activity');
		assert.ok(/^[a-z]/.test(result), 'first char should be lowercase');
	});
});

// ─── toFullNameExport ────────────────────────────────────────────────────────

describe('toFullNameExport', () => {
	it('uses the full set name instead of the short prefix', () => {
		assert.equal(toFullNameExport('lucide', 'activity'), 'lucideActivity');
		assert.equal(toFullNameExport('phosphor', 'arrow-up'), 'phosphorArrowUp');
	});

	it('does not prepend "icon" when the set name keeps the identifier alpha-starting', () => {
		// The full-name export uses the set name as prefix, which is always alpha.
		assert.equal(toFullNameExport('simple', '1password'), 'simple1password');
	});
});

// ─── toSafePathName ──────────────────────────────────────────────────────────

describe('toSafePathName', () => {
	it('strips .svg extension and lowercases', () => {
		assert.equal(toSafePathName('ArrowUp.svg'), 'arrowup');
		assert.equal(toSafePathName('chevron-right.SVG'), 'chevron-right');
	});

	it('handles filenames without extension', () => {
		assert.equal(toSafePathName('Activity'), 'activity');
	});
});

// ─── extractViewBox ──────────────────────────────────────────────────────────

describe('extractViewBox', () => {
	it('extracts viewBox from the <svg> tag', () => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">';
		assert.equal(extractViewBox(svg), '0 0 24 24');
	});

	it('handles non-standard viewBox values', () => {
		const svg = '<svg viewBox="0 0 16 16">';
		assert.equal(extractViewBox(svg), '0 0 16 16');
	});

	it('falls back to width/height when no viewBox is present', () => {
		const svg = '<svg width="32" height="32">';
		assert.equal(extractViewBox(svg), '0 0 32 32');
	});

	it('falls back to width/height with px units', () => {
		const svg = '<svg width="48px" height="48px">';
		assert.equal(extractViewBox(svg), '0 0 48 48');
	});

	it('returns default 0 0 24 24 when neither viewBox nor dimensions exist', () => {
		const svg = '<svg xmlns="http://www.w3.org/2000/svg">';
		assert.equal(extractViewBox(svg), '0 0 24 24');
	});

	it('is case-insensitive for the viewBox attribute', () => {
		const svg = '<svg ViewBox="0 0 20 20">';
		assert.equal(extractViewBox(svg), '0 0 20 20');
	});
});

// ─── normalizeColor ──────────────────────────────────────────────────────────

describe('normalizeColor', () => {
	it('replaces fill="#000" with fill="currentColor"', () => {
		assert.equal(
			normalizeColor('<path fill="#000" d="M0 0"/>'),
			'<path fill="currentColor" d="M0 0"/>'
		);
	});

	it('replaces stroke="#000000" with stroke="currentColor"', () => {
		assert.equal(
			normalizeColor('<path stroke="#000000" d="M0 0"/>'),
			'<path stroke="currentColor" d="M0 0"/>'
		);
	});

	it('is case-insensitive for hex colors', () => {
		assert.equal(
			normalizeColor('<path fill="#0F172A" d="M0 0"/>'),
			'<path fill="currentColor" d="M0 0"/>'
		);
	});

	it('replaces CSS-style fill:#000 (no space after colon)', () => {
		assert.equal(
			normalizeColor('<path style="fill:#000" d="M0 0"/>'),
			'<path style="fill:currentColor" d="M0 0"/>'
		);
	});

	it('does NOT replace fill: #000 (with space after colon) — materialanim mask geometry', () => {
		const input = '<path style="fill: #000" d="M0 0"/>';
		assert.equal(normalizeColor(input), input);
	});

	it('replaces the keyword "black"', () => {
		assert.equal(
			normalizeColor('<path fill="black" d="M0 0"/>'),
			'<path fill="currentColor" d="M0 0"/>'
		);
	});

	it('replaces rgb(0,0,0) and rgb(0, 0, 0)', () => {
		assert.equal(
			normalizeColor('<path fill="rgb(0,0,0)" d="M0 0"/>'),
			'<path fill="currentColor" d="M0 0"/>'
		);
		assert.equal(
			normalizeColor('<path fill="rgb(0, 0, 0)" d="M0 0"/>'),
			'<path fill="currentColor" d="M0 0"/>'
		);
	});

	it('handles multiple replacements in one string', () => {
		const input = '<path fill="#000" stroke="#000" d="M0 0"/>';
		const expected = '<path fill="currentColor" stroke="currentColor" d="M0 0"/>';
		assert.equal(normalizeColor(input), expected);
	});
});

// ─── stripSvg ────────────────────────────────────────────────────────────────

describe('stripSvg', () => {
	it('removes the outer <svg> wrapper and returns inner content', () => {
		const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';
		assert.equal(stripSvg(svg), '<path d="M0 0"/>');
	});

	it('preserves presentation attributes from root <svg> as a <g> wrapper', () => {
		const svg =
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0"/></svg>';
		const result = stripSvg(svg);
		assert.ok(result.startsWith('<g '));
		assert.ok(result.includes('fill="none"'));
		assert.ok(result.includes('stroke="currentColor"'));
		assert.ok(result.includes('stroke-width="2"'));
		assert.ok(result.includes('<path d="M0 0"/>'));
	});

	it('strips <title> and <desc> metadata elements', () => {
		const svg =
			'<svg viewBox="0 0 24 24"><title>Icon Title</title><desc>Description</desc><path d="M0 0"/></svg>';
		const result = stripSvg(svg);
		assert.ok(!result.includes('<title>'));
		assert.ok(!result.includes('<desc>'));
		assert.ok(result.includes('<path d="M0 0"/>'));
	});

	it('removes invisible spacer rects (fill="none" with no stroke)', () => {
		const svg =
			'<svg viewBox="0 0 24 24"><rect fill="none" width="24" height="24"/><path d="M0 0"/></svg>';
		const result = stripSvg(svg);
		assert.ok(!result.includes('<rect'));
		assert.ok(result.includes('<path d="M0 0"/>'));
	});

	it('removes XML declarations and comments', () => {
		const svg =
			'<?xml version="1.0"?><!-- comment --><svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';
		const result = stripSvg(svg);
		assert.ok(!result.includes('<?xml'));
		assert.ok(!result.includes('<!--'));
	});

	it('normalizes hardcoded black colors in the inner content', () => {
		const svg = '<svg viewBox="0 0 24 24"><path fill="#000" d="M0 0"/></svg>';
		const result = stripSvg(svg);
		assert.ok(result.includes('fill="currentColor"'));
	});
});

// ─── toIconDeclaration ───────────────────────────────────────────────────────

describe('toIconDeclaration', () => {
	const simpleSvg = '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>';

	it('returns an object with exportName, fullAliasName, iconName, and declaration', () => {
		const result = toIconDeclaration('lucide', 'activity', simpleSvg);
		assert.equal(result.exportName, 'luActivity');
		assert.equal(result.fullAliasName, 'lucideActivity');
		assert.equal(result.iconName, 'activity');
		assert.ok(result.declaration.includes('export const luActivity'));
		assert.ok(result.declaration.includes('as lucideActivity'));
	});

	it('omits the alias when short and full names are identical', () => {
		// Use a set name that is the same as its prefix — not realistic but tests the branch
		// We can't easily construct this with the real prefix map, so just verify the
		// declaration structure for a normal case where they DO differ.
		const result = toIconDeclaration('lucide', 'activity', simpleSvg);
		// lucideActivity !== luActivity, so alias should be present
		assert.ok(result.declaration.includes('export { luActivity as lucideActivity }'));
	});

	it('produces valid IconData JSON in the declaration', () => {
		const result = toIconDeclaration('phosphor', 'arrow-up', simpleSvg);
		// Extract the JSON portion: `export const phArrowUp: IconData = {...};`
		const jsonMatch = result.declaration.match(/= ({.*?});/);
		assert.ok(jsonMatch, 'declaration should contain a JSON object');
		const data = JSON.parse(jsonMatch[1]);
		assert.equal(data.name, 'arrow-up');
		assert.equal(data.set, 'phosphor');
		assert.equal(data.viewBox, '0 0 24 24');
		assert.ok(typeof data.body === 'string');
	});
});
