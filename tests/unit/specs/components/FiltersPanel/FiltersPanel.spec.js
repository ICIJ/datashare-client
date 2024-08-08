import { shallowMount } from '@vue/test-utils'

import FiltersPanel from '@/components/FiltersPanel/FiltersPanel'
import CoreSetup from '~tests/unit/CoreSetup'

describe('FiltersPanel.vue', () => {
  let wrapper = null

  beforeEach(() => {
    const api = { tree: vi.fn() }
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = shallowMount(FiltersPanel, { global: { plugins } })
  })

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.filters-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', async () => {
    await wrapper.find('.filters-panel__sticky__toolbar__toggler').trigger('click')
    expect(wrapper.find('.filters-panel').isVisible()).toBeFalsy()
  })

  it('should not reset the starredDocuments on filters reset', () => {
    wrapper.vm.$store.commit('starred/documents', [{ id: 'doc_01' }, { id: 'doc_02' }])
    wrapper.vm.$root.$emit('filter::search::reset-filters')
    expect(wrapper.vm.$store.state.starred.documents).toEqual([{ id: 'doc_01' }, { id: 'doc_02' }])
  })
})
