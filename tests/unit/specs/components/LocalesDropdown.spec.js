import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import LocalesDropdown from '@/components/LocalesDropdown'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('LocalesDropdown.vue', () => {
  afterEach(() => {
    localStorage.removeItem('locale')
    i18n.locale = 'en'
  })

  it('should display the interfaces in English by default', () => {
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')
  })

  it('should display the interface in French if localStorage says so', () => {
    localStorage.setItem('locale', 'fr')
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Français')
  })

  it('should display the interface in Spanish if localStorage says so', () => {
    localStorage.setItem('locale', 'es')
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Español')
  })

  it('should display a menu with 3 languages', () => {
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.findAll('.dropdown-item').length).toEqual(3)
  })

  it('should switch from English to French interface language', async () => {
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')

    wrapper.findAll('.dropdown-item').at(1).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Français')
    expect(localStorage.getItem('locale')).toEqual('fr')
  })

  it('should switch from English to Spanish interface language', async () => {
    const wrapper = mount(LocalesDropdown, { localVue, i18n, router, store })
    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')

    wrapper.findAll('.dropdown-item').at(2).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Español')
    expect(localStorage.getItem('locale')).toEqual('es')
  })
})
