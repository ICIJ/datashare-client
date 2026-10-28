import { componentCssLast } from '@/utils/componentCssLast'
import { COMPONENTS_CHUNK } from '@/utils/manualChunks'

const link = href => `    <link rel="stylesheet" crossorigin href="${href}">\n`
const head = (...hrefs) => `<!doctype html>\n<html>\n  <head>\n${hrefs.map(link).join('')}  </head>\n</html>`
const order = html => [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href)

describe('componentCssLast', () => {
  it('moves the component stylesheet after the entry one', () => {
    const html = head('./assets/vendor-ui-aaa.css', './assets/components-bbb.css', './assets/index-ccc.css')
    expect(order(componentCssLast(html))).toEqual([
      './assets/vendor-ui-aaa.css',
      './assets/index-ccc.css',
      './assets/components-bbb.css'
    ])
  })

  it('leaves a build without a component chunk untouched', () => {
    const html = head('./assets/vendor-ui-aaa.css', './assets/index-ccc.css')
    expect(componentCssLast(html)).toBe(html)
  })

  it('leaves the dev server markup untouched', () => {
    const html = '<!doctype html>\n<html>\n  <head></head>\n</html>'
    expect(componentCssLast(html)).toBe(html)
  })

  it('keeps the html when every stylesheet is a component one', () => {
    const html = head('./assets/components-bbb.css')
    expect(componentCssLast(html)).toBe(html)
  })

  it('looks for the stylesheet of the chunk manualChunks actually emits', () => {
    // Guards the pair: a renamed chunk must not turn the transform into a no-op
    const html = head(`./assets/${COMPONENTS_CHUNK}-bbb.css`, './assets/index-ccc.css')
    expect(order(componentCssLast(html))).toEqual([
      './assets/index-ccc.css',
      `./assets/${COMPONENTS_CHUNK}-bbb.css`
    ])
  })

  it('moves several component stylesheets while keeping their order', () => {
    const html = head('./assets/components-aaa.css', './assets/components-bbb.css', './assets/index-ccc.css')
    expect(order(componentCssLast(html))).toEqual([
      './assets/index-ccc.css',
      './assets/components-aaa.css',
      './assets/components-bbb.css'
    ])
  })
})
