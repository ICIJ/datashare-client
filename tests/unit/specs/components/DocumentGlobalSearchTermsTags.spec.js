import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import { Core } from '@/core'

import { IndexedDocument } from 'tests/unit/es_utils'
import { flushPromises } from 'tests/unit/tests_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentGlobalSearchTermsTags.vue', () => {
  const { index, es } = esConnectionHelper.build()

  function mockedDocumentSearchFactory () {
    return {
      terms: { },
      add ({ term = '', count = 0, offsets = [] } = {}) {
        this.terms[term] = { count, offsets }
        return this
      },
      commit () {
        // Mock the `searchDocument` method
        jest.spyOn(Api.prototype, 'searchDocument')
          .mockImplementation(async (index, id, term) => {
            if (term in this.terms) {
              return this.terms[term]
            }
            return { count: 0, offsets: [] }
          })
        return this
      }
    }
  }

  async function createView (content = '', query = '', metadata = '', tags = []) {
    const indexedDocument = await IndexedDocument
      .build('document-id', index)
      .withContent(content)
      .withOtherMetadata(metadata)
      .withTags(tags)
      .commit(es)
    const { id } = indexedDocument.document
    await store.dispatch('document/get', { id, index })
    store.commit('search/query', query)
    const propsData = { document: store.state.document.doc }
    const wrapper = shallowMount(DocumentGlobalSearchTermsTags, { i18n, localVue, store, propsData })
    await flushPromises()
    return wrapper
  }

  afterEach(async () => {
    // Ensure all promise are flushed...
    await flushPromises()
    // Then clear all mocks
    jest.clearAllMocks()
    // Remove document
    store.commit('document/reset')
    store.commit('search/reset')
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

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(4)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('test')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('3')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toBe('document')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toBe('2')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(2).text()).toBe('result')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(2).text()).toBe('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(3).text()).toBe('other')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(3).text()).toBe('0')
    })

    it('should display query terms in tags with specific message and in last position', async () => {
      mockedDocumentSearchFactory()
        .add({ term: 'message', count: 1 })
        .add({ term: 'tag_01', count: 0 })
        .commit()
      const wrapper = await createView('message', 'message tag_01', '', ['tag_01', 'tag_02'])

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(2)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('message')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toBe('tag_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toBe('in tags')
    })

    it('should not display the query terms on a specific field but content', async () => {
      mockedDocumentSearchFactory()
        .add({ term: 'term_01', count: 1 })
        .add({ term: 'term_02', count: 0 })
        .commit()
      const wrapper = await createView('term_01', 'content:term_01 field_name:term_02')

      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
    })

    it('should not display the negative query terms', async () => {
      mockedDocumentSearchFactory()
        .add({ term: 'term_01', count: 1 })
        .add({ term: 'term_02', count: 0 })
        .commit()
      const wrapper = await createView('term_01', 'term_01 -term_02')

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(1)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      const wrapper = await createView('this is a full full content', 'full content')

      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-0')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-0 .document-global-search-terms-tags__item__label').text()).toBe('full')
      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-1')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-1 .document-global-search-terms-tags__item__label').text()).toBe('content')
    })
  })
})
