import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import JsonFormatter from '@/components/JsonFormatter'

describe('JsonFormatter.vue', () => {
  let wrapper, core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(async () => {
    const global = { plugins: core.plugins }
    wrapper = mount(JsonFormatter, { global, props: { json: ['foo', 'bar'] } })
    await wrapper.vm.$nextTick()
  })

  it('should render an array of 1 element', () => {
    expect(wrapper.find('.json-formatter-row:nth-child(1) .json-formatter-value').text()).toBe('Array[2]')
  })

  it('should render an open row', async () => {
    expect(wrapper.find('.json-formatter-row.json-formatter-open').exists()).toBeTruthy()
  })
})
