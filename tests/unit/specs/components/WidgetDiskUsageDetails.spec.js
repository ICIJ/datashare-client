import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetDiskUsageDetails from '@/components/WidgetDiskUsageDetails'
import { Core } from '@/core'

describe('WidgetDiskUsageDetails.vue', () => {
  const { i18n, localVue, wait, store, config } = Core.init(createLocalVue()).useAll()
  const propsData = { path: '/home/foo' }

  beforeAll(() => {
    config.set('dataDir', '/home/foo')
  })

  it('should be a Vue instance', () => {
    const methods = {
      sumByDirectory: () => ({
        hits: 10,
        directories: [
          { key: 'bar', contentLengthSum: { value: 1024 } },
          { key: 'baz', contentLengthSum: { value: 1024 } }
        ]
      }),
      sumTotal: () => 2048
    }
    const wrapper = shallowMount(WidgetDiskUsageDetails, { i18n, localVue, wait, store, propsData, methods })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display 2 directories', async () => {
    const methods = {
      sumByDirectory: () => ({
        hits: 10,
        directories: [
          { key: 'bar', contentLengthSum: { value: 1024 } },
          { key: 'baz', contentLengthSum: { value: 1024 } }
        ]
      }),
      sumTotal: () => 2048
    }
    const wrapper = shallowMount(WidgetDiskUsageDetails, { i18n, localVue, wait, store, propsData, methods })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.widget-disk-usage-details__directories__item')).toHaveLength(3)
    // One for the document count
    expect(wrapper.find('.widget-disk-usage-details__directories__item--hits').exists()).toBeTruthy()
    expect(wrapper.find('.widget-disk-usage-details__directories__item--hits').text()).toBe('10 documents')
  })
})
