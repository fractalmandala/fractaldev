import { vi, describe, it, expect } from 'vitest'
import { parse, highlight } from '../src/gpu.js'

vi.mock('gpu-lexer', () => ({
  parse: vi.fn(async (code: string) => [
    { type: 'keyword', start: 0, end: 5 },
    { type: 'plain', start: 5, end: code.length },
  ]),
}))

describe('gpu path', () => {
  it('highlight() returns HTML with fp__token--keyword', async () => {
    const html = await highlight('const x = 1')
    expect(html).toContain('fp__token--keyword')
    expect(html).toContain('fp__token--identifier')
    expect(html).toContain('var(--fp-keyword)')
  })

  it('parse() returns ParsedCode compatible with render()', async () => {
    const parsed = await parse('const x = 1')
    expect(parsed.value).toBe('const x = 1')
    expect(parsed.lines).toHaveLength(1)

    const tokens = parsed.lines[0]!.tokens
    expect(tokens.some((t) => t.value === 'const' && t.type === 'keyword')).toBe(true)
    expect(tokens.some((t) => t.value === ' x = 1' && t.type === 'identifier')).toBe(true)
  })

  it('empty code returns empty lines', async () => {
    const parsed = await parse('')
    expect(parsed.value).toBe('')
    expect(parsed.lines).toHaveLength(0)
  })

  it('mixed-language input does not throw', async () => {
    const code = 'const x = 1\nfunction foo() {}\n# python comment'
    await expect(highlight(code)).resolves.toContain('fp__token--keyword')
  })
})
