import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import JsonViewer from '@/components/document/viewers/JsonViewer'
import JsonFormatter from '@/components/JsonFormatter'
import CoreSetup from '~tests/unit/CoreSetup'
import documentJson from '~tests/unit/resources/document.json'

describe('JsonViewer.vue', () => {
  let api, wrapper

  beforeEach(async () => {
    api = { getSource: vi.fn().mockResolvedValue({ data: documentJson }) }
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = shallowMount(JsonViewer, { global: { plugins }, props: { document: { url: 'document.json' } } })
    await flushPromises()
  })

  it('should render the JSON in a JsonFormatter component', async () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
