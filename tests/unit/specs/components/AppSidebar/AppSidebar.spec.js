import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppSidebar from '@/components/AppSidebar/AppSidebar'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn().mockResolvedValue({ uid: 'local' })
  }
}))

describe('AppSidebar.vue', () => {
  let core, plugins, wrapper

  function setServerMode() {
    core.config.merge({ mode: 'SERVER' })
    return shallowMount(AppSidebar, { global: { plugins, renderStubDefaultSlot: true, stubs: { LocalesMenu: false } }, router: core.router })
  }

  function setLocalMode() {
    core.config.merge({ mode: 'LOCAL' })
    return shallowMount(AppSidebar, { global: { plugins, renderStubDefaultSlot: true, stubs: { LocalesMenu: false } }, router: core.router })
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  beforeEach(async () => {
    core.createPinia()
    plugins = core.plugins
    vi.clearAllMocks()
    wrapper = setLocalMode()
  })

  afterAll(() => {
    vi.resetAllMocks()
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
