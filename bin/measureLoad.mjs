/**
 * Compare two production builds on what actually hurts over HTTP/1.1: the number
 * of sequential request waves. Localhost has no latency, which hides the cost
 * entirely, so the browser is throttled to a realistic RTT via CDP.
 *
 * Usage: node bin/measureLoad.mjs <distA> <distB> [--rtt 40]
 * Each dist is served by `vite preview`, so /settings and /me are proxied to
 * VITE_DEV_PROXY exactly as in a real deployment.
 */
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve, basename } from 'path'

const [, , ...argv] = process.argv
const rttIndex = argv.indexOf('--rtt')
const RTT_MS = rttIndex === -1 ? 40 : Number(argv[rttIndex + 1])
const dists = argv.filter((a, i) => !a.startsWith('--') && (rttIndex === -1 || i !== rttIndex + 1))
const DOWNLOAD_BPS = (10 * 1000 * 1000) / 8

if (dists.length !== 2) {
  console.error('usage: node bin/measureLoad.mjs <distA> <distB> [--rtt 40]')
  process.exit(1)
}

/** Chunks a route pulls in through static imports, i.e. what blocks its render. */
function staticClosure(assetsDir, prefix) {
  const pattern = /(?:from|(?<![\w)])import)\s*["']\.\/([A-Za-z0-9_.-]+\.js)["']/g
  const entry = readdirSync(assetsDir).find(f => f.startsWith(prefix) && f.endsWith('.js'))
  const seen = new Set([entry])
  const queue = [entry]
  while (queue.length) {
    const source = readFileSync(`${assetsDir}/${queue.pop()}`, 'utf8')
    for (const [, dep] of source.matchAll(pattern)) {
      if (!seen.has(dep) && existsSync(`${assetsDir}/${dep}`)) {
        seen.add(dep)
        queue.push(dep)
      }
    }
  }
  return [...seen]
}

function serve(dist, port) {
  const server = spawn('yarn', ['vite', 'preview', '--outDir', resolve(dist), '--port', String(port)], {
    stdio: 'ignore'
  })
  return server
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    }
    catch {
      // server not up yet
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`server never came up: ${url}`)
}

async function throttle(page) {
  const session = await page.context().newCDPSession(page)
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: RTT_MS,
    downloadThroughput: DOWNLOAD_BPS,
    uploadThroughput: DOWNLOAD_BPS
  })
  return session
}

/** Replays a route's chunk list with the browser's own HTTP/1.1 connection pool. */
async function replayClosure(page, origin, urls) {
  return page.evaluate(async ({ origin, urls }) => {
    const started = performance.now()
    await Promise.all(urls.map(u => fetch(`${origin}/assets/${u}`).then(r => r.arrayBuffer())))
    return performance.now() - started
  }, { origin, urls })
}

async function measure(dist, port) {
  const assetsDir = `${dist}/assets`
  const origin = `http://localhost:${port}`
  const server = serve(dist, port)
  const browser = await chromium.launch()
  try {
    await waitForServer(`${origin}/index.html`)
    const context = await browser.newContext()
    const page = await context.newPage()
    await throttle(page)

    const requests = []
    page.on('requestfinished', async (request) => {
      const url = request.url()
      if (url.startsWith(origin)) requests.push(url)
    })

    const bootStarted = Date.now()
    await page.goto(origin, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle').catch(() => {})
    const bootMs = Date.now() - bootStarted
    const bootJs = requests.filter(u => u.endsWith('.js')).length

    const routes = {}
    for (const prefix of ['ProjectList-', 'Search-', 'DocumentView-']) {
      const urls = staticClosure(assetsDir, prefix)
      await page.goto(`${origin}/index.html`)
      const cold = await replayClosure(page, origin, urls)
      const warm = await replayClosure(page, origin, urls)
      routes[prefix.replace('-', '')] = { count: urls.length, cold: Math.round(cold), warm: Math.round(warm) }
    }
    return { name: basename(dist), chunks: readdirSync(assetsDir).filter(f => f.endsWith('.js')).length, bootMs, bootJs, routes }
  }
  finally {
    await browser.close()
    server.kill()
  }
}

const results = []
let port = 9100
for (const dist of dists) {
  results.push(await measure(dist, port++))
}

const pad = (s, n) => String(s).padEnd(n)
console.log(`\nRTT ${RTT_MS} ms, 10 Mbps, HTTP/1.1\n`)
console.log(pad('', 18) + results.map(r => pad(r.name, 22)).join(''))
console.log(pad('chunks emitted', 18) + results.map(r => pad(r.chunks, 22)).join(''))
console.log(pad('boot: js reqs', 18) + results.map(r => pad(r.bootJs, 22)).join(''))
console.log(pad('boot: load', 18) + results.map(r => pad(`${r.bootMs} ms`, 22)).join(''))
for (const route of Object.keys(results[0].routes)) {
  console.log(`\n  ${route}`)
  console.log(pad('    requests', 18) + results.map(r => pad(r.routes[route].count, 22)).join(''))
  console.log(pad('    cold fetch', 18) + results.map(r => pad(`${r.routes[route].cold} ms`, 22)).join(''))
  console.log(pad('    warm (304s)', 18) + results.map(r => pad(`${r.routes[route].warm} ms`, 22)).join(''))
}
console.log()
