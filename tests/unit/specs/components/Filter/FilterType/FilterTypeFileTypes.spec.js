import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeFileTypes from '@/components/Filter/FilterType/FilterTypeFileTypes'
import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView'
import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory'
import ContentTypesCategoryItem from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName'
import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry'
import FiltersPanelSectionFilterTitleSort from '@/components/FiltersPanel/FiltersPanelSectionFilterTitleSort'
import { apiInstance as api } from '@/api/apiInstance'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return {
    apiInstance: {
      ...apiInstance,
      getContentTypeCategories: vi.fn()
    }
  }
})

describe('FilterTypeFileTypes.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, wrapper, searchStore

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    api.getContentTypeCategories.mockClear()
    api.getContentTypeCategories.mockResolvedValue({})

    core = CoreSetup.init().useAll()
    searchStore = useSearchStore()
    const filter = searchStore.getFilter({ name: 'contentType' })

    searchStore.setIndex(index)
    searchStore.reset()
    searchStore.resetFilters()

    wrapper = mount(FilterTypeFileTypes, {
      global: {
        plugins: core.plugins
      },
      props: { filter, collapse: false }
    })
  })

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    vi.resetAllMocks()
  })

  it('should render a ButtonToggleContentTypesView in the actions slot', () => {
    expect(wrapper.findComponent(ButtonToggleContentTypesView).exists()).toBe(true)
  })

  it('should have grouped set to true by default', () => {
    expect(wrapper.findComponent(ButtonToggleContentTypesView).props('grouped')).toBe(true)
  })

  it('should toggle grouped to false when the button is clicked', async () => {
    await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
    expect(wrapper.findComponent(ButtonToggleContentTypesView).props('grouped')).toBe(false)
  })

  it('should toggle grouped back to true on second click', async () => {
    const button = wrapper.findComponent(ButtonToggleContentTypesView)
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.findComponent(ButtonToggleContentTypesView).props('grouped')).toBe(true)
  })

  it('should render category groups when entries are aggregated in grouped mode', async () => {
    api.getContentTypeCategories.mockResolvedValue({
      Documents: ['application/pdf'],
      Other: ['text/html', 'other']
    })

    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('other')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()

    expect(wrapper.findAllComponents(ContentTypesCategory)).toHaveLength(2)
    expect(wrapper.findAllComponents(ContentTypesCategoryItem)).toHaveLength(3)
    expect(wrapper.findAllComponents(ContentTypesEntry)).toHaveLength(0)
  })

  it('should hide the sort control in grouped mode', () => {
    expect(wrapper.findComponent(FiltersPanelSectionFilterTitleSort).exists()).toBe(false)
  })

  it('should show the sort control when grouped is toggled off', async () => {
    await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(FiltersPanelSectionFilterTitleSort).exists()).toBe(true)
  })

  it('should render flat entries when grouped is toggled off', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('other')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()
    await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')

    expect(wrapper.findAllComponents(ContentTypesCategory)).toHaveLength(0)
    expect(wrapper.findAllComponents(ContentTypesEntry)).toHaveLength(3)
  })

  it('should pass aggregated content types to the categories API', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()

    expect(api.getContentTypeCategories).toHaveBeenCalledWith(
      expect.arrayContaining(['application/pdf', 'text/html'])
    )
  })

  describe('smart combine selection', () => {
    // Shared fixture: two categories (`Documents` with one MIME type, `Other`
    // with two) so we can exercise full/partial/mixed transitions without
    // rebuilding the dataset in every test.
    const seedCategoriesAndIndex = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        Documents: ['application/pdf'],
        Other: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const findCategoryName = (label) => {
      const names = wrapper.findAllComponents(ContentTypesCategoryName)
      return names.find(node => node.props('label') === label)
    }

    const findCategoryItem = (contentType) => {
      const items = wrapper.findAllComponents(ContentTypesCategoryItem)
      return items.find(node => node.props('contentType') === contentType)
    }

    it('writes contentTypeCategory and clears individual contentType values on none→all transition', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['Other'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('drops both the category value and individual types on all→none transition', async () => {
      await seedCategoriesAndIndex()

      // First pick the whole category.
      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['Other'])

      // Then untick the whole category.
      await findCategoryName('Other').vm.$emit('update:modelValue', false)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('expands contentTypeCategory into individual contentType values on all→mixed transition', async () => {
      await seedCategoriesAndIndex()

      // Start from a stored category.
      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['Other'])

      // Untick one type inside the stored category.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', false)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType).toContain('text/plain')
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
    })

    it('collapses individual contentType values back into contentTypeCategory on mixed→all transition', async () => {
      await seedCategoriesAndIndex()

      // Build up a mixed state by selecting individual types first.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentType).toEqual(expect.arrayContaining(['text/html', 'text/plain']))

      // Now tick the category checkbox.
      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['Other'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('writes only contentType for individual selections outside any fully-selected category', async () => {
      await seedCategoriesAndIndex()

      await findCategoryItem('application/pdf').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentType).toEqual(['application/pdf'])
      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
    })

    it('derives full/indeterminate/unchecked states for the category checkbox', async () => {
      await seedCategoriesAndIndex()

      // Unchecked: nothing is selected.
      expect(findCategoryName('Other').props('modelValue')).toBe(false)
      expect(findCategoryName('Other').props('indeterminate')).toBe(false)

      // Indeterminate: only some individual types are ticked.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(findCategoryName('Other').props('modelValue')).toBe(false)
      expect(findCategoryName('Other').props('indeterminate')).toBe(true)

      // Fully-selected: every individual type is ticked (but category not stored yet).
      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(findCategoryName('Other').props('modelValue')).toBe(true)
      expect(findCategoryName('Other').props('indeterminate')).toBe(false)
    })

    it('renders entry checkmarks as checked when the category is stored as contentTypeCategory', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryItem('text/html').props('modelValue')).toBe(true)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(true)
      // A type outside the stored category stays unchecked.
      expect(findCategoryItem('application/pdf').props('modelValue')).toBe(false)
    })

    it('keeps the category checkbox fully checked when contentTypeCategory is stored', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('Other').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryName('Other').props('modelValue')).toBe(true)
      expect(findCategoryName('Other').props('indeterminate')).toBe(false)
    })
  })
})
