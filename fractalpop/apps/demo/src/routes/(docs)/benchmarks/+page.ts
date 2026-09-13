import benchmarkResultsRaw from '../../../../../../docs/benchmark-results.json?raw'

export function load() {
  return {
    jsonString: benchmarkResultsRaw.trim(),
  }
}
