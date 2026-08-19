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

  it('shows a loading state before the source resolves, then renders sanitized HTML', async () => {
    apiInstance.getSource.mockResolvedValue('# Hello\n\n<script>alert(1)</script>')
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })

    // Before the fetch resolves, the loading state is shown (no empty card flash).
    expect(wrapper.find('.markdown-viewer__loading').exists()).toBe(true)
    expect(wrapper.find('.markdown-viewer__content').exists()).toBe(false)

    await flushPromises()

    const content = wrapper.find('.markdown-viewer__content')
    expect(content.exists()).toBe(true)
    expect(content.html()).toContain('<h1 id="hello">Hello</h1>')
    expect(content.html()).not.toContain('<script')
    // Rendered like the PDF view: bordered, elevated, padded card, centered.
    expect(content.classes()).toEqual(expect.arrayContaining(['shadow-sm', 'border', 'p-3', 'mx-auto']))
  })

  it('re-fetches and re-renders when the document prop changes', async () => {
    apiInstance.getSource.mockImplementation(document => Promise.resolve(`# ${document.url}`))
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'first' } }
    })
    await flushPromises()
    expect(wrapper.find('.markdown-viewer__content').html()).toContain('<h1 id="first">first</h1>')

    await wrapper.setProps({ document: { url: 'second' } })
    await flushPromises()
    expect(wrapper.find('.markdown-viewer__content').html()).toContain('<h1 id="second">second</h1>')
    expect(wrapper.find('.markdown-viewer__content').html()).not.toContain('first')
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

  it('renders ordinary markdown, including a table with a header row, unchanged', async () => {
    // `renderMarkdown` (and its headerless-table normalization) is shared
    // with the Text tab's markdown page; this pins the View tab's output for
    // a normal document so a future change to that shared normalizer cannot
    // silently alter it here.
    const source = ['# Title', '', '| a | b |', '| - | - |', '| 1 | 2 |', '', 'Some prose about it.'].join('\n')
    apiInstance.getSource.mockResolvedValue(source)
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })
    await flushPromises()

    const content = wrapper.find('.markdown-viewer__content')
    expect(content.html()).toContain('<h1 id="title">Title</h1>')
    expect(content.find('table').exists()).toBe(true)
    expect(content.find('th').text()).toBe('a')
    expect(content.find('td').text()).toBe('1')
    expect(content.html()).toContain('<p>Some prose about it.</p>')
  })

  it('scrolls to the target instead of navigating when an in-document link is clicked', async () => {
    apiInstance.getSource.mockResolvedValue('# My Section\n\nSee [the section](#my-section).')
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })
    await flushPromises()

    const heading = wrapper.find('h1').element
    heading.scrollIntoView = vi.fn()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.find('a').element.dispatchEvent(event)

    // The router lives in the URL hash, so letting the browser follow a
    // fragment href would drop the user out of the document entirely.
    expect(event.defaultPrevented).toBe(true)
    expect(heading.scrollIntoView).toHaveBeenCalled()
  })

  it('leaves clicks on external links to the browser', async () => {
    apiInstance.getSource.mockResolvedValue('[report](https://example.org/report)')
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = shallowMount(DocumentViewerMarkdown, {
      global: { plugins },
      props: { document: { url: 'doc.md' } }
    })
    await flushPromises()

    const anchor = wrapper.find('a')
    expect(anchor.attributes('target')).toBe('_blank')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    anchor.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
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
