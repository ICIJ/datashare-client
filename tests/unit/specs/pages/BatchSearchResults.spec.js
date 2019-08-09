import BatchSearchResults from '@/pages/BatchSearchResults'
import { createLocalVue, mount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getBatchSearchResults: jest.fn().mockReturnValue(jsonOk([{
        creationDate: '2011-10-11T04:12:49.000+0000',
        documentId: 42,
        documentNumber: 0,
        documentPath: 'this/is/a/path/42',
        query: 'query_01',
        rootId: 42
      }, {
        creationDate: '2011-10-11T04:12:49.000+0000',
        documentId: 43,
        documentNumber: 1,
        documentPath: 'this/is/a/path/43',
        query: 'query_01',
        rootId: 43
      }, {
        creationDate: '2011-10-11T04:12:49.000+0000',
        documentId: 44,
        documentNumber: 2,
        documentPath: 'this/is/a/path/44',
        query: 'query_02',
        rootId: 44
      }]))
    }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearchResults.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] })
    store.commit('batchSearch/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42').withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43').withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44').withContentType('type_01')).commit()
    store.commit('batchSearch/batchSearches', [{
      uuid: '12',
      project: { name: 'ProjectName' },
      description: 'This is the description of the batch search',
      queries: ['query_01', 'query_02', 'query_03'],
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000'
    }])
    wrapper = mount(BatchSearchResults, { localVue, i18n, store, router, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: process.env.VUE_APP_ES_INDEX } })
    wrapper.vm.$route.params.index = process.env.VUE_APP_ES_INDEX
    await wrapper.vm.getBatchSearchResults({ uuid: 12 })
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.findAll('.batch-search-results')).toHaveLength(1)
    expect(wrapper.findAll('.batch-search-results .batch-search-results__queries__query')).toHaveLength(3)
  })

  it('should display a link to document page', () => {
    expect(wrapper.findAll('.batch-search-results .batch-search-results__queries__query__link')).toHaveLength(3)
    expect(wrapper.findAll('.batch-search-results .batch-search-results__queries__query__link').at(0).attributes('href')).toBe(`#/d/${process.env.VUE_APP_ES_INDEX}/42/42`)
    expect(wrapper.findAll('.batch-search-results .batch-search-results__queries__query__link').at(1).attributes('href')).toBe(`#/d/${process.env.VUE_APP_ES_INDEX}/43/43`)
    expect(wrapper.findAll('.batch-search-results .batch-search-results__queries__query__link').at(2).attributes('href')).toBe(`#/d/${process.env.VUE_APP_ES_INDEX}/44/44`)
  })

  it('should display a button to download the results as a CSV file', () => {
    expect(wrapper.findAll('.batch-search-results .batch-search-results__download')).toHaveLength(1)
  })

  it('should display the queries filters', () => {
    expect(wrapper.findAll('.batch-search-results .batch-search-results__filters a')).toHaveLength(4)
  })

  it('should display info about the BatchSearch', () => {
    expect(wrapper.findAll('.batch-search-results .batch-search-results__info')).toHaveLength(1)
    expect(wrapper.findAll('.batch-search-results .batch-search-results__info dd')).toHaveLength(5)
  })
})
