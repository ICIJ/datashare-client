import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    updateProject: vi.fn(),
    removeProject: vi.fn()
  }
})

describe('Search.vue', () => {
  let core, wrapper

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  beforeEach(async () => {
    core.createPinia()
    await core.router.replace('/')
    const plugins = core.plugins

    wrapper = shallowMount(Search, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
