import { shallowMount, flushPromises } from '@vue/test-utils'

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
  let core, wrapper

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(async () => {
    core.createPinia()
    const plugins = core.plugins
    wrapper = shallowMount(DocumentViewerJson, { global: { plugins }, props: { document: { url: 'document.json' } } })
    await flushPromises()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should render the JSON in a JsonFormatter component', async () => {
    expect(wrapper.findComponent(JsonFormatter).exists()).toBeTruthy()
  })
})
