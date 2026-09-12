import { describe, expect, it } from 'vitest';
import { parseFenceMeta, parseRangeList } from './code-meta.js';

describe('parseRangeList', () => {
  it('parses singles and ranges', () => {
    expect([...parseRangeList('2,4-6')].sort((a, b) => a - b)).toEqual([2, 4, 5, 6]);
  });

  it('throws on bad tokens', () => {
    expect(() => parseRangeList('nope')).toThrow(/Invalid line range/);
  });
});

describe('parseFenceMeta', () => {
  it('parses full meta', () => {
    const meta = parseFenceMeta(
      'filename="src/peer.ts" lineNumbers wrap highlight="2-3" focus="2" add="4" remove="1"'
    );
    expect(meta.filename).toBe('src/peer.ts');
    expect(meta.lineNumbers).toBe(true);
    expect(meta.wrap).toBe(true);
    expect([...meta.highlight]).toEqual([2, 3]);
    expect([...meta.focus]).toEqual([2]);
    expect([...meta.add]).toEqual([4]);
    expect([...meta.remove]).toEqual([1]);
  });
});
