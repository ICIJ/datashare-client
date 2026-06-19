import { flushPromises, mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocuments, letData } from '~tests/unit/es_utils'
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

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      tree: vi.fn()
    }
  }
})

describe('PathTree.vue', () => {
  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('Posix', () => {
    const { index, es } = esConnectionHelper.build()
    let wrapper, core, searchStore

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
      searchStore = useSearchStore()
      searchStore.setIndex(index)
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)

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
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should display 4 directories including one from the tree', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.find('.path-tree-view-entry-stats-documents').exists()).toBeTruthy()
      expect(wrapper.find('.path-tree-view-entry-stats-documents').text()).toBe('10')
      expect(wrapper.findAll('.path-tree-view-entry-stats-documents')).toHaveLength(4)
    })

    it('should be a display a correct basename', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

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

    it('counts only descendant folders that contain documents directly (recursive, pass-through excluded)', async () => {
      // /home/foo/deep is a pass-through folder: its only documents live in /home/foo/deep/leaf.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/deep/leaf/doc_01').withIndex(index).count(3))
        .commit()
      // /home/foo/bar contains documents directly and has no subfolders.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_02').withIndex(index).count(3))
        .commit()

      await wrapper.setProps({ noTree: true })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // Entries render in KEY-asc order: [root /home/foo, bar, deep].
      // Directory-count stat is shown for each (non-compact mode).
      const counts = wrapper.findAll('.path-tree-view-entry-stats-directories')
      // index 1 = bar: no subfolders -> 0
      expect(counts.at(1).text()).toBe('0')
      // index 2 = deep: one descendant folder with direct docs (deep/leaf) -> 1
      expect(counts.at(2).text()).toBe('1')
    })
  })

  describe('compact mode (filter column)', () => {
    const { index } = esConnectionHelper.build()
    let core, searchSpy

    const fullPageOfBuckets = Array.from({ length: 50 }, (_, i) => ({
      key: `/home/foo/dir${String(i).padStart(2, '0')}`,
      doc_count: 1,
      size: { value: 100 }
    }))

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
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

  describe('directory_paths aggregation', () => {
    const { index } = esConnectionHelper.build()
    let core, searchSpy

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)
      searchSpy = vi.spyOn(api.elasticsearch, 'search').mockResolvedValue({
        hits: { total: { value: 0 }, hits: [] },
        aggregations: {
          total_directories: { value: 1 },
          total_size: { value: 0 },
          dirname: { buckets: [] },
          directory_paths: { buckets: [] }
        }
      })
    })

    afterEach(() => {
      searchSpy.mockRestore()
    })

    it('requests a keys-only directory_paths terms agg on the exact dirname field', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const { body } = searchSpy.mock.calls[0][0]
      expect(body.aggs).toHaveProperty('directory_paths')
      expect(body.aggs.directory_paths.terms.field).toBe('dirname')
      expect(body.aggs.directory_paths.terms.size).toBe(10000)
      // keys only: no metric/bucket sub-aggregations
      expect(body.aggs.directory_paths.aggs).toBeUndefined()
    })

    it('no longer requests a per-bucket cardinality sub-aggregation', async () => {
      const wrapper = mount(PathTree, {
        props: { projects: [index], path: '/home/foo', noDocuments: true },
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const { body } = searchSpy.mock.calls[0][0]
      expect(body.aggs.dirname.aggs).not.toHaveProperty('directories')
    })
  })

  describe('Windows', () => {
    const { index, es } = esConnectionHelper.build('spec', true)
    let wrapper, core, searchStore

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      searchStore = useSearchStore()
      searchStore.setIndex(index)
      core.config.set('dataDir', 'C:\\home\\foo')
      core.config.set('pathSeparator', '\\')

      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE_WIN)

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
    })

    it('should be a display a correct basename on windows', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\bar\\doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\baz\\doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(0).text()).toBe('foo')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(1).text()).toBe('bar')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(2).text()).toBe('baz')
      expect(wrapper.findAll('.path-tree-view-entry-name__value').at(3).text()).toBe('01FOO')
    })

    it('should display 3 directories including one from the tree on windows', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\bar\\doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\baz\\doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })

      expect(wrapper.find('.path-tree-view-entry-stats-documents').exists()).toBeTruthy()
      expect(wrapper.find('.path-tree-view-entry-stats-documents').text()).toBe('10')
      expect(wrapper.findAll('.path-tree-view-entry')).toHaveLength(4)
    })
  })
})
