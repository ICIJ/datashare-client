import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

import AppSidebar from '@/components/AppSidebar'
import CoreSetup from '~tests/unit/CoreSetup'

vi.mock('@/utils/utils', () => {
  return {
    getOS: vi.fn(),
    isAuthenticated: vi.fn()
  }
})

describe('AppSidebar.vue', () => {
  const api = {
    getVersion: vi.fn().mockResolvedValue({ version: { 'git.commit.id.abbrev': '', 'git.build.version': '' } })
  }

  const { config, plugins, router } = CoreSetup.init(api).useAll().useRouter()
  let wrapper = null
  const options = { global: { plugins, renderStubDefaultSlot: true, stubs: { LocalesMenu: false } }, router }
  function setServerMode() {
    config.merge({ mode: 'SERVER' })
    return shallowMount(AppSidebar, { ...options })
  }
  function setLocalMode() {
    config.merge({ mode: 'LOCAL' })
    return shallowMount(AppSidebar, { ...options })
  }
  function setBasicAuthFilter() {
    config.merge({ authFilter: 'org.icij.datashare.session.BasicAuthAdaptorFilter', mode: 'SERVER' })
    return shallowMount(AppSidebar, { ...options })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = setLocalMode()
  })

  afterAll(() => {
    vi.unmock('@/utils/utils')
  })

  describe('the help link', () => {
    it('should be a gitbook link if NOT in SERVER mode', () => {
      expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(
        expect.stringContaining('gitbook.io')
      )
    })

    it('should be another github link if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toBe(
        'https://icij.gitbook.io/datashare/ask-for-help'
      )
    })
  })

  describe('the logout link', () => {
    it('should NOT be displayed if NOT in SERVER mode', () => {
      expect(wrapper.find('.app-sidebar__container__menu__item--logout').exists()).toBeFalsy()
    })

    it('should be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.find('.app-sidebar__container__menu__item--logout').exists()).toBeTruthy()
    })

    describe('in basic auth', () => {
      it('should be displayed if using BASIC AUTH authFilter', () => {
        wrapper = setBasicAuthFilter()
        expect(wrapper.vm.isServer).toBeTruthy()
        expect(wrapper.vm.isBasicAuth).toBeTruthy()
        const element = wrapper.find('.app-sidebar__container__menu__item__link--basic-auth')
        expect(element.exists()).toBe(true)
      })

      describe('when clicking on the logout link', () => {
        beforeEach(() => {
          wrapper = setBasicAuthFilter()
        })
        it('should call showModal', async () => {
          wrapper.vm.showModal = vi.fn()
          vi.spyOn(wrapper.vm, 'showModal')
          expect(wrapper.vm.showModal).toHaveBeenCalledTimes(0)
          wrapper.find('.app-sidebar__container__menu__item__link--basic-auth').trigger('click')
          expect(wrapper.vm.showModal).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('the Mounted location component', () => {
    it('should NOT be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.find('.app-sidebar__data-location').exists()).toBeFalsy()
    })

    it('should be displayed if NOT in SERVER mode', () => {
      expect(wrapper.find('.app-sidebar__data-location').exists()).toBeTruthy()
    })
  })
})
