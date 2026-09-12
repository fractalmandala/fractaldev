/** zig — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["addrspace", "align", "allowzero", "and", "anyframe", "anytype", "asm", "async", "await", "break", "callconv", "catch", "comptime", "const", "continue", "defer", "else", "enum", "errdefer", "error", "export", "extern", "false", "fn", "for", "if", "inline", "linksection", "noalias", "noinline", "nosuspend", "null", "opaque", "or", "orelse", "packed", "pub", "resume", "return", "struct", "suspend", "switch", "test", "threadlocal", "true", "try", "undefined", "union", "unreachable", "usingnamespace", "var", "volatile", "while"],
  typeKeywords: ["anyerror", "anyopaque", "bool", "c_char", "c_int", "c_long", "c_longdouble", "c_longlong", "c_short", "c_uint", "c_ulong", "c_ulonglong", "c_ushort", "comptime_float", "comptime_int", "f16", "f32", "f64", "f80", "f128", "i8", "i16", "i32", "i64", "i128", "isize", "noreturn", "type", "u8", "u16", "u32", "u64", "u128", "usize", "void"],
  comments: {"line":["//"]},
})
