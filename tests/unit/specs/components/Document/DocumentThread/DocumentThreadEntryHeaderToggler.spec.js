import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryHeaderToggler from '@/components/Document/DocumentThread/DocumentThreadEntryHeaderToggler'

describe('DocumentThreadEntryHeaderToggler.vue', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryHeaderToggler, {
      global: {
        plugins: core.plugins
      },
      props
    })
  }

  beforeEach(() => {
    core.createPinia()
  })

  it('should render the toggler element', () => {
    const wrapper = createWrapper({ expanded: false })
    expect(wrapper.find('.document-thread-entry-header-toggler').exists()).toBe(true)
  })

  it('should render different icons based on expanded state', () => {
    const collapsed = createWrapper({ expanded: false })
    const expanded = createWrapper({ expanded: true })
    expect(collapsed.html()).not.toBe(expanded.html())
  })
})
