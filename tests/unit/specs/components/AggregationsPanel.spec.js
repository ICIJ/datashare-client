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

  it('should call function resetFacetValues on event facet::search::reset-filters emitted', async () => {
    const resetFacetValuesStub = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { resetFacetValues: resetFacetValuesStub }, sync: false })
    wrapper.vm.$root.$emit('facet::search::reset-filters')

    expect(resetFacetValuesStub).toHaveBeenCalled()
  })

  it('should call function refreshEachFacet on event index::delete::all emitted', async () => {
    const refreshEachFacetMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { refreshEachFacet: refreshEachFacetMock }, sync: false })

    wrapper.vm.$root.$emit('index::delete::all')

    expect(refreshEachFacetMock).toHaveBeenCalled()
  })

  it('should call function updateFacetSelectedValues on event facet::search::add-facet-values emitted', async () => {
    const updateFacetSelectedValuesMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { updateFacetSelectedValues: updateFacetSelectedValuesMock }, sync: false })

    wrapper.vm.$root.$emit('facet::search::add-facet-values')

    expect(updateFacetSelectedValuesMock).toHaveBeenCalled()
  })

  it('should emit an event "facet::search::reset-filters" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

    wrapper.vm.$root.$emit('facet::search::reset-filters')

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not reset the starredDocuments on filters reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.$root.$emit('facet::search::reset-filters')

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })
})
