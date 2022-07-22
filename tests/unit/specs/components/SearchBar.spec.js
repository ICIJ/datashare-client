import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBar from '@/components/SearchBar'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('SearchBar.vue', function () {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()
  const { index: project, es } = esConnectionHelper.build()
  let wrapper = null

  beforeAll(() => store.commit('search/index', project))

  beforeEach(() => {
    store.commit('search/reset')
    wrapper = shallowMount(SearchBar, { i18n, localVue, router, store })
  })

  afterAll(() => store.commit('search/reset'))

  it('should display search bar', () => {
    expect(wrapper.find('.search-bar').element).toBeTruthy()
  })

  it('should display the shortkeys-modal component', async () => {
    await wrapper.setProps({ settings: true })

    expect(wrapper.find('.search-bar shortkeys-modal-stub').element).toBeTruthy()
  })

  it('should submit search', () => {
    wrapper.vm.$set(wrapper.vm, 'query', 'foo')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('foo')

    wrapper.vm.$set(wrapper.vm, 'query', 'bar')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('bar')
  })

  it('should reset the from search parameter to 0', () => {
    store.commit('search/from', 12)
    wrapper.vm.submit()

    expect(store.state.search.from).toBe(0)
  })

  describe('search suggestions', () => {
    it('should retrieve suggestions in NamedEntities and tags for default search', async () => {
      await letData(es).have(new IndexedDocument('document', project)
        .withNer('ne_01')
        .withTags(['ne_tag'])
      ).commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([{ key: 'ne_01', doc_count: 1 }, { key: 'ne_tag', doc_count: 1 }])
    })

    it('should order suggestions by doc_count descending', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withNer('ne_01')
        .withNer('ne_02')
      ).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withNer('ne_02')
      ).commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([{ key: 'ne_02', doc_count: 2 }, { key: 'ne_01', doc_count: 1 }])
    })
  })
})
