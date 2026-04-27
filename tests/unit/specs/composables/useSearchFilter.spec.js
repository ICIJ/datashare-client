import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import bodybuilder from 'bodybuilder'
import { vi } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useContentTypeCategoryAvailability } from '@/composables/useContentTypeCategoryAvailability'
import { useSearchStore } from '@/store/modules'

vi.mock('@/composables/useContentTypeCategoryAvailability', () => ({
  useContentTypeCategoryAvailability: vi.fn()
}))

describe('useSearchFilter composable', () => {
  let plugins, searchStore

  beforeEach(() => {
    // Default to "modern index" so paired-dimension tests behave as before;
    // the legacy/degraded tests override this per case.
    useContentTypeCategoryAvailability.mockReturnValue({
      isAvailable: ref(true),
      isLoading: ref(false),
      error: ref(null)
    })

    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    searchStore = useSearchStore()
    searchStore.reset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useSearchFilter()
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  describe('paired contextualize state (contentType ↔ contentTypeCategory)', () => {
    it('contextualizes both dimensions when toggled on via contentType', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: 'contentType' }, true)

      expect(searchStore.isFilterContextualized('contentType')).toBe(true)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(true)
    })

    it('contextualizes both dimensions when toggled on via contentTypeCategory', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: 'contentTypeCategory' }, true)

      expect(searchStore.isFilterContextualized('contentType')).toBe(true)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(true)
    })

    it('decontextualizes both dimensions when toggled off via contentType', () => {
      searchStore.contextualizeFilter('contentType')
      searchStore.contextualizeFilter('contentTypeCategory')

      const { toggleContextualizeFilter } = mountComposable()
      toggleContextualizeFilter({ name: 'contentType' }, false)

      expect(searchStore.isFilterContextualized('contentType')).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })

    it('decontextualizes both dimensions when toggled off via contentTypeCategory', () => {
      searchStore.contextualizeFilter('contentType')
      searchStore.contextualizeFilter('contentTypeCategory')

      const { toggleContextualizeFilter } = mountComposable()
      toggleContextualizeFilter({ name: 'contentTypeCategory' }, false)

      expect(searchStore.isFilterContextualized('contentType')).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })

    it('leaves unrelated filters untouched when toggling a paired dimension', () => {
      searchStore.contextualizeFilter('language')

      const { toggleContextualizeFilter } = mountComposable()
      toggleContextualizeFilter({ name: 'contentType' }, true)

      expect(searchStore.isFilterContextualized('language')).toBe(true)
    })

    it('is idempotent: toggling on twice keeps both dimensions contextualized once', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: 'contentType' }, true)
      toggleContextualizeFilter({ name: 'contentType' }, true)

      expect(searchStore.contextualizeFilters.filter(n => n === 'contentType')).toHaveLength(1)
      expect(searchStore.contextualizeFilters.filter(n => n === 'contentTypeCategory')).toHaveLength(1)
    })

    it('is idempotent: toggling off when already off leaves both dimensions decontextualized', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: 'contentType' }, false)

      expect(searchStore.isFilterContextualized('contentType')).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })
  })

  describe('isFilterContextualized (unified read with reconciliation)', () => {
    it('returns true when both paired dimensions agree on true', () => {
      searchStore.contextualizeFilter('contentType')
      searchStore.contextualizeFilter('contentTypeCategory')

      const { isFilterContextualized } = mountComposable()

      expect(isFilterContextualized({ name: 'contentType' })).toBe(true)
      expect(isFilterContextualized({ name: 'contentTypeCategory' })).toBe(true)
    })

    it('returns false when both paired dimensions agree on false', () => {
      const { isFilterContextualized } = mountComposable()

      expect(isFilterContextualized({ name: 'contentType' })).toBe(false)
      expect(isFilterContextualized({ name: 'contentTypeCategory' })).toBe(false)
    })

    it('reconciles a divergent state using the canonical contentType when canonical is contextualized', () => {
      searchStore.contextualizeFilter('contentType')

      const { isFilterContextualized } = mountComposable()

      expect(isFilterContextualized({ name: 'contentType' })).toBe(true)
      expect(isFilterContextualized({ name: 'contentTypeCategory' })).toBe(true)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(true)
    })

    it('reconciles a divergent state using the canonical contentType when canonical is NOT contextualized', () => {
      searchStore.contextualizeFilter('contentTypeCategory')

      const { isFilterContextualized } = mountComposable()

      expect(isFilterContextualized({ name: 'contentType' })).toBe(false)
      expect(isFilterContextualized({ name: 'contentTypeCategory' })).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })

    it('still works for unpaired filters without cross-dimension writes', () => {
      searchStore.contextualizeFilter('language')

      const { isFilterContextualized } = mountComposable()

      expect(isFilterContextualized({ name: 'language' })).toBe(true)
      expect(isFilterContextualized({ name: 'tags' })).toBe(false)
    })
  })

  describe('computedContextualizeFilter', () => {
    it('get() exposes the unified paired state and set() toggles both dimensions', () => {
      const { computedContextualizeFilter } = mountComposable()
      const contextualized = computedContextualizeFilter({ name: 'contentType' })

      expect(contextualized.value).toBe(false)

      contextualized.value = true
      expect(searchStore.isFilterContextualized('contentType')).toBe(true)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(true)

      contextualized.value = false
      expect(searchStore.isFilterContextualized('contentType')).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })
  })

  describe('paired exclude state (contentType ↔ contentTypeCategory)', () => {
    it('excludes both dimensions when toggled on via contentType', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: 'contentType' }, true)

      expect(searchStore.isFilterExcluded('contentType')).toBe(true)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('excludes both dimensions when toggled on via contentTypeCategory', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: 'contentTypeCategory' }, true)

      expect(searchStore.isFilterExcluded('contentType')).toBe(true)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('includes both dimensions when toggled off via contentType', () => {
      searchStore.excludeFilter('contentType')
      searchStore.excludeFilter('contentTypeCategory')

      const { toggleExcludeFilter } = mountComposable()
      toggleExcludeFilter({ name: 'contentType' }, false)

      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('includes both dimensions when toggled off via contentTypeCategory', () => {
      searchStore.excludeFilter('contentType')
      searchStore.excludeFilter('contentTypeCategory')

      const { toggleExcludeFilter } = mountComposable()
      toggleExcludeFilter({ name: 'contentTypeCategory' }, false)

      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('leaves unrelated filters untouched when toggling a paired dimension', () => {
      searchStore.excludeFilter('language')

      const { toggleExcludeFilter } = mountComposable()
      toggleExcludeFilter({ name: 'contentType' }, true)

      expect(searchStore.isFilterExcluded('language')).toBe(true)
    })

    it('is idempotent: toggling on twice keeps both dimensions excluded once', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: 'contentType' }, true)
      toggleExcludeFilter({ name: 'contentType' }, true)

      expect(searchStore.excludeFilters.filter(n => n === 'contentType')).toHaveLength(1)
      expect(searchStore.excludeFilters.filter(n => n === 'contentTypeCategory')).toHaveLength(1)
    })

    it('is idempotent: toggling off when already off leaves both dimensions included', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: 'contentType' }, false)

      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })
  })

  describe('isFilterExcluded (unified read with reconciliation)', () => {
    it('returns true when both paired dimensions agree on true', () => {
      searchStore.excludeFilter('contentType')
      searchStore.excludeFilter('contentTypeCategory')

      const { isFilterExcluded } = mountComposable()

      expect(isFilterExcluded({ name: 'contentType' })).toBe(true)
      expect(isFilterExcluded({ name: 'contentTypeCategory' })).toBe(true)
    })

    it('returns false when both paired dimensions agree on false', () => {
      const { isFilterExcluded } = mountComposable()

      expect(isFilterExcluded({ name: 'contentType' })).toBe(false)
      expect(isFilterExcluded({ name: 'contentTypeCategory' })).toBe(false)
    })

    it('reconciles a divergent state using the canonical contentType when canonical is excluded', () => {
      searchStore.excludeFilter('contentType')

      const { isFilterExcluded } = mountComposable()

      expect(isFilterExcluded({ name: 'contentType' })).toBe(true)
      expect(isFilterExcluded({ name: 'contentTypeCategory' })).toBe(true)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('reconciles a divergent state using the canonical contentType when canonical is NOT excluded', () => {
      searchStore.excludeFilter('contentTypeCategory')

      const { isFilterExcluded } = mountComposable()

      expect(isFilterExcluded({ name: 'contentType' })).toBe(false)
      expect(isFilterExcluded({ name: 'contentTypeCategory' })).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('still works for unpaired filters without cross-dimension writes', () => {
      searchStore.excludeFilter('language')

      const { isFilterExcluded } = mountComposable()

      expect(isFilterExcluded({ name: 'language' })).toBe(true)
      expect(isFilterExcluded({ name: 'tags' })).toBe(false)
    })
  })

  describe('computedExcludeFilter', () => {
    it('get() exposes the unified paired state and set() toggles both dimensions', () => {
      const { computedExcludeFilter } = mountComposable()
      const excluded = computedExcludeFilter({ name: 'contentType' })

      expect(excluded.value).toBe(false)

      excluded.value = true
      expect(searchStore.isFilterExcluded('contentType')).toBe(true)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(true)

      excluded.value = false
      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })
  })

  describe('searchStore query body honors paired exclude flag', () => {
    it('marks both instantiated filters as excluded when toggled via contentType', () => {
      const { toggleExcludeFilter, addFilterValue } = mountComposable()

      addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
      addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })
      toggleExcludeFilter({ name: 'contentType' }, true)

      const instances = searchStore.instantiatedFilters.filter(f =>
        f.name === 'contentType' || f.name === 'contentTypeCategory'
      )
      expect(instances).toHaveLength(2)
      for (const instance of instances) {
        expect(instance.excluded).toBe(true)
      }
    })

    it('produces an Elasticsearch body with both dimensions as must_not when excluded', () => {
      const { toggleExcludeFilter, addFilterValue } = mountComposable()

      addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
      addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })
      toggleExcludeFilter({ name: 'contentType' }, true)

      const body = bodybuilder()
      searchStore.instantiatedFilters.filter(f => f.hasValues()).forEach(f => f.applyTo(body))
      const built = JSON.stringify(body.build())

      expect(built).toContain('must_not')
      expect(built).toContain('"contentType"')
      expect(built).toContain('"contentTypeCategory"')
      expect(built).not.toMatch(/"must":\s*\[[^\]]*"contentType"/)
    })
  })

  describe.each([
    { filter: 'language' },
    { filter: 'extractionLevel' }
  ])('single-dimension regression coverage for $filter', ({ filter }) => {
    it('toggleExcludeFilter writes exactly one entry to excludeFilters', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: filter }, true)

      expect(searchStore.excludeFilters).toEqual([filter])
    })

    it('toggleExcludeFilter does not touch the contentType / contentTypeCategory pair', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: filter }, true)

      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(searchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('toggleExcludeFilter off after on leaves excludeFilters empty', () => {
      const { toggleExcludeFilter } = mountComposable()

      toggleExcludeFilter({ name: filter }, true)
      toggleExcludeFilter({ name: filter }, false)

      expect(searchStore.excludeFilters).toEqual([])
    })

    it('isFilterExcluded does not write back to any other dimension', () => {
      const { isFilterExcluded } = mountComposable()
      searchStore.excludeFilter(filter)

      const before = [...searchStore.excludeFilters]
      expect(isFilterExcluded({ name: filter })).toBe(true)

      expect(searchStore.excludeFilters).toEqual(before)
      expect(searchStore.excludeFilters).toEqual([filter])
    })

    it('computedExcludeFilter round-trips on the single dimension', () => {
      const { computedExcludeFilter } = mountComposable()
      const excluded = computedExcludeFilter({ name: filter })

      expect(excluded.value).toBe(false)

      excluded.value = true
      expect(excluded.value).toBe(true)
      expect(searchStore.excludeFilters).toEqual([filter])

      excluded.value = false
      expect(excluded.value).toBe(false)
      expect(searchStore.excludeFilters).toEqual([])
    })

    it('toggleContextualizeFilter writes exactly one entry to contextualizeFilters', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: filter }, true)

      expect(searchStore.contextualizeFilters).toEqual([filter])
    })

    it('toggleContextualizeFilter does not touch the contentType / contentTypeCategory pair', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: filter }, true)

      expect(searchStore.isFilterContextualized('contentType')).toBe(false)
      expect(searchStore.isFilterContextualized('contentTypeCategory')).toBe(false)
    })

    it('toggleContextualizeFilter off after on leaves contextualizeFilters empty', () => {
      const { toggleContextualizeFilter } = mountComposable()

      toggleContextualizeFilter({ name: filter }, true)
      toggleContextualizeFilter({ name: filter }, false)

      expect(searchStore.contextualizeFilters).toEqual([])
    })

    it('isFilterContextualized does not write back to any other dimension', () => {
      const { isFilterContextualized } = mountComposable()
      searchStore.contextualizeFilter(filter)

      const before = [...searchStore.contextualizeFilters]
      expect(isFilterContextualized({ name: filter })).toBe(true)

      expect(searchStore.contextualizeFilters).toEqual(before)
      expect(searchStore.contextualizeFilters).toEqual([filter])
    })

    it('computedContextualizeFilter round-trips on the single dimension', () => {
      const { computedContextualizeFilter } = mountComposable()
      const contextualized = computedContextualizeFilter({ name: filter })

      expect(contextualized.value).toBe(false)

      contextualized.value = true
      expect(contextualized.value).toBe(true)
      expect(searchStore.contextualizeFilters).toEqual([filter])

      contextualized.value = false
      expect(contextualized.value).toBe(false)
      expect(searchStore.contextualizeFilters).toEqual([])
    })

    it('getFilterPairedDimensions returns only the filter itself for unpaired filters', () => {
      const { getFilterPairedDimensions, getFilterPairedDimension } = mountComposable()

      expect(getFilterPairedDimensions({ name: filter })).toEqual([filter])
      expect(getFilterPairedDimension({ name: filter })).toBeNull()
    })
  })

  describe('computedAll', () => {
    describe('single filter ref (existing API)', () => {
      it('returns true when the filter has no values', () => {
        const { computedAll } = mountComposable()
        const all = computedAll({ name: 'language' })

        expect(all.value).toBe(true)
      })

      it('returns false once the filter has at least one value', () => {
        const { computedAll, addFilterValue } = mountComposable()
        const all = computedAll({ name: 'language' })

        addFilterValue({ name: 'language' }, { key: 'en' })

        expect(all.value).toBe(false)
      })

      it('clears the filter when set to true', () => {
        const { computedAll, addFilterValue } = mountComposable()
        addFilterValue({ name: 'language' }, { key: 'en' })

        const spy = vi.spyOn(searchStore, 'setFilterValue')
        const all = computedAll({ name: 'language' })
        all.value = true

        const clearedFilters = spy.mock.calls.map(args => args[0]?.name)
        expect(clearedFilters).toEqual(['language'])
      })

      it('does not clear the filter when set to false', () => {
        const { computedAll, addFilterValue, hasAnyFilterValue } = mountComposable()
        addFilterValue({ name: 'language' }, { key: 'en' })

        const all = computedAll({ name: 'language' })
        all.value = false

        expect(hasAnyFilterValue({ name: 'language' })).toBe(true)
        expect(all.value).toBe(false)
      })
    })

    describe('paired filter list (new API)', () => {
      it('returns true when every paired filter has no values', () => {
        const { computedAll } = mountComposable()
        const all = computedAll([
          { name: 'contentType' },
          { name: 'contentTypeCategory' }
        ])

        expect(all.value).toBe(true)
      })

      it('returns false when any paired filter has a value', () => {
        const { computedAll, addFilterValue } = mountComposable()
        addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })

        const all = computedAll([
          { name: 'contentType' },
          { name: 'contentTypeCategory' }
        ])

        expect(all.value).toBe(false)
      })

      it('returns false when all paired filters have values', () => {
        const { computedAll, addFilterValue } = mountComposable()
        addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
        addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })

        const all = computedAll([
          { name: 'contentType' },
          { name: 'contentTypeCategory' }
        ])

        expect(all.value).toBe(false)
      })

      it('clears every paired filter when set to true', () => {
        const { computedAll, addFilterValue } = mountComposable()
        addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
        addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })

        const spy = vi.spyOn(searchStore, 'setFilterValue')
        const all = computedAll([
          { name: 'contentType' },
          { name: 'contentTypeCategory' }
        ])
        all.value = true

        const clearedFilters = spy.mock.calls.map(args => args[0]?.name)
        expect(clearedFilters).toEqual(['contentType', 'contentTypeCategory'])
      })

      it('flips back to true once every paired filter is cleared', () => {
        const { computedAll, addFilterValue, removeFilterValue } = mountComposable()
        addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
        addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })

        const all = computedAll([
          { name: 'contentType' },
          { name: 'contentTypeCategory' }
        ])
        expect(all.value).toBe(false)

        removeFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
        expect(all.value).toBe(false)

        removeFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })
        expect(all.value).toBe(true)
      })
    })

    describe('degraded mode (legacy index without contentTypeCategory mapping)', () => {
      beforeEach(() => {
        useContentTypeCategoryAvailability.mockReturnValue({
          isAvailable: ref(false),
          isLoading: ref(false),
          error: ref(null)
        })
      })

      it('reflects only the contentType filter when the paired dimension is unavailable', () => {
        const { computedAll, getFilterPairedDimensions, addFilterValue } = mountComposable()
        const pairedFilters = getFilterPairedDimensions({ name: 'contentType' })
        const all = computedAll(pairedFilters)

        expect(pairedFilters).toEqual(['contentType'])
        expect(all.value).toBe(true)

        addFilterValue({ name: 'contentType' }, { key: 'application/pdf' })
        expect(all.value).toBe(false)
      })

      it('ignores stray contentTypeCategory selections in degraded mode', () => {
        const { computedAll, getFilterPairedDimensions, addFilterValue } = mountComposable()
        addFilterValue({ name: 'contentTypeCategory' }, { key: 'DOCUMENT' })

        const pairedFilters = getFilterPairedDimensions({ name: 'contentType' })
        const all = computedAll(pairedFilters)

        // The category dimension is gone from the read layer, so a stale
        // category value alone must not flip the contentType "All" off.
        expect(all.value).toBe(true)
      })
    })
  })
})
