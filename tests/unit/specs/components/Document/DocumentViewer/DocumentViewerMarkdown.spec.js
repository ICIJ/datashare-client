import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerMarkdown from '@/components/Document/DocumentViewer/DocumentViewerMarkdown'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSource: vi.fn()
    }
  }
})

import { apiInstance } from '@/api/apiInstance'

describe('DocumentViewerMarkdown.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('renders sanitized HTML from the markdown source', async () => {
    apiInstance.getSource.mockResolvedValue('# Hello\n\n<script>alert(1)</script>')
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })
    await flushPromises()

    const content = wrapper.find('.markdown-viewer__content')
    expect(content.exists()).toBe(true)
    expect(content.html()).toContain('<h1>Hello</h1>')
    expect(content.html()).not.toContain('<script')
  })

  it('shows an error message when the source cannot be fetched', async () => {
    apiInstance.getSource.mockRejectedValue({ response: { status: 404 } })
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'missing.md' } }
    })
    await flushPromises()

    expect(wrapper.find('.markdown-viewer__error').exists()).toBe(true)
    expect(wrapper.find('.markdown-viewer__content').exists()).toBe(false)
  })
})
