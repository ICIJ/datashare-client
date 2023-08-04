import { createLocalVue, shallowMount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import JsonViewer from '@/components/document/viewers/JsonViewer'
import JsonFormatter from '@/components/JsonFormatter'
import { Core } from '@/core'

const documentJson = require('tests/unit/resources/document.json')

describe('JsonViewer.vue', () => {
  let localVue, api, wrapper
  beforeAll(() => {
    api = { getSource: jest.fn().mockResolvedValue({ data: documentJson }) }
    const core = Core.init(createLocalVue(), api).useAll()
    localVue = core.localVue
  })

  it('should render the JSON in a JsonFormatter component', async () => {
    wrapper = shallowMount(JsonViewer, { localVue, propsData: { document: { url: 'document.json' } } })
    await flushPromises()
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
