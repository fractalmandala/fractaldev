import { describe, expect, it } from 'vitest'
import { parse } from '../src/core.js'
import { findLanguage, getLanguageConfig } from '../src/full.js'
import type { ParsedToken } from '../src/shared.js'

const svelte = getLanguageConfig(findLanguage('svelte')!.id)!
const flat = (code: string): ParsedToken[] => parse(code, svelte).lines.flatMap((l) => l.tokens)
const find = (t: ParsedToken[], v: string) => t.find((x) => x.value === v)

const file = `<script lang="ts">
  let count: number = $state(0)
  const label = 'clicks'
<\/script>

<button class="btn" onclick={() => count++}>
  {label}: {count}
</button>

<style lang="sass">
  .btn
    color: $brand
    &:hover
      opacity: 0.8
<\/style>`

describe('svelte composite lexer', () => {
  const t = flat(file)

  it('highlights the <script lang="ts"> region as TypeScript', () => {
    expect(find(t, 'let')?.type).toBe('keyword')
    expect(find(t, 'const')?.type).toBe('keyword')
    expect(find(t, 'number')?.type).toBe('keyword') // TS keyword
    expect(t.some((x) => x.type === 'string' && x.value.includes('clicks'))).toBe(true)
  })

  it('highlights markup tags and attributes', () => {
    expect(find(t, 'button')?.type).toBe('class') // tag name
    expect(find(t, 'class')?.type).toBe('property') // attribute
    expect(find(t, 'onclick')?.type).toBe('property')
  })

  it('delegates {expr} mustaches to the JS lexer', () => {
    // {label} and {count} — identifiers, and the braces are signs
    expect(t.some((x) => x.type === 'sign' && x.value === '{')).toBe(true)
    expect(find(t, 'label')?.type).toBe('identifier')
    expect(find(t, 'count')?.type).toBe('identifier')
  })

  it('highlights the <style lang="sass"> region as indented Sass', () => {
    // $brand colored as a Sass variable (property), &:hover selector present
    expect(find(t, '$brand')?.type).toBe('property')
    expect(find(t, 'color')?.type).toBe('property') // declaration
    expect(t.some((x) => x.type === 'sign' && x.value === '&')).toBe(true)
  })

  it('handles Svelte block tags like {#if}/{@render}', () => {
    const b = flat('{#if ready}<p>hi</p>{/if}')
    expect(b.some((x) => x.type === 'keyword' && x.value === '#if')).toBe(true)
    expect(b.some((x) => x.type === 'keyword' && x.value === '/if')).toBe(true)
  })
})
