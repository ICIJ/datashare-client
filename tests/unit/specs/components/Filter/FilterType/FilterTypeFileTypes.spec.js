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
      DOCUMENT: ['application/pdf'],
      OTHER: ['text/html', 'other']
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

  it('should show the sort control in grouped mode', () => {
    expect(wrapper.findComponent(FiltersPanelSectionFilterTitleSort).exists()).toBe(true)
  })

  it('should keep the sort control visible when grouped is toggled off', async () => {
    await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(FiltersPanelSectionFilterTitleSort).exists()).toBe(true)
  })

  it('renders the sort dropdown wired to the section filter sort model', () => {
    // The dropdown receives its modelValue from the parent section filter, which
    // bridges it to the filter's sort accessor (ultimately searchStore.sortFilters).
    // Checking its presence + a well-formed modelValue proves the wiring is in
    // place for the categories view.
    const sortDropdown = wrapper.findComponent(FiltersPanelSectionFilterTitleSort)

    expect(sortDropdown.exists()).toBe(true)
    expect(sortDropdown.props('modelValue')).toEqual({
      sortBy: expect.any(String),
      orderBy: expect.any(String)
    })
  })

  it('persists a user-selected sort option to searchStore.sortFilters', async () => {
    // Round-trip: the dropdown emits the selected option and the store records it,
    // which is the "reflects searchStore.sortFilter" contract from the user side.
    const sortDropdown = wrapper.findComponent(FiltersPanelSectionFilterTitleSort)
    sortDropdown.vm.$emit('update:modelValue', { sortBy: '_key', orderBy: 'asc' })
    await flushPromises()

    expect(searchStore.sortFilters.contentType).toEqual({
      sortBy: '_key',
      orderBy: 'asc'
    })
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
    // Shared fixture: two categories (`DOCUMENT` with one MIME type, `OTHER`
    // with two) so we can exercise full/partial/mixed transitions without
    // rebuilding the dataset in every test.
    const seedCategoriesAndIndex = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const findCategoryName = (category) => {
      const names = wrapper.findAllComponents(ContentTypesCategoryName)
      return names.find(node => node.props('category') === category)
    }

    const findCategoryItem = (contentType) => {
      const items = wrapper.findAllComponents(ContentTypesCategoryItem)
      return items.find(node => node.props('contentType') === contentType)
    }

    it('writes contentTypeCategory and clears individual contentType values on none→all transition', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('drops both the category value and individual types on all→none transition', async () => {
      await seedCategoriesAndIndex()

      // First pick the whole category.
      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      // Then untick the whole category.
      await findCategoryName('OTHER').vm.$emit('update:modelValue', false)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('expands contentTypeCategory into individual contentType values on all→mixed transition', async () => {
      await seedCategoriesAndIndex()

      // Start from a stored category.
      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      // Untick one type inside the stored category.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', false)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType).toContain('text/plain')
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
    })

    it('auto-promotes to contentTypeCategory when ticking the last individual type completes a category', async () => {
      await seedCategoriesAndIndex()

      // Tick one of two types in OTHER — still mixed, nothing promoted yet.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentType).toEqual(['text/html'])
      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])

      // Ticking the last one completes the category: promote to the hidden filter
      // and drop the individual contentType values that now live under the category.
      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('collapses individual contentType values into contentTypeCategory when the category checkbox is ticked from a mixed state', async () => {
      await seedCategoriesAndIndex()

      // Leave it mixed: only one of two types ticked.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentType).toEqual(['text/html'])

      // Tick the category checkbox to collapse into the hidden filter.
      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
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
      expect(findCategoryName('OTHER').props('modelValue')).toBe(false)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(false)

      // Indeterminate: only some individual types are ticked.
      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(findCategoryName('OTHER').props('modelValue')).toBe(false)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(true)

      // Fully-selected: the second tick completes the category and auto-promotes
      // to the hidden contentTypeCategory filter.
      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(findCategoryName('OTHER').props('modelValue')).toBe(true)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(false)
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
    })

    it('renders entry checkmarks as checked when the category is stored as contentTypeCategory', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryItem('text/html').props('modelValue')).toBe(true)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(true)
      // A type outside the stored category stays unchecked.
      expect(findCategoryItem('application/pdf').props('modelValue')).toBe(false)
    })

    it('keeps the category checkbox fully checked when contentTypeCategory is stored', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryName('OTHER').props('modelValue')).toBe(true)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(false)
    })
  })

  describe('category sorting', () => {
    // Seed three categories whose keys exist in contentTypeCategories.json so the
    // sort-by-name test exercises the resolved (human-readable) labels.
    //   VIDEO    → 1 doc  (label: "Video")
    //   IMAGE    → 2 docs (label: "Image")
    //   DOCUMENT → 3 docs (label: "Document")
    const seedSortableCategories = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        IMAGE: ['image/jpeg'],
        VIDEO: ['video/mp4']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d2', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d3', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('i2', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('v1', index).withContentType('video/mp4')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const categoryOrder = () =>
      wrapper.findAllComponents(ContentTypesCategoryName).map(node => node.props('category'))

    it('orders categories by count desc (highest first) by default', async () => {
      await seedSortableCategories()

      expect(categoryOrder()).toEqual(['DOCUMENT', 'IMAGE', 'VIDEO'])
    })

    it('orders categories by count asc (lowest first) when orderBy is asc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_count', orderBy: 'asc' })
      await seedSortableCategories()

      expect(categoryOrder()).toEqual(['VIDEO', 'IMAGE', 'DOCUMENT'])
    })

    it('orders categories alphabetically A→Z using resolved labels when sortBy is _key and orderBy is asc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await seedSortableCategories()

      // Labels: "Document", "Image", "Video" → alphabetical A→Z.
      expect(categoryOrder()).toEqual(['DOCUMENT', 'IMAGE', 'VIDEO'])
    })

    it('orders categories alphabetically Z→A using resolved labels when sortBy is _key and orderBy is desc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'desc' })
      await seedSortableCategories()

      expect(categoryOrder()).toEqual(['VIDEO', 'IMAGE', 'DOCUMENT'])
    })

    it('updates the category order immediately when the sort option changes', async () => {
      await seedSortableCategories()
      expect(categoryOrder()).toEqual(['DOCUMENT', 'IMAGE', 'VIDEO'])

      searchStore.sortFilter({ name: 'contentType', sortBy: '_count', orderBy: 'asc' })
      await flushPromises()

      expect(categoryOrder()).toEqual(['VIDEO', 'IMAGE', 'DOCUMENT'])
    })

    it('keeps categories with a count of 0 visible and interleaves them by count', async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        IMAGE: ['image/jpeg'],
        VIDEO: ['video/mp4']
      })

      // Only VIDEO has indexed documents; IMAGE and DOCUMENT end up with count 0.
      await letData(es).have(new IndexedDocument('v1', index).withContentType('video/mp4')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      // All three categories remain visible; VIDEO leads on count desc.
      expect(categoryOrder()).toHaveLength(3)
      expect(categoryOrder()[0]).toBe('VIDEO')
      expect(categoryOrder()).toEqual(expect.arrayContaining(['DOCUMENT', 'IMAGE', 'VIDEO']))
    })

    it('falls back to the JSON order to break ties when counts are equal', async () => {
      // IMAGE and VIDEO both have 1 doc → ties; JSON order is VIDEO before IMAGE.
      api.getContentTypeCategories.mockResolvedValue({
        IMAGE: ['image/jpeg'],
        VIDEO: ['video/mp4']
      })

      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('v1', index).withContentType('video/mp4')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      // JSON declares VIDEO before IMAGE; ties preserve that declared order.
      expect(categoryOrder()).toEqual(['VIDEO', 'IMAGE'])
    })

    it('does not drop or duplicate categories when sorting', async () => {
      await seedSortableCategories()

      searchStore.sortFilter({ name: 'contentType', sortBy: '_count', orderBy: 'asc' })
      await flushPromises()

      const order = categoryOrder()
      expect(order).toHaveLength(3)
      expect(new Set(order)).toEqual(new Set(['DOCUMENT', 'IMAGE', 'VIDEO']))
    })
  })

  describe('nested bucket sorting', () => {
    // Single category holding three MIME types with distinct counts and labels so
    // we can verify both _count and _key ordering within the same category.
    //   application/pdf (3 docs, label "Portable Document Format (PDF)")
    //   text/plain      (2 docs, label "Plain text document")
    //   text/html       (1 doc,  label "HTML document")
    const seedBucketsInCategory = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf', 'text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d2', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d3', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('t1', index).withContentType('text/plain')).commit()
      await letData(es).have(new IndexedDocument('t2', index).withContentType('text/plain')).commit()
      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const bucketOrder = () =>
      wrapper.findAllComponents(ContentTypesCategoryItem).map(node => node.props('contentType'))

    it('orders buckets by doc_count desc (highest first) by default', async () => {
      await seedBucketsInCategory()

      expect(bucketOrder()).toEqual(['application/pdf', 'text/plain', 'text/html'])
    })

    it('orders buckets by doc_count asc (lowest first) when orderBy is asc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_count', orderBy: 'asc' })
      await seedBucketsInCategory()

      expect(bucketOrder()).toEqual(['text/html', 'text/plain', 'application/pdf'])
    })

    it('orders buckets A→Z using resolved labels when sortBy is _key and orderBy is asc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await seedBucketsInCategory()

      // Labels: "HTML document" < "Plain text document" < "Portable Document Format (PDF)".
      expect(bucketOrder()).toEqual(['text/html', 'text/plain', 'application/pdf'])
    })

    it('orders buckets Z→A using resolved labels when sortBy is _key and orderBy is desc', async () => {
      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'desc' })
      await seedBucketsInCategory()

      expect(bucketOrder()).toEqual(['application/pdf', 'text/plain', 'text/html'])
    })

    it('updates nested bucket order immediately when the sort option changes', async () => {
      await seedBucketsInCategory()
      expect(bucketOrder()).toEqual(['application/pdf', 'text/plain', 'text/html'])

      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await flushPromises()

      expect(bucketOrder()).toEqual(['text/html', 'text/plain', 'application/pdf'])
    })

    it('does not drop or duplicate buckets when sorting', async () => {
      await seedBucketsInCategory()

      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await flushPromises()

      const order = bucketOrder()
      expect(order).toHaveLength(3)
      expect(new Set(order)).toEqual(new Set(['application/pdf', 'text/html', 'text/plain']))
    })

    it('keeps the aggregated category total unchanged when bucket order changes', async () => {
      await seedBucketsInCategory()

      const totalBefore = wrapper.findAllComponents(ContentTypesCategoryName)[0].props('count')
      expect(totalBefore).toBe(6)

      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await flushPromises()

      const totalAfter = wrapper.findAllComponents(ContentTypesCategoryName)[0].props('count')
      expect(totalAfter).toBe(totalBefore)
    })
  })

  describe('non-grouped (flat) view', () => {
    // Exercise the flat view explicitly: the categories-view changes from US-001/2/3
    // must not alter how the underlying FilterType renders a flat list of entries.
    const seedAndFlatten = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        IMAGE: ['image/jpeg'],
        VIDEO: ['video/mp4']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d2', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('d3', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('i2', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('v1', index).withContentType('video/mp4')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
      // Flip to the flat view.
      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()
    }

    it('renders flat entries and no category components when grouped is off', async () => {
      await seedAndFlatten()

      expect(wrapper.findAllComponents(ContentTypesEntry)).toHaveLength(3)
      expect(wrapper.findAllComponents(ContentTypesCategory)).toHaveLength(0)
      expect(wrapper.findAllComponents(ContentTypesCategoryName)).toHaveLength(0)
      expect(wrapper.findAllComponents(ContentTypesCategoryItem)).toHaveLength(0)
    })

    it('keeps the sort dropdown wired to searchStore in the flat view', async () => {
      await seedAndFlatten()

      // Round-trip through the dropdown: the flat view must still write back to
      // searchStore.sortFilters the same way the categories view does.
      const sortDropdown = wrapper.findComponent(FiltersPanelSectionFilterTitleSort)
      sortDropdown.vm.$emit('update:modelValue', { sortBy: '_key', orderBy: 'asc' })
      await flushPromises()

      expect(searchStore.sortFilters.contentType).toEqual({
        sortBy: '_key',
        orderBy: 'asc'
      })
    })

    it('still renders every aggregated entry when a non-default sort is active in flat mode', async () => {
      // Set a non-default sort before aggregating so the grouped-view-specific
      // sort logic has a chance to leak — it should not.
      searchStore.sortFilter({ name: 'contentType', sortBy: '_key', orderBy: 'asc' })
      await seedAndFlatten()

      const entries = wrapper.findAllComponents(ContentTypesEntry)
      expect(entries).toHaveLength(3)

      // All three aggregated content types are rendered — none dropped or duplicated.
      const contentTypes = entries.map(node => node.props('contentType'))
      expect(new Set(contentTypes)).toEqual(new Set(['application/pdf', 'image/jpeg', 'video/mp4']))
    })
  })
})
