import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetFileBarometer from '@/components/WidgetFileBarometer'

describe('WidgetFileBarometer.vue', () => {
  const { localVue, store, i18n, wait } = Core.init(createLocalVue()).useAll()
  const widget = { title: 'Hello world' }
  const propsData = { widget }
  const methods = { count: () => 10 }

  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetFileBarometer, { localVue, store, i18n, wait, propsData, methods })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    const wrapper = shallowMount(WidgetFileBarometer, { localVue, store, i18n, wait, propsData, methods })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.widget__main-figure').text()).toBe('10 documents')
  })
})
