import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
import { usePipelinesStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

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
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id' }

  let core

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll()
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
    expect(api.getStructurePage).toBeCalledWith('foo', 'doc-id', 1, 'root-id')
    expect(wrapper.find('h1').text()).toBe('Hello world')
    expect(wrapper.find('em').text()).toBe('world')
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
    const firstDocumentCalls = api.getStructurePage.mock.calls.filter(([, id]) => id === 'doc-id')
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
})
