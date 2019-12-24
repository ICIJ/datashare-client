import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import LocalesDropdown from '@/components/LocalesDropdown'

const { localVue, i18n } = App.init(createLocalVue()).useAll()

describe('LocalesDropdown', () => {
  let wrapper

  afterEach(() => {
    localStorage.removeItem('locale')
    i18n.locale = 'en'
  })

  describe('should change the interface language according to localStorage', () => {
    it('should display the interfaces in English by default', () => {
      wrapper = shallowMount(LocalesDropdown, { localVue, i18n })

      expect(wrapper.find('.locales-dropdown__button').text()).toBe('English')
    })

    it('should display the interface in French if localStorage says so', () => {
      localStorage.setItem('locale', 'fr')
      wrapper = shallowMount(LocalesDropdown, { localVue, i18n })

      expect(wrapper.find('.locales-dropdown__button').text()).toBe('Français')
    })

    it('should display the interface in Spanish if localStorage says so', () => {
      localStorage.setItem('locale', 'es')
      wrapper = shallowMount(LocalesDropdown, { localVue, i18n })

      expect(wrapper.find('.locales-dropdown__button').text()).toBe('Español')
    })
  })

  describe('b-popover menu', () => {
    beforeEach(() => {
      wrapper = shallowMount(LocalesDropdown, { localVue, i18n })
    })

    it('should display a menu with 3 languages', () => {
      expect(wrapper.findAll('b-popover-stub .dropdown-item').length).toBe(3)
    })

    it('should switch from English to French interface language', async () => {
      expect(wrapper.find('.locales-dropdown__button').text()).toBe('English')

      wrapper.findAll('.dropdown-item').at(1).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.locales-dropdown__button').text()).toBe('Français')
      expect(localStorage.getItem('locale')).toBe('fr')
    })

    it('should switch from English to Spanish interface language', async () => {
      expect(wrapper.find('.locales-dropdown__button').text()).toBe('English')

      wrapper.findAll('.dropdown-item').at(2).trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.locales-dropdown__button').text()).toBe('Español')
      expect(localStorage.getItem('locale')).toBe('es')
    })
  })
})
