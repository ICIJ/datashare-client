import find from 'lodash/find'
import toLower from 'lodash/toLower'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'

import FilterPath from '@/components/FilterPath'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()

describe('FilterPath.vue', () => {
  const project = toLower('FilterPath')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    Murmur.config.set('dataDir', '/data')
    wrapper = mount(FilterPath, {
      i18n,
      localVue,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'path' }) }
    })
    store.commit('search/reset')
  })

  beforeEach(() => store.commit('search/setGlobalSearch', false))

  it('should display an empty tree', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(0)
  })

  it('should display a not empty tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/doc_01', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/doc_02', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_03/doc_03', project)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(3)
  })

  it('should display the first level of the tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/doc_01', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/doc_02', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/folder_03/doc_03', project)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(2)
  })

  describe('filter the filter', () => {
    it('should filter items according to the path filter search', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_01/document_01', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_02/document_02', project)).commit()

      const pathFilter = find(store.getters['search/instantiatedFilters'], { name: 'path' })
      pathFilter.value = ['/data/folder_01/']
      store.commit('search/addFilterValue', pathFilter)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })

    it('should filter on a specific folder even if another folder starts with the same name', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_1/document_01', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_11/document_02', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_22/document_03', project)).commit()

      const pathFilter = find(store.getters['search/instantiatedFilters'], { name: 'path' })
      pathFilter.value = ['/data/folder_1/']
      store.commit('search/addFilterValue', pathFilter)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })
  })
})
