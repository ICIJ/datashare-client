import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import SearchResultsHeader from '@/components/SearchResultsHeader'
import { Core } from '@/core'
import { IndexedDocument, IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('SearchResultsHeader.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  const index = toLower('SearchResultsHeader')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper = null

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = mount(SearchResultsHeader, { i18n, localVue, router, store })
    store.commit('search/reset')
  })

  afterAll(() => jest.unmock('axios'))

  describe('progress', () => {
    it('should display one document', async () => {
      await letData(es).have(new IndexedDocument('doc.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')

      expect(wrapper.find('.search-results-header__settings__size__toggler__slot').text()).toBe('1 – 1')
      expect(wrapper.find('.search-results-header__settings__size__toggler__hits').text()).toBe('on 1 document')
    })

    it('should display 2 documents', async () => {
      await letData(es).have(new IndexedDocument('doc_011.txt', index).withContent('bar')).commit()
      await letData(es).have(new IndexedDocument('doc_02.txt', index).withContent('bar')).commit()

      await store.dispatch('search/query', 'bar')

      expect(wrapper.find('.search-results-header__settings__size__toggler__slot').text()).toBe('1 – 2')
      expect(wrapper.find('.search-results-header__settings__size__toggler__hits').text()).toBe('on 2 documents')
    })
  })

  it('should display an applied filters component on top position', async () => {
    await letData(es).have(
      new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)
    ).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    wrapper.setProps({ position: 'top' })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(1)
  })

  it('should not display an applied filters component on bottom position', async () => {
    await letData(es).have(
      new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(3)
    ).commit()

    await store.dispatch('search/query', { query: '*', from: 0, size: 3 })
    await wrapper.setProps({ position: 'bottom' })

    expect(wrapper.findAll('.search-results-header__applied-search-filters')).toHaveLength(0)
  })

  it('should display the dropdown to choose the number of results per page', () => {
    expect(wrapper.find('.search-results-header__settings__size__toggler').exists()).toBeTruthy()
    expect(wrapper.find('.search-results-header__settings__size__dropdown').exists()).toBeTruthy()
  })

  it('should display the dropdown to choose the number of results per page', () => {
    const toggle = wrapper.find('.search-results-header__settings__sort__toggler')
    const dropdown = wrapper.find('.search-results-header__settings__sort__dropdown')
    expect(toggle.exists()).toBeTruthy()
    expect(dropdown.exists()).toBeTruthy()
  })

  it('should change the searchSort and searchSize via the dropdown', () => {
    wrapper.findAll('.search-results-header__settings__sort__dropdown .dropdown-item').at(3).trigger('click')
    expect(wrapper.vm.searchSort).toBe('sizeLargest')
    wrapper.findAll('.search-results-header__settings__size__dropdown .dropdown-item').at(3).trigger('click')
    expect(wrapper.vm.searchSize).toBe(100)
  })
})
