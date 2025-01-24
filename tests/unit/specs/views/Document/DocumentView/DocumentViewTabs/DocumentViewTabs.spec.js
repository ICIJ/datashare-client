import { shallowMount } from '@vue/test-utils'

import DocumentViewTabs from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabs'
import CoreSetup from '~tests/unit/CoreSetup'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

describe('DocumentViewTabs.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })
  it('should display the component', async () => {
    const props = { documentRoute: { name: '' } }

    const wrapper = shallowMount(DocumentViewTabs, {
      global: {
        plugins: core.plugins
      },
      props
    })
    expect(wrapper.exists()).toBe(true)
  })
  it('should display 4 entries: text, viewer, metadata and entities', async () => {
    const props = { documentRoute: { name: '' } }

    const wrapper = shallowMount(DocumentViewTabs, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    const entries = wrapper.findAllComponents(TabGroupNavigationEntry)
    expect(entries).toHaveLength(4)
    expect(entries.at(0).text()).toBe('Text')
    expect(entries.at(1).text()).toBe('View')
    expect(entries.at(2).text()).toBe('Metadata')
    expect(entries.at(3).text()).toBe('Entities')
  })
})
