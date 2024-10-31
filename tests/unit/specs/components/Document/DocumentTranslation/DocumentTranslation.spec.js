import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { flushPromises } from '~tests/unit/tests_utils'
import { letTextContent } from '~tests/unit/api_mock'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

describe('DocumentTranslatedContent.vue', () => {
  let core, api, plugins, store
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
        await store.dispatch('document/get', { id, index })
        const document = store.state.document.doc
        // Finally flush all promises and return all necessary values
        await flushPromises()
        return { content, contentSlice, document, id }
      }
    }
  }

  beforeEach(() => {
    api = { getDocumentSlice: vi.fn(), elasticsearch: es }
    core = CoreSetup.init(api).useAll()
    plugins = core.plugins
    store = core.store
    store.commit('document/toggleShowTranslatedContent', true)
  })

  afterEach(async () => {
    // Ensure all promise are flushed...
    await flushPromises()
    // Remove document
    store.commit('document/reset')
  })

  it('should show no translations', async () => {
    const mocked = mockedDocumentContentFactory('document-without-translation', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withNoContentTranslated()
    const { document } = await mocked.commit()
    const wrapper = mount(DocumentTranslatedContent, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    await wrapper.vm.$refs.content.loadMaxOffset()
    await wrapper.vm.$refs.content.loadContentSlice()
    await wrapper.vm.$refs.content.cookAllContentSlices()
    await flushPromises()
    expect(wrapper.find('.document-content__body').text()).toBe('Premier')
  })

  it("shouldn't show italian translation", async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-italian', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('Primo', 'FRENCH', 'ITALIAN')
    const { document } = await mocked.commit()
    const wrapper = mount(DocumentTranslatedContent, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    await wrapper.vm.$refs.content.loadMaxOffset()
    await wrapper.vm.$refs.content.loadContentSlice()
    await wrapper.vm.$refs.content.cookAllContentSlices()
    await flushPromises()
    expect(wrapper.find('.document-content__body').text()).toBe('Premier')
  })

  it('should show english translation', async () => {
    const mocked = mockedDocumentContentFactory('document-with-a-translation-in-english', 'Premier')
    mocked.indexedDocument.withLanguage('FRENCH').withContentTranslated('First', 'FRENCH', 'ENGLISH')
    const { document } = await mocked.commit()
    const wrapper = mount(DocumentTranslatedContent, { global: { plugins }, props: { document } })
    await wrapper.vm.loadAvailableTranslations()
    await wrapper.vm.$refs.content.loadMaxOffset()
    await wrapper.vm.$refs.content.loadContentSlice()
    await wrapper.vm.$refs.content.cookAllContentSlices()
    await flushPromises()
    expect(wrapper.find('.document-content__body').text()).toBe('First')
  })
})
