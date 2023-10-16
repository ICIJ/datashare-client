import { createLocalVue, mount } from '@vue/test-utils'

import ColumnChartPicker from '@/components/ColumnChartPicker'
import { Core } from '@/core'

describe('ColumnChartPicker.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper

  beforeEach(() => {
    wrapper = mount(ColumnChartPicker, {
      i18n,
      localVue,
      propsData: {
        data: [
          {
            key: 1672531200000,
            doc_count: 2
          },
          {
            key: 1640995200000,
            doc_count: 1
          },
          {
            key: 1577836800000,
            doc_count: 1
          },
          {
            key: 1199145600000,
            doc_count: 1
          },
          {
            key: 0,
            doc_count: 7
          }
        ],
        interval: 'year',
        value: {
          start: 0,
          end: 1
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('emits the "update" event when the range is changed', async () => {
    await wrapper.setData({ range: [0.2, 0.8] })

    expect(wrapper.emitted().update).toBeTruthy()
    expect(wrapper.emitted().update[0]).toEqual([{ start: expect.any(Number), end: expect.any(Number) }])
  })
})
