import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathTree from '@/components/PathTree/PathTree'
import { useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const HOME_TREE = {
  name: '/home/foo',
  type: 'directory',
  prot: 'drwxrwxrwx',
  contents: [
    {
      prot: 'drwxr-xr-x',
      contents: [],
      name: '/home/foo/01FOO',
      type: 'directory'
    }
  ]
}

const HOME_TREE_WIN = {
  name: 'C:\\home\\foo',
  type: 'directory',
  prot: 'dw',
  contents: [
    {
      prot: 'dw',
      contents: [],
      name: 'C:\\home\\foo\\01FOO',
      type: 'directory'
    }
  ]
}

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    elasticsearch: { search: vi.fn() },
    tree: vi.fn()
  }
}))

describe('PathTree.vue', () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('Posix', () => {
    const index = 'local-datashare'
    let wrapper, core, searchStore, searchSpy

    beforeAll(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
    })

    beforeEach(async () => {
      core.createPinia()
      searchStore = useSearchStore()
      searchStore.setIndex(index)
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)

      // The ES include pattern is /home/foo/* so the root is never a bucket.
      // The root entry is always rendered separately (line 543 in PathTree.vue)
      // and gets its doc count from hits.total.value. 01FOO comes from api.tree.
      searchSpy = vi.spyOn(api.elasticsearch, 'search').mockResolvedValue({
        hits: { total: { value: 10 }, hits: [] },
        aggregations: {
          total_directories: { value: 2 },
          dirname: {
            buckets: [
              { key: '/home/foo/bar', doc_count: 5, size: { value: 500 } },
              { key: '/home/foo/baz', doc_count: 5, size: { value: 500 } }
            ]
          }
        }
      })

      wrapper = mount(PathTree, {
        props: {
          projects: [index],
          path: '/home/foo',
          selectedPaths: ['path_01', 'path_02'],
          count: true,
          nested: true,
          infiniteScroll: false,
          noDocuments: true
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })
      // Let the immediate watcher's loadDataWithSpinner complete before each test.
      await flushPromises()
    })

    afterEach(() => {
      wrapper?.unmount()
      searchSpy.mockRestore()
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should display 4 directories including one from the tree', () => {
      expect(wrapper.find('.path-tree-view-entry-stats-documents').exists()).toBeTruthy()
      expect(wrapper.find('.path-tree-view-entry-stats-documents').text()).toBe('10')
      expect(wrapper.findAll('.path-tree-view-entry-stats-documents')).toHaveLength(4)
    })

    it('should be a display a correct basename', () => {
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(0).text()).toBe('foo')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(1).text()).toBe('bar')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(2).text()).toBe('baz')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(3).text()).toBe('01FOO')
    })

    it('should init selected on component creation', () => {
      expect(wrapper.vm.selectedPaths).toEqual(['path_01', 'path_02'])
    })

    it('should show a search bar', async () => {
      await wrapper.setProps({ noSearch: false })
      await flushPromises()
      expect(wrapper.find('.path-tree-view-search').exists()).toBeTruthy()
    })

    it('should not show a search bar', async () => {
      await wrapper.setProps({ noSearch: true })
      await flushPromises()
      expect(wrapper.find('.path-tree-view-search').exists()).toBeFalsy()
    })
  })

  describe('compact mode (filter column)', () => {
    const index = 'local-datashare'
    let core, searchSpy

    const fullPageOfBuckets = Array.from({ length: 50 }, (_, i) => ({
      key: `/home/foo/dir${String(i).padStart(2, '0')}`,
      doc_count: 1,
      size: { value: 100 }
    }))

    beforeAll(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
    })

    beforeEach(() => {
      core.createPinia()
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)
      searchSpy = vi.spyOn(api.elasticsearch, 'search').mockResolvedValue({
        hits: { total: { value: 0 }, hits: [] },
        aggregations: {
          total_directories: { value: 201 },
          dirname: { buckets: fullPageOfBuckets }
        }
      })
    })

    afterEach(() => {
      searchSpy.mockRestore()
    })

    it('includes total_directories in ES query even in compact mode', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', compact: true, noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const { body } = searchSpy.mock.calls[0][0]
      expect(body.aggs).toHaveProperty('total_directories')
    })

    it('shows remaining directory count in "show more" button in compact mode', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', compact: true, noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // Before the fix, compact mode omitted total_directories from ES query,
      // causing totalDirectories=0 -> directoriesLeft=0 -> "No more directories"
      expect(wrapper.find('.path-tree-view-entry-more').text()).toMatch(/Show \d+ of \d+ more director/)
    })
  })

  describe('Windows', () => {
    const index = 'local-datashare'
    let wrapper, core, searchStore, searchSpy

    beforeAll(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', 'C:\\home\\foo')
      core.config.set('pathSeparator', '\\')
    })

    beforeEach(async () => {
      core.createPinia()
      searchStore = useSearchStore()
      searchStore.setIndex(index)

      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE_WIN)

      searchSpy = vi.spyOn(api.elasticsearch, 'search').mockResolvedValue({
        hits: { total: { value: 10 }, hits: [] },
        aggregations: {
          total_directories: { value: 2 },
          dirname: {
            buckets: [
              { key: 'C:\\home\\foo\\bar', doc_count: 5, size: { value: 500 } },
              { key: 'C:\\home\\foo\\baz', doc_count: 5, size: { value: 500 } }
            ]
          }
        }
      })

      wrapper = mount(PathTree, {
        props: {
          projects: [index],
          path: 'C:\\home\\foo',
          count: true,
          nested: true,
          infiniteScroll: false,
          noDocuments: true
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })
      await flushPromises()
    })

    afterEach(() => {
      wrapper?.unmount()
      searchSpy.mockRestore()
    })

    it('should be a display a correct basename on windows', () => {
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(0).text()).toBe('foo')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(1).text()).toBe('bar')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(2).text()).toBe('baz')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(3).text()).toBe('01FOO')
    })

    it('should display 3 directories including one from the tree on windows', () => {
      expect(wrapper.find('.path-tree-view-entry-stats-documents').exists()).toBeTruthy()
      expect(wrapper.find('.path-tree-view-entry-stats-documents').text()).toBe('10')
      expect(wrapper.findAll('.path-tree-view-entry')).toHaveLength(4)
    })
  })
})
