import toLower from 'lodash/toLower'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { Core } from '@/core'

const { localVue, store } = Core.init(createLocalVue()).useAll()

async function createView (es, index, content = '', query = '', metadata = '', tags = []) {
  const id = 'document'
  await letData(es).have(new IndexedDocument(id, index).withContent(content).withMetadata(metadata).withTags(tags)).commit()
  await store.dispatch('document/get', { id, index })
  store.commit('search/query', query)
  return shallowMount(DocumentGlobalSearchTermsTags, {
    localVue,
    store,
    propsData: { document: store.state.document.doc },
    mocks: { $t: msg => msg }
  })
}

describe('DocumentGlobalSearchTermsTags.vue', () => {
  const index = toLower('DocumentGlobalSearchTermsTags')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  describe('lists the query terms but the ones about specific field other than "content"', () => {
    it('should display query terms with occurrences in decreasing order', async () => {
      wrapper = await createView(es, index, 'document result test document test test', 'result test document other')

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(4)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('test')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('3')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toEqual('document')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toEqual('2')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(2).text()).toEqual('result')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(2).text()).toEqual('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(3).text()).toEqual('other')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(3).text()).toEqual('0')
    })

    it('should display query terms in metadata with specific message and in last position', async () => {
      wrapper = await createView(es, index, 'message', 'bruno and message', 'bruno message')

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(3)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('message')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toEqual('and')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toEqual('0')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(2).text()).toEqual('bruno')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(2).text()).toEqual('document.in_metadata')
    })

    it('should display query terms in tags with specific message and in last position', async () => {
      wrapper = await createView(es, index, 'message', 'message tag_01', '', ['tag_01', 'tag_02'])

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(2)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('message')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toEqual('tag_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toEqual('document.in_tags')
    })

    it('should not display the query terms on a specific field but content', async () => {
      wrapper = await createView(es, index, 'term_01', 'content:term_01 field_name:term_02')

      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toEqual('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toEqual('1')
    })

    it('should stroke the negative query terms', async () => {
      wrapper = await createView(es, index, 'term_01', '-term_02')

      expect(wrapper.findAll('.document-global-search-terms-tags__item--negation')).toHaveLength(1)
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      wrapper = await createView(es, index, 'this is a full full content', 'full content')

      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-0')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-0 .document-global-search-terms-tags__item__label').text()).toBe('full')
      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-1')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-1 .document-global-search-terms-tags__item__label').text()).toBe('content')
    })
  })
})
