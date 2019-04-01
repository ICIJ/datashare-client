import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import find from 'lodash/find'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import Search from '@/components/Search'
import { EventBus } from '@/utils/event-bus'

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

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()

    await wrapper.vm.search('document')

    expect(wrapper.find('a.search-results-link').attributes().href).toMatch(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()

    await wrapper.vm.search('children')

    expect(wrapper.find('a.search-results-link').attributes().href).toMatch(/child.txt\/parent.txt/)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 2 })

    expect(wrapper.findAll('.search-results-link').length).toEqual(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapper.vm.search({ query: 'document', from: 0, size: 3 })

    expect(wrapper.findAll('.search-results-link').length).toEqual(3)
  })

  it('should display only the document who has a NE person Paris', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('first document').withNer('paris', 1, 'LOCATION')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('second document').withNer('paris', 1, 'PERSON')).commit()

    store.commit('search/reset')
    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['paris']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.search('*')
    expect(wrapper.findAll('.search-results-link').length).toEqual(1)
    expect(wrapper.findAll('.search-results-link .search-results-link__basename .document-sliced-name__item__root').at(0).text()).toEqual('doc_02.txt')
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

  it('should refresh the view on custom event', async () => {
    const actions = { query: jest.fn() }
    const store2 = new Vuex.Store({ modules: { search: { namespaced: true, actions } } })
    wrapper = shallowMount(Search, { localVue, i18n, router, store: store2 })
    EventBus.$emit('index::delete::all')
    await delay(100)
    expect(actions.query).toHaveBeenCalled()
  })

  it('should display a `Back to the search results` link', () => {
    expect(wrapper.findAll('.search__body__document__nav')).toHaveLength(1)
    expect(wrapper.findAll('.search__body__document__nav').at(0).attributes('href')).toEqual(`#/?q=&from=0&size=25&sort=relevance&index=${process.env.VUE_APP_ES_INDEX}`)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
