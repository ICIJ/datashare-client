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

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()

    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
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
