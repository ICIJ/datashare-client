import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import { mount, createLocalVue } from '@vue/test-utils'
import noop from 'lodash/noop'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Search from '@/components/Search'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import DatashareClient from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

jest.mock('@/api/DatashareClient', () => jest.fn())
DatashareClient.mockImplementation(() => {
  return {
    getIndices: () => {
      return Promise.resolve(new Response(JSON.stringify([]),
        { status: 200, headers: { 'Content-type': 'application/json' } }))
    }
  }
})

describe('Search.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    // Remove all facets to avoid unecessary request
    store.commit('search/clear')
  })

  beforeEach(async () => {
    Search.created = noop
    Vue.prototype.config = { dataDir: '/home/user/data' }
    wrapper = mount(Search, { localVue, i18n, router, store })
    store.commit('search/clear')
  })

  it('should display no documents found', async () => {
    await wrapper.vm.search('foo')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results__header__number-of-results').text()).toEqual('No documents found')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()

    await wrapper.vm.search('bar')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('1 - 1')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 1 document found')
    expect(wrapper.find('.search-results-item__fragments').html()).toEqual('<div class="search-results-item__fragments">this is <mark>bar</mark> document</div>')
  })

  it('should display 2 documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()

    await wrapper.vm.search('bar')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('1 - 2')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 2 documents found')
    expect(wrapper.findAll('.search-results-item').length).toEqual(2)
  })

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()

    await wrapper.vm.search('document')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results-item__basename a').attributes().href).toMatch(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()

    await wrapper.vm.search('children')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results-item__basename a').attributes().href).toMatch(/child.txt\/parent.txt/)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 2 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results-item').length).toEqual(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results-item').length).toEqual(3)
  })

  it('should not display the pagination (1/2)', async () => {
    await wrapper.vm.search('foo')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results__header__first-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page').length).toEqual(0)
  })

  it('should not display the pagination (2/2)', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()

    await wrapper.vm.search('document')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results__header__first-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page').length).toEqual(0)
  })

  it('should display the pagination', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })
    await wrapper.vm.$nextTick()

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
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results__header__first-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__previous-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__next-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__last-page.disabled').length).toEqual(0)
  })

  it('should display the next and the last page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 3, size: 3 })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.search-results__header__first-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__previous-page.disabled').length).toEqual(0)
    expect(wrapper.findAll('.search-results__header__next-page.disabled').length).toEqual(2)
    expect(wrapper.findAll('.search-results__header__last-page.disabled').length).toEqual(2)
    expect(wrapper.find('.search-results__header__progress__pagination').text()).toEqual('4 - 4')
    expect(wrapper.find('.search-results__header__progress_number-of-results').text()).toEqual('on 4 documents found')
    expect(wrapper.findAll('.search-results-item').length).toEqual(1)
  })
})
