import { describe, expect, it } from 'vitest'
import {
  parseHighlightMeta,
  toHighlightRanges,
  escapeSvelte,
} from '../src/meta.js'

describe('parseHighlightMeta', () => {
  it('returns an empty set for null, undefined, or empty meta', () => {
    expect(parseHighlightMeta(undefined).size).toBe(0)
    expect(parseHighlightMeta(null).size).toBe(0)
    expect(parseHighlightMeta('').size).toBe(0)
    expect(parseHighlightMeta('no ranges here').size).toBe(0)
  })

  it('parses a single line', () => {
    expect([...parseHighlightMeta('{4}')]).toEqual([4])
  })

  it('parses multiple lines', () => {
    expect([...parseHighlightMeta('{1,3,5}')]).toEqual([1, 3, 5])
  })

  it('parses a range', () => {
    expect([...parseHighlightMeta('{2-4}')]).toEqual([2, 3, 4])
  })

  it('parses mixed single lines and ranges', () => {
    expect([...parseHighlightMeta('{1,3-5,7}')]).toEqual([1, 3, 4, 5, 7])
  })

  it('tolerates whitespace', () => {
    expect([...parseHighlightMeta('{ 1 , 3 - 5 }')]).toEqual([1, 3, 4, 5])
  })

  it('ignores invalid and negative numbers', () => {
    expect([...parseHighlightMeta('{-2,3,abc,5-}')]).toEqual([3])
    expect([...parseHighlightMeta('{0,1}')]).toEqual([1])
  })
})

describe('toHighlightRanges', () => {
  it('returns an empty array for null, undefined, or empty meta', () => {
    expect(toHighlightRanges(undefined)).toEqual([])
    expect(toHighlightRanges(null)).toEqual([])
    expect(toHighlightRanges('')).toEqual([])
  })

  it('returns single numbers and [start, end] tuples', () => {
    expect(toHighlightRanges('{1,3-5,7}')).toEqual([1, [3, 5], 7])
  })

  it('tolerates whitespace and ignores invalid numbers', () => {
    expect(toHighlightRanges('{ 1 , 3 - 5 , -1 }')).toEqual([1, [3, 5]])
  })
})

describe('escapeSvelte', () => {
  it('encodes braces and backticks', () => {
    expect(escapeSvelte('a{b}`c`')).toBe('a&#123;b&#125;&#96;c&#96;')
  })
})
