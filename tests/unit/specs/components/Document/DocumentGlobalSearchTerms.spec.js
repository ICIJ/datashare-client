import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument } from '~tests/unit/es_utils'
import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'
import DocumentGlobalSearchTermsEntry from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTermsEntry'
import { useDocumentStore } from '@/store/modules/document'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      searchDocument: vi.fn()
    }
  }
})

describe('DocumentGlobalSearchTerms.vue', () => {
  function mockedDocumentSearchFactory() {
    return {
      terms: {},
      add({ term = '', count = 0, offsets = [] } = {}) {
        this.terms[term] = { count, offsets }
        return this
      },
      commit() {
        api.searchDocument.mockImplementation(async (index, id, term) => {
          if (term in this.terms) {
            return this.terms[term]
          }
          return { count: 0, offsets: [] }
        })
        return this
      }
    }
  }

  async function createView(content = '', query = '', metadata = '', tags = []) {
    const indexedDocument = await IndexedDocument.build('document-id', index)
      .withContent(content)
      .withOtherMetadata(metadata)
      .withTags(tags)
      .commit(es)
    const { id } = indexedDocument.document
    await documentStore.getDocument({ id, index })
    core.store.commit('search/query', query)
    const { plugins } = core
    const global = { plugins, renderStubDefaultSlot: true }
    const props = { document: documentStore.document }
    const wrapper = shallowMount(DocumentGlobalSearchTerms, { global, props })
    await flushPromises()
    return wrapper
  }

  const { index, es } = esConnectionHelper.build()
  let core, documentStore

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    documentStore = useDocumentStore()
  })

  afterEach(async () => {
    // Ensure all promise are flushed
    await flushPromises()
    // Then clear all mocks
    vi.clearAllMocks()
    // Remove document
    documentStore.reset()
    // Reset search query
    core.store.commit('search/reset')
  })

  describe('lists the query terms but the ones about specific field other than "content"', () => {
    it('should display query terms with occurrences in decreasing order', async () => {
      mockedDocumentSearchFactory()
        .add({ term: 'test', count: 3 })
        .add({ term: 'document', count: 2 })
        .add({ term: 'result', count: 1 })
        .add({ term: 'other', count: 0 })
        .commit()
      const wrapper = await createView('document result test document test test', 'result test document other')
      const entries = wrapper.findAllComponents(DocumentGlobalSearchTermsEntry)
      expect(entries).toHaveLength(4)
      expect(entries.at(0).vm.term.label).toBe('test')
      expect(entries.at(0).vm.term.count).toBe(3)
      expect(entries.at(1).vm.term.label).toBe('document')
      expect(entries.at(1).vm.term.count).toBe(2)
      expect(entries.at(2).vm.term.label).toBe('result')
      expect(entries.at(2).vm.term.count).toBe(1)
      expect(entries.at(3).vm.term.label).toBe('other')
      expect(entries.at(3).vm.term.count).toBe(0)
    })

    it('should display query terms in tags with specific message and in last position', async () => {
      mockedDocumentSearchFactory().add({ term: 'message', count: 1 }).add({ term: 'tag_01', count: 0 }).commit()
      const wrapper = await createView('message', 'message tag_01', '', ['tag_01', 'tag_02'])
      const entries = wrapper.findAllComponents(DocumentGlobalSearchTermsEntry)
      expect(entries).toHaveLength(2)
      expect(entries.at(0).vm.term.label).toBe('message')
      expect(entries.at(0).vm.term.count).toBe(1)
      expect(entries.at(1).vm.term.label).toBe('tag_01')
      expect(entries.at(1).vm.term.count).toBe(0)
    })

    it('should not display the query terms on a specific field but content', async () => {
      mockedDocumentSearchFactory().add({ term: 'term_01', count: 1 }).add({ term: 'term_02', count: 0 }).commit()
      const wrapper = await createView('term_01', 'content:term_01 field_name:term_02')
      const entries = wrapper.findAllComponents(DocumentGlobalSearchTermsEntry)
      expect(entries).toHaveLength(1)
      expect(entries.at(0).vm.term.label).toBe('term_01')
      expect(entries.at(0).vm.term.count).toBe(1)
    })

    it('should not display the negative query terms', async () => {
      mockedDocumentSearchFactory().add({ term: 'term_01', count: 1 }).add({ term: 'term_02', count: 0 }).commit()
      const wrapper = await createView('term_01', 'term_01 -term_02')
      const entries = wrapper.findAllComponents(DocumentGlobalSearchTermsEntry)
      expect(entries).toHaveLength(1)
      expect(entries.at(0).vm.term.label).toBe('term_01')
      expect(entries.at(0).vm.term.count).toBe(1)
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      const wrapper = await createView('this is a full full content', 'full content')
      const entries = wrapper.findAllComponents(DocumentGlobalSearchTermsEntry)
      expect(entries).toHaveLength(2)
      expect(entries.at(0).vm.term.label).toBe('full')
      expect(entries.at(1).vm.term.label).toBe('content')
    })
  })
})
