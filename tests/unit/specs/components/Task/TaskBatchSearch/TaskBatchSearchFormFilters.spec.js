/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormFilters from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormFilters'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules/search'
import { MODE_NAME } from '@/mode'

describe('TaskBatchSearchFormFilters', () => {
  let core
  let plugins
  let mainSearchStore
  let formSearchStore
  let composable

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
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
          FormStep: { template: '<div><slot /></div>' },
          FilterType: true,
          FilterTypePath: true,
          FilterTypeStarred: true,
          FilterTypeRecommendedBy: true,
          FilterTypeDateRange: true
        }
      }
    })
  }

  function findFilterComponents(wrapper) {
    const components = ['FilterType', 'FilterTypePath', 'FilterTypeStarred', 'FilterTypeRecommendedBy', 'FilterTypeDateRange']
    return components.flatMap(name => wrapper.findAllComponents({ name }))
  }

  function renderedFilterNames(wrapper) {
    return findFilterComponents(wrapper).map(component => component.props('filter').name)
  }

  function renderedSections(wrapper) {
    const isBefore = (a, b) => a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING
    const byDocumentOrder = (a, b) => (isBefore(a, b) ? -1 : 1)
    return wrapper.findAll('.filters-panel-section').map((section) => {
      const title = section.find('.filters-panel-section-title').text()
      const filters = findFilterComponents(wrapper)
        .filter(component => section.element.contains(component.element))
        .sort(byDocumentOrder)
        .map(component => component.props('filter').name)
      return { title, filters }
    })
  }

  it('renders every filter available in server mode', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    const wrapper = mountWithDisposable()
    expect(renderedFilterNames(wrapper)).toEqual(expect.arrayContaining([
      'starred',
      'tags',
      'recommendedBy',
      'path',
      'contentType',
      'creationDate',
      'language',
      'extractionLevel',
      'indexingDate'
    ]))
  })

  it('groups the filters in sections ordered like the search filters', () => {
    core.config.set('mode', MODE_NAME.SERVER)
    const wrapper = mountWithDisposable()
    expect(renderedSections(wrapper)).toEqual([
      {
        title: 'Documents info',
        filters: ['path', 'contentType', 'creationDate', 'language', 'extractionLevel', 'indexingDate']
      },
      {
        title: 'User data',
        filters: ['starred', 'tags', 'recommendedBy']
      }
    ])
  })

  it('hides the recommended by filter in local mode', () => {
    core.config.set('mode', MODE_NAME.LOCAL)
    const wrapper = mountWithDisposable()
    expect(renderedFilterNames(wrapper)).not.toContain('recommendedBy')
  })

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
