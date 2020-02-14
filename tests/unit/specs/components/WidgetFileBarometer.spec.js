import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import WidgetFileBarometer from '@/components/WidgetFileBarometer'

const { localVue, store, i18n } = App.init(createLocalVue()).useAll()
const methods = { count: () => 10 }

describe('WidgetFileBarometer.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetFileBarometer, { localVue, store, i18n, methods })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    const wrapper = shallowMount(WidgetFileBarometer, { localVue, store, i18n, methods })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.widget__main-figure').text()).toBe('10 documents')
  })
})
