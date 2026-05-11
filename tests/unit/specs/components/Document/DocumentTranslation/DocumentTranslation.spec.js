import { mount, shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import RawDocBuilder from '~tests/unit/RawDocBuilder'
import { letTextContent } from '~tests/unit/api_mock'
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'
import DocumentContent from '@/components/Document/DocumentContent'
import { useDocumentStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const {
    apiInstance: { elasticsearch }
  } = await importOriginal()

  return {
    apiInstance: {
      elasticsearch: {
        ...elasticsearch,
        getSource: vi.fn(),
        search: vi.fn().mockResolvedValue({ hits: { hits: [], total: { value: 0 } } })
      },
      getDocumentSlice: vi.fn(),
      getPages: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentTranslation.vue', () => {
  let core, plugins, documentStore
  const index = 'test-index'

  function mockedDocumentContentFactory(id, content = '') {
    const contentSlice = letTextContent().withContent(content)
    const builder = RawDocBuilder.build(id, index).withContent(content)

    return {
      indexedDocument: builder,
      content,
      contentSlice,
      async commit() {
        documentStore.setDocument(builder.toRaw())

        const content_translated = builder._source.content_translated ?? null
        api.elasticsearch.getSource.mockResolvedValue({ content_translated })

        api.getDocumentSlice.mockImplementation(async (_project, _docId, offset, limit, targetLanguage) => {
          const translations = builder._source.content_translated ?? []
          const translation = translations.find(t => t.target_language === targetLanguage)
          const text = translation?.content || content
          return { ...contentSlice, content: text.substring(offset, offset + limit), offset, limit }
        })

        const document = documentStore.document
        await flushPromises()
        return { content, contentSlice, document, id }
      }
    }
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    plugins = core.plugins
    documentStore = useDocumentStore()
    documentStore.toggleTranslatedContent(true)
  })

  afterEach(async () => {
    await flushPromises()
    documentStore.reset()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should show no translations', async () => {
    const mocked = mockedDocumentContentFactory('document-without-translation', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withNoContentTranslated()
    const { document } = await mocked.commit()
    const wrapper = shallowMount(DocumentTranslation, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    expect(wrapper.vm.hasTranslations).toBe(false)
  })

  it('shouldn\'t show italian translation', async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-italian', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('Primo', 'FRENCH', 'ITALIAN')
    const { document } = await mocked.commit()
    const wrapper = shallowMount(DocumentTranslation, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    expect(wrapper.vm.hasTranslations).toBe(false)
  })

  it('should show english translation', async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-english', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('First', 'FRENCH', 'ENGLISH')
    const { document } = await mocked.commit()
    const wrapper = shallowMount(DocumentTranslation, {
      global: { plugins, renderStubDefaultSlot: true },
      props: { document }
    })
    await wrapper.vm.loadAvailableTranslations()
    expect(wrapper.vm.hasTranslations).toBe(true)
    expect(wrapper.vm.sourceLanguage).toBe('FRENCH')
    expect(wrapper.vm.targetLanguage).toBe('ENGLISH')
    expect(wrapper.vm.detectedLanguage).toBe('FRENCH')
    expect(wrapper.findComponent(DocumentContent).attributes('targetlanguage')).toBe('ENGLISH')
  })

  it('should show document translation alert and display english translation', async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-english', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('First', 'FRENCH', 'ENGLISH')
    const { document } = await mocked.commit()
    const wrapper = mount(DocumentTranslation, {
      global: { plugins, renderStubDefaultSlot: true },
      props: { document }
    })
    await wrapper.vm.loadAvailableTranslations()
    expect(wrapper.vm.hasTranslations).toBe(true)
    await flushPromises()
    expect(wrapper.find('.document-translation-alert').exists()).toBe(true)
    expect(wrapper.find('.document-content__body').text()).toBe('First')
  })

  it('fallback on original content if translated is not provided', async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-english', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('', 'FRENCH', 'ENGLISH')
    const { document } = await mocked.commit()
    const wrapper = mount(DocumentTranslation, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    await flushPromises()
    expect(wrapper.vm.hasTranslations).toBe(true)
    expect(wrapper.find('.document-content__body').text()).toBe('Premier')
  })
})
