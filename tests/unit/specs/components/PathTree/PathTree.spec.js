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
          size: true,
          count: true,
          nested: true,
          infiniteScroll: false
        },
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        }
      })
    })

    afterAll(() => {
      vi.resetAllMocks()
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should display 3 directories including the current', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/bar/doc_01').withIndex(index).count(5))
        .commit()
      await letData(es)
        .have(new IndexedDocuments().setBaseName('/home/foo/baz/doc_02').withIndex(index).count(5))
        .commit()
      await wrapper.vm.loadData()

      expect(wrapper.find('.path-tree-view-entry-stats-documents').exists()).toBeTruthy()
      expect(wrapper.find('.path-tree-view-entry-stats-documents').text()).toBe('10')
      expect(wrapper.findAll('.path-tree-view-entry')).toHaveLength(3)
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
          size: true,
          count: true,
          nested: true,
          infiniteScroll: false
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
