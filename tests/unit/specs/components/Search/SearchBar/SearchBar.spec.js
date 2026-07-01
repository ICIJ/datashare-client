import { mount, shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import { useSearchStore } from '@/store/modules'

describe('SearchBar.vue', function () {
  const { index, es } = esConnectionHelper.build('search-bar')
  const { index: indexFoo } = esConnectionHelper.build('search-bar-foo')
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  let wrapper, searchStore

  const shallowMountFactory = (props = {}) => {
    return shallowMount(SearchBar, { props, global: { plugins, renderStubDefaultSlot: true } })
  }

  const mountFactory = (props = {}) => {
    return mount(SearchBar, { props, global: { plugins, renderStubDefaultSlot: true } })
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
  })

  it('should display a field dropdown', () => {
    wrapper = mountFactory()
    expect(wrapper.findComponent({ name: 'SearchBarInput' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'FieldDropdownSelector' }).exists()).toBeTruthy()
  })

  it('should submit the query into the store', async () => {
    wrapper = shallowMountFactory()
    wrapper.findComponent(SearchBarInput).vm.$emit('update:modelValue', 'foo')
    await wrapper.vm.$nextTick()
    wrapper.vm.submit()
    expect(searchStore.q).toBe('foo')
  })

  it('should reset the from search parameter to 0', () => {
    wrapper = shallowMountFactory()
    searchStore.setFrom(12)
    wrapper.vm.submit()
    expect(searchStore.from).toBe(0)
  })

  it('should submit with a different index', () => {
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
