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

    expect(wrapper.findAll('.tree-node')).toHaveLength(0)
  })

  it('should display a not empty tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_03/document', project)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node')).toHaveLength(3)
  })

  it('should display the first level of the tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/folder_03/document', project)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node')).toHaveLength(2)
  })

  it('should display all folders of the first level of the tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_03/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_04/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_05/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_06/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_07/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_08/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_09/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_10/document', project)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node')).toHaveLength(10)
  })

  describe('filter the filter', () => {
    it('should filter items according to the path filter search', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_01/document', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_02/document', project)).commit()

      const pathFilter = find(store.getters['search/instantiatedFilters'], { name: 'path' })
      pathFilter.value = ['/data/folder_01/']
      store.commit('search/addFilterValue', pathFilter)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })

    it('should filter on a specific folder even if another folder starts with the same name', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_1/document', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_11/document', project)).commit()
      await letData(es).have(new IndexedDocument('/data/folder_22/document', project)).commit()

      const pathFilter = find(store.getters['search/instantiatedFilters'], { name: 'path' })
      pathFilter.value = ['/data/folder_1/']
      store.commit('search/addFilterValue', pathFilter)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })
  })
})
