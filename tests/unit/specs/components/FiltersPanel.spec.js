import { createLocalVue, shallowMount } from '@vue/test-utils'

import FiltersPanel from '@/components/FiltersPanel'
import { Core } from '@/core'

describe('FiltersPanel.vue', () => {
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(FiltersPanel, { i18n, localVue, router, store, wait })
  })

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.filters-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', async () => {
    await wrapper.find('.filters-panel__sticky__toolbar__toggler').trigger('click')

    expect(wrapper.find('.filters-panel').isVisible()).toBeFalsy()
  })

  it('should not reset the starredDocuments on filters reset', () => {
    store.commit('starred/documents', ['doc_01', 'doc_02'])

    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(store.state.starred.documents).toEqual(['doc_01', 'doc_02'])
  })
})
