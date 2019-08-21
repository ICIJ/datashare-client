import VueI18n from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import AggregationsPanel from '@/components/AggregationsPanel'
import store from '@/store'
import router from '@/router'
import messages from '@/lang/en'
import { createApp } from '@/main'
import { jsonOk } from 'tests/unit/tests_utils'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

describe('AggregationsPanel.vue', () => {
  let wrapper, appVue, i18n

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: [] }))
    appVue = await createApp()
    i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })
  })

  beforeEach(() => {
    wrapper = shallowMount(AggregationsPanel, { appVue, i18n, router, store })
  })

  afterAll(() => window.fetch.mockRestore())

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.aggregations-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', () => {
    wrapper.find('.aggregations-panel__sticky__toolbar__item--hide-filters').trigger('click')

    expect(wrapper.find('.aggregations-panel').isVisible()).toBeFalsy()
  })

  it('should call function resetFacetValues on event facet::search::reset-filters emitted', async () => {
    const resetFacetValuesStub = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { appVue, i18n, store, methods: { resetFacetValues: resetFacetValuesStub } })
    wrapper.vm.$root.$emit('facet::search::reset-filters')

    expect(resetFacetValuesStub).toHaveBeenCalled()
  })

  it('should call function refreshEachFacet on event index::delete::all emitted', async () => {
    const refreshEachFacetMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { appVue, i18n, store, methods: { refreshEachFacet: refreshEachFacetMock } })

    wrapper.vm.$root.$emit('index::delete::all')

    expect(refreshEachFacetMock).toHaveBeenCalled()
  })

  it('should call function updateFacetSelectedValues on event facet::search::add-facet-values emitted', async () => {
    const updateFacetSelectedValuesMock = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { appVue, i18n, store, methods: { updateFacetSelectedValues: updateFacetSelectedValuesMock } })

    wrapper.vm.$root.$emit('facet::search::add-facet-values')

    expect(updateFacetSelectedValuesMock).toHaveBeenCalled()
  })

  it('should emit an event "facet::search::reset-filters" on filters reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

    wrapper.vm.resetFilters()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not reset the starredDocuments on filters reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.resetFilters()

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should reset the query on filters reset', () => {
    store.commit('search/query', 'another query')

    wrapper.vm.resetFilters()

    expect(store.state.search.query).toBe('')
  })
})
