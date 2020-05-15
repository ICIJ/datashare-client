import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import SearchResultsHeader from '@/components/SearchResultsHeader'

const { localVue, store, router } = Core.init(createLocalVue()).useAll()

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('SearchResultsHeader.vue', () => {
  const index = toLower('SearchResultsHeader')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = mount(SearchResultsHeader, { localVue, router, store, mocks: { $t: msg => msg, $tc: msg => msg, $n: msg => msg } })
    store.commit('search/reset')
  })

  describe('progress', () => {
    it('should display one document', async () => {
      await letData(es).have(new IndexedDocument('doc.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination__toggler').text()).toBe('1 – 1')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toBe('search.results.on search.results.results')
    })

    it('should display 2 documents', async () => {
      await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination__toggler').text()).toBe('1 – 2')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toBe('search.results.on search.results.results')
    })
  })

  it('should display an applied filters component on top position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'top' })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(1)
  })

  it('should not display an applied filters component on bottom position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    await wrapper.setProps({ position: 'bottom' })

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(0)
  })

  it('should display the dropdown to choose the number of results per page', () => {
    const toggler = wrapper.find('.search-results-header__paging__progress__pagination__toggler')
    const dropdown = wrapper.find('.search-results-header__paging__progress__pagination__dropdown')
    expect(toggler.exists()).toBeTruthy()
    expect(dropdown.exists()).toBeTruthy()
  })

  it('should display the dropdown to choose the number of results per page', () => {
    const toggler = wrapper.find('.search-results-header__sort__toggler')
    const dropdown = wrapper.find('.search-results-header__sort__dropdown')
    expect(toggler.exists()).toBeTruthy()
    expect(dropdown.exists()).toBeTruthy()
  })

  it('should change the searchSort and searchSize via the dropdown', () => {
    wrapper.findAll('.search-results-header__sort__dropdown .dropdown-item').at(5).trigger('click')
    expect(wrapper.vm.searchSort).toBe('sizeLargest')
    wrapper.findAll('.search-results-header__paging__progress__pagination__dropdown .dropdown-item').at(3).trigger('click')
    expect(wrapper.vm.searchSize).toBe(100)
  })
})
