import '@testing-library/jest-dom'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import FiltersPanel from '@/components/FiltersPanel'
import { Core } from '@/core'

describe('FiltersPanel.vue', () => {
  const { localVue, store, router, i18n, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(FiltersPanel, { localVue, i18n, router, store, wait })
  })

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.filters-panel').element).toBeVisible()
  })

  it('should hide the aggregation panel on click on `Hide filters`', async () => {
    await wrapper.find('.filters-panel__sticky__toolbar__toggler').trigger('click')

    expect(wrapper.find('.filters-panel').element).not.toBeVisible()
  })

  it('should not reset the starredDocuments on filters reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })
})
