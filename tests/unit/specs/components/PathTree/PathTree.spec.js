import { flushPromises, mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocuments, letData } from '~tests/unit/es_utils'
import PathTree from '@/components/PathTree/PathTree'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
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
      // /home/foo/deep/leaf is a pass-through folder: its only documents live one level below,
      // in /home/foo/deep/leaf/a and /home/foo/deep/leaf/b. The single-child chain
      // /home/foo/deep -> /home/foo/deep/leaf is folded into one entry.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/deep/leaf/a/doc_01').withIndex(index).count(3))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/deep/leaf/b/doc_03').withIndex(index).count(3))
        .commit()
      // /home/foo/bar contains documents directly and has no subfolders.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_02').withIndex(index).count(3))
        .commit()

      await wrapper.setProps({ noTree: true })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // Entries render in KEY-asc order: [root /home/foo, bar, deep/leaf].
      // Directory-count stat is shown for each (non-compact mode).
      const counts = wrapper.findAll('.path-tree-view-entry-stats-directories')
      // index 1 = bar: no subfolders -> 0
      expect(counts.at(1).text()).toBe('0')
      // index 2 = deep/leaf: two descendant folders with direct docs (a and b), and
      // leaf itself is a pass-through folder so it is not counted -> 2
      expect(counts.at(2).text()).toBe('2')
    })

    it('makes a single Elasticsearch request per level (no empty-directories probe)', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(3))
        .commit()

      const searchSpy = vi.spyOn(api.elasticsearch, 'search')
      await wrapper.setProps({ noTree: true })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // noDocuments is true on this wrapper, so the only ES call is the directories aggregation.
      expect(searchSpy).toHaveBeenCalledTimes(1)
      searchSpy.mockRestore()
    })
  })

  describe('root path', () => {
    const { index, es } = esConnectionHelper.build()
    let wrapper, core

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)

      wrapper = mount(PathTree, {
        props: {
          projects: [index],
          path: '/',
          noTree: true
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })
    })

    it('lists the first-level directory of documents nested far below the root', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(3))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // The whole chain below the root is a single child at every level, so it is
      // folded into one entry instead of one entry per level.
      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toContain('home/foo/bar')
    })

    it('lists documents stored directly at the root', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/doc').withIndex(index).count(1))
        .commit()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toContain('/doc_1')
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

  describe('folded directory chains', () => {
    const { index, es } = esConnectionHelper.build()
    let core, wrapper

    function mountAtHome(props = {}) {
      wrapper = mount(PathTree, {
        props: {
          projects: [index],
          path: '/home/foo',
          noTree: true,
          noDocuments: true,
          // Without this, a still-running load from the immediate `path` watcher
          // swaps the entries for the loading placeholder and the assertions see nothing.
          noPlaceholder: true,
          ...props
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })
      return wrapper
    }

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', '/home/foo')
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE)
    })

    // A left-over tree reacts to the next test's CoreSetup.init() and fetches again,
    // which lands on a deleted index once this block is over.
    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    it('renders a chain of single-child directories as one entry', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/docs/a/b/c/doc_01').withIndex(index).count(2))
        .commit()

      mountAtHome()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toEqual(['foo', 'data/docs/a/b/c'])
    })

    it('stops folding where the chain branches', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/docs/a/doc_01').withIndex(index).count(2))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/docs/b/doc_02').withIndex(index).count(2))
        .commit()

      mountAtHome()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toEqual(['foo', 'data/docs'])
    })

    it('stops folding on a directory holding documents directly', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/doc_01').withIndex(index).count(2))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/docs/a/doc_02').withIndex(index).count(2))
        .commit()

      mountAtHome()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toEqual(['foo', 'data'])
    })

    it('folds chains inside an expanded directory, not only at the root of the tree', async () => {
      // /home/foo/bar branches, so it doesn't fold. One of its children is a chain.
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/deep/a/b/doc_01').withIndex(index).count(2))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/other/doc_02').withIndex(index).count(2))
        .commit()

      mountAtHome({ openPaths: ['/home/foo/bar'] })
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      // The nested PathTree rendered for /home/foo/bar mounts after its parent and runs
      // its own Elasticsearch round trip, so wait for it rather than a single flush.
      await vi.waitFor(() => {
        const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
        // The nested level runs its own directory_paths aggregation, so the chain
        // deep -> a -> b is folded one level down too.
        expect(names).toEqual(['foo', 'bar', 'deep/a/b', 'other'])
      })
    })

    it('gives the folded entry the deepest real directory path', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/data/docs/a/b/c/doc_01').withIndex(index).count(2))
        .commit()

      mountAtHome()
      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const paths = wrapper.findAllComponents(PathTreeViewEntry).map(entry => entry.props('path'))
      expect(paths).toEqual(['/home/foo', '/home/foo/data/docs/a/b/c'])
    })
  })

  describe('folded directory chains on Windows', () => {
    const { index, es } = esConnectionHelper.build('spec', true)
    let core, wrapper

    beforeEach(() => {
      core = CoreSetup.init().useAll()
      core.config.set('dataDir', 'C:\\home\\foo')
      core.config.set('pathSeparator', '\\')
      api.tree.mockClear()
      api.tree.mockResolvedValue(HOME_TREE_WIN)
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
    })

    it('renders a chain of single-child directories as one entry', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('C:\\home\\foo\\data\\docs\\a\\doc_01').withIndex(index).count(2))
        .commit()

      wrapper = mount(PathTree, {
        props: {
          projects: [index],
          path: 'C:\\home\\foo',
          noTree: true,
          noDocuments: true,
          noPlaceholder: true
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })

      await wrapper.vm.loadData({ clearPages: true })
      await flushPromises()

      const names = wrapper.findAll('.path-tree-view-entry-name__value').map(name => name.text())
      expect(names).toEqual(['foo', 'data\\docs\\a'])
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
