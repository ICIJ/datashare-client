import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeFileTypes from '@/components/Filter/FilterType/FilterTypeFileTypes'
import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView'
import ContentTypesAll from '@/components/ContentTypes/ContentTypesCategories/ContentTypesAll'
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

  describe('"All" disabled state for paired contentType/contentTypeCategory', () => {
    // The "All" entry must reflect the *union* of both paired dimensions: it is
    // only "all-selected" (and therefore disabled) when neither contentType nor
    // contentTypeCategory has any value. A selection in either dimension must
    // re-enable the entry so the user can click it to clear everything.
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

    it('disables "All" when both contentType and contentTypeCategory are empty', async () => {
      await seedCategoriesAndIndex()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(true)
    })

    it('keeps "All" enabled when only contentType has values', async () => {
      await seedCategoriesAndIndex()

      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })

    it('keeps "All" enabled when only contentTypeCategory has values', async () => {
      await seedCategoriesAndIndex()

      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })

    it('keeps "All" enabled when both contentType and contentTypeCategory have values', async () => {
      await seedCategoriesAndIndex()

      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })
  })

  describe('"All" click resets paired contentType/contentTypeCategory', () => {
    // Clicking the "All" entry must fully reset the categories view: every
    // value across both paired dimensions is dropped, the entry itself flips
    // back to "all-selected" / disabled, and unrelated filters stay intact.
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

    it('clears contentType values when "All" is clicked', async () => {
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      await flushPromises()
      expect(searchStore.values.contentType).toEqual(['application/pdf'])

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentType ?? []).toEqual([])
    })

    it('clears contentTypeCategory values when "All" is clicked', async () => {
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
    })

    it('clears both dimensions in a single click when both are populated', async () => {
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentType ?? []).toEqual([])
      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
    })

    it('flips "All" back to disabled / all-selected after the click', async () => {
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)

      await all.vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(all.props('modelValue')).toBe(true)
    })

    it('does not affect unrelated filters when "All" is clicked', async () => {
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      // Unrelated filter that must survive the click.
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.language).toEqual(['ENGLISH'])
    })
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

    it('renders entry checkmarks as unchecked when the category is stored as contentTypeCategory', async () => {
      // The category-display rule decouples child checkboxes from the stored
      // parent: a type that's only implicitly covered by contentTypeCategory
      // must render unchecked so the user can see at a glance what they
      // actually picked.
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryItem('text/html').props('modelValue')).toBe(false)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(false)
      // A type outside the stored category also stays unchecked.
      expect(findCategoryItem('application/pdf').props('modelValue')).toBe(false)
    })

    it('renders an explicitly stored child checked even when its parent category is also stored', async () => {
      await seedCategoriesAndIndex()
      // URL-tamper / race scenario where both filters cover the same child.
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      searchStore.addFilterValue({ name: 'contentType', value: 'text/html' })
      await flushPromises()

      expect(findCategoryItem('text/html').props('modelValue')).toBe(true)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(false)
    })

    it('keeps the category checkbox fully checked while children render unchecked when only the category is stored', async () => {
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(findCategoryName('OTHER').props('modelValue')).toBe(true)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(false)
      expect(findCategoryItem('text/html').props('modelValue')).toBe(false)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(false)
    })

    it('demotes a stored category to a single per-child selection when one of its children is clicked', async () => {
      // The child renders unchecked when only its parent category is stored
      // (US-001). Clicking it narrows the selection: the category is dropped
      // and only the clicked child becomes individually selected — the other
      // implicit siblings should NOT remain selected.
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType).toEqual(['text/html'])

      expect(findCategoryName('OTHER').props('modelValue')).toBe(false)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(true)
      expect(findCategoryItem('text/html').props('modelValue')).toBe(true)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(false)
    })

    it('demotes only the targeted category when other categories are also stored', async () => {
      // Demoting one category must leave unrelated stored categories alone, so
      // a multi-category selection narrows precisely where the user clicked.
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        IMAGE: ['image/jpeg', 'image/png'],
        TEXT: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('i2', index).withContentType('image/png')).commit()
      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('t1', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'IMAGE' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'TEXT' })
      // Unrelated explicit pick that must be preserved across the demote.
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      await flushPromises()

      await findCategoryItem('image/jpeg').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual(['TEXT'])
      expect(searchStore.values.contentType ?? []).toEqual(
        expect.arrayContaining(['application/pdf', 'image/jpeg'])
      )
      expect(searchStore.values.contentType ?? []).not.toContain('image/png')
      expect(searchStore.values.contentType ?? []).toHaveLength(2)
    })

    it('re-promotes to a stored category when every sibling is re-checked one by one after a demotion', async () => {
      // Round-trip: demote → tick the remaining sibling. With every sibling
      // now individually selected, the existing promotion path must fire and
      // collapse the explicit picks back into a stored category.
      await seedCategoriesAndIndex()

      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType).toEqual(['text/html'])

      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })

    it('drops a lingering individual contentType value when the user unticks it while the category is also stored', async () => {
      // URL-tamper / race scenario: contentTypeCategory=OTHER and contentType=text/html
      // are both stored at the same time. Unticking text/html must drop it and
      // expand only the remaining siblings, not re-introduce it alongside them.
      await seedCategoriesAndIndex()
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      searchStore.addFilterValue({ name: 'contentType', value: 'text/html' })
      await flushPromises()

      await findCategoryItem('text/html').vm.$emit('update:modelValue', false)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).toContain('text/plain')
    })
  })

  describe('stale checkbox state on category promotion', () => {
    // Other tests in this file shortcut clicks via `vm.$emit('update:modelValue')`
    // on the ContentTypesCategoryItem wrapper, which bypasses the BFormCheckbox →
    // FiltersPanelSectionFilterEntry v-model chain and cannot reveal the stale
    // DOM-checked state when a click leaves `props.modelValue` unchanged on
    // both sides. Driving the click through the rendered <input> exercises it.
    const seedCategoriesAndIndex = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('t1', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const findCategoryItem = (contentType) => {
      const items = wrapper.findAllComponents(ContentTypesCategoryItem)
      return items.find(node => node.props('contentType') === contentType)
    }

    const findCategoryItemCheckbox = (contentType) => {
      return findCategoryItem(contentType).find('input[type="checkbox"]')
    }

    const findCategoryName = (category) => {
      const names = wrapper.findAllComponents(ContentTypesCategoryName)
      return names.find(node => node.props('category') === category)
    }

    const findCategoryNameCheckbox = (category) => {
      return findCategoryName(category).find('input[type="checkbox"]')
    }

    it('resets the just-clicked child checkbox to unchecked once its category is promoted', async () => {
      await seedCategoriesAndIndex()

      // Pre-select text/html so OTHER is one click away from being fully selected.
      searchStore.addFilterValue({ name: 'contentType', value: 'text/html' })
      await flushPromises()

      expect(findCategoryItemCheckbox('text/html').element.checked).toBe(true)
      expect(findCategoryItemCheckbox('text/plain').element.checked).toBe(false)
      expect(findCategoryName('OTHER').props('modelValue')).toBe(false)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(true)

      await findCategoryItemCheckbox('text/plain').setValue(true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')

      expect(findCategoryName('OTHER').props('modelValue')).toBe(true)
      expect(findCategoryName('OTHER').props('indeterminate')).toBe(false)
      expect(findCategoryNameCheckbox('OTHER').element.checked).toBe(true)

      expect(findCategoryItem('text/html').props('modelValue')).toBe(false)
      expect(findCategoryItem('text/plain').props('modelValue')).toBe(false)
      expect(findCategoryItemCheckbox('text/html').element.checked).toBe(false)
      expect(findCategoryItemCheckbox('text/plain').element.checked).toBe(false)
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

  describe('paired-filter "All" behavior in non-grouped (flat) view', () => {
    // The "All" entry lives in the shared `#all` slot of FilterType, so the
    // disabled-state and click-reset semantics introduced for the categories
    // view in US-002/003 must apply identically in the flat view. These
    // tests prove that parity end-to-end from the user's seam.
    const seedAndFlatten = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
      // Flip to the flat view before exercising "All".
      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()
    }

    it('disables "All" when both contentType and contentTypeCategory are empty', async () => {
      await seedAndFlatten()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(true)
    })

    it('keeps "All" enabled when only contentType has values', async () => {
      await seedAndFlatten()

      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })

    it('keeps "All" enabled when only contentTypeCategory has values', async () => {
      await seedAndFlatten()

      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })

    it('keeps "All" enabled when both contentType and contentTypeCategory have values', async () => {
      await seedAndFlatten()

      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)
    })

    it('clears both contentType and contentTypeCategory when "All" is clicked', async () => {
      await seedAndFlatten()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentType ?? []).toEqual([])
      expect(searchStore.values.contentTypeCategory ?? []).toEqual([])
    })

    it('flips "All" back to disabled / all-selected after the click', async () => {
      await seedAndFlatten()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      const all = wrapper.findComponent(ContentTypesAll)
      expect(all.props('modelValue')).toBe(false)

      await all.vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(all.props('modelValue')).toBe(true)
    })

    it('does not affect unrelated filters when "All" is clicked', async () => {
      await seedAndFlatten()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      // Unrelated filter that must survive the click.
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.language).toEqual(['ENGLISH'])
    })

    it('produces the same final filter state whether "All" is clicked from grouped or flat view', async () => {
      // Parity check from the user's seam: identical sequence (populate both
      // paired filters → click "All") must reach the same store state in
      // both views, so toggling the view is purely cosmetic.
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      // First run: stay in the default grouped view, populate, then click "All".
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      const groupedState = {
        contentType: searchStore.values.contentType ?? [],
        contentTypeCategory: searchStore.values.contentTypeCategory ?? []
      }

      // Second run: flip to flat, repeat the same user actions.
      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()

      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'OTHER' })
      await flushPromises()

      await wrapper.findComponent(ContentTypesAll).vm.$emit('update:modelValue', true)
      await flushPromises()

      const flatState = {
        contentType: searchStore.values.contentType ?? [],
        contentTypeCategory: searchStore.values.contentTypeCategory ?? []
      }

      expect(flatState).toEqual(groupedState)
      expect(flatState).toEqual({ contentType: [], contentTypeCategory: [] })
    })
  })

  describe('search preserves "All" row, counts, and current selection', () => {
    // Seed a multi-category dataset so a query can match a single category
    // while leaving selected items in *other* categories that the user
    // expects to keep seeing.
    //   DOCUMENT → application/pdf (3 docs)
    //   IMAGE    → image/jpeg      (2 docs)
    //   VIDEO    → video/mp4       (1 doc)
    const seedMultiCategoryIndex = async () => {
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

    const setQuery = async (value) => {
      wrapper.findComponent(FilterType).vm.$emit('update:query', value)
      await flushPromises()
    }

    const findCategoryItem = (contentType) => {
      const items = wrapper.findAllComponents(ContentTypesCategoryItem)
      return items.find(node => node.props('contentType') === contentType)
    }

    const findCategoryName = (category) => {
      const names = wrapper.findAllComponents(ContentTypesCategoryName)
      return names.find(node => node.props('category') === category)
    }

    it('keeps the "All" row rendered when the query matches no category or type', async () => {
      await seedMultiCategoryIndex()
      await setQuery('zzz-no-match-anywhere')

      expect(wrapper.findComponent(ContentTypesAll).exists()).toBe(true)
    })

    it('keeps the "All" row count tied to total aggregations, not the filtered subset', async () => {
      await seedMultiCategoryIndex()

      const totalBefore = wrapper.findComponent(ContentTypesAll).props('count')

      await setQuery('image')

      // The query only matches IMAGE, but the All count comes from the
      // overall search total — it does NOT recompute from the visible subset.
      expect(wrapper.findComponent(ContentTypesAll).props('count')).toBe(totalBefore)
    })

    it('keeps per-category and per-item counts unchanged when the query is active', async () => {
      await seedMultiCategoryIndex()

      const documentCountBefore = findCategoryName('DOCUMENT').props('count')
      const pdfCountBefore = findCategoryItem('application/pdf').props('count')

      await setQuery('pdf')

      // DOCUMENT is the only category visible now, but its count and the pdf
      // item count must still reflect the underlying aggregation.
      expect(findCategoryName('DOCUMENT').props('count')).toBe(documentCountBefore)
      expect(findCategoryItem('application/pdf').props('count')).toBe(pdfCountBefore)
    })

    it('keeps a selected item visible in the grouped view when the query no longer matches it', async () => {
      await seedMultiCategoryIndex()

      await findCategoryItem('video/mp4').vm.$emit('update:modelValue', true)
      await flushPromises()

      await setQuery('pdf')

      // pdf is the matching item, but video/mp4 is selected so it stays.
      expect(findCategoryItem('application/pdf')).toBeDefined()
      expect(findCategoryItem('video/mp4')).toBeDefined()
      // VIDEO category is kept because it owns a selected (visible) type,
      // even though its label doesn't match.
      expect(findCategoryName('VIDEO')).toBeDefined()
    })

    it('keeps a stored category and its items visible when the query no longer matches them', async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf'],
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('t1', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      // User picks the whole OTHER category — text/html and text/plain are
      // now selected via contentTypeCategory rather than individual values.
      await findCategoryName('OTHER').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])

      await setQuery('pdf')

      // text/html and text/plain are selected (via the stored category) so
      // they stay visible even though they don't match the query.
      expect(findCategoryItem('text/html')).toBeDefined()
      expect(findCategoryItem('text/plain')).toBeDefined()
    })

    it('keeps a selected item visible in the flat view when the query no longer matches it', async () => {
      await seedMultiCategoryIndex()

      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()

      const videoEntry = wrapper.findAllComponents(ContentTypesEntry)
        .find(node => node.props('contentType') === 'video/mp4')
      await videoEntry.vm.$emit('update:modelValue', true)
      await flushPromises()

      await setQuery('pdf')

      const visibleTypes = wrapper.findAllComponents(ContentTypesEntry)
        .map(node => node.props('contentType'))

      expect(visibleTypes).toContain('application/pdf')
      expect(visibleTypes).toContain('video/mp4')
      expect(visibleTypes).not.toContain('image/jpeg')
    })

    it('does not change selection semantics: ticking a sibling under a query promotes to category', async () => {
      api.getContentTypeCategories.mockResolvedValue({
        OTHER: ['text/html', 'text/plain']
      })

      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('t1', index).withContentType('text/plain')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      await findCategoryItem('text/html').vm.$emit('update:modelValue', true)
      await flushPromises()
      expect(searchStore.values.contentType).toEqual(['text/html'])

      // Ticking the last sibling under an active query must still trigger
      // the category-promotion path that toggleEntry implements.
      await setQuery('plain')
      await findCategoryItem('text/plain').vm.$emit('update:modelValue', true)
      await flushPromises()

      expect(searchStore.values.contentTypeCategory).toEqual(['OTHER'])
      expect(searchStore.values.contentType ?? []).not.toContain('text/html')
      expect(searchStore.values.contentType ?? []).not.toContain('text/plain')
    })
  })

  describe('search filtering of the rendered structure', () => {
    // Multi-category seed used to exercise structural filtering: each category
    // owns enough types to distinguish "category-label match keeps siblings"
    // from "type-label match hides siblings" in the same dataset.
    //   DOCUMENT → application/pdf (label "Portable Document Format (PDF)")
    //   DOCUMENT → text/html       (label "HTML document")
    //   IMAGE    → image/jpeg      (label "JPEG image")
    //   VIDEO    → video/mp4       (label "MP4 audio/video")
    const seedStructuralCategories = async () => {
      api.getContentTypeCategories.mockResolvedValue({
        DOCUMENT: ['application/pdf', 'text/html'],
        IMAGE: ['image/jpeg'],
        VIDEO: ['video/mp4']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('h1', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()
      await letData(es).have(new IndexedDocument('v1', index).withContentType('video/mp4')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()
    }

    const setQuery = async (value) => {
      wrapper.findComponent(FilterType).vm.$emit('update:query', value)
      await flushPromises()
    }

    const visibleCategories = () =>
      wrapper.findAllComponents(ContentTypesCategoryName).map(node => node.props('category'))

    const visibleCategoryItems = () =>
      wrapper.findAllComponents(ContentTypesCategoryItem).map(node => node.props('contentType'))

    it('renders the unfiltered grouped structure when the query is empty', async () => {
      await seedStructuralCategories()

      // Empty query is a fast-path no-op: every aggregated category and item
      // is rendered, alongside the "All" row.
      expect(visibleCategories()).toEqual(expect.arrayContaining(['DOCUMENT', 'IMAGE', 'VIDEO']))
      expect(visibleCategories()).toHaveLength(3)
      expect(visibleCategoryItems()).toEqual(
        expect.arrayContaining(['application/pdf', 'text/html', 'image/jpeg', 'video/mp4'])
      )
      expect(visibleCategoryItems()).toHaveLength(4)
      expect(wrapper.findComponent(ContentTypesAll).exists()).toBe(true)
    })

    it('hides non-matching siblings and categories when the query matches a content type label', async () => {
      await seedStructuralCategories()

      // "html" matches text/html (key + "HTML document" label) but does NOT
      // match any other type's key/label nor any category label, so DOCUMENT
      // is kept solely because it owns text/html — its sibling application/pdf
      // is hidden, and IMAGE / VIDEO disappear entirely.
      await setQuery('html')

      expect(visibleCategories()).toEqual(['DOCUMENT'])
      expect(visibleCategoryItems()).toEqual(['text/html'])
    })

    it('matches a content type by raw MIME substring even when the label does not contain the query', async () => {
      await seedStructuralCategories()

      // "application" appears in the application/pdf MIME key but NOT in its
      // label "Portable Document Format (PDF)" nor in any category label — so
      // a positive match here proves the filter consults the raw key, not
      // just the resolved label.
      await setQuery('application')

      expect(visibleCategoryItems()).toEqual(['application/pdf'])
      expect(visibleCategories()).toEqual(['DOCUMENT'])
    })

    it('keeps every type in a category when the query matches the category label', async () => {
      api.getContentTypeCategories.mockResolvedValue({
        OTHER: ['application/pdf', 'image/jpeg']
      })

      await letData(es).have(new IndexedDocument('d1', index).withContentType('application/pdf')).commit()
      await letData(es).have(new IndexedDocument('i1', index).withContentType('image/jpeg')).commit()

      await wrapper.findComponent(FilterType).vm.aggregateOver()
      await flushPromises()

      // "other" matches the OTHER category label ("Other") but does NOT match
      // either of its content-type keys or labels — so a category-label match
      // must keep both children rendered, not narrow to the empty set.
      await setQuery('other')

      expect(visibleCategories()).toEqual(['OTHER'])
      expect(visibleCategoryItems()).toEqual(
        expect.arrayContaining(['application/pdf', 'image/jpeg'])
      )
      expect(visibleCategoryItems()).toHaveLength(2)
    })

    it('preserves the active query across a grouped → flat → grouped toggle', async () => {
      await seedStructuralCategories()

      // Apply a query that matches a single category so we can observe the
      // same filter on both sides of the view toggle.
      await setQuery('image')

      expect(visibleCategories()).toEqual(['IMAGE'])
      expect(visibleCategoryItems()).toEqual(['image/jpeg'])

      // Flip to flat: the FilterType search input stays mounted, the local
      // query ref is unchanged, and the flat list applies the same predicate.
      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()

      const flatTypes = wrapper.findAllComponents(ContentTypesEntry)
        .map(node => node.props('contentType'))
      expect(flatTypes).toEqual(['image/jpeg'])

      // Flip back to grouped: the same query still narrows the categories.
      await wrapper.findComponent(ButtonToggleContentTypesView).trigger('click')
      await flushPromises()

      expect(visibleCategories()).toEqual(['IMAGE'])
      expect(visibleCategoryItems()).toEqual(['image/jpeg'])
    })
  })
})
