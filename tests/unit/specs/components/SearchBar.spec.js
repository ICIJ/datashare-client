import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { flushPromises } from 'tests/unit/tests_utils'

import { Core } from '@/core'
import SearchBar from '@/components/SearchBar'

describe('SearchBar.vue', function () {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()
  const { index: project, es } = esConnectionHelper.build()

  let wrapper = null
  const shallowMountFactory = (propsData = {}) => {
    return shallowMount(SearchBar, { i18n, localVue, router, store, propsData })
  }
  const mountFactory = (propsData = {}, data = () => ({ suggestions: [] })) => {
    return mount(SearchBar, { i18n, localVue, router, store, propsData, data })
  }
  beforeAll(() => store.commit('search/index', project))

  beforeEach(() => {
    store.commit('search/reset')
  })

  afterAll(() => store.commit('search/reset'))

  it('should display search bar', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar').element).toBeTruthy()
    expect(wrapper.find('search-bar-input-stub').element).toBeTruthy()
  })

  it('should display a search bar input with dropdown field options', () => {
    wrapper = mountFactory()
    expect(wrapper.find('.search-bar__input').element).toBeTruthy()
    expect(wrapper.find('.search-bar__field-options').element).toBeTruthy()
  })

  it('should display a suggestion dropdown when there are suggestions', async () => {
    wrapper = mountFactory()
    expect(wrapper.find('.search-bar__suggestions').element).toBeFalsy()
    await wrapper.setData({ suggestions: ['suggestion1', 'suggestion2'] })
    expect(wrapper.find('.search-bar__suggestions').element).toBeTruthy()
  })

  it('should display a the query typed by the user as first suggestion in the dropdown when there are suggestions', async () => {
    const query = 'barba'
    const suggestTermsMock = jest.fn().mockResolvedValue({
      suggestions: [
        { key: 'barbar', doc_count: 1 },
        { key: 'barbaz', doc_count: 1 }
      ],
      query
    })
    wrapper = mountFactory({}, () => ({ query }))
    wrapper.vm.suggestTerms = suggestTermsMock
    await wrapper.vm.onFocus()
    await flushPromises()
    const items = wrapper.findAll('.selectable-dropdown__item')
    expect(items).toHaveLength(3)
    expect(items.at(0).text()).toBe('barba')
  })

  it('should select the term when suggestion dropdown item is clicked', async () => {
    wrapper = mountFactory({}, () => ({ suggestions: [{ key: 'bar' }], query: 'foo' }))
    await flushPromises()
    await wrapper.find('.selectable-dropdown__item').trigger('click')
    expect(wrapper.vm.query).toBe('bar')
  })

  it('should display the shortkeys-modal component', async () => {
    const propsData = { settings: false }
    wrapper = shallowMountFactory(propsData)
    expect(wrapper.find('.search-bar shortkeys-modal-stub').element).toBeFalsy()
    propsData.settings = true
    wrapper = shallowMountFactory(propsData)
    expect(wrapper.find('.search-bar shortkeys-modal-stub').element).toBeTruthy()
  })

  it('should submit search', () => {
    wrapper = shallowMountFactory()
    wrapper.vm.$set(wrapper.vm, 'query', 'foo')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('foo')

    wrapper.vm.$set(wrapper.vm, 'query', 'bar')
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('bar')
  })

  it('should reset the from search parameter to 0', () => {
    wrapper = shallowMountFactory()
    store.commit('search/from', 12)
    wrapper.vm.submit()

    expect(store.state.search.from).toBe(0)
  })

  describe('search suggestions', () => {
    it('should retrieve suggestions in NamedEntities and tags for default search', async () => {
      wrapper = shallowMountFactory()
      await letData(es)
        .have(new IndexedDocument('document', project).withNer('ne_01').withTags(['ne_tag']))
        .commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_01', doc_count: 1 },
        { key: 'ne_tag', doc_count: 1 }
      ])
    })

    it('should order suggestions by doc_count descending', async () => {
      wrapper = shallowMountFactory()
      await letData(es).have(new IndexedDocument('document_01', project).withNer('ne_01').withNer('ne_02')).commit()
      await letData(es).have(new IndexedDocument('document_02', project).withNer('ne_02')).commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_02', doc_count: 2 },
        { key: 'ne_01', doc_count: 1 }
      ])
    })
  })
})
