import find from 'lodash/find'
import { createLocalVue, mount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import { App } from '@/main'
import { datashare } from '@/store/modules/search'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FacetPath from '@/components/FacetPath'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonResp } from 'tests/unit/tests_utils'

const { localVue, i18n, store } = App.init(createLocalVue()).useAll()

describe('FacetPath.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(async () => {
    Murmur.config.set('dataDir', '/data')
    wrapper = mount(FacetPath, {
      localVue,
      i18n,
      store,
      propsData: {
        facet: find(store.state.search.facets, { name: 'path' })
      }
    })
    store.commit('search/reset')
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
    store.commit('search/setGlobalSearch', false)
  })

  afterAll(() => datashare.fetch.mockRestore())

  it('should display an empty tree', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(0)
  })

  it('should display a not empty tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/doc_01')).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/doc_02')).commit()
    await letData(es).have(new IndexedDocument('/data/folder_03/doc_03')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(3)
  })

  it('should display the first level of the tree', async () => {
    await letData(es).have(new IndexedDocument('/data/folder_01/doc_01')).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/doc_02')).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/folder_03/doc_03')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.tree-node').length).toEqual(2)
  })

  describe('filter the facet', () => {
    it('should filter items according to the path facet search', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_01/document_01')).commit()
      await letData(es).have(new IndexedDocument('/data/folder_02/document_02')).commit()

      const pathFacet = find(store.state.search.facets, { name: 'path' })
      pathFacet.value = ['/data/folder_01/']
      store.commit('search/addFacetValue', pathFacet)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })

    it('should filter on a specific folder even if another folder starts with the same name', async () => {
      await letData(es).have(new IndexedDocument('/data/folder_1/document_01')).commit()
      await letData(es).have(new IndexedDocument('/data/folder_11/document_02')).commit()
      await letData(es).have(new IndexedDocument('/data/folder_22/document_03')).commit()

      const pathFacet = find(store.state.search.facets, { name: 'path' })
      pathFacet.value = ['/data/folder_1/']
      store.commit('search/addFacetValue', pathFacet)
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.tree-node')).toHaveLength(1)
    })
  })
})
