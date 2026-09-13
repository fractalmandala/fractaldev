import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import remarkFractalpop from '@fractalpop/remark'
import benchmarkMd from '../../../../../../docs/BENCHMARK.md?raw'
import benchmarkResultsRaw from '../../../../../../docs/benchmark-results.json?raw'

export async function load() {
  const file = await remark()
    .use(gfm)
    .use(remarkFractalpop)
    .use(html, { sanitize: false })
    .process(benchmarkMd)

  return {
    contentHtml: String(file),
    jsonString: benchmarkResultsRaw.trim(),
  }
}
