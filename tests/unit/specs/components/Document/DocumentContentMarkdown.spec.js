import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
import { usePipelinesStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'
// The off-thread renderer reaches its inline fallback through a dynamic import;
// loading the module up front keeps that fallback within one promise flush.
import '@/utils/markdown'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getStructurePage: vi.fn()
    }
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('DocumentContentMarkdown.vue', () => {
  let core
  let document
  let nextDocumentId = 0

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll()
    // The rendered-page cache lives at module scope so it survives the
    // Formatted/Plain unmount cycle: a distinct document per test keeps the
    // tests from sharing it.
    document = { index: 'foo', id: `doc-id-${++nextDocumentId}`, routing: 'root-id' }
    api.getStructurePage.mockResolvedValue('# Hello *world*')
  })

  async function mountComponent(props = {}) {
    const { plugins } = core
    const wrapper = mount(DocumentContentMarkdown, { props: { document, page: 1, ...props }, global: { plugins } })
    await flushPromises()
    await flushPromises()
    return wrapper
  }

  it('fetches and renders the markdown page as sanitized html', async () => {
    const wrapper = await mountComponent()
    expect(api.getStructurePage).toBeCalledWith('foo', document.id, 1, 'root-id')
    expect(wrapper.find('h1').text()).toBe('Hello world')
    expect(wrapper.find('em').text()).toBe('world')
  })

  it('scrolls to the target instead of navigating when an in-document link is clicked', async () => {
    api.getStructurePage.mockResolvedValue('# My Section\n\nSee [the section](#my-section).')
    const wrapper = await mountComponent()
    const heading = wrapper.find('h1').element
    heading.scrollIntoView = vi.fn()

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.find('a').element.dispatchEvent(event)

    // This view renders the same markdown as the viewer tab, so a fragment
    // link must not replace the route here either.
    expect(event.defaultPrevented).toBe(true)
    expect(heading.scrollIntoView).toHaveBeenCalled()
  })

  it('fetches a page only once', async () => {
    const wrapper = await mountComponent()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    await wrapper.setProps({ page: 1 })
    await flushPromises()
    const firstPageCalls = api.getStructurePage.mock.calls.filter(([, , page]) => page === 1)
    expect(firstPageCalls).toHaveLength(1)
  })

  it('does not let a stale in-flight fetch for a previous page overwrite the current page', async () => {
    let resolvePageOne
    const pageOnePromise = new Promise((resolve) => {
      resolvePageOne = resolve
    })
    api.getStructurePage.mockImplementation((index, id, page) => {
      return page === 1 ? pageOnePromise : Promise.resolve('# Page two')
    })
    const wrapper = mount(DocumentContentMarkdown, { props: { document, page: 1 }, global: { plugins: core.plugins } })
    await flushPromises()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Page two')
    // The page-1 fetch resolves only now, after navigation moved on to page 2
    resolvePageOne('# Page one (stale)')
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Page two')
  })

  it('does not let a superseded fetch overwrite the current page with an oversized result', async () => {
    let resolvePageOne
    const pageOnePromise = new Promise((resolve) => {
      resolvePageOne = resolve
    })
    api.getStructurePage.mockImplementation((index, id, page) => {
      return page === 1 ? pageOnePromise : Promise.resolve('# Page two')
    })
    const wrapper = mount(DocumentContentMarkdown, {
      props: { document, page: 1, oversizedThreshold: 99 },
      global: { plugins: core.plugins }
    })
    await flushPromises()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Page two')
    // Page 1's oversized payload resolves only now, after navigation moved on to page 2
    resolvePageOne('a'.repeat(100))
    await flushPromises()
    await flushPromises()
    expect(wrapper.emitted('oversized')).toBeUndefined()
    expect(wrapper.find('h1').text()).toBe('Page two')
  })

  it('fetches an empty page only once across two visits', async () => {
    api.getStructurePage.mockResolvedValue('')
    const wrapper = await mountComponent()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    await wrapper.setProps({ page: 1 })
    await flushPromises()
    const firstPageCalls = api.getStructurePage.mock.calls.filter(([, , page]) => page === 1)
    expect(firstPageCalls).toHaveLength(1)
  })

  it('shows the no-content message instead of an empty body for an empty page', async () => {
    api.getStructurePage.mockResolvedValue('')
    const wrapper = await mountComponent()
    expect(wrapper.find('.document-content-markdown__body').exists()).toBe(false)
    expect(wrapper.text()).toContain('No content extracted for this document')
  })

  it('emits empty when the page it shows is empty, so the parent can go back to plain text', async () => {
    api.getStructurePage.mockResolvedValue('')
    const wrapper = await mountComponent()
    expect(wrapper.emitted('empty')).toHaveLength(1)
  })

  it('does not emit empty for a page that has content', async () => {
    api.getStructurePage.mockImplementation((index, id, page) => {
      return Promise.resolve(page === 1 ? '# Page one' : '')
    })
    const wrapper = await mountComponent()
    expect(wrapper.emitted('empty')).toBeUndefined()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    expect(wrapper.text()).toContain('No content extracted for this document')
    expect(wrapper.emitted('empty')).toHaveLength(1)
  })

  it('drops the rendered page cache when the document changes', async () => {
    const wrapper = await mountComponent()
    await wrapper.setProps({ document: { index: 'foo', id: 'other-id', routing: 'other-id' } })
    await flushPromises()
    await wrapper.setProps({ document })
    await flushPromises()
    const firstDocumentCalls = api.getStructurePage.mock.calls.filter(([, id]) => id === document.id)
    expect(firstDocumentCalls).toHaveLength(2)
  })

  it('marks the global search terms inside the local ones', async () => {
    api.getStructurePage.mockResolvedValue('lorem ipsum dolor')
    const wrapper = await mountComponent({ term: 'ipsum dolor', globalSearchTerms: [{ label: 'dolor' }] })
    const html = wrapper.find('.document-content-markdown__body').html()
    expect(html).toContain('<mark class="local-search-term">ipsum <mark class="global-search-term"')
  })

  // An empty artifact is permanent, a failed fetch is not: the parent disables
  // the formatted option on the first and keeps it available on the second.
  it('emits empty rather than fallback when the first page is empty', async () => {
    api.getStructurePage.mockResolvedValue('')
    const wrapper = await mountComponent()
    expect(wrapper.emitted('fallback')).toBeUndefined()
  })

  it('does not let a superseded page fetch fail over a newer page that already loaded', async () => {
    let resolvePageTwo
    const pageTwoPromise = new Promise((resolve) => {
      resolvePageTwo = resolve
    })
    let rejectPageOne
    const pageOnePromise = new Promise((_resolve, reject) => {
      rejectPageOne = reject
    })
    api.getStructurePage.mockImplementation((index, id, page) => {
      return page === 1 ? pageOnePromise : pageTwoPromise
    })
    const wrapper = mount(DocumentContentMarkdown, { props: { document, page: 1 }, global: { plugins: core.plugins } })
    await flushPromises()
    await wrapper.setProps({ page: 2 })
    await flushPromises()
    // Page 2 (the page the user is now looking at) resolves successfully first
    resolvePageTwo('# Page two')
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Page two')
    // Page 1's stale, superseded request fails only after page 2 has rendered
    rejectPageOne(new Error('Network Error'))
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Page two')
    expect(wrapper.find('.document-content-markdown__error').exists()).toBe(false)
  })

  it('reloads when the document changes even if the page number stays the same', async () => {
    const wrapper = await mountComponent()
    api.getStructurePage.mockResolvedValue('# Other document')
    await wrapper.setProps({ document: { index: 'foo', id: 'other-doc-id', routing: 'root-id' } })
    await flushPromises()
    await flushPromises()
    expect(api.getStructurePage).toBeCalledWith('foo', 'other-doc-id', 1, 'root-id')
    expect(wrapper.find('h1').text()).toBe('Other document')
  })

  it('marks the term occurrences in the rendered page', async () => {
    api.getStructurePage.mockResolvedValue('# Hello world\n\nhello again')
    const wrapper = await mountComponent({ term: 'hello' })
    expect(wrapper.findAll('mark.local-search-term')).toHaveLength(2)
  })

  it('activates the nth mark and scrolls to it', async () => {
    api.getStructurePage.mockResolvedValue('hello and hello')
    const wrapper = await mountComponent({ term: 'hello', activeMatch: 2 })
    const marks = wrapper.findAll('mark.local-search-term')
    expect(marks[0].classes()).not.toContain('local-search-term--active')
    expect(marks[1].classes()).toContain('local-search-term--active')
  })

  it('clamps the active mark to the marks the dom actually shows', async () => {
    api.getStructurePage.mockResolvedValue('a single hello')
    const wrapper = await mountComponent({ term: 'hello', activeMatch: 5 })
    const marks = wrapper.findAll('mark.local-search-term')
    expect(marks).toHaveLength(1)
    expect(marks[0].classes()).toContain('local-search-term--active')
  })

  it('shows an inline error with a retry button when the page fetch fails', async () => {
    api.getStructurePage.mockRejectedValue(new Error('Network Error'))
    const wrapper = await mountComponent()
    expect(wrapper.find('.document-content-markdown__error').exists()).toBe(true)
    api.getStructurePage.mockResolvedValue('# Recovered')
    await wrapper.find('.document-content-markdown__error__retry').trigger('click')
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Recovered')
  })

  it('emits fallback when the user asks for the plain text view', async () => {
    api.getStructurePage.mockRejectedValue(new Error('Network Error'))
    const wrapper = await mountComponent()
    await wrapper.find('.document-content-markdown__error__fallback').trigger('click')
    expect(wrapper.emitted('fallback')).toHaveLength(1)
  })

  describe('sanitization boundary', () => {
    it('runs a plugin registered under the markdown-text category on the rendered body', async () => {
      const pipelinesStore = usePipelinesStore()
      pipelinesStore.register({ category: 'markdown-text', type: html => html.replace('Hello', 'Bonjour') })
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').text()).toBe('Bonjour world')
    })

    it('does not route the markdown body through the extracted-text pipeline chain', async () => {
      // The repo's own SanitizeHtml pipeline whitelists only `mark` and `p`:
      // if the markdown body ever flowed through the `extracted-text:post`
      // chain, this would strip the `<h1>` down to plain text.
      const pipelinesStore = usePipelinesStore()
      pipelinesStore.register({ name: 'extracted-text-sanitize-html', type: 'SanitizeHtml', category: 'extracted-text:post' })
      const wrapper = await mountComponent()
      expect(wrapper.find('h1').exists()).toBe(true)
    })
  })

  it('emits oversized instead of rendering a page bigger than the threshold', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(100))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('oversized')).toHaveLength(1)
    expect(wrapper.find('.document-content-markdown__body').exists()).toBe(false)
  })

  it('does not report an oversized page as empty', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(100))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('empty')).toBeUndefined()
  })

  it('renders a page at the threshold exactly', async () => {
    api.getStructurePage.mockResolvedValue('a'.repeat(99))
    const wrapper = await mountComponent({ oversizedThreshold: 99 })
    expect(wrapper.emitted('oversized')).toBeUndefined()
    expect(wrapper.find('.document-content-markdown__body').exists()).toBe(true)
  })

  it('renders an oversized page when the reader insists', async () => {
    api.getStructurePage.mockResolvedValue('# Big page')
    const wrapper = await mountComponent({ oversizedThreshold: 3, renderOversized: true })
    expect(wrapper.emitted('oversized')).toBeUndefined()
    expect(wrapper.find('h1').text()).toBe('Big page')
  })

  it('keeps the rendered page across an unmount, so a view toggle does not refetch', async () => {
    const wrapper = await mountComponent()
    wrapper.unmount()
    const remounted = await mountComponent()
    expect(remounted.find('h1').text()).toContain('world')
    expect(api.getStructurePage).toHaveBeenCalledTimes(1)
  })

  it('renders an oversized page from the payload it already downloaded', async () => {
    api.getStructurePage.mockResolvedValue('# Big page')
    const wrapper = await mountComponent({ oversizedThreshold: 3 })
    expect(wrapper.emitted('oversized')).toHaveLength(1)
    wrapper.unmount()
    const remounted = await mountComponent({ oversizedThreshold: 3, renderOversized: true })
    expect(remounted.find('h1').text()).toBe('Big page')
    expect(api.getStructurePage).toHaveBeenCalledTimes(1)
  })

  it('leaves a sibling showing another document untouched', async () => {
    const wrapper = await mountComponent()
    const other = { index: 'foo', id: `${document.id}-sibling`, routing: 'root-id' }
    const sibling = await mountComponent({ document: other })
    expect(sibling.find('h1').exists()).toBe(true)
    // The sibling's own load must not evict the pages this one is showing
    expect(wrapper.find('h1').exists()).toBe(true)
    const firstDocumentCalls = api.getStructurePage.mock.calls.filter(([, id]) => id === document.id)
    expect(firstDocumentCalls).toHaveLength(1)
  })

  it('drops a document nobody shows any more once another one is opened', async () => {
    const wrapper = await mountComponent()
    wrapper.unmount()
    const other = { index: 'foo', id: `${document.id}-other`, routing: 'root-id' }
    const openedNext = await mountComponent({ document: other })
    openedNext.unmount()
    await mountComponent()
    const firstDocumentCalls = api.getStructurePage.mock.calls.filter(([, id]) => id === document.id)
    expect(firstDocumentCalls).toHaveLength(2)
  })

  it('shows the no-content message rather than an error for a page with no payload', async () => {
    api.getStructurePage.mockResolvedValue(undefined)
    const wrapper = await mountComponent()
    expect(wrapper.find('.document-content-markdown__error').exists()).toBe(false)
    expect(wrapper.text()).toContain('No content extracted for this document')
  })
})
