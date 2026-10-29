import { COMPONENTS_CHUNK } from './manualChunks.js'

const STYLESHEET = /\s*<link rel="stylesheet"[^>]*>/g
// Built from the chunk name rather than repeated, so renaming the chunk cannot
// turn this transform into a silent no-op.
const COMPONENT_CHUNK = new RegExp(`/${COMPONENTS_CHUNK}-[^."]*\\.css`)

/**
 * Move the component chunk's stylesheet to the end of the head.
 *
 * Vite emits a stylesheet as a static dependency of whichever chunk imports it,
 * so grouping the components makes components.css land before the entry's own
 * stylesheet. Component rules then lose every specificity tie against bootstrap
 * and murmur, which they used to win only because their stylesheet was injected
 * last. Restoring that order keeps the cascade identical to an ungrouped build.
 *
 * @param {string} html - the generated index.html
 * @returns {string} the same html with component stylesheets moved last
 */
export function componentCssLast(html) {
  const links = [...html.matchAll(STYLESHEET)].map(([link]) => link)
  const components = links.filter(link => COMPONENT_CHUNK.test(link))

  if (!components.length || components.length === links.length) {
    return html
  }

  let moved = html
  for (const link of components) {
    moved = moved.replace(link, '')
  }

  const last = links.filter(link => !components.includes(link)).at(-1)
  return moved.replace(last, last + components.join(''))
}
