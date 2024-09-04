import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

import AppSidebar from '@/components/AppSidebar/AppSidebar'
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


  beforeEach(async () => {
    vi.clearAllMocks()
    wrapper = setLocalMode()
  })

  afterAll(() => {
    vi.unmock('@/utils/utils')
  })

  describe('the logout link', () => {
    it('should NOT be displayed if NOT in SERVER mode', () => {
      expect(wrapper.vm.noSignOut).toBeTruthy()
    })

    it('should be displayed if in SERVER mode', () => {
      wrapper = setServerMode()
      expect(wrapper.vm.noSignOut).toBeFalsy()
    })
  })
})
