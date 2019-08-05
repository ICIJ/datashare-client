import BatchSearchForm from '@/components/BatchSearchForm'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearchForm.vue', () => {
  let wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  it('should call the store', () => {
    const state = {
      batchSearches: []
    }
    const actions = {
      onSubmit: jest.fn(),
      getBatchSearches: jest.fn()
    }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions } } })
    wrapper = shallowMount(BatchSearchForm, { localVue, i18n, store })

    wrapper.vm.onSubmit()

    expect(actions.onSubmit).toHaveBeenCalled()
  })
})
