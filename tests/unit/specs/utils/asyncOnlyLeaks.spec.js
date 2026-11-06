import { asyncOnlyLeaks, COMPONENTS_CHUNK } from '@/utils/manualChunks'

const GLOB = '/repo/src/core/ComponentsMixin.js'

const bundle = ids => ({
  'components-aaa.js': { name: COMPONENTS_CHUNK, moduleIds: ids },
  'index-bbb.js': { name: 'index', moduleIds: ['/repo/src/main.js'] }
})

const leaks = info => asyncOnlyLeaks(bundle(Object.keys(info)), id => info[id])

describe('asyncOnlyLeaks', () => {
  it('reports a module the group reaches only through a defineAsyncComponent call', () => {
    const id = '/repo/src/components/Widget/WidgetDiskUsage.vue'
    expect(leaks({ [id]: { importers: [], dynamicImporters: [GLOB, '/repo/src/store/widgets.js'] } })).toEqual([id])
  })

  it('accepts a component that only the plugin API glob imports dynamically', () => {
    const id = '/repo/src/components/Badge/BadgeFilter.vue'
    expect(leaks({ [id]: { importers: [], dynamicImporters: [GLOB] } })).toEqual([])
  })

  it('accepts an excluded path that a static importer dragged into the group', () => {
    const id = '/repo/src/components/Filter/FilterType/FilterType.vue'
    const importers = ['/repo/src/composables/useSearchFilter.js']
    expect(leaks({ [id]: { importers, dynamicImporters: [GLOB] } })).toEqual([])
  })

  it('ignores the other chunks', () => {
    const info = { '/repo/src/main.js': { importers: [], dynamicImporters: ['/repo/src/lazy.js'] } }
    expect(asyncOnlyLeaks(bundle([]), id => info[id])).toEqual([])
  })

  it('tolerates a build without a components chunk', () => {
    expect(asyncOnlyLeaks({ 'index-bbb.js': { name: 'index', moduleIds: [] } }, () => null)).toEqual([])
  })
})
