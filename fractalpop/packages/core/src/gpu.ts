/**
 * fractalpop WebGPU path — optional `gpu-lexer` integration.
 *
 * `gpu-lexer` is an optional peer dependency. This module re-exports the
 * shared assemble/render pipeline so `cx`/`mark`/`markLine` behave identically
 * to the synchronous core path.
 */
import { parse as parseWithGpu } from 'gpu-lexer'
import {
  assemble,
  render,
  T_CLASS,
  T_COMMENT,
  T_ENTITY,
  T_IDENTIFIER,
  T_KEYWORD,
  T_SIGN,
  T_STRING,
} from './shared.js'
import type { DisplayOptions, ParsedCode, Token } from './shared.js'

const labelToType: Record<string, number> = {
  plain: T_IDENTIFIER,
  comment: T_COMMENT,
  string: T_STRING,
  number: T_CLASS,
  keyword: T_KEYWORD,
  type: T_CLASS,
  function: T_ENTITY,
  constant: T_CLASS,
  operator: T_SIGN,
}

function appendPlain(tokens: Token[], value: string): void {
  tokens.push([T_IDENTIFIER, value])
}

/** Parse `code` through the GPU lexer and assemble it into a `ParsedCode` shape. */
export async function parse(code: string): Promise<ParsedCode> {
  if (code.length === 0) {
    return { value: '', lines: [] }
  }

  const spans = await parseWithGpu(code)
  const tokens: Token[] = []
  let position = 0

  for (const span of spans) {
    if (span.start > position) {
      appendPlain(tokens, code.slice(position, span.start))
    }

    const type = labelToType[span.type] ?? T_IDENTIFIER
    tokens.push([type, code.slice(span.start, span.end)])
    position = span.end
  }

  if (position < code.length) {
    appendPlain(tokens, code.slice(position))
  }

  return assemble(code, tokens)
}

/** Highlight `code` using the GPU lexer, returning an HTML string. */
export async function highlight(code: string, options?: DisplayOptions): Promise<string> {
  const parsed = await parse(code)
  return render(parsed, options)
}

export type { DisplayOptions, ParsedCode } from './shared.js'
