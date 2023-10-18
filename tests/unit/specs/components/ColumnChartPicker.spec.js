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

  it('computes the "aggregatedData" correctly', () => {
    const aggregatedData = wrapper.vm.aggregatedData
    expect(aggregatedData).toHaveLength(16)
    expect(aggregatedData[0]).toEqual({ date: expect.any(Date), value: expect.any(Number) })
  })

  it('computes the "startYear" correctly', () => {
    expect(wrapper.vm.startYear).toBe(2008)
  })

  it('computes the "endYear" correctly', () => {
    expect(wrapper.vm.endYear).toBe(2023)
  })

  it('computes the "intervalTimesExtent" correctly', () => {
    expect(wrapper.vm.intervalTimesExtent).toEqual([
      new Date(Date.UTC(2008, 0, 1)).getTime(),
      new Date(Date.UTC(2023, 11, 31, 23, 59, 59)).getTime()
    ])
  })

  it('computes the "intervalDatesExtent" correctly', () => {
    expect(wrapper.vm.intervalDatesExtent).toEqual([
      new Date(Date.UTC(2008, 0, 1)),
      new Date(Date.UTC(2023, 11, 31, 23, 59, 59))
    ])
  })

  it('executes "isBucketValid" method correctly', () => {
    expect(wrapper.vm.isBucketValid({ key: 1234567890 })).toBe(true)
    expect(wrapper.vm.isBucketValid({ key: 0 })).toBe(false)
  })
})
