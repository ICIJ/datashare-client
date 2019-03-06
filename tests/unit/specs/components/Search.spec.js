import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { mount, createLocalVue } from '@vue/test-utils'
import find from 'lodash/find'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import Search from '@/components/Search'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(BootstrapVue)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('Search.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    Vue.prototype.config = { userIndices: [process.env.VUE_APP_ES_INDEX] }
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    wrapper = mount(Search, { localVue, i18n, router, store })
    store.commit('search/reset')
  })

  it('should display no documents found', async () => {
    await wrapper.vm.search('*')

    expect(wrapper.find('.search-results__header__number-of-results').text()).toEqual('No documents found')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()

    await wrapper.vm.search('bar')

    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('1 - 1')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 1 document found')
    expect(wrapper.find('.search-results-item__fragments').html()).toEqual('<div class="search-results-item__fragments">this is <mark>bar</mark> document</div>')
  })

  it('should display 2 documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()

    await wrapper.vm.search('bar')

    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('1 - 2')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 2 documents found')
    expect(wrapper.findAll('.search-results-item').length).toEqual(2)
  })

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()

    await wrapper.vm.search('document')

    expect(wrapper.find('a.search-results-item').attributes().href).toMatch(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()

    await wrapper.vm.search('children')

    expect(wrapper.find('a.search-results-item').attributes().href).toMatch(/child.txt\/parent.txt/)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 2 })

    expect(wrapper.findAll('.search-results-item').length).toEqual(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results-item').length).toEqual(3)
  })

  it('should not display the pagination (1/2)', async () => {
    await wrapper.vm.search('*')

    expect(wrapper.findAll('.search-results__header__first-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page').length).toEqual(0)
  })

  it('should not display the pagination (2/2)', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()

    await wrapper.vm.search('document')

    expect(wrapper.findAll('.search-results__header__first-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page').length).toEqual(0)
  })

  it('should display the pagination', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results__header__first-page').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__previous-page').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__next-page').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__last-page').length).toEqual(2)
    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('1 - 3')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 4 documents found')
    expect(wrapper.findAll('.search-results-item').length).toEqual(3)
  })

  it('should display the first and the previous page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results__header__first-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__previous-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__next-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page.disabled').length).toEqual(0)
  })

  it('should display the next and the last page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 3, size: 3 })

    expect(wrapper.findAll('.search-results__header__first-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__last-page.disabled').length).toEqual(2)
    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('4 - 4')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 4 documents found')
    expect(wrapper.findAll('.search-results-item').length).toEqual(1)
  })

  it('should display only the document who has a NE person Paris', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('first document').withNer('paris', 1, 'LOCATION')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('second document').withNer('paris', 1, 'PERSON')).commit()

    store.commit('search/reset')
    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['paris']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.search('*')

    expect(wrapper.findAll('.search-results-item').length).toEqual(1)
    expect(wrapper.findAll('.search-results-item .search-results-item__basename').at(0).text()).toEqual('doc_02.txt')
  })

  it('should hide the `Show filters` menu by default', async () => {
    await wrapper.vm.search('*')

    expect(wrapper.find('.search-results .search-results__toolbar').isVisible()).toBeFalsy()
  })

  it('should show the `Show filters` menu', async () => {
    await wrapper.vm.search('*')
    store.commit('search/toggleFilters')

    expect(wrapper.find('.search-results .search-results__toolbar').isVisible()).toBeTruthy()
  })

  it('should display the filters on click on `Show filters` menu', async () => {
    await wrapper.vm.search('*')
    store.commit('search/toggleFilters')
    wrapper.find('.search-results .search-results__toolbar .nav-link').trigger('click')

    expect(store.state.search.showFilters).toBeTruthy()
  })
})
