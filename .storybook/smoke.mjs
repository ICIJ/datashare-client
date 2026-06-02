/**
 * Storybook render smoke test.
 *
 * Loads every story (and autodocs page) from a running Storybook and fails if
 * any of them throws while rendering. This is the red/green signal for the
 * `$core` + MSW work: a clean story leaves Storybook's `#error-message`
 * element empty, while a story that throws populates it with the error — true
 * both when the body flips to `sb-show-errordisplay` and when the root is left
 * empty.
 *
 * We use Playwright directly (rather than @storybook/test-runner) to keep the
 * harness transparent and free of the heavy Jest stack, which is incompatible
 * with this toolchain (Node's require() of the ESM-only `strip-ansi` breaks
 * @jest/reporters under yarn-v1 hoisting).
 *
 * Usage: `yarn storybook` in one terminal, then `yarn test-storybook`.
 * Override the target with STORYBOOK_URL (e.g. the static build on port 6007).
 *
 * We deliberately avoid `waitUntil: 'networkidle'`: a story that fires a failing
 * request never reaches network-idle and would block on a 30s timeout. Instead
 * we load to `domcontentloaded` and poll briefly for the story to settle —
 * either it rendered content into `#storybook-root` or it populated
 * `#error-message`. This caps per-story time at ~2.5s.
 */
import { chromium } from 'playwright'

const BASE = (process.env.STORYBOOK_URL || 'http://127.0.0.1:6006').replace(/\/$/, '')
const SETTLE_MS = 2500

const index = await fetch(`${BASE}/index.json`).then(response => response.json())
// Smoke only `story` entries: they render into `#storybook-root`, so a clean
// render is detected in milliseconds. Autodocs (`docs`) pages render the same
// components into a different container and would force the full settle timeout
// on every page; their health is already covered by the underlying stories.
//
// Optional STORYBOOK_IDS (comma-separated story ids) narrows the run to a
// subset — handy for quickly re-checking the stories a change was meant to fix
// without paying for the whole suite.
const only = (process.env.STORYBOOK_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean)
const onlySet = new Set(only)
const entries = Object.values(index.entries ?? index.stories ?? {})
  .filter(entry => entry.type === 'story')
  .filter(entry => onlySet.size === 0 || onlySet.has(entry.id))

const browser = await chromium.launch()
const page = await browser.newPage()
const failures = []

for (const entry of entries) {
  const url = `${BASE}/iframe.html?id=${entry.id}&viewMode=story`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
  const error = await page.evaluate(async (settleMs) => {
    const read = () => {
      const message = document.querySelector('#error-message')
      const text = message ? message.textContent.trim() : ''
      const root = document.querySelector('#storybook-root')
      return { text, rendered: !!root && root.children.length > 0 }
    }
    const deadline = Date.now() + settleMs
    while (Date.now() < deadline) {
      const state = read()
      if (state.text) return state.text
      if (state.rendered) {
        // Rendered something — wait one more tick for a late async throw.
        await new Promise(resolve => setTimeout(resolve, 150))
        return read().text
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return read().text
  }, SETTLE_MS)
  if (error) {
    failures.push({ id: entry.id, label: `${entry.title} / ${entry.name}`, error: error.slice(0, 200) })
    process.stdout.write('✗')
  }
  else {
    process.stdout.write('.')
  }
}

process.stdout.write('\n')
await browser.close()

if (failures.length) {
  console.error(`\n${failures.length}/${entries.length} stories errored:\n`)
  for (const failure of failures) {
    console.error(`  ✗ ${failure.label} [${failure.id}]\n      ${failure.error}`)
  }
  process.exit(1)
}

console.log(`\nAll ${entries.length} stories rendered without errors.`)
