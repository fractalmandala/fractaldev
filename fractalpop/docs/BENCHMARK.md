# Benchmarks

Benchmarks for `fractalpop` evaluate both **bundle size** (browser payload) and **highlighting throughput** across file sizes, following the exact methodology pioneered by Sugar High.

Run the benchmark suite from the repository root:

```sh
pnpm benchmark:large
```

The runner installs pinned comparison versions (`sugar-high`, `prismjs`, `highlight.js`, `shiki`, and `gpu-lexer`) into an isolated temporary folder and cleans it up when finished. These libraries are never added to your project's `package.json`.

---

## 1. Methodology

### Synthetic TypeScript Input
The benchmark generates deterministic, realistic TypeScript source code (`UserService${i}` classes with async methods, generics, nested types, and template literals) scaled to target sizes:
- **11 KiB** — typical component / module file
- **100 KiB** — large single-file utility / library
- **500 KiB** — massive generated API client / AST file

### Runtime Speed
- **Warmup**: Initial passes are run first to ensure JIT optimization.
- **Garbage Collection**: Node is run with `--expose-gc` and triggers `global.gc?.()` before timed samples to prevent GC pauses from tainting individual engine runs.
- **Sampling**: 5 separate timed runs per file size; the **median** is reported.
- **Scope**: Measures raw highlight-to-HTML execution time. CSS parsing, DOM insertion, and network overhead are excluded.

### Bundle Size
Bundles are built using **Bun** (`bun build --bundle --minify --target=browser`), capturing only the highlighters' TypeScript browser entry point.
- **Minified**: Raw minified bundle byte size.
- **Gzip**: Standard zlib compression with level 9.

---

## 2. Benchmark Results

Measured with Node v24.19.0, darwin arm64, Apple Silicon:

| TypeScript | fractalpop 0.1.0 | Sugar High 2.4.0 | PrismJS 1.30.0 | highlight.js 11.12.0 | Shiki 4.4.3 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Minified (KiB)** | **12.35** | 27.29 | 14.57 | 29.49 | 364.20 |
| **Gzip (KiB)** | **5.28** | 10.09 | 5.57 | 11.28 | 72.79 |
| **11 KiB file** | **1.96 ms** | 1.97 ms | 1.47 ms | 2.55 ms | 18.55 ms |
| **100 KiB file** | **19.75 ms** | 20.50 ms | 14.68 ms | 24.11 ms | 163.34 ms |
| **500 KiB file** | **97.70 ms** | 101.81 ms | 100.31 ms | 127.61 ms | 858.15 ms |

*Lower is better. Median milliseconds per file; 5 timed samples after warmup.*

---

## 3. WebGPU & `gpu-lexer` (Optional Peer Dependency)

Sugar High highlights `sugar-high/gpu` as an experimental async pathway powered by `gpu-lexer`.

`fractalpop` provides the exact same experimental capability through [`fractalpop/gpu`](https://www.npmjs.com/package/fractalpop) with `gpu-lexer` as an **optional peer dependency**:

```sh
npm install fractalpop gpu-lexer
```

```js
import { highlight } from 'fractalpop/gpu'

const html = await highlight(source)
```

### Why WebGPU is Benchmarked Separately from CPU:
1. **Async vs Sync**: `fractalpop/gpu` returns a `Promise<string>`, whereas standard CPU highlighters are synchronous functions returning `string`.
2. **Buffer / Pipeline Overhead**: WebGPU dispatches compute shaders across GPU buffers. This introduces an initial GPU dispatch latency (~5–15 ms), making it slower on small 10 KiB files than CPU lexing, but vastly scalable on multi-megabyte files (500 KiB – 5 MiB+).
3. **Environment**: Standard Node.js does not expose `navigator.gpu` without a browser context (Playwright / Chromium) or Dawn bindings.
4. **Bundle Size**:
   | Engine | Minified (KiB) | Gzip (KiB) |
   | :--- | :---: | :---: |
   | `fractalpop/gpu` (with `gpu-lexer`) | **60.55** | **33.38** |
   | `sugar-high/gpu` (with `gpu-lexer`) | 60.79 | 33.50 |

---

## 4. Customizing the Benchmark

Control runs via environment variables:

```sh
# Custom file sizes (e.g. 50 KiB and 1 MiB)
BENCH_SIZES_KIB=50,1000 pnpm benchmark:large

# Adjust sample count
BENCH_RUNS=10 pnpm benchmark:large

# Machine-readable JSON output
node --expose-gc scripts/benchmark-large.mjs --json
```
