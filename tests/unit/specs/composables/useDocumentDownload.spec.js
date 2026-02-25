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
    plugins = core.plugins
    URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockGetSource(response) {
    apiInstance.elasticsearch.getSource = vi.fn().mockResolvedValue(response)
  }

  function mountComposable(document) {
    let result
    const TestComponent = {
      setup() {
        result = useDocumentDownload(document)
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  describe('hasTranslations', () => {
    it('should be true when API returns translations', async () => {
      mockGetSource({ content_translated: [{ target_language: 'ENGLISH' }] })
      const doc = new Document({
        _id: 'doc1',
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
})
