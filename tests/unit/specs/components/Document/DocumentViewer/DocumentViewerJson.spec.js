import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerJson from '@/components/Document/DocumentViewer/DocumentViewerJson'
import JsonFormatter from '@/components/JsonFormatter'

vi.mock('@/api/apiInstance', async () => {
  const { default: data } = await import('~tests/unit/resources/document.json')

  return {
    apiInstance: {
      getSource: vi.fn().mockResolvedValue({ data })
    }
  }
})

describe('DocumentViewerJson.vue', () => {
  let wrapper

  beforeEach(async () => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = shallowMount(DocumentViewerJson, { global: { plugins }, props: { document: { url: 'document.json' } } })
    await flushPromises()
  })

  it('should render the JSON in a JsonFormatter component', async () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
