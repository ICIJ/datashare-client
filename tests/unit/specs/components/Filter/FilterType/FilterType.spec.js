import find from 'lodash/find'
import { ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import { vi } from 'vitest'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'
import { useContentTypeCategoryAvailability } from '@/composables/useContentTypeCategoryAvailability'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'
import en from '@/lang/en.json'
import fr from '@/lang/fr.json'

vi.mock('@/composables/useContentTypeCategoryAvailability', () => ({
  useContentTypeCategoryAvailability: vi.fn()
}))

describe('FilterType.vue', () => {
  const { index, es } = esConnectionHelper.build('filter-type-a-')
  const { index: anotherIndex } = esConnectionHelper.build('filter-type-b-')

  let core, wrapper, searchStore

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    // Default to "modern index" so paired-dimension tests behave as before;
    // legacy/degraded behavior is exercised in dedicated specs.
    useContentTypeCategoryAvailability.mockReturnValue({
      isAvailable: ref(true),
      isLoading: ref(false),
      error: ref(null)
    })

    core = CoreSetup.init().useAll()
    searchStore = useSearchStore()
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  describe('contentType', () => {
    beforeEach(() => {
      const name = 'contentType'
      const filter = searchStore.getFilter({ name })

      wrapper = shallowMount(FilterType, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: {
          filter
        }
      })

      searchStore.decontextualizeFilter(name)
      searchStore.setIndex(index)
      searchStore.reset()
      searchStore.resetFilters()
    })

    it('should display no items for the contentType filter', async () => {
      await wrapper.vm.aggregateOver()

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(0)
      expect(wrapper.vm.lastPage.total).toBe(0)
    })

    it('should display 2 items for the contentType filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()

      await wrapper.vm.aggregateOver()

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(5)
    })

    it('should filter according to the others filters if contextualized search', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withContentType('type_01').withLanguage('ENGLISH'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_02', index).withContentType('type_02').withLanguage('FRENCH'))
        .commit()

      searchStore.contextualizeFilter('contentType')
      searchStore.setFilterValue({ name: 'language', value: 'ENGLISH' })
      await wrapper.vm.aggregateOver()
      const findAllComponents = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(findAllComponents).toHaveLength(1)
      expect(wrapper.vm.lastPage.total).toBe(1)
    })

    it('should display 3 items for the contentType filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()
      await letData(es).have(new IndexedDocument('document_07', index).withContentType('text/stylesheet')).commit()

      await wrapper.vm.aggregateOver()

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)
      expect(wrapper.vm.lastPage.total).toBe(7)
    })

    it('should display 3 items for the contentType filter alphabetically', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()

      searchStore.sortFilter({ name, sortBy: '_key', orderBy: 'asc' })
      await wrapper.vm.aggregateOver()

      const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(entries).toHaveLength(3)

      expect(entries.at(0).attributes('label')).toEqual('HTML document')
      expect(entries.at(1).attributes('label')).toEqual('JavaScript')
      expect(entries.at(2).attributes('label')).toEqual('Stylesheet')
    })

    it('should display X filter items after applying the relative search', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withContent('INDEX').withContentType('text/javascript'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_02', index).withContent('LIST').withContentType('text/javascript'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_03', index).withContent('SHOW').withContentType('text/javascript'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_04', index).withContent('INDEX').withContentType('text/html'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_05', index).withContent('LIST').withContentType('text/html'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_06', index).withContent('LIST').withContentType('text/stylesheet'))
        .commit()

      searchStore.setQuery('SHOW')
      searchStore.decontextualizeFilter('contentType')
      await wrapper.vm.aggregateOver()
      expect(wrapper.vm.lastPage.total).toBe(6)
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)

      searchStore.contextualizeFilter('contentType')
      await wrapper.vm.aggregateOver()
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)

      searchStore.setQuery('INDEX')
      await wrapper.vm.aggregateOver()
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
    })

    it('should apply relative filter and get back to global filter', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withContent('Lorem').withContentType('text/javascript'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_02', index).withContent('Ipsum').withContentType('text/html'))
        .commit()

      searchStore.setQuery('Lorem')
      searchStore.decontextualizeFilter('contentType')
      await wrapper.vm.aggregateOver()
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)

      searchStore.contextualizeFilter('contentType')
      await wrapper.vm.aggregateOver()
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)

      searchStore.decontextualizeFilter('contentType')
      await wrapper.vm.aggregateOver()
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
    })

    it('should display an item for excluded filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()

      searchStore.addFilterValue({ name: 'contentType', value: 'text/javascript' })
      searchStore.excludeFilter('contentType')

      await wrapper.vm.aggregateOver()

      expect(wrapper.findComponent(FiltersPanelSectionFilterEntry).attributes('count')).toBe('2')
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should filter filter values', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_12', index).withContentType('text/type_12')).commit()
      await letData(es).have(new IndexedDocument('document_13', index).withContentType('text/type_13')).commit()

      wrapper.vm.query = 'text/type_0'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(3)
      expect(wrapper.vm.lastPage.total).toBe(5)
    })

    it('should filter filter values with no results', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/type_03')).commit()

      wrapper.vm.query = 'yolo'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(0)
      expect(wrapper.vm.lastPage.total).toBe(6)
    })

    it('should filter filter values - Uppercase situation', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/csv')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('plain/text')).commit()

      wrapper.vm.query = 'TEX'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)
    })

    it('should filter filter values on filter item', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
      await letData(es)
        .have(
          new IndexedDocument('document_02', index).withContentType(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
        )
        .commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('image/wmf')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('image/emf')).commit()

      wrapper.vm.query = 'image'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(4)
    })

    it('should filter filter values on filter label', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

      wrapper.vm.query = 'Internet'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(1)
      expect(wrapper.vm.entries[0].item.doc_count).toBe(2)
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should filter filter values on filter label in capital letters', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

      wrapper.vm.query = 'MESSAGE'

      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(1)
      expect(wrapper.vm.entries[0].item.doc_count).toBe(2)
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should return filters from another index', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('doc_03', anotherIndex).withContentType('text/javascript')).commit()
      await wrapper.vm.aggregateOver()

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)

      searchStore.setIndex(anotherIndex)
      await wrapper.vm.aggregateOver()

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)
      expect(wrapper.vm.lastPage.total).toBe(1)
    })

    describe('closed-state count reflects paired-dimension union', () => {
      // Mirrors the OR semantics used in the search query and the breadcrumb.
      it('is zero when neither contentType nor contentTypeCategory has values', () => {
        expect(wrapper.vm.count).toBe(0)
      })

      it('counts only contentType when contentTypeCategory is empty', async () => {
        searchStore.addFilterValue({ name: 'contentType', value: 'text/javascript' })
        searchStore.addFilterValue({ name: 'contentType', value: 'text/html' })
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.count).toBe(2)
      })

      it('counts contentTypeCategory selections when contentType is empty', async () => {
        searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.count).toBe(1)
      })

      it('sums selections across both paired dimensions (OR-union)', async () => {
        searchStore.addFilterValue({ name: 'contentType', value: 'text/javascript' })
        searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })
        searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'IMAGE' })
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.count).toBe(3)
      })
    })
  })

  // NOTE: this suite uses the `language` filter (rather than `contentType`)
  // because `contentType` is rendered via FilterTypeFileTypes, which overrides
  // FilterType's default slot entirely and does not (yet) receive lock/unlock
  // bindings. `language` uses FilterType's own default slot unmodified, which
  // is the only case lock/unlock support covers today — see the TODO above
  // `lockedName` in FilterType.vue.
  describe('locked filters', () => {
    let lockedFiltersStore

    beforeEach(() => {
      const name = 'language'
      const filter = searchStore.getFilter({ name })

      wrapper = shallowMount(FilterType, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: {
          filter
        }
      })

      searchStore.decontextualizeFilter(name)
      searchStore.setIndex(index)
      searchStore.reset()
      searchStore.resetFilters()
      lockedFiltersStore = useLockedFiltersStore()
    })

    it('reports a ticked value as unlocked by default', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })

      await wrapper.vm.aggregateOver()

      expect(wrapper.findComponent(FiltersPanelSectionFilterEntry).props('locked')).toBe(false)
    })

    it('locks a value when the entry emits update:locked with true', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })

      await wrapper.vm.aggregateOver()
      await wrapper.findComponent(FiltersPanelSectionFilterEntry).vm.$emit('update:locked', true)

      expect(lockedFiltersStore.isLocked({ name: 'language', value: 'ENGLISH' })).toBe(true)
      expect(wrapper.findComponent(FiltersPanelSectionFilterEntry).props('locked')).toBe(true)
    })

    it('unlocks a value when the entry emits update:locked with false', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      lockedFiltersStore.lock({ name: 'language', value: 'ENGLISH', label: 'English' })

      await wrapper.vm.aggregateOver()
      await wrapper.findComponent(FiltersPanelSectionFilterEntry).vm.$emit('update:locked', false)

      expect(lockedFiltersStore.isLocked({ name: 'language', value: 'ENGLISH' })).toBe(false)
    })

    it('locks under the "-" prefixed name when the filter is currently excluded', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      searchStore.excludeFilter('language')

      await wrapper.vm.aggregateOver()
      await wrapper.findComponent(FiltersPanelSectionFilterEntry).vm.$emit('update:locked', true)

      expect(lockedFiltersStore.isLocked({ name: '-language', value: 'ENGLISH' })).toBe(true)
      expect(lockedFiltersStore.isLocked({ name: 'language', value: 'ENGLISH' })).toBe(false)
    })

    it('removes the lock when the value is unticked', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      lockedFiltersStore.lock({ name: 'language', value: 'ENGLISH', label: 'English' })

      await wrapper.vm.aggregateOver()
      await wrapper.findComponent(FiltersPanelSectionFilterEntry).vm.$emit('update:model-value', false)

      expect(lockedFiltersStore.isLocked({ name: 'language', value: 'ENGLISH' })).toBe(false)
    })

    it('still renders a locked value with no matching aggregation bucket, at zero count', async () => {
      // No document with this language exists — simulates a deleted/re-indexed value.
      lockedFiltersStore.lock({ name: 'language', value: 'KLINGON', label: 'Removed Language' })

      await wrapper.vm.aggregateOver()

      const entry = wrapper.findAllComponents(FiltersPanelSectionFilterEntry).find(
        w => w.props('label') === 'Removed Language'
      )
      expect(entry).toBeTruthy()
      expect(entry.props('count')).toBe(0)
      expect(entry.props('locked')).toBe(true)
    })

    it('drops the synthetic locked-but-missing entry once it is unlocked', async () => {
      lockedFiltersStore.lock({ name: 'language', value: 'KLINGON', label: 'Removed Language' })
      await wrapper.vm.aggregateOver()
      expect(wrapper.vm.entries.some(({ label }) => label === 'Removed Language')).toBe(true)

      lockedFiltersStore.unlock({ name: 'language', value: 'KLINGON' })
      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries.some(({ label }) => label === 'Removed Language')).toBe(false)
      expect(
        wrapper.findAllComponents(FiltersPanelSectionFilterEntry).some(w => w.props('label') === 'Removed Language')
      ).toBe(false)
    })

    it('renders a ticked+excluded+locked value only once, even with no matching aggregation bucket', async () => {
      // No document indexed with this language — it is "missing" from both
      // excludedBucketsPage (ticked+excluded synthesis) and, absent dedup,
      // missingLockedBucketsPage (locked-but-missing synthesis) at once.
      searchStore.contextualizeFilter('language')
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      searchStore.excludeFilter('language')
      lockedFiltersStore.lock({ name: '-language', value: 'ENGLISH', label: 'English' })

      await wrapper.vm.aggregateOver()

      const matches = wrapper.vm.entries.filter(({ value }) => value === 'ENGLISH')
      expect(matches).toHaveLength(1)
    })
  })

  describe('language', () => {
    beforeEach(() => {
      const name = 'language'
      const filter = searchStore.getFilter({ name })

      wrapper = shallowMount(FilterType, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: {
          filter
        }
      })

      searchStore.decontextualizeFilter(name)
      searchStore.setIndex(index)
      searchStore.reset()
    })

    it('should display the language filter in French', async () => {
      await core.loadI18Locale('fr')
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      await wrapper.vm.aggregateOver()
      const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(entries).toHaveLength(1)
      expect(entries.at(0).attributes('label')).toBe('Anglais')
    })

    it('should translate any weird language', async () => {
      await core.loadI18Locale('fr')
      await wrapper.setProps({ filter: searchStore.getFilter({ name: 'language' }) })

      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('WELSH')).commit()
      await wrapper.vm.aggregateOver()

      const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(entries).toHaveLength(1)
      expect(entries.at(0).attributes('label')).toBe('Gallois')
    })

    it('should match language search case-insensitively', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withLanguage('FRENCH')).commit()

      wrapper.vm.query = 'english'
      await wrapper.vm.aggregateOver()

      expect(wrapper.vm.entries).toHaveLength(1)
      expect(wrapper.vm.entries[0].item.key).toBe('ENGLISH')
    })

    it('counts only its own values for an unpaired filter', async () => {
      // Sanity check: the union-aware count must collapse to the filter's own
      // values when it has no paired dimension, so unrelated filters keep
      // their existing closed-state behavior unchanged.
      searchStore.addFilterValue({ name: 'language', value: 'ENGLISH' })
      searchStore.addFilterValue({ name: 'language', value: 'FRENCH' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.count).toBe(2)
    })
  })

  describe('extractionLevel', () => {
    beforeEach(() => {
      const name = 'extractionLevel'
      const filter = searchStore.getFilter({ name })

      wrapper = shallowMount(FilterType, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: {
          filter
        }
      })

      searchStore.decontextualizeFilter(name)
      searchStore.setIndex(index)
      searchStore.reset()
    })

    it('should display the extraction level filter with correct labels', async () => {
      const filter = find(searchStore.instantiatedFilters, { name: 'extractionLevel' })
      await wrapper.setProps({ filter })

      await letData(es).have(new IndexedDocument('document_01', index)).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
      await wrapper.vm.aggregateOver()

      const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(entries).toHaveLength(2)
      expect(entries.at(0).attributes('label')).toBe(en.filter.level.level00)
    })

    it('should display the extraction level filter with correct labels in French', async () => {
      await core.loadI18Locale('fr')
      const filter = searchStore.getFilter({ name: 'extractionLevel' })

      await wrapper.setProps({ filter })

      await letData(es).have(new IndexedDocument('document_01', index)).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
      await wrapper.vm.aggregateOver()

      const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
      expect(entries).toHaveLength(2)
      expect(entries.at(0).attributes('label')).toBe(fr.filter.level.level00)
    })
  })

  describe('pageless behavior (pagelessBucketSize option)', () => {
    let filterWrapper, searchStoreSpy

    beforeEach(() => {
      const filter = searchStore.getFilter({ name: 'language' })
      // simulate an opted-in config by mutating the instance
      filter.pagelessBucketSize = 1000

      searchStoreSpy = vi.spyOn(searchStore, 'queryFilter')

      filterWrapper = shallowMount(FilterType, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: { filter }
      })

      searchStore.decontextualizeFilter('language')
      searchStore.setIndex(index)
      searchStore.reset()
      searchStore.resetFilters()
    })

    afterEach(() => {
      searchStoreSpy.mockRestore()
    })

    it('requests `pagelessBucketSize` buckets in one page', async () => {
      await filterWrapper.vm.aggregateOver()

      expect(searchStoreSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'language', from: 0, size: 1000 })
      )
    })

    it('does not render the infinite-loading component', async () => {
      await filterWrapper.vm.aggregateOver()

      expect(filterWrapper.findComponent({ name: 'InfiniteLoading' }).exists()).toBe(false)
    })
  })
})
