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
 */
import { chromium } from 'playwright'

const BASE = (process.env.STORYBOOK_URL || 'http://127.0.0.1:6006').replace(/\/$/, '')

const index = await fetch(`${BASE}/index.json`).then((response) => response.json())
const entries = Object.values(index.entries ?? index.stories ?? {})

const browser = await chromium.launch()
const page = await browser.newPage()
const failures = []

for (const entry of entries) {
  const viewMode = entry.type === 'docs' ? 'docs' : 'story'
  const url = `${BASE}/iframe.html?id=${entry.id}&viewMode=${viewMode}`
  await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {})
  const error = await page.evaluate(async () => {
    // Give async setup()/onMounted hooks a tick to throw before we read.
    await new Promise((resolve) => setTimeout(resolve, 300))
    const message = document.querySelector('#error-message')
    return message ? message.textContent.trim() : ''
  })
  if (error) {
    failures.push({ id: entry.id, label: `${entry.title} / ${entry.name}`, error: error.slice(0, 200) })
    process.stdout.write('✗')
  } else {
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
