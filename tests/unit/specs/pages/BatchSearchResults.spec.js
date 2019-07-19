import BatchSearchResults from '@/pages/BatchSearchResults'
import { createLocalVue, mount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getBatchSearch: jest.fn().mockReturnValue(jsonOk([{
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
        rootId: 42
      }, {
        creationDate: '2011-10-11T04:12:49.000+0000',
        documentId: 44,
        documentNumber: 2,
        documentPath: 'this/is/a/path/44',
        query: 'query_02',
        rootId: 42
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
  let wrapper

  beforeEach(() => {
    wrapper = mount(BatchSearchResults, { localVue, i18n, store, router })
    wrapper.vm.$route.params.index = 'index'
  })

  it('should display the list of the queries of this batch search', async () => {
    await store.dispatch('batchSearch/getBatchSearch', 12)

    expect(wrapper.findAll('.batchsearchresults')).toHaveLength(1)
    expect(wrapper.findAll('.batchsearchresults .batchsearchresults__queries__query')).toHaveLength(3)
  })

  it('should display a link to document page', async () => {
    await store.dispatch('batchSearch/getBatchSearch', 12)

    expect(wrapper.findAll('.batchsearchresults__queries .batchsearchresults__queries__query__link')).toHaveLength(3)
    expect(wrapper.findAll('.batchsearchresults__queries .batchsearchresults__queries__query__link').at(0).attributes('href')).toBe('#/d/index/42/42')
    expect(wrapper.findAll('.batchsearchresults__queries .batchsearchresults__queries__query__link').at(1).attributes('href')).toBe('#/d/index/43/42')
    expect(wrapper.findAll('.batchsearchresults__queries .batchsearchresults__queries__query__link').at(2).attributes('href')).toBe('#/d/index/44/42')
  })
})
