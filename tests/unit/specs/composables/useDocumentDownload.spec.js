import { mount, flushPromises } from '@vue/test-utils'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
import { useDocumentStore } from '@/store/modules'
import Document from '@/api/resources/Document'
import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance } from '@/api/apiInstance'

describe('useDocumentDownload composable', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    // Force a fresh Pinia so the document download store isn't memoized
    // across tests sharing the same document index/id/routing
    core.createPinia()
    plugins = core.plugins
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockGetSource(response) {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue(response)
  }

  function mountComposable(document, options) {
    let result
    const TestComponent = {
      setup() {
        result = useDocumentDownload(document, options)
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  describe('fetchStatuses', () => {
    it('should not fetch download status when immediate is false', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
    })

    it('should fetch download status and translations when fetchStatuses is called', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { fetchStatuses, hasTranslations } = mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
      expect(hasTranslations.value).toBe(false)

      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).toHaveBeenCalledWith('test-index', 'doc1', 'doc1')
      expect(hasTranslations.value).toBe(true)
    })

    it('should not fetch download status when the document has no id', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({ _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.isDocumentDownloadable).not.toHaveBeenCalled()
    })
  })

  describe('isDownloadAllowed', () => {
    it('should be true before the status is fetched', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed } = mountComposable(doc, { immediate: false })
      expect(isDownloadAllowed.value).toBe(true)
    })

    it('should be false once the backend refuses the download', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(false)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed, fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(isDownloadAllowed.value).toBe(false)
    })

    it('should stay true when the backend allows the download', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc1',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { isDownloadAllowed, fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(isDownloadAllowed.value).toBe(true)
    })
  })

  describe('hasTranslations', () => {
    it('should be true when API returns translations', async () => {
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc-with-translations',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { hasTranslations } = mountComposable(doc)
      await flushPromises()
      expect(hasTranslations.value).toBe(true)
    })

    it('should be false when API returns no translations', async () => {
      mockGetSource({ content_translated: [] })
      const doc = new Document({
        _id: 'doc2',
        _index: 'test-index',
        _source: { title: 'test' }
      })
      const { hasTranslations } = mountComposable(doc)
      await flushPromises()
      expect(hasTranslations.value).toBe(false)
    })
  })

  describe('downloadTranslatedContent', () => {
    it('should create a blob download with translated content', async () => {
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc3',
        _source: {
          title: 'test-doc',
          path: '/path/to/test-doc.pdf',
          content: 'original content',
          content_translated: [{ content: 'translated text', target_language: 'ENGLISH' }]
        }
      })

      const clickSpy = vi.fn()
      const fakeAnchor = { href: '', download: '', click: clickSpy }
      const originalCreateElement = window.document.createElement.bind(window.document)
      vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return fakeAnchor
        return originalCreateElement(tag)
      })

      const { downloadTranslatedContent } = mountComposable(doc)
      await downloadTranslatedContent()

      expect(clickSpy).toHaveBeenCalled()
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    })

    it('should call getContent when content is not loaded', async () => {
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc3',
        _source: {
          title: 'test-doc',
          path: '/path/to/test-doc.pdf',
          content_translated: [{ content: 'translated text', target_language: 'ENGLISH' }]
        }
      })

      const clickSpy = vi.fn()
      const fakeAnchor = { href: '', download: '', click: clickSpy }
      const originalCreateElement = window.document.createElement.bind(window.document)
      vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return fakeAnchor
        return originalCreateElement(tag)
      })

      const documentStore = useDocumentStore()
      const getContentSpy = vi.spyOn(documentStore, 'getContent').mockResolvedValue()

      const { downloadTranslatedContent } = mountComposable(doc)
      await downloadTranslatedContent()

      expect(getContentSpy).toHaveBeenCalled()
    })
  })

  describe('hasMarkdown', () => {
    function markdownDocument(id) {
      return new Document({
        _id: id,
        _index: 'test-index',
        _source: { title: 'test' }
      })
    }

    it('should be false before the manifest is fetched', () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn(() => new Promise(() => {}))
      const { hasMarkdown } = mountComposable(markdownDocument('md-pending'))
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the document has no structure artifact', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const { hasMarkdown } = mountComposable(markdownDocument('md-none'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the manifest reports zero pages', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 0, formats: ['md'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-empty'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when markdown is not among the available formats', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['xhtml'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-xhtml-only'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be true when the manifest reports markdown pages', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['md', 'xhtml'] })
      const { hasMarkdown } = mountComposable(markdownDocument('md-available'))
      await flushPromises()
      expect(hasMarkdown.value).toBe(true)
    })
  })

  describe('fetchMarkdownStatus', () => {
    it('should not probe the manifest when immediate is false', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const doc = new Document({ _id: 'md-lazy', _index: 'test-index', _source: { title: 'test' } })
      mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })

    it('should probe the manifest when fetchStatuses is called', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      const doc = new Document({ _id: 'md-explicit', _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses, hasMarkdown } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).toHaveBeenCalledWith('test-index', 'md-explicit', 'md-explicit')
      expect(hasMarkdown.value).toBe(true)
    })

    it('should not probe the manifest when the document has no id', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const doc = new Document({ _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })
  })

  describe('downloadMarkdown', () => {
    function stubAnchor() {
      const anchor = { href: '', download: '', click: vi.fn() }
      const originalCreateElement = window.document.createElement.bind(window.document)
      vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return anchor
        return originalCreateElement(tag)
      })
      return anchor
    }

    // jsdom's Blob doesn't implement `text()`; read it via FileReader instead.
    function readBlob(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsText(blob)
      })
    }

    it('should request every page of the artifact', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 3, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('page')
      stubAnchor()
      const doc = new Document({ _id: 'md-pages', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).toHaveBeenCalledTimes(3)
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 1, 'md-pages')
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 2, 'md-pages')
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', 'md-pages', 3, 'md-pages')
    })

    it('should join the pages with a blank line', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 2, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn((index, id, page) => Promise.resolve(`# Page ${page}`))
      stubAnchor()
      const doc = new Document({ _id: 'md-join', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      const [blob] = URL.createObjectURL.mock.calls.at(-1)
      expect(blob.type).toBe('text/markdown;charset=utf-8')
      await expect(readBlob(blob)).resolves.toBe('# Page 1\n\n# Page 2')
    })

    it('should name the file after the document title', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Only page')
      const anchor = stubAnchor()
      const doc = new Document({ _id: 'md-name', _index: 'test-index', _source: { title: 'my-doc' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(anchor.download).toBe('my-doc.md')
      expect(anchor.click).toHaveBeenCalled()
    })

    it('should do nothing when the document has no markdown', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Nope')
      const anchor = stubAnchor()
      const doc = new Document({ _id: 'md-absent', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).not.toHaveBeenCalled()
      expect(anchor.click).not.toHaveBeenCalled()
    })

    it('should resolve without downloading when a page fails to load', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 2, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn((index, id, page) => {
        return page === 2 ? Promise.reject(new Error('boom')) : Promise.resolve('# Page 1')
      })
      const anchor = stubAnchor()
      const doc = new Document({ _id: 'md-failing-page', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await expect(downloadMarkdown()).resolves.toBeUndefined()
      expect(anchor.click).not.toHaveBeenCalled()
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })
  })

  describe('isDownloadingMarkdown', () => {
    function stubAnchor() {
      const anchor = { href: '', download: '', click: vi.fn() }
      const originalCreateElement = window.document.createElement.bind(window.document)
      vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return anchor
        return originalCreateElement(tag)
      })
      return anchor
    }

    it('should be false before any download starts', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      const doc = new Document({ _id: 'md-idle', _index: 'test-index', _source: { title: 'test' } })
      const { isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      expect(isDownloadingMarkdown.value).toBe(false)
    })

    it('should be true while the pages are being fetched', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 2, formats: ['md'] })
      // Every page must be resolvable: Promise.all only settles once the last
      // one does, so keeping a single resolver would hang the download.
      const resolvers = []
      apiInstance.getStructurePage = vi.fn(() => new Promise(resolve => resolvers.push(resolve)))
      stubAnchor()
      const doc = new Document({ _id: 'md-pending-download', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown, isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      const pending = downloadMarkdown()
      await flushPromises()
      expect(isDownloadingMarkdown.value).toBe(true)
      resolvers.forEach(resolve => resolve('# Page'))
      await pending
      expect(isDownloadingMarkdown.value).toBe(false)
    })

    it('should be false again once a page fails', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages: 1, formats: ['md'] })
      apiInstance.getStructurePage = vi.fn().mockRejectedValue(new Error('boom'))
      stubAnchor()
      const doc = new Document({ _id: 'md-failed-download', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown, isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(isDownloadingMarkdown.value).toBe(false)
    })

    it('should stay false when the document has no markdown', async () => {
      mockGetSource({ content_translated: [] })
      apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
      const doc = new Document({ _id: 'md-no-artifact', _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown, isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(isDownloadingMarkdown.value).toBe(false)
    })
  })
})
