import { createLocalVue, shallowMount } from '@vue/test-utils'

import AppSidebar from '@/components/AppSidebar'
import { Core } from '@/core'
import { getOS } from '@/utils/utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('AppSidebar.vue', () => {
  const { config, i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  function setServerMode () {
    config.merge({ mode: 'SERVER' })
    return shallowMount(AppSidebar, { config, i18n, localVue, router, store })
  }

  beforeEach(() => {
    getOS.mockReset()
    config.merge({ mode: 'LOCAL' })
    wrapper = shallowMount(AppSidebar, { config, i18n, localVue, router, store })
  })

  afterAll(() => jest.unmock('@/utils/utils'))

  describe('the link to the analyse page', () => {
    it('should NOT be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
    })

    it('should be displayed if NOT in SERVER mode', () => {
      expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeTruthy()
    })
  })

  describe('the help link', () => {
    it('should be a github link if NOT in SERVER mode', () => {
      expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('github.com'))
    })

    it('should be another github link if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toBe('https://github.com/ICIJ/datashare/wiki/Datashare-Support')
    })
  })

  describe('the logout link', () => {
    it('should NOT be displayed if NOT in SERVER mode', () => {
      expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeFalsy()
    })

    it('should be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeTruthy()
    })
  })

  describe('the Mounted location component', () => {
    it('should NOT be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeFalsy()
    })

    it('should be displayed if NOT in SERVER mode', () => {
      expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeTruthy()
    })
  })
})
