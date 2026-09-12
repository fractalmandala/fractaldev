declare module 'gpu-lexer' {
  export interface GpuSpan {
    type: string
    start: number
    end: number
  }

  export function parse(code: string): Promise<GpuSpan[]>
}
