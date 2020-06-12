import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetFileBarometer from '@/components/WidgetFileBarometer'
import { Core } from '@/core'

describe('WidgetFileBarometer.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const widget = { title: 'Hello world' }
  const propsData = { widget }
  const methods = { count: () => 10 }

  beforeEach(() => store.commit('insights/reset'))

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetFileBarometer, { i18n, localVue, store, wait, propsData, methods })
    expect(wrapper).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    const wrapper = shallowMount(WidgetFileBarometer, { i18n, localVue, store, wait, propsData, methods })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.widget__main-figure').text()).toBe('10 documents')
  })
})
