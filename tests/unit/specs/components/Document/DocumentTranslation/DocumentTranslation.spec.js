import { mount, shallowMount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { flushPromises } from '~tests/unit/tests_utils'
import { letTextContent } from '~tests/unit/api_mock'
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'
import DocumentContent from '@/components/Document/DocumentContent'
import { useDocumentStore } from '@/store/modules/document'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getDocumentSlice: vi.fn()
    }
  }
})

describe('DocumentTranslation.vue', () => {
  let core, plugins, documentStore
  const { index, es } = esConnectionHelper.build()

  function mockedDocumentContentFactory(id, content = '') {
    // Index the document
    const contentSlice = letTextContent().withContent(content)
    const indexedDocument = new IndexedDocument(id, index).withContent(content)

    return {
      indexedDocument,
      content,
      contentSlice,
      async commit() {
        // Mock the `getDocumentSlice` method
        const getDocumentSlideMock = async (project, documentId, offset, limit, targetLanguage) => {
          // Get the translation (if any)
          const translation = this.indexedDocument.getContentTranslated({ targetLanguage })
          // Modify the returned content according to passed parameters
          const content = (translation || this.indexedDocument.content).substring(offset, offset + limit)
          return { ...contentSlice, content, offset, limit }
        }
        api.getDocumentSlice.mockImplementation(getDocumentSlideMock)
        // Index the document
        await letData(es).have(this.indexedDocument).commit()
        // Get the document from the store
        await documentStore.getDocument({ id, index })
        const document = documentStore.document
        // Finally flush all promises and return all necessary values
        await flushPromises()
        return { content, contentSlice, document, id }
      }
    }
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
    documentStore = useDocumentStore()
    documentStore.toggleTranslatedContent(true)
  })

  afterEach(async () => {
    // Ensure all promise are flushed...
    await flushPromises()
    // Remove document
    documentStore.reset()
  })

  it('should show no translations', async () => {
    const mocked = mockedDocumentContentFactory('document-without-translation', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withNoContentTranslated()
    const { document } = await mocked.commit()
    const wrapper = shallowMount(DocumentTranslation, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    expect(wrapper.vm.hasTranslations).toBe(false)
  })

  it("shouldn't show italian translation", async () => {
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
