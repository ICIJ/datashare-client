import { shallowMount, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import { useSearchStore } from '@/store/modules'

describe('SearchBar.vue', function () {
  const { index, es } = esConnectionHelper.build('search-bar')
  const { index: indexFoo } = esConnectionHelper.build('search-bar-foo')
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  let wrapper, searchStore
  const shallowMountFactory = (props = {}) => {
    return shallowMount(SearchBar, {
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  }

  const mountFactory = (props = {}, data = { pristine: false, suggestions: [] }) => {
    return mount(SearchBar, {
      data() {
        return { ...data }
      },
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  }

  beforeAll(() => {
    searchStore = useSearchStore()
    config.set('projects', [
      { name: index, label: 'default' },
      { name: indexFoo, label: 'foo' }
    ])
  })

  beforeEach(() => {
    searchStore.setIndex(index)
    searchStore.reset()
  })

  afterAll(() => {
    searchStore.reset()
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

  it('should not display the shortkeys-modal component', async () => {
    const props = { settings: false }
    wrapper = shallowMountFactory(props)
    expect(wrapper.find('.search-bar shortkeys-modal-stub').exists()).toBeFalsy()
  })

  it('should submit search', () => {
    wrapper = shallowMountFactory()
    wrapper.setData({ query: 'foo' })
    wrapper.vm.submit()
    expect(searchStore.q).toBe('foo')

    wrapper.setData({ query: 'bar' })
    wrapper.vm.submit()
    expect(searchStore.q).toBe('bar')
  })

  it('should reset the from search parameter to 0', () => {
    wrapper = shallowMountFactory()
    searchStore.setFrom(12)
    wrapper.vm.submit()

    expect(searchStore.from).toBe(0)
  })

  it('should submit the from with a different index', () => {
    wrapper = shallowMountFactory({ indices: [indexFoo] })
    wrapper.vm.submit()
    expect(searchStore.indices).toContain(indexFoo)
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
