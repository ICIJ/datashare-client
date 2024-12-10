import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import DocumentViewerJson from '@/components/Document/DocumentViewer/DocumentViewerJson'
import JsonFormatter from '@/components/JsonFormatter'
import CoreSetup from '~tests/unit/CoreSetup'
import documentJson from '~tests/unit/resources/document.json'

describe('DocumentViewerJson.vue', () => {
  let api, wrapper

  beforeEach(async () => {
    api = { getSource: vi.fn().mockResolvedValue({ data: documentJson }) }
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = shallowMount(DocumentViewerJson, { global: { plugins }, props: { document: { url: 'document.json' } } })
    await flushPromises()
  })

  it('should render the JSON in a JsonFormatter component', async () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
