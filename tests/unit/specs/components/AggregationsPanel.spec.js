import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AggregationsPanel from '@/components/AggregationsPanel'
import store from '@/store'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
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
})
