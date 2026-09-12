import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { cpus, tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

const script = fileURLToPath(import.meta.url)
const root = fileURLToPath(new URL('..', import.meta.url))
const fractalpopVersion = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version

const engines = [
  { id: 'fractalpop', label: 'fractalpop', version: fractalpopVersion },
  { id: 'sugar-high', label: 'Sugar High', version: '2.4.0' },
  { id: 'prismjs', label: 'PrismJS', version: '1.30.0' },
  { id: 'highlight.js', label: 'highlight.js', version: '11.12.0' },
]

function positiveNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function sourceBlock(index) {
  return `
interface User${index} {
  id: number
  name: string
  roles: readonly string[]
  active: boolean
}

export class UserService${index} {
  #cache = new Map<number, User${index}>()

  async find(id: number): Promise<User${index} | null> {
    // Return a cached user before requesting the API.
    const cached = this.#cache.get(id)
    if (cached?.active) return cached

    const response = await fetch(\`/api/users/\${id}?source=benchmark\`)
    if (!response.ok) return null

    const user = (await response.json()) as User${index}
    this.#cache.set(id, user)
    return { ...user, roles: user.roles.filter(Boolean) }
  }
}
`
}

function makeSource(targetBytes) {
  const blocks = [
    "import type { ReadonlyDeep } from './types'\n",
    "export type Status = 'idle' | 'loading' | 'ready' | 'error'\n",
  ]
  let bytes = blocks[0].length + blocks[1].length

  for (let index = 0; bytes < targetBytes; index++) {
    const block = sourceBlock(index)
    blocks.push(block)
    bytes += block.length
  }

  return blocks.join('')
}

function comparisonModule(...path) {
  const directory = process.env.FP_BENCH_MODULES
  if (!directory) throw new Error('Comparison packages directory is not set.')
  return pathToFileURL(join(directory, 'node_modules', ...path)).href
}

async function loadHighlighter(engine) {
  if (engine === 'fractalpop') {
    const { highlight } = await import(pathToFileURL(join(root, 'packages/core/dist/index.js')).href)
    return source => highlight(source, { lang: 'typescript' })
  }

  if (engine === 'sugar-high') {
    const { highlight } = await import(comparisonModule('sugar-high', 'lib', 'index.js'))
    return source => highlight(source, { lang: 'typescript' })
  }

  if (engine === 'prismjs') {
    const { default: Prism } = await import(comparisonModule('prismjs', 'prism.js'))
    await import(comparisonModule('prismjs', 'components', 'prism-typescript.js'))
    return source => Prism.highlight(source, Prism.languages.typescript, 'typescript')
  }

  if (engine === 'highlight.js') {
    const [{ default: hljs }, { default: typescript }] = await Promise.all([
      import(comparisonModule('highlight.js', 'es', 'core.js')),
      import(comparisonModule('highlight.js', 'es', 'languages', 'typescript.js')),
    ])
    hljs.registerLanguage('typescript', typescript)
    return source => hljs.highlight(source, { language: 'typescript', ignoreIllegals: true }).value
  }

  throw new Error(`Unknown highlighter: ${engine}`)
}

function resultWeight(result) {
  return typeof result === 'string' ? result.length : (result.lines?.length ?? 0)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function runWorker() {
  const engine = process.argv[3]
  const targetKiB = positiveNumber(process.argv[4], 100)
  const iterations = Math.ceil(positiveNumber(process.argv[5], 3))
  const runs = Math.ceil(positiveNumber(process.argv[6], 3))
  const source = makeSource(targetKiB * 1024)
  const sourceBytes = Buffer.byteLength(source)
  const highlight = await loadHighlighter(engine)

  // Warmup
  const warmupIterations = Math.max(1, Math.min(10, Math.ceil(512 * 1024 / sourceBytes)))
  for (let i = 0; i < warmupIterations; i++) {
    highlight(source)
  }

  const samples = []
  for (let run = 0; run < runs; run++) {
    global.gc?.()
    const start = process.hrtime.bigint()
    for (let iteration = 0; iteration < iterations; iteration++) {
      highlight(source)
    }
    const elapsedSeconds = Number(process.hrtime.bigint() - start) / 1e9
    samples.push({
      milliseconds: (elapsedSeconds * 1000) / iterations,
      mibPerSecond: (sourceBytes * iterations) / elapsedSeconds / 1024 / 1024,
    })
  }

  const throughput = samples.map(s => s.mibPerSecond)
  const result = {
    engine,
    targetKiB,
    sourceBytes,
    iterations,
    runs,
    milliseconds: median(samples.map(s => s.milliseconds)),
    mibPerSecond: median(throughput),
  }
  process.stdout.write(JSON.stringify(result))
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MiB`
    : `${(bytes / 1024).toFixed(0)} KiB`
}

function installComparisons() {
  const directory = mkdtempSync(join(tmpdir(), 'fp-benchmark-'))
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  process.stderr.write('Installing temporary benchmark comparisons (sugar-high, prismjs, highlight.js)...\n')

  try {
    execFileSync(
      pnpm,
      [
        'add',
        '--dir',
        directory,
        '--ignore-workspace',
        '--ignore-scripts',
        '--save-exact',
        '--lockfile=false',
        'sugar-high@2.4.0',
        'prismjs@1.30.0',
        'highlight.js@11.12.0',
        'gpu-lexer@0.0.2',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    return directory
  } catch (error) {
    rmSync(directory, { recursive: true, force: true })
    if (error.stderr) process.stderr.write(error.stderr)
    throw error
  }
}

async function measureBundles(directory) {
  const coreDist = join(root, 'packages/core/dist')
  const bun = process.env.BUN_BIN || '/Users/amrit/.bun/bin/bun' || 'bun'

  const entries = {
    fractalpop: `
      import { highlight } from ${JSON.stringify(join(coreDist, 'index.js'))}
      export const run = source => highlight(source, { lang: 'typescript' })
    `,
    'sugar-high': `
      import { highlight } from 'sugar-high'
      export const run = source => highlight(source, { lang: 'typescript' })
    `,
    prismjs: `
      import Prism from 'prismjs/components/prism-core.js'
      import 'prismjs/components/prism-clike.js'
      import 'prismjs/components/prism-javascript.js'
      import 'prismjs/components/prism-typescript.js'
      export const run = source => Prism.highlight(source, Prism.languages.typescript, 'typescript')
    `,
    'highlight.js': `
      import hljs from 'highlight.js/lib/core'
      import typescript from 'highlight.js/lib/languages/typescript'
      hljs.registerLanguage('typescript', typescript)
      export const run = source => hljs.highlight(source, { language: 'typescript', ignoreIllegals: true }).value
    `,
  }

  // Also include GPU entries
  const gpuEntries = {
    'fractalpop/gpu': `
      import { highlight } from ${JSON.stringify(join(coreDist, 'gpu.js'))}
      export const run = source => highlight(source)
    `,
    'sugar-high/gpu': `
      import { highlight } from 'sugar-high/gpu'
      export const run = source => highlight(source)
    `,
  }

  const bundles = []
  for (const engine of engines) {
    const entry = join(directory, `${engine.id}-entry.js`)
    const output = join(directory, `${engine.id}-bundle.mjs`)
    writeFileSync(entry, entries[engine.id])
    execFileSync(
      bun,
      ['build', entry, '--bundle', '--minify', '--target=browser', `--outfile=${output}`],
      { stdio: 'pipe', cwd: directory },
    )
    const bundled = readFileSync(output)
    bundles.push({
      engine: engine.id,
      label: engine.label,
      minified: bundled.byteLength,
      gzip: gzipSync(bundled, { level: 9 }).byteLength,
    })
  }

  const gpuBundles = []
  for (const [id, code] of Object.entries(gpuEntries)) {
    const entry = join(directory, `${id.replace('/', '-')}-entry.js`)
    const output = join(directory, `${id.replace('/', '-')}-bundle.mjs`)
    writeFileSync(entry, code)
    execFileSync(
      bun,
      ['build', entry, '--bundle', '--minify', '--target=browser', `--outfile=${output}`],
      { stdio: 'pipe', cwd: directory },
    )
    const bundled = readFileSync(output)
    gpuBundles.push({
      engine: id,
      minified: bundled.byteLength,
      gzip: gzipSync(bundled, { level: 9 }).byteLength,
    })
  }

  return {
    bundler: `Bun ${execFileSync(bun, ['--version'], { encoding: 'utf8' }).trim()}`,
    results: bundles,
    gpuResults: gpuBundles,
  }
}

async function runBenchmarks(comparisonDirectory) {
  process.stderr.write('Measuring browser bundle sizes with Bun...\n')
  const bundles = await measureBundles(comparisonDirectory)

  const sizes = (process.env.BENCH_SIZES_KIB || '11,100,500')
    .split(',')
    .map(v => positiveNumber(v.trim(), 0))
    .filter(Boolean)
  const targetMiB = positiveNumber(process.env.BENCH_TARGET_MIB, 4)
  const runs = Math.ceil(positiveNumber(process.env.BENCH_RUNS, 5))
  const results = []

  process.stderr.write(`Running throughput benchmarks (${runs} runs per sample)...\n`)
  for (const size of sizes) {
    const iterations = Math.max(3, Math.ceil((targetMiB * 1024) / size))
    for (const engine of engines) {
      const output = execFileSync(
        process.execPath,
        ['--expose-gc', script, '--worker', engine.id, String(size), String(iterations), String(runs)],
        {
          encoding: 'utf8',
          env: { ...process.env, FP_BENCH_MODULES: comparisonDirectory },
          maxBuffer: 1024 * 1024,
        },
      )
      results.push(JSON.parse(output))
    }
  }

  const snapshot = {
    measuredAt: new Date().toISOString(),
    runtime: process.version,
    platform: `${process.platform} ${process.arch}`,
    cpu: cpus()[0]?.model || 'Apple Silicon',
    engines,
    bundles,
    results,
  }

  writeFileSync(join(root, 'docs/benchmark-results.json'), JSON.stringify(snapshot, null, 2) + '\n')
  process.stderr.write('Saved results snapshot to docs/benchmark-results.json\n')

  // Format Markdown comparison table exactly like Sugar High's README table:
  const bundleRows = [
    { label: 'Minified (KiB)', key: 'minified' },
    { label: 'Gzip (KiB)', key: 'gzip' },
  ].map(m => {
    const vals = engines.map(e => {
      const b = bundles.results.find(r => r.engine === e.id)
      return (b[m.key] / 1024).toFixed(2)
    })
    return `| ${m.label.padEnd(16)} | ${vals.map(v => v.padStart(16)).join(' | ')} |`
  })

  const speedRows = sizes.map(size => {
    const vals = engines.map(e => {
      const r = results.find(res => res.engine === e.id && res.targetKiB === size)
      return r ? r.milliseconds.toFixed(2) : '-'
    })
    return `| ${`${size} KiB`.padEnd(16)} | ${vals.map(v => v.padStart(16)).join(' | ')} |`
  })

  const header = `| TypeScript       | ${engines.map(e => `${e.label} ${e.version}`.padStart(16)).join(' | ')} |`
  const separator = `| :--------------- | ${engines.map(() => '----------------:').join(' | ')} |`

  const markdownTable = [
    `### Benchmark Comparison (Same Methodology as Sugar High)`,
    `Measured with Node ${process.version}, ${process.platform} ${process.arch}, ${cpus()[0]?.model || 'Apple Silicon'}.`,
    '',
    header,
    separator,
    ...bundleRows,
    ...speedRows,
    '',
    `*Median milliseconds per file; lower is better. ${runs} timed samples after warmup.*`,
    `*Sizes are TypeScript-only browser bundles minified with ${bundles.bundler}; gzip uses level 9.*`,
    '',
    `#### WebGPU Bundles (with \`gpu-lexer\`)`,
    `| Engine           | Minified (KiB) | Gzip (KiB) |`,
    `| :--------------- | -------------: | ---------: |`,
    ...bundles.gpuResults.map(
      g => `| ${g.engine.padEnd(16)} | ${(g.minified / 1024).toFixed(2).padStart(14)} | ${(g.gzip / 1024).toFixed(2).padStart(10)} |`,
    ),
  ].join('\n')

  const readmeMarkdown = [
    '<!-- benchmark:start -->',
    `Measured ${snapshot.measuredAt.slice(0, 10)} with Node ${snapshot.runtime}, ${snapshot.platform}, ${snapshot.cpu}.`,
    '',
    `| TypeScript | ${engines.map(e => `${e.label} ${e.version}`).join(' | ')} |`,
    `| --- | ${engines.map(() => '---:').join(' | ')} |`,
    ...['minified', 'gzip'].map(metric =>
      `| ${metric === 'gzip' ? 'Gzip' : 'Minified'} (KiB) | ${engines.map(e => (bundles.results.find(r => r.engine === e.id)[metric] / 1024).toFixed(2)).join(' | ')} |`
    ),
    ...sizes.map(size => {
      const row = engines.map(e => {
        const r = results.find(res => res.engine === e.id && res.targetKiB === size)
        return r ? r.milliseconds.toFixed(2) : '-'
      })
      return `| ${size} KiB | ${row.join(' | ')} |`
    }),
    '',
    `Median milliseconds per file; lower is better. ${runs} timed samples after warmup.`,
    `Sizes are TypeScript-only browser bundles, minified with Bun; gzip uses level 9. Theme CSS is excluded.`,
    `Loading and initialization are excluded. Each library highlights the same generated TypeScript`,
    `into HTML using an explicit language. Grammars and HTML output differ; this is not a measure`,
    `of highlighting quality or browser rendering speed. Results vary by machine and workload.`,
    '<!-- benchmark:end -->',
  ].join('\n')

  if (process.argv.includes('--write')) {
    const marker = /<!-- benchmark:start -->[\s\S]*?<!-- benchmark:end -->/
    for (const file of [join(root, 'README.md'), join(root, 'packages/core/README.md')]) {
      try {
        const content = readFileSync(file, 'utf8')
        if (marker.test(content)) {
          writeFileSync(file, content.replace(marker, () => readmeMarkdown))
          process.stderr.write(`Updated benchmark table in ${file}\n`)
        }
      } catch (err) {
        process.stderr.write(`Could not update ${file}: ${err.message}\n`)
      }
    }
  }

  console.log('\n' + markdownTable + '\n')

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(snapshot, null, 2))
  }
}

async function runSuite() {
  const comparisonDirectory = installComparisons()
  try {
    await runBenchmarks(comparisonDirectory)
  } finally {
    rmSync(comparisonDirectory, { recursive: true, force: true })
  }
}

if (process.argv[2] === '--worker') {
  await runWorker()
} else {
  await runSuite()
}
