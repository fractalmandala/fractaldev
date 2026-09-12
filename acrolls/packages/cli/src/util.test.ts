import { describe, expect, it } from 'vitest';
import { parseArgs } from './util.js';

describe('parseArgs', () => {
	it('keeps the command after boolean flags', () => {
		expect(parseArgs(['--cwd', '/tmp/host', '--non-interactive', 'onboard', '--docs-dir', 'docs'])).toEqual({
			_: ['onboard'],
			flags: {
				cwd: '/tmp/host',
				'non-interactive': true,
				'docs-dir': 'docs'
			}
		});
	});
});
