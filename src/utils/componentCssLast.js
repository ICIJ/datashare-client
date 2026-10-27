const STYLESHEET = /\s*<link rel="stylesheet"[^>]*>/g
const COMPONENT_CHUNK = /\/components-[^."]*\.css/

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

  const moved = components.reduce((acc, link) => acc.replace(link, ''), html)
  const last = links.filter(link => !components.includes(link)).at(-1)
  return moved.replace(last, last + components.join(''))
}
