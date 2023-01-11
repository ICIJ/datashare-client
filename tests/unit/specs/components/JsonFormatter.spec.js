import { createLocalVue, mount } from '@vue/test-utils'

import JsonFormatter from '@/components/JsonFormatter'
import { Core } from '@/core'

describe('JsonFormatter.vue', () => {
  let wrapper, localVue
  beforeAll(() => {
    const core = Core.init(createLocalVue()).useAll()
    localVue = core.localVue
  })
  beforeEach(async () => {
    wrapper = mount(JsonFormatter, { localVue, propsData: { json: ['foo', 'bar'] } })
    await wrapper.vm.$nextTick()
  })

  it('should render an array of 1 element', () => {
    expect(wrapper.find('.json-formatter-row:nth-child(1) .json-formatter-value').text()).toBe('Array[2]')
  })

  it('should render an open row', async () => {
    expect(wrapper.find('.json-formatter-row.json-formatter-open').exists()).toBeTruthy()
  })
})
