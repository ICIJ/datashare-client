import BatchSearch from '@/pages/BatchSearch'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import store from '@/store'
import BootstrapVue from 'bootstrap-vue'

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(jsonOk([{
        uuid: 1,
        project: { name: 'project_01' },
        name: 'name_01',
        description: 'description_01',
        queries: ['query_01'],
        date: '2019-01-01'
      }, {
        uuid: 2,
        project: { name: 'project_02' },
        name: 'name_02',
        description: 'description_02',
        queries: ['query_02'],
        date: '2019-01-01'
      }]))
    }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearch.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(BatchSearch, { localVue, i18n, store })
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should display the form', () => {
    expect(wrapper.findAll('.batchsearch b-form-stub')).toHaveLength(1)
  })

  it('should call the store', () => {
    const state = {
      batchSearches: []
    }
    const actions = {
      onSubmit: jest.fn(),
      getBatchSearches: jest.fn()
    }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions } } })
    wrapper = shallowMount(BatchSearch, { localVue, i18n, store })

    wrapper.vm.onSubmit()

    expect(actions.onSubmit).toHaveBeenCalled()
  })

  it('should list the searches', async () => {
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.batchsearch .batchsearch__list .row')).toHaveLength(2)
  })
})
