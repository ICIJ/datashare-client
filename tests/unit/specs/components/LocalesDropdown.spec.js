import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import LocalesDropdown from '@/components/LocalesDropdown'
import messages from '@/lang/en'
import { App } from '@/main'

const { localVue } = App.init(createLocalVue()).useAll()
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('LocalesDropdown', () => {
  afterEach(() => {
    localStorage.removeItem('locale')
    i18n.locale = 'en'
  })

  describe('should change the interface language according to localStorage', () => {
    it('should display the interfaces in English by default', () => {
      const wrapper = shallowMount(LocalesDropdown, { localVue, i18n })
      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')
    })

    it('should display the interface in French if localStorage says so', () => {
      localStorage.setItem('locale', 'fr')
      const wrapper = shallowMount(LocalesDropdown, { localVue, i18n })
      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Français')
    })

    it('should display the interface in Spanish if localStorage says so', () => {
      localStorage.setItem('locale', 'es')
      const wrapper = shallowMount(LocalesDropdown, { localVue, i18n })
      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Español')
    })
  })

  describe('b-popover menu', () => {
    let wrapper

    beforeEach(() => {
      wrapper = shallowMount(LocalesDropdown, { localVue, i18n })
    })

    it('should display a menu with 3 languages', () => {
      expect(wrapper.findAll('b-popover-stub .dropdown-item').length).toEqual(3)
    })

    it('should switch from English to French interface language', async () => {
      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')

      wrapper.findAll('.dropdown-item').at(1).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Français')
      expect(localStorage.getItem('locale')).toEqual('fr')
    })

    it('should switch from English to Spanish interface language', async () => {
      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('English')

      wrapper.findAll('.dropdown-item').at(2).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.locales-dropdown__button').text()).toEqual('Español')
      expect(localStorage.getItem('locale')).toEqual('es')
    })
  })
})
