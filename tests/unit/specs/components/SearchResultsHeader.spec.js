import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import SearchResultsHeader from '@/components/SearchResultsHeader'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('SearchResultsHeader.vue', () => {
  const index = toLower('SearchResultsHeader')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsHeader, { localVue, store, mocks: { $t: msg => msg, $tc: msg => msg, $n: msg => msg } })
    store.commit('search/reset')
  })

  describe('progress', () => {
    it('should display one document', async () => {
      await letData(es).have(new IndexedDocument('doc.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination').text()).toBe('1 – 1')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toBe('search.results.on search.results.results')
    })

    it('should display 2 documents', async () => {
      await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.search-results-header__paging__progress__pagination').text()).toBe('1 – 2')
      expect(wrapper.find('.search-results-header__paging__progress_number-of-results').text()).toBe('search.results.on search.results.results')
    })
  })

  it('should display an applied filters component on top position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'top' })

    expect(wrapper.findAll('search-results-applied-filters-stub')).toHaveLength(1)
  })

  it('should not display an applied filters component on bottom position', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'bottom' })

    expect(wrapper.findAll('search-results-applied-filters-stub')).toHaveLength(0)
  })
})
