import SearchResults from '@/components/SearchResults'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import find from 'lodash/find'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import messages from '@/lang/en'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

async function createView (query = '*', size) {
  const response = await store.dispatch('search/query', { query: query, from: 0, size: size })
  return shallowMount(SearchResults, {
    localVue,
    i18n,
    store,
    propsData: { response: response.hits, query: query }
  })
}

describe('SearchResults.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] })
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    store.commit('search/reset')
  })

  it('should display no documents found', async () => {
    const wrapper = await createView()

    expect(wrapper.find('.search-results__header__number-of-results').text()).toEqual('No documents found')
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
    const wrapper = await createView('document', 2)

    expect(wrapper.findAll('.search-results__items__item__link')).toHaveLength(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
    const wrapper = await createView('document', 3)

    expect(wrapper.findAll('.search-results__items__item__link')).toHaveLength(3)
  })

  it('should display only the document who has a NE person Paris', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('first document').withNer('paris', 1, 'LOCATION')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('second document').withNer('paris', 1, 'PERSON')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('third document').withNer('paris', 1, 'PERSON')).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['paris']
    store.commit('search/addFacetValue', namedEntityFacet)
    const wrapper = await createView()

    expect(wrapper.findAll('.search-results__items__item__link')).toHaveLength(2)
  })

  it('should hide the `Show filters` menu by default', async () => {
    const wrapper = await createView()

    expect(wrapper.find('.search-results .search-results__toolbar').isVisible()).toBeFalsy()
  })

  it('should show the `Show filters` menu', async () => {
    const wrapper = await createView()
    store.commit('search/toggleFilters')

    expect(wrapper.find('.search-results .search-results__toolbar').isVisible()).toBeTruthy()
  })

  it('should display the filters on click on `Show filters` menu', async () => {
    const wrapper = await createView()
    store.commit('search/toggleFilters')
    wrapper.find('.search-results .search-results__toolbar .nav-link').trigger('click')

    expect(store.state.search.showFilters).toBeTruthy()
  })
})
