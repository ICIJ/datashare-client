import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
import { useDocumentStore } from '@/store/modules'
import Document from '@/api/resources/Document'
import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance } from '@/api/apiInstance'

const FORMAT = Object.freeze({
  MARKDOWN: 'md',
  XHTML: 'xhtml'
})

// One id per case, so a failing assertion names the scenario it came from
const DOCUMENT_ID = Object.freeze({
  PENDING_MANIFEST: 'md-pending',
  NO_ARTIFACT: 'md-none',
  EMPTY_MANIFEST: 'md-empty',
  XHTML_ONLY: 'md-xhtml-only',
  AVAILABLE: 'md-available',
  BEFORE_CHANGE: 'md-first',
  AFTER_CHANGE: 'md-second',
  LAZY_PROBE: 'md-lazy',
  EXPLICIT_PROBE: 'md-explicit',
  EVERY_PAGE: 'md-pages',
  JOINED_PAGES: 'md-join',
  NAMED_FILE: 'md-name',
  WITHOUT_MARKDOWN: 'md-absent',
  FAILING_PAGE: 'md-failing-page',
  TOASTED_PAGE: 'md-toasted-page',
  EXPIRED_SESSION: 'md-expired-session',
  DOUBLE_CLICK: 'md-double-click',
  IDLE: 'md-idle',
  DOWNLOADING: 'md-pending-download',
  FAILED_DOWNLOAD: 'md-failed-download',
  NO_ARTIFACT_DOWNLOAD: 'md-no-artifact'
})

