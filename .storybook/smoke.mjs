/**
 * Storybook render smoke test: load every story and fail if any throws while
 * rendering. A clean story leaves `#error-message` empty; a throwing one fills
 * it (or leaves `#storybook-root` empty).
 *
 * Uses Playwright directly rather than @storybook/test-runner, whose Jest stack
 * is incompatible with this toolchain (ESM-only `strip-ansi` under yarn-v1).
 *
 * Usage: `yarn storybook` in one terminal, then `yarn test-storybook`.
 * Override the target with STORYBOOK_URL, or narrow it with STORYBOOK_IDS
 * (comma-separated ids) to re-check a subset.
 */
import { chromium } from 'playwright'

const DEFAULT_STORYBOOK_URL = 'http://127.0.0.1:6006'
const SETTLE_MS = 2500
const POLL_INTERVAL_MS = 100
const LATE_THROW_GRACE_MS = 150
const GOTO_TIMEOUT_MS = 15000
const ERROR_PREVIEW_LENGTH = 200

/**
 * Storybook base URL, trailing slash stripped.
 * @returns {string}
 */
function resolveBaseUrl() {
  return (process.env.STORYBOOK_URL || DEFAULT_STORYBOOK_URL).replace(/\/$/, '')
}

/**
 * Story ids to restrict the run to; empty means every story.
 * @returns {Set<string>}
 */
function resolveStoryIdFilter() {
  const ids = (process.env.STORYBOOK_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean)
  return new Set(ids)
}

/**
 * Fetch the entries to smoke. Only `story` entries render into
 * `#storybook-root`; autodocs pages are covered by their underlying stories.
 * @param {string} baseUrl
 * @param {Set<string>} idFilter
 * @returns {Promise<Array<{ id: string, title: string, name: string }>>}
 */
async function fetchStoryEntries(baseUrl, idFilter) {
  const index = await fetch(`${baseUrl}/index.json`).then(response => response.json())
  const entries = Object.values(index.entries ?? index.stories ?? {})
  return entries
    .filter(entry => entry.type === 'story')
    .filter(entry => idFilter.size === 0 || idFilter.has(entry.id))
}

/**
 * @param {string} baseUrl
 * @param {string} id
 * @returns {string}
 */
function storyIframeUrl(baseUrl, id) {
  return `${baseUrl}/iframe.html?id=${id}&viewMode=story`
}

/**
 * Poll the rendered story for an error, in the browser. Returns the
 * `#error-message` text (empty when clean). Avoids `networkidle` — a story
 * firing a failing request never reaches it.
 * @param {{ settleMs: number, pollMs: number, graceMs: number }} timings
 * @returns {Promise<string>}
 */
async function detectRenderError({ settleMs, pollMs, graceMs }) {
  const readState = () => {
    const message = document.querySelector('#error-message')
    const text = message ? message.textContent.trim() : ''
    const root = document.querySelector('#storybook-root')
    return { text, rendered: !!root && root.children.length > 0 }
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  const deadline = Date.now() + settleMs
  while (Date.now() < deadline) {
    const state = readState()
    if (state.text) {
      return state.text
    }
    // Rendered something: wait one tick for a late async throw, then re-read.
    if (state.rendered) {
      await wait(graceMs)
      return readState().text
    }
    await wait(pollMs)
  }
  return readState().text
}

/**
 * Load one story and return its render error (empty string if clean).
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {{ id: string }} entry
 * @returns {Promise<string>}
 */
async function renderStoryError(page, baseUrl, entry) {
  const url = storyIframeUrl(baseUrl, entry.id)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: GOTO_TIMEOUT_MS }).catch(() => {})
  return page.evaluate(detectRenderError, {
    settleMs: SETTLE_MS,
    pollMs: POLL_INTERVAL_MS,
    graceMs: LATE_THROW_GRACE_MS,
  })
}

/**
 * Smoke every entry, printing a dot per pass and a cross per failure.
 * @param {import('playwright').Page} page
 * @param {string} baseUrl
 * @param {Array<{ id: string, title: string, name: string }>} entries
 * @returns {Promise<Array<{ id: string, label: string, error: string }>>}
 */
async function smokeStories(page, baseUrl, entries) {
  const failures = []
  for (const entry of entries) {
    const error = await renderStoryError(page, baseUrl, entry)
    if (error) {
      const label = `${entry.title} / ${entry.name}`
      failures.push({ id: entry.id, label, error: error.slice(0, ERROR_PREVIEW_LENGTH) })
      process.stdout.write('✗')
    }
    else {
      process.stdout.write('.')
    }
  }
  process.stdout.write('\n')
  return failures
}

/**
 * @param {Array<{ id: string, label: string, error: string }>} failures
 * @param {number} total
 * @returns {void}
 */
function reportFailures(failures, total) {
  console.error(`\n${failures.length}/${total} stories errored:\n`)
  for (const failure of failures) {
    console.error(`  ✗ ${failure.label} [${failure.id}]\n      ${failure.error}`)
  }
}

/**
 * Run the suite and exit non-zero if any story errored.
 * @returns {Promise<void>}
 */
async function main() {
  const baseUrl = resolveBaseUrl()
  const entries = await fetchStoryEntries(baseUrl, resolveStoryIdFilter())

  const browser = await chromium.launch()
  let failures = []
  // Always close the browser, even if a render throws mid-suite.
  try {
    const page = await browser.newPage()
    failures = await smokeStories(page, baseUrl, entries)
  }
  finally {
    await browser.close()
  }

  if (failures.length) {
    reportFailures(failures, entries.length)
    process.exit(1)
  }
  console.log(`\nAll ${entries.length} stories rendered without errors.`)
}

await main()
