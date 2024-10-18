import { mount } from '@vue/test-utils'

import { IndexedDocument, IndexedDocuments, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchResultsHeader from '@/components/SearchResultsHeader'

describe('SearchResultsHeader.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { index: anotherIndex } = esConnectionHelper.build()
  let wrapper, api, core

  beforeAll(() => {
    api = {
      runBatchDownload: vi.fn(),
      elasticsearch: es,
      getMappingsByFields: vi.fn()
    }
    core = CoreSetup.init(api).useAll().useRouter()
    core.store.commit('search/index', index)
  })

  beforeEach(() => {
    wrapper = mount(SearchResultsHeader, {
      global: {
        plugins: core.plugins
      }
    })
    core.store.commit('search/reset')
  })

  describe('progress', () => {
    it('should display one document', async () => {
      await letData(es).have(new IndexedDocument('doc.txt', index).withContent('bar')).commit()

      await core.store.dispatch('search/query', 'bar')

      expect(wrapper.find('.search-results-header__settings__size__toggler__slot').text()).toBe('1 - 1')
      expect(wrapper.find('.search-results-header__settings__size__toggler__hits').text()).toBe('on 1 document')
    })

    it('should display 2 documents', async () => {
      await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withContent('bar')).commit()

      await core.store.dispatch('search/query', 'bar')

      expect(wrapper.find('.search-results-header__settings__size__toggler__slot').text()).toBe('1 - 2')
      expect(wrapper.find('.search-results-header__settings__size__toggler__hits').text()).toBe('on 2 documents')
    })
  })

  it('should display an applied filters component on top position', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3))
      .commit()

    await core.store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'top' })

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(1)
  })

  it('should not display an applied filters component on bottom position', async () => {
    await letData(es)
      .have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3))
      .commit()

    await core.store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    await wrapper.setProps({ position: 'bottom' })

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(0)
  })

  it('should display the dropdown to choose the number of results per page', () => {
    expect(wrapper.find('.search-results-header__settings__size__toggler').exists()).toBeTruthy()
    expect(wrapper.find('.search-results-header__settings__size__dropdown').exists()).toBeTruthy()
  })

  it('should not show the download results button when there is no results', () => {
    expect(wrapper.find('.search-results-header__settings__btn-download').exists()).toBeFalsy()
  })

  it('should show the download results button if results are less than the limit', async () => {
    await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
    await core.store.dispatch('search/query', 'bar')
    expect(wrapper.find('.search-results-header__settings__btn-download').exists()).toBeTruthy()
  })

  it('should show labels by default', async () => {
    await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
    await core.store.dispatch('search/query', 'bar')
    expect(wrapper.find('.search-results-header__settings__btn-download').text().trim()).toBe('Download results')
  })

  it('should not show labels when noLabels property is set', async () => {
    wrapper.setProps({ noLabels: true })
    await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
    await core.store.dispatch('search/query', 'bar')
    expect(wrapper.find('.search-results-header__settings__btn-download').text().trim()).toHaveLength(0)
  })

  it('should send api request when batch download method is called', async () => {
    const query = 'bar'
    await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent(query)).commit()
    core.store.commit('search/indices', [index, anotherIndex])
    await core.store.dispatch('search/query', query)
    wrapper.vm.tag = 'tag_02'

    await wrapper.vm.batchDownload()
    expect(api.runBatchDownload).toBeCalledTimes(1)
    const data = {
      projectIds: [index, anotherIndex],
      uri: expect.any(String),
      query: {
        bool: {
          must: [
            { match_all: {} },
            { bool: { should: [{ query_string: { query: 'bar' } }] } },
            { match: { type: 'Document' } }
          ]
        }
      }
    }
    expect(api.runBatchDownload).toBeCalledWith(expect.objectContaining(data))
  })

  describe('firstDocument', () => {
    it('should return 1', async () => {
      await letData(es).have(new IndexedDocument('doc.txt', index).withContent('bar')).commit()
      await core.store.dispatch('search/query', 'bar')

      expect(wrapper.vm.firstDocument).toBe(1)
    })

    it('should return 0', () => {
      expect(wrapper.vm.firstDocument).toBe(0)
    })
  })
})
