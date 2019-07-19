import BatchSearch from '@/pages/BatchSearch'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
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
      getBatchSearches: jest.fn().mockReturnValue(jsonOk([{
        uuid: 1,
        project: { id: 'project_01', name: 'project_01' },
        name: 'name_01',
        description: 'description_01',
        queries: ['query_01'],
        date: '2019-01-01'
      }, {
        uuid: 2,
        project: { id: 'project_02', name: 'project_02' },
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
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearch.vue', () => {
  let wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

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

  it('should list the searches', () => {
    wrapper = mount(BatchSearch, { localVue, i18n, store, router })

    expect(wrapper.findAll('.batchsearch__items .batchsearch__items__item')).toHaveLength(2)
  })

  it('should display a link to batch search page', () => {
    wrapper = mount(BatchSearch, { localVue, i18n, store, router })

    expect(wrapper.findAll('.batchsearch__items .batchsearch__items__item__link')).toHaveLength(2)
    expect(wrapper.findAll('.batchsearch__items .batchsearch__items__item__link').at(0).attributes('href')).toBe('#/batch-search/project_01/1')
    expect(wrapper.findAll('.batchsearch__items .batchsearch__items__item__link').at(1).attributes('href')).toBe('#/batch-search/project_02/2')
  })
})
