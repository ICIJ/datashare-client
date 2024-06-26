import { shallowMount, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchBar from '@/components/SearchBar'

describe('SearchBar.vue', function () {
  const { index, es } = esConnectionHelper.build('search-bar')
  const { index: indexFoo } = esConnectionHelper.build('search-bar-foo')
  const { plugins, config, store } = CoreSetup.init({ elasticsearch: es }).useAll().useRouter()

  let wrapper = null

  const shallowMountFactory = (props = {}) => {
    return shallowMount(SearchBar, {
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  }

  const mountFactory = (props = {}, data = () => ({ suggestions: [] })) => {
    return mount(SearchBar, {
      data,
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  }

  beforeAll(() => {
    config.set('projects', [
      { name: index, label: 'default' },
      { name: indexFoo, label: 'foo' }
    ])
  })

  beforeEach(() => {
    store.commit('search/index', index)
    store.commit('search/reset')
  })

  afterAll(() => {
    store.commit('search/reset')
  })

  it('should display search bar', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar').element).toBeTruthy()
    expect(wrapper.find('search-bar-input-stub').element).toBeTruthy()
  })

  it('should display a search bar input with dropdown field options', () => {
    wrapper = mountFactory()
    expect(wrapper.findComponent({ name: 'SearchBarInput' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'SearchBarInputDropdownForField' }).exists()).toBeTruthy()
  })

  it('should display a suggestion dropdown when there are suggestions', async () => {
    wrapper = mountFactory()
    expect(wrapper.find('.search-bar__suggestions').exists()).toBeFalsy()
    await wrapper.setData({ suggestions: ['suggestion1', 'suggestion2'] })
    expect(wrapper.find('.search-bar__suggestions').exists()).toBeTruthy()
  })

  it('should display a the query typed by the user as first suggestion in the dropdown when there are suggestions', async () => {
    const query = 'barba'
    const suggestTermsMock = vi.fn().mockResolvedValue({
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

  it('should not display the shortkeys-modal component', async () => {
    const props = { settings: false }
    wrapper = shallowMountFactory(props)
    expect(wrapper.find('.search-bar shortkeys-modal-stub').exists()).toBeFalsy()
  })

  it('should display the shortkeys-modal component', async () => {
    const props = { settings: true }
    wrapper = shallowMountFactory(props)
    expect(wrapper.find('.search-bar shortkeys-modal-stub').exists()).toBeTruthy()
  })

  it('should submit search', () => {
    wrapper = shallowMountFactory()
    wrapper.setData({ query: 'foo' })
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('foo')

    wrapper.setData({ query: 'bar' })
    wrapper.vm.submit()
    expect(wrapper.vm.$store.state.search.query).toBe('bar')
  })

  it('should reset the from search parameter to 0', () => {
    wrapper = shallowMountFactory()
    store.commit('search/from', 12)
    wrapper.vm.submit()

    expect(store.state.search.from).toBe(0)
  })

  it('should submit the from with a different index', () => {
    wrapper = shallowMountFactory({ indices: [indexFoo] })
    wrapper.vm.submit()
    expect(store.state.search.indices).toContain(indexFoo)
  })

  describe('search suggestions', () => {
    it('should retrieve suggestions in NamedEntities and tags for default search', async () => {
      wrapper = shallowMountFactory()
      await letData(es)
        .have(new IndexedDocument('document', index).withNer('ne_01').withTags(['ne_tag']))
        .commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_01', doc_count: 1 },
        { key: 'ne_tag', doc_count: 1 }
      ])
    })

    it('should order suggestions by doc_count descending', async () => {
      wrapper = shallowMountFactory()
      await letData(es).have(new IndexedDocument('document_01', index).withNer('ne_01').withNer('ne_02')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('ne_02')).commit()

      const suggestions = await wrapper.vm.suggestTerms([{ field: '<implicit>', term: 'ne_' }])

      expect(suggestions.suggestions).toEqual([
        { key: 'ne_02', doc_count: 2 },
        { key: 'ne_01', doc_count: 1 }
      ])
    })
  })
})
