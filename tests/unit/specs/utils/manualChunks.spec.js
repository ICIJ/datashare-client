import { manualChunks, COMPONENTS_CHUNK } from '@/utils/manualChunks'

const srcId = path => `/repo/src/${path}`
const moduleId = path => `/repo/node_modules/${path}`

describe('manualChunks', () => {
  it('groups a regular component', () => {
    expect(manualChunks(srcId('components/Project/ProjectRow/ProjectRow.vue'))).toBe(COMPONENTS_CHUNK)
  })

  it.each([
    'components/Widget/WidgetDiskUsage.vue',
    'components/Filter/FilterType/FilterTypeDateRange.vue',
    'components/Search/SearchAdvancedModal/SearchAdvancedModal.vue',
    'components/Form/FormControl/FormControlDateRange/FormControlDateRange.vue',
    'components/Document/DocumentViewer/DocumentViewerPdf.vue',
    'components/ColumnChartPicker.vue'
  ])('leaves %s out of the group so it stays lazy', (path) => {
    expect(manualChunks(srcId(path))).toBeUndefined()
  })

  it('keeps v-calendar out of the boot preload by not grouping its only component', () => {
    expect(manualChunks(srcId('components/Form/FormControl/FormControlDateRange/FormControlDateRange.vue'))).toBeUndefined()
    expect(manualChunks(moduleId('v-calendar/dist/index.mjs'))).toBe('vendor-calendar')
  })

  it('pins the CommonJS helpers so vendor chunks never depend on the components chunk', () => {
    expect(manualChunks('\0commonjsHelpers.js')).toBe('vendor-framework')
  })

  it.each([
    ['elasticsearch-browser/index.js', 'vendor-search'],
    ['bootstrap-vue-next/dist/index.js', 'vendor-ui'],
    ['resize-observer-polyfill/dist/index.js', 'vendor-ui'],
    ['vue/dist/vue.esm-bundler.js', 'vendor-framework'],
    ['lodash/merge.js', 'vendor-lodash'],
    ['xlsx/xlsx.mjs', 'vendor-export'],
    ['d3-geo/src/index.js', 'vendor-charts']
  ])('puts %s in %s', (path, chunk) => {
    expect(manualChunks(moduleId(path))).toBe(chunk)
  })

  it.each([
    ['bootstrap-vue-next/dist/src/components/BButton/BButton.js', 'vendor-ui'],
    ['v-calendar/dist/src/components/Calendar.js', 'vendor-calendar']
  ])('keeps %s in its vendor chunk despite its src/components path', (path, chunk) => {
    expect(manualChunks(moduleId(path))).toBe(chunk)
  })

  /**
   * The bundle guard cannot see this one: `ColumnChartPicker` is behind a
   * `defineAsyncComponent` call but `WidgetDocumentsByCreationDate.vue` also
   * imports it statically, so dropping it from the list leaves the emitted
   * chunk looking legitimate. The two checks cover disjoint sets.
   */
  it('excludes every component behind a defineAsyncComponent call', () => {
    const sources = Object.values(import.meta.glob('@/**/*.{vue,js}', { query: '?raw', import: 'default', eager: true }))
    const targets = sources
      .filter(source => source.includes('defineAsyncComponent'))
      .flatMap(source => [...source.matchAll(/import\('@\/components\/([^']+)'\)/g)])
      .map(([, path]) => path)

    expect(targets.length).toBeGreaterThan(0)
    const grouped = [...new Set(targets)].filter(target => manualChunks(srcId(`components/${target}.vue`)))
    expect(grouped).toEqual([])
  })

  it('leaves anything else to rollup', () => {
    expect(manualChunks(moduleId('pdfjs-dist/build/pdf.mjs'))).toBeUndefined()
    expect(manualChunks(srcId('views/Search/Search.vue'))).toBeUndefined()
  })
})
