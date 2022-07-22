import { createLocalVue, shallowMount } from '@vue/test-utils'

import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

async function createView (es, project, content = '', query = '', metadata = '', tags = []) {
  const id = 'document'
  await letData(es).have(new IndexedDocument(id, project).withContent(content).withOtherMetadata(metadata).withTags(tags)).commit()
  await store.dispatch('document/get', { id, index: project })
  await store.dispatch('document/getContent', { id, index: project })
  store.commit('search/query', query)
  return shallowMount(DocumentGlobalSearchTermsTags, {
    i18n,
    localVue,
    store,
    propsData: { document: store.state.document.doc }
  })
}

describe('DocumentGlobalSearchTermsTags.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  let wrapper = null

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  describe('lists the query terms but the ones about specific field other than "content"', () => {
    it('should display query terms with occurrences in decreasing order', async () => {
      wrapper = await createView(es, project, 'document result test document test test', 'result test document other')
      await wrapper.vm.getTerms()

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
      wrapper = await createView(es, project, 'message', 'message tag_01', '', ['tag_01', 'tag_02'])
      await wrapper.vm.getTerms()

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(2)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('message')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(1).text()).toBe('tag_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(1).text()).toBe('in tags')
    })

    it('should not display the query terms on a specific field but content', async () => {
      wrapper = await createView(es, project, 'term_01', 'content:term_01 field_name:term_02')
      await wrapper.vm.getTerms()

      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
    })

    it('should not display the negative query terms', async () => {
      wrapper = await createView(es, project, 'term_01', 'term_01 -term_02')
      await wrapper.vm.getTerms()

      expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(1)
      expect(wrapper.findAll('.document-global-search-terms-tags__item__label').at(0).text()).toBe('term_01')
      expect(wrapper.findAll('.document-global-search-terms-tags__item__count').at(0).text()).toBe('1')
    })

    it('should highlight the query terms with the same color than in the list', async () => {
      wrapper = await createView(es, project, 'this is a full full content', 'full content')
      await wrapper.vm.getTerms()

      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-0')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-0 .document-global-search-terms-tags__item__label').text()).toBe('full')
      expect(wrapper.findAll('.document-global-search-terms-tags__item--index-1')).toHaveLength(1)
      expect(wrapper.find('.document-global-search-terms-tags__item--index-1 .document-global-search-terms-tags__item__label').text()).toBe('content')
    })
  })

  it('should highlight the query terms while event "document::content-loaded" is emitted', async () => {
    wrapper = await createView(es, project, 'document result test document test test', 'result test document other')
    expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(0)

    await wrapper.vm.$root.$emit('document::content-loaded')
    expect(wrapper.findAll('.document-global-search-terms-tags__item')).toHaveLength(4)
  })
})