describe('useDocumentDownload composable', () => {
  let core, plugins, wrapper

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    // Force a fresh Pinia so the document download store isn't memoized
    // across tests sharing the same document index/id/routing
    core.createPinia()
    plugins = core.plugins
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
    // Plain property assignments on the api singleton survive
    // `vi.restoreAllMocks`, so every probe is stubbed here rather than relying
    // on a stub set by an earlier test to leak into the next one. Tests that
    // need another answer than "nothing to download" override their own.
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue(null)
    apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
    mockGetSource({ content_translated: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockGetSource(response) {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue(response)
  }

  function mockStructureManifest(pages, formats = [FORMAT.MARKDOWN]) {
    apiInstance.getStructureManifest = vi.fn().mockResolvedValue({ pages, formats })
  }

  function stubAnchor() {
    const anchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = window.document.createElement.bind(window.document)
    vi.spyOn(window.document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return anchor
      }
      return originalCreateElement(tag)
    })
    return anchor
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
    wrapper = mount(TestComponent, { global: { plugins } })
    return result
  }

  describe('fetchStatuses', () => {
    it('should not fetch download status when immediate is false', async () => {
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
      apiInstance.getStructureManifest = vi.fn(() => new Promise(() => {}))
      const { hasMarkdown } = mountComposable(markdownDocument(DOCUMENT_ID.PENDING_MANIFEST))
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the document has no structure artifact', async () => {
      const { hasMarkdown } = mountComposable(markdownDocument(DOCUMENT_ID.NO_ARTIFACT))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when the manifest reports zero pages', async () => {
      mockStructureManifest(0)
      const { hasMarkdown } = mountComposable(markdownDocument(DOCUMENT_ID.EMPTY_MANIFEST))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be false when markdown is not among the available formats', async () => {
      mockStructureManifest(3, [FORMAT.XHTML])
      const { hasMarkdown } = mountComposable(markdownDocument(DOCUMENT_ID.XHTML_ONLY))
      await flushPromises()
      expect(hasMarkdown.value).toBe(false)
    })

    it('should be true when the manifest reports markdown pages', async () => {
      mockStructureManifest(3, [FORMAT.MARKDOWN, FORMAT.XHTML])
      const { hasMarkdown } = mountComposable(markdownDocument(DOCUMENT_ID.AVAILABLE))
      await flushPromises()
      expect(hasMarkdown.value).toBe(true)
    })

    // A recycled component keeps its manifest when it is handed another
    // document: the page count of the previous one must never be reused
    it('should be false again when the document changes', async () => {
      mockStructureManifest(3)
      const document = ref(markdownDocument(DOCUMENT_ID.BEFORE_CHANGE))
      const { hasMarkdown, fetchStatuses } = mountComposable(document, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(hasMarkdown.value).toBe(true)
      document.value = markdownDocument(DOCUMENT_ID.AFTER_CHANGE)
      expect(hasMarkdown.value).toBe(false)
    })
  })

  describe('fetchMarkdownStatus', () => {
    it('should not probe the manifest when immediate is false', async () => {
      const doc = new Document({ _id: DOCUMENT_ID.LAZY_PROBE, _index: 'test-index', _source: { title: 'test' } })
      mountComposable(doc, { immediate: false })
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })

    it('should probe the manifest when fetchStatuses is called', async () => {
      apiInstance.isDocumentDownloadable = vi.fn().mockResolvedValue(true)
      mockStructureManifest(1)
      const id = DOCUMENT_ID.EXPLICIT_PROBE
      const doc = new Document({ _id: id, _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses, hasMarkdown } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).toHaveBeenCalledWith('test-index', id, id)
      expect(hasMarkdown.value).toBe(true)
    })

    it('should not probe the manifest when the document has no id', async () => {
      const doc = new Document({ _index: 'test-index', _source: { title: 'test' } })
      const { fetchStatuses } = mountComposable(doc, { immediate: false })
      await fetchStatuses()
      await flushPromises()
      expect(apiInstance.getStructureManifest).not.toHaveBeenCalled()
    })
  })

  describe('downloadMarkdown', () => {
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
      mockStructureManifest(3)
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('page')
      stubAnchor()
      const id = DOCUMENT_ID.EVERY_PAGE
      const doc = new Document({ _id: id, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).toHaveBeenCalledTimes(3)
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', id, 1, id)
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', id, 2, id)
      expect(apiInstance.getStructurePage).toHaveBeenCalledWith('test-index', id, 3, id)
    })

    it('should join the pages with a horizontal rule', async () => {
      mockStructureManifest(2)
      apiInstance.getStructurePage = vi.fn((index, id, page) => Promise.resolve(`# Page ${page}`))
      stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.JOINED_PAGES, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      const [blob] = URL.createObjectURL.mock.calls.at(-1)
      expect(blob.type).toBe('text/markdown;charset=utf-8')
      await expect(readBlob(blob)).resolves.toBe('# Page 1\n\n---\n\n# Page 2')
    })

    it('should name the file after the document title', async () => {
      mockStructureManifest(1)
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Only page')
      const anchor = stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.NAMED_FILE, _index: 'test-index', _source: { title: 'my-doc' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(anchor.download).toBe('my-doc.md')
      expect(anchor.click).toHaveBeenCalled()
    })

    it('should do nothing when the document has no markdown', async () => {
      apiInstance.getStructurePage = vi.fn().mockResolvedValue('# Nope')
      const anchor = stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.WITHOUT_MARKDOWN, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).not.toHaveBeenCalled()
      expect(anchor.click).not.toHaveBeenCalled()
    })

    it('should resolve without downloading when a page fails to load', async () => {
      mockStructureManifest(2)
      apiInstance.getStructurePage = vi.fn((index, id, page) => {
        return page === 2 ? Promise.reject(new Error('boom')) : Promise.resolve('# Page 1')
      })
      const anchor = stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.FAILING_PAGE, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      await expect(downloadMarkdown()).resolves.toBeUndefined()
      expect(anchor.click).not.toHaveBeenCalled()
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })

    it('should report an error toast when a page fails to load', async () => {
      mockStructureManifest(1)
      apiInstance.getStructurePage = vi.fn().mockRejectedValue(new Error('boom'))
      stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.TOASTED_PAGE, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      const toastError = vi.spyOn(wrapper.vm.$toast, 'error')
      await downloadMarkdown()
      expect(toastError).toHaveBeenCalledWith('The markdown could not be downloaded.')
    })

    it('should leave an expired session to the single log-back-in toast', async () => {
      mockStructureManifest(1)
      const unauthorized = Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
      apiInstance.getStructurePage = vi.fn().mockRejectedValue(unauthorized)
      stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.EXPIRED_SESSION, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      const toastError = vi.spyOn(wrapper.vm.$toast, 'error')
      await downloadMarkdown()
      expect(toastError).not.toHaveBeenCalled()
    })

    it('should ignore a second call while the pages are still being fetched', async () => {
      mockStructureManifest(1)
      const resolvers = []
      apiInstance.getStructurePage = vi.fn(() => new Promise(resolve => resolvers.push(resolve)))
      const anchor = stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.DOUBLE_CLICK, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown } = mountComposable(doc)
      await flushPromises()
      const pending = downloadMarkdown()
      await downloadMarkdown()
      expect(apiInstance.getStructurePage).toHaveBeenCalledTimes(1)
      resolvers.forEach(resolve => resolve('# Page'))
      await pending
      expect(anchor.click).toHaveBeenCalledTimes(1)
    })
  })

  describe('isDownloadingMarkdown', () => {
    it('should be false before any download starts', async () => {
      mockStructureManifest(1)
      const doc = new Document({ _id: DOCUMENT_ID.IDLE, _index: 'test-index', _source: { title: 'test' } })
      const { isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      expect(isDownloadingMarkdown.value).toBe(false)
    })

    it('should be true while the pages are being fetched', async () => {
      mockStructureManifest(2)
      // Every page must be resolvable: Promise.all only settles once the last
      // one does, so keeping a single resolver would hang the download.
      const resolvers = []
      apiInstance.getStructurePage = vi.fn(() => new Promise(resolve => resolvers.push(resolve)))
      stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.DOWNLOADING, _index: 'test-index', _source: { title: 'test' } })
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
      mockStructureManifest(1)
      apiInstance.getStructurePage = vi.fn().mockRejectedValue(new Error('boom'))
      stubAnchor()
      const doc = new Document({ _id: DOCUMENT_ID.FAILED_DOWNLOAD, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown, isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(isDownloadingMarkdown.value).toBe(false)
    })

    it('should stay false when the document has no markdown', async () => {
      const { NO_ARTIFACT_DOWNLOAD } = DOCUMENT_ID
      const doc = new Document({ _id: NO_ARTIFACT_DOWNLOAD, _index: 'test-index', _source: { title: 'test' } })
      const { downloadMarkdown, isDownloadingMarkdown } = mountComposable(doc)
      await flushPromises()
      await downloadMarkdown()
      expect(isDownloadingMarkdown.value).toBe(false)
    })
  })
})
