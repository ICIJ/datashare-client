import { createLocalVue, shallowMount, mount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetCreationDateOverTime from '@/components/WidgetCreationDateOverTime'

describe('WidgetCreationDateOverTime.vue', () => {
  const { localVue, store, i18n, wait } = Core.init(createLocalVue()).useAll()
  const widget = { title: 'Hello world' }
  const propsData = { widget }

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetCreationDateOverTime, { localVue, store, i18n, wait, propsData })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display a barchart with 2 bars', async () => {
    const methods = { loadData: () => [{ date: new Date('2012-02'), doc_count: 2 }, { date: new Date('2012-03'), doc_count: 4 }] }
    const wrapper = mount(WidgetCreationDateOverTime, { localVue, store, i18n, wait, propsData, methods, attachToDocument: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('svg')).toHaveLength(1)
    expect(wrapper.findAll('svg rect')).toHaveLength(2)
  })
})
