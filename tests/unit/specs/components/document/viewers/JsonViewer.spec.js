import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import documentJson from 'tests/unit/resources/document.json'
import JsonViewer from '@/components/document/viewers/JsonViewer'

const { localVue } = Core.init(createLocalVue()).useAll()

describe('JsonViewer.vue', () => {
  let wrapper
  const document = { url: 'document.json' }
  const methods = { getSource: jest.fn().mockResolvedValue(documentJson) }

  beforeEach(() => {
    wrapper = shallowMount(JsonViewer, { localVue, propsData: { document }, methods })
  })

  it('should render an array of 1 element', () => {
    expect(wrapper.find('.json-formatter-row:nth-child(1) .json-formatter-value').text()).toBe('Array[2]')
  })

  it('should render an open row', () => {
    expect(wrapper.find('.json-formatter-row.json-formatter-open').exists()).toBeTruthy()
  })
})
