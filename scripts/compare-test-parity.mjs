import { readFileSync, writeFileSync } from 'node:fs'

const [basePath, currentPath, outputPath] = process.argv.slice(2)
if (!basePath || !currentPath) {
  throw new Error('Expected baseline JSON, current JSON, [report JSON]')
}
const baseline = JSON.parse(readFileSync(basePath, 'utf8'))
const current = JSON.parse(readFileSync(currentPath, 'utf8'))

function assertions(results) {
  const occurrences = new Map()
  return new Map(
    results.testResults.flatMap((suite) => {
      const file = suite.name.match(/(?:^|\/)((?:src|config|mobile|tests)\/.*)$/)?.[1] ?? suite.name
      return suite.assertionResults.map((test) => {
        const name = `${file}\0${test.fullName}`
        const occurrence = occurrences.get(name) ?? 0
        occurrences.set(name, occurrence + 1)
        return [
          `${name}\0${occurrence}`,
          { file, name: test.fullName, occurrence, status: test.status }
        ]
      })
    })
  )
}

const before = assertions(baseline)
const after = assertions(current)
const regressions = []
const transitions = {}
for (const [key, test] of before) {
  const transition = `${test.status}->${after.get(key)?.status ?? 'missing'}`
  transitions[transition] = (transitions[transition] ?? 0) + 1
  if (test.status === 'passed' && after.get(key)?.status !== 'passed') {
    regressions.push({ ...test, status: after.get(key)?.status ?? 'missing' })
  }
}
const counts = (results) => ({
  files: results.testResults.length,
  passed: results.numPassedTests,
  failed: results.numFailedTests,
  pending: results.numPendingTests
})
const report = {
  baseline: { ...counts(baseline), assertions: before.size },
  current: { ...counts(current), assertions: after.size },
  transitions,
  regressions
}
if (outputPath) {
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
}
console.log(JSON.stringify(report, null, 2))
process.exitCode = regressions.length === 0 ? 0 : 1
