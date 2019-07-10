import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'
import BatchSearches from '@/pages/BatchSearches'
import router from '@/router'
import store from '@/store'
import BootstrapVue from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearches.vue', () => {
  let wrapper

  it('should display the form', () => {
    wrapper = shallowMount(BatchSearches, { localVue, i18n, router, store })
    expect(wrapper.findAll('b-form-stub')).toHaveLength(1)
  })
})
