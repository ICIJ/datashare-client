/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormFilters from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormFilters'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules/search'

describe('TaskBatchSearchFormFilters', () => {
  let plugins
  let mainSearchStore
  let formSearchStore
  let composable

  beforeEach(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    mainSearchStore = useSearchStore()
    mainSearchStore.reset()
    formSearchStore = null
    composable = null
  })

  function mountWithDisposable() {
    // Harness runs as a sibling of TaskBatchSearchFormFilters so it inherits
    // the disposable store provided by the parent — same injection path as
    // the FilterType instances rendered by the form.
    const ComposableHarness = defineComponent({
      setup() {
        formSearchStore = useSearchStore.inject()
        composable = useSearchFilter()
        return {}
      },
      template: '<div />'
    })

    const Parent = defineComponent({
      components: { TaskBatchSearchFormFilters, ComposableHarness },
      setup() {
        useSearchStore.disposable()
      },
      template: `
        <div>
          <task-batch-search-form-filters />
          <composable-harness />
        </div>
      `
    })

    return mount(Parent, {
      global: {
        plugins,
        stubs: {
          FormStep: true,
          FilterType: true,
          FilterTypePath: true
        }
      }
    })
  }

  it('provides a form-scoped disposable store distinct from the main search store', () => {
    mountWithDisposable()
    expect(formSearchStore).not.toBe(mainSearchStore)
  })

  describe('paired exclude state (contentType ↔ contentTypeCategory)', () => {
    it('writes to both paired dimensions when exclude is toggled via contentType', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'contentType' }, true)

      expect(formSearchStore.isFilterExcluded('contentType')).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('writes to both paired dimensions when exclude is toggled via contentTypeCategory', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'contentTypeCategory' }, true)

      expect(formSearchStore.isFilterExcluded('contentType')).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('clears both paired dimensions when exclude is toggled off', () => {
      mountWithDisposable()
      formSearchStore.excludeFilter('contentType')
      formSearchStore.excludeFilter('contentTypeCategory')

      composable.toggleExcludeFilter({ name: 'contentType' }, false)

      expect(formSearchStore.isFilterExcluded('contentType')).toBe(false)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('reads the unified exclude state and reconciles drift on read', () => {
      mountWithDisposable()

      // Seed only the canonical side — the read should propagate it to the pair.
      formSearchStore.excludeFilter('contentType')

      expect(composable.isFilterExcluded({ name: 'contentType' })).toBe(true)
      expect(composable.isFilterExcluded({ name: 'contentTypeCategory' })).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
    })

    it('does not mutate the main search store when the form-scoped store toggles exclude', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'contentType' }, true)

      expect(formSearchStore.isFilterExcluded('contentType')).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(true)
      expect(mainSearchStore.isFilterExcluded('contentType')).toBe(false)
      expect(mainSearchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })
  })

  describe('paired contextualize state (contentType ↔ contentTypeCategory)', () => {
    // The batch form hides the contextualize toggle in the UI (see the
    // `hide-contextualize` prop) but the underlying state machinery still
    // fans out — so paired consistency is guaranteed independently of UI
    // visibility, which prevents drift if a future change re-enables it.
    it('writes to both paired dimensions when contextualize is toggled via contentType', () => {
      mountWithDisposable()

      composable.toggleContextualizeFilter({ name: 'contentType' }, true)

      expect(formSearchStore.isFilterContextualized('contentType')).toBe(true)
      expect(formSearchStore.isFilterContextualized('contentTypeCategory')).toBe(true)
    })

    it('reads the unified contextualize state and reconciles drift on read', () => {
      mountWithDisposable()
      formSearchStore.contextualizeFilter('contentType')

      expect(composable.isFilterContextualized({ name: 'contentType' })).toBe(true)
      expect(composable.isFilterContextualized({ name: 'contentTypeCategory' })).toBe(true)
      expect(formSearchStore.isFilterContextualized('contentTypeCategory')).toBe(true)
    })
  })

  describe('non-paired filters (no regression)', () => {
    it('leaves language, tags, and path untouched when a paired dimension is excluded', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'contentType' }, true)

      expect(formSearchStore.isFilterExcluded('language')).toBe(false)
      expect(formSearchStore.isFilterExcluded('tags')).toBe(false)
      expect(formSearchStore.isFilterExcluded('path')).toBe(false)
    })

    it('toggles an unpaired filter (language) without affecting the paired dimensions', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'language' }, true)

      expect(formSearchStore.isFilterExcluded('language')).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentType')).toBe(false)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })

    it('toggles an unpaired filter (tags) without affecting the paired dimensions', () => {
      mountWithDisposable()

      composable.toggleExcludeFilter({ name: 'tags' }, true)

      expect(formSearchStore.isFilterExcluded('tags')).toBe(true)
      expect(formSearchStore.isFilterExcluded('contentType')).toBe(false)
      expect(formSearchStore.isFilterExcluded('contentTypeCategory')).toBe(false)
    })
  })
})
