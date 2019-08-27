import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
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

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

jest.mock('@/api/DatashareClient', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([
        {
          uuid: '12',
          project: { name: 'ProjectName' },
          description: 'This is the description of the batch search',
          queries: ['query_01', 'query_02', 'query_03'],
          state: 'SUCCESS',
          date: '2019-07-18T14:45:34.869+0000'
        }, {
          uuid: '13',
          project: { name: 'ProjectName2' },
          description: 'Another description',
          queries: ['query_04'],
          state: 'SUCCESS',
          date: '2019-07-28T14:45:34.869+0000'
        }
      ])),
      getBatchSearchResults: jest.fn().mockReturnValue(Promise.resolve([
        {
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
        }
      ]))
    }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearchResultsFilters.vue', () => {
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
    }, {
      uuid: '13',
      project: { name: 'ProjectName2' },
      description: 'Another description',
      queries: ['query_04'],
      state: 'SUCCESS',
      date: '2019-07-28T14:45:34.869+0000'
    }])
  })

  it('should display a selectable dropdown with queries', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, i18n, store, router, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: process.env.VUE_APP_ES_INDEX } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown span')).toHaveLength(3)
  })

  it('should not ad dropdown but a simple list if there is only one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, i18n, store, router, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', index: process.env.VUE_APP_ES_INDEX } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').text()).toEqual('query_04')
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeFalsy()
  })
})
