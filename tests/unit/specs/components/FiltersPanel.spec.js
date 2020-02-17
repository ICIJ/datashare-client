import { createLocalVue, shallowMount } from '@vue/test-utils'

import FiltersPanel from '@/components/FiltersPanel'
import { Core } from '@/core'

const { localVue, store, router, i18n, wait } = Core.init(createLocalVue()).useAll()

describe('FiltersPanel.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(FiltersPanel, { localVue, i18n, router, store, wait, sync: false })
  })

  afterAll(() => window.fetch.mockRestore())

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.filters-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', async () => {
    await wrapper.find('.filters-panel__sticky__toolbar__toggler').trigger('click')

    expect(wrapper.find('.filters-panel').isVisible()).toBeFalsy()
  })

  it('should call function resetFilterValues on event filter::search::reset-filters emitted', async () => {
    const resetFilterValuesStub = jest.fn()
    wrapper = shallowMount(FiltersPanel, { localVue, i18n, store, wait, methods: { resetFilterValues: resetFilterValuesStub }, sync: false })
    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(resetFilterValuesStub).toHaveBeenCalled()
  })

  it('should call function refreshEachFilter on event index::delete::all emitted', async () => {
    const refreshEachFilterMock = jest.fn()
    wrapper = shallowMount(FiltersPanel, { localVue, i18n, store, wait, methods: { refreshEachFilter: refreshEachFilterMock }, sync: false })

    wrapper.vm.$root.$emit('index::delete::all')

    expect(refreshEachFilterMock).toHaveBeenCalled()
  })

  it('should call function updateFilterSelectedValues on event filter::search::add-filter-values emitted', async () => {
    const updateFilterSelectedValuesMock = jest.fn()
    wrapper = shallowMount(FiltersPanel, { localVue, i18n, store, wait, methods: { updateFilterSelectedValues: updateFilterSelectedValuesMock }, sync: false })

    wrapper.vm.$root.$emit('filter::search::add-filter-values')

    expect(updateFilterSelectedValuesMock).toHaveBeenCalled()
  })

  it('should emit an event "filter::search::reset-filters" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::search::reset-filters', mockCallback)

    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not reset the starredDocuments on filters reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })
})
