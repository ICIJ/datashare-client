import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AggregationsPanel from '@/components/AggregationsPanel'
import store from '@/store'
import messages from '@/lang/en'
import { EventBus } from '@/utils/event-bus'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('AggregationsPanel.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store })
  })

  it('should display the aggregation panel by default', () => {
    expect(wrapper.find('.aggregations-panel').isVisible()).toBeTruthy()
  })

  it('should hide the aggregation panel on click on `Hide filters`', () => {
    wrapper.find('.aggregations-panel .nav .nav-link').trigger('click')

    expect(wrapper.find('.aggregations-panel').isVisible()).toBeFalsy()
  })

  it('should call function refreshEachFacet on event index::delete::all emitted', async () => {
    const refreshEachFacetStub = jest.fn()
    wrapper = shallowMount(AggregationsPanel, { localVue, i18n, store, methods: { refreshEachFacet: refreshEachFacetStub } })
    EventBus.$emit('index::delete::all')

    expect(refreshEachFacetStub).toHaveBeenCalled()
  })
})
