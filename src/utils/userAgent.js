// Order matters: Edge and Opera also announce Chrome, and Chrome also announces Safari
const BROWSERS = [
  ['Edge', /Edg\/([\d.]+)/],
  ['Opera', /OPR\/([\d.]+)/],
  ['Firefox', /Firefox\/([\d.]+)/],
  ['Chrome', /Chrome\/([\d.]+)/],
  ['Safari', /Version\/([\d.]+).*Safari/]
]

// Order matters: iOS announces "like Mac OS X", and Android announces Linux
const SYSTEMS = [
  ['iOS', /iPhone|iPad|iPod/],
  ['Android', /Android/],
  ['Windows', /Windows/],
  ['macOS', /Macintosh/],
  ['Linux', /Linux|X11/]
]

function findBrowser(userAgent) {
  for (const [name, pattern] of BROWSERS) {
    const match = userAgent.match(pattern)
    if (match) {
      return `${name} ${match[1]}`
    }
  }
  return null
}

function findSystem(userAgent) {
  const system = SYSTEMS.find(([, pattern]) => pattern.test(userAgent))
  return system?.[0] ?? null
}

/**
 * Read the browser (with its version) and the operating system from a user
 * agent string. Each is null when not recognized.
 *
 * @param {string} userAgent
 * @returns {{ browser: string|null, os: string|null }}
 */
export function parseUserAgent(userAgent) {
  const browser = findBrowser(userAgent)
  const os = findSystem(userAgent)
  return { browser, os }
}
