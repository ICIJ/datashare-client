import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerMarkdown from '@/components/Document/DocumentViewer/DocumentViewerMarkdown'
import messages from '@/lang/en.json'

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

  it('shows the not-found error message when the source returns a 404', async () => {
    apiInstance.getSource.mockRejectedValue({ response: { status: 404 } })
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'missing.md' } }
    })
    await flushPromises()

    const error = wrapper.find('.markdown-viewer__error')
    expect(error.exists()).toBe(true)
    expect(wrapper.find('.markdown-viewer__content').exists()).toBe(false)
    // The 404 branch must select the "errorNotFound" translation, not the generic one.
    expect(error.text()).toBe(messages.document.errorNotFound)
    expect(error.text()).not.toBe(messages.document.notAvailable)
  })

  it('shows the generic not-available message for non-404 failures', async () => {
    apiInstance.getSource.mockRejectedValue({ response: { status: 500 } })
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'broken.md' } }
    })
    await flushPromises()

    const error = wrapper.find('.markdown-viewer__error')
    expect(error.exists()).toBe(true)
    expect(wrapper.find('.markdown-viewer__content').exists()).toBe(false)
    // The non-404 branch must select the generic "notAvailable" translation.
    expect(error.text()).toBe(messages.document.notAvailable)
    expect(error.text()).not.toBe(messages.document.errorNotFound)
  })
})
