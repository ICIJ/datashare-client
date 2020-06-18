import { createLocalVue, shallowMount } from '@vue/test-utils'

import JsonViewer from '@/components/document/viewers/JsonViewer'
import { Core } from '@/core'

jest.mock('axios', () => {
  const documentJson = require('tests/unit/resources/document.json')
  return {
    request: jest.fn().mockResolvedValue({ data: documentJson })
  }
})

describe('JsonViewer.vue', () => {
  const { localVue } = Core.init(createLocalVue()).useAll()
  let wrapper

  beforeEach(async () => {
    wrapper = await shallowMount(JsonViewer, { localVue, propsData: { document: { url: 'document.json' } } })
  })

  afterAll(() => jest.unmock('axios'))

  it('should render an array of 1 element', () => {
    expect(wrapper.find('.json-formatter-row:nth-child(1) .json-formatter-value').text()).toBe('Array[2]')
  })

  it('should render an open row', async () => {
    expect(wrapper.find('.json-formatter-row.json-formatter-open').exists()).toBeTruthy()
  })
})
