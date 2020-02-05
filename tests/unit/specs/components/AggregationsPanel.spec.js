import { createLocalVue, shallowMount } from '@vue/test-utils'

import AggregationsPanel from '@/components/AggregationsPanel'
import { App } from '@/main'

const { localVue, store, router, i18n } = App.init(createLocalVue()).useAll()

describe('AggregationsPanel.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, router, store, sync: false })
  })

  afterAll(() => window.fetch.mockRestore())

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.aggregations-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', async () => {
    await wrapper.find('.aggregations-panel__sticky__toolbar__toggler').trigger('click')

    expect(wrapper.find('.aggregations-panel').isVisible()).toBeFalsy()
  })

  it('should call function resetFilterValues on event filter::search::reset-filters emitted', async () => {
    const resetFilterValuesStub = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { resetFilterValues: resetFilterValuesStub }, sync: false })
    wrapper.vm.$root.$emit('filter::search::reset-filters')

    expect(resetFilterValuesStub).toHaveBeenCalled()
  })

  it('should call function refreshEachFilter on event index::delete::all emitted', async () => {
    const refreshEachFilterMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { refreshEachFilter: refreshEachFilterMock }, sync: false })

    wrapper.vm.$root.$emit('index::delete::all')

    expect(refreshEachFilterMock).toHaveBeenCalled()
  })

  it('should call function updateFilterSelectedValues on event filter::search::add-filter-values emitted', async () => {
    const updateFilterSelectedValuesMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { updateFilterSelectedValues: updateFilterSelectedValuesMock }, sync: false })

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
