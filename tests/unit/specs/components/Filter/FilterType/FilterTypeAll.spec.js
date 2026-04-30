import { flushPromises, shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import FilterTypeAll from '@/components/Filter/FilterType/FilterTypeAll'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchStore } from '@/store/modules'

describe('FilterTypeAll.vue', () => {
  let core, wrapper, searchStore, filter

  beforeEach(() => {
    setActivePinia(createPinia())
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    searchStore = useSearchStore()
    filter = searchStore.getFilter({ name: 'contentType' })
    wrapper = shallowMount(FilterTypeAll, {
      global: { plugins: core.plugins },
      props: { filter }
    })
  })

  it('renders the filter entry', async () => {
    await flushPromises()
    expect(wrapper.findComponent(FiltersPanelSectionFilterEntry).exists()).toBe(true)
  })

  it('always hides the count', async () => {
    await flushPromises()
    expect(wrapper.findComponent(FiltersPanelSectionFilterEntry).props('hideCount')).toBe(true)
  })
})
