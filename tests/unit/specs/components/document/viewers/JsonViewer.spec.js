import { createLocalVue, shallowMount } from '@vue/test-utils'

import JsonViewer from '@/components/document/viewers/JsonViewer'
import JsonFormatter from '@/components/JsonFormatter'
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
    wrapper = shallowMount(JsonViewer, { localVue, propsData: { document: { url: 'document.json' } } })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('axios'))

  it('should render the JSON in a JsonFormatter component', () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
