import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'

import AppSidebar from '@/components/AppSidebar/AppSidebar'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn().mockResolvedValue({ uid: 'local' })
  }
}))

describe('AppSidebar.vue', () => {
  const { config, plugins, router } = CoreSetup.init().useAll().useRouter()
  const options = { global: { plugins, renderStubDefaultSlot: true, stubs: { LocalesMenu: false } }, router }

  let wrapper

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
