import { shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search/Search'

describe('Search.vue', () => {
  const { es: elasticsearch } = esConnectionHelper.build()
  let api, core, wrapper

  beforeEach(() => {
    api = { elasticsearch, updateProject: vi.fn(), deleteProject: vi.fn() }
    core = CoreSetup.init(api).useAll().useRouter()

    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  it('is a Vue instance', () => {
    expect(wrapper.vm).toBeTruthy()
  })
})
