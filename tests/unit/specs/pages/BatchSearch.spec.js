import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import BatchSearch from '@/pages/BatchSearch'
import router from '@/router'
import store from '@/store'
import BootstrapVue from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearch.vue', () => {
  let wrapper

  it('should display the form', () => {
    wrapper = shallowMount(BatchSearch, { localVue, i18n, router, store })

    expect(wrapper.findAll('b-form-stub')).toHaveLength(1)
  })

  it('should call the store', () => {
    const actions = {
      onSubmit: jest.fn()
    }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, actions } } })
    wrapper = shallowMount(BatchSearch, { localVue, i18n, router, store })

    wrapper.vm.onSubmit()

    expect(actions.onSubmit).toHaveBeenCalled()
  })
})
