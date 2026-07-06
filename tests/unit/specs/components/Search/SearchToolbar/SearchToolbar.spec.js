import { ref } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchToolbar from '@/components/Search/SearchToolbar/SearchToolbar'
import SearchBar from '@/components/Search/SearchBar/SearchBar'

// Control the width-driven compact flag so we can assert the toolbar's wiring
// without simulating a resize.
const compact = ref(false)
vi.mock('@/composables/useCompact', () => ({
  useCompact: () => ({ compact })
}))

describe('SearchToolbar.vue', () => {
  let core

  beforeEach(() => {
    compact.value = false
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  const mountToolbar = () => {
    return shallowMount(SearchToolbar, {
      global: { plugins: core.plugins }
    })
  }

  it('shows the search submit button when the toolbar is at normal width', () => {
    const wrapper = mountToolbar()
    expect(wrapper.findComponent(SearchBar).props('showSubmit')).toBe(true)
  })

  it('hides the search submit button in compact mode to spare the width', () => {
    compact.value = true
    const wrapper = mountToolbar()
    expect(wrapper.findComponent(SearchBar).props('showSubmit')).toBe(false)
  })
})
