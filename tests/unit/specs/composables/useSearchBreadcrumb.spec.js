import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'
import { routes } from '@/router'

describe('useSearchBreadcrumb composable', () => {
  let core, plugins, searchStore

  // The "search" route lazily imports the whole Search view subtree, whose
  // setup() reads from the search store. Resolve it once here, on a
  // throwaway router/pinia, so that cost isn't paid inside a single test's
  // timeout.
  beforeAll(async () => {
    setActivePinia(createPinia())
    const router = createRouter({ routes, history: createWebHashHistory() })
    await router.push({ name: 'search' })
  })

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    searchStore = useSearchStore()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useSearchBreadcrumb()
        return result
      },
      template: '<div></div>'
    }
    const wrapper = mount(TestComponent, { global: { plugins } })
    return { ...result, wrapper }
  }

  describe('parseFiltersEntries (breadcrumb rendering for content type + category)', () => {
    it('returns a single entry when only contentTypeCategory is in the URL', () => {
      const { parseFiltersEntries } = mountComposable()
      const entries = parseFiltersEntries({ 'f[contentTypeCategory]': 'Documents' })

      expect(entries).toHaveLength(1)
      expect(entries[0]).toMatchObject({ filter: 'contentTypeCategory', value: 'Documents' })
    })

    it('returns one entry per individual contentType when only contentType values are in the URL', () => {
      const { parseFiltersEntries } = mountComposable()
      const entries = parseFiltersEntries({ 'f[contentType]': ['application/pdf', 'image/png'] })

      expect(entries).toHaveLength(2)
      expect(entries[0]).toMatchObject({ filter: 'contentType', value: 'application/pdf' })
      expect(entries[1]).toMatchObject({ filter: 'contentType', value: 'image/png' })
    })

    it('returns one category entry plus one entry per stand-alone contentType in a mixed URL', () => {
      const { parseFiltersEntries } = mountComposable()
      const entries = parseFiltersEntries({
        'f[contentTypeCategory]': 'Documents',
        'f[contentType]': 'application/pdf'
      })

      expect(entries).toHaveLength(2)
      const filters = entries.map(entry => entry.filter)
      expect(filters).toContain('contentTypeCategory')
      expect(filters).toContain('contentType')

      const categoryEntry = entries.find(entry => entry.filter === 'contentTypeCategory')
      const typeEntry = entries.find(entry => entry.filter === 'contentType')
      expect(categoryEntry.value).toBe('Documents')
      expect(typeEntry.value).toBe('application/pdf')
    })
  })

  describe('clearEntry (removing chips from the breadcrumb)', () => {
    it('clears only the contentTypeCategory value when the category chip is removed', async () => {
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'Documents' })
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })

      const { clearEntry } = mountComposable()
      await clearEntry(null, { filter: 'contentTypeCategory', value: 'Documents' })

      expect(searchStore.getFilter({ name: 'contentTypeCategory' }).values).toEqual([])
      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
    })

    it('clears only the given contentType value when a type chip is removed', async () => {
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'Documents' })
      searchStore.addFilterValue({ name: 'contentType', value: ['application/pdf', 'image/png'] })

      const { clearEntry } = mountComposable()
      await clearEntry(null, { filter: 'contentType', value: 'application/pdf' })

      expect(searchStore.getFilter({ name: 'contentTypeCategory' }).values).toEqual(['Documents'])
      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['image/png'])
    })
  })

  describe('clearFiltersEntries / clearAll preserve locked values (icij/datashare#2330)', () => {
    let lockedFiltersStore

    beforeEach(() => {
      lockedFiltersStore = useLockedFiltersStore()
    })

    it('clearFiltersEntries removes an unlocked value but keeps a locked one', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentType', value: 'text/plain' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { clearFiltersEntries } = mountComposable()
      clearFiltersEntries()

      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
    })

    it('clearAll clears the query and unlocked values but keeps locked ones', () => {
      searchStore.setQuery('foo')
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentType', value: 'text/plain' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { clearAll } = mountComposable()
      clearAll()

      expect(searchStore.q).toBe('')
      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
    })

    it('does not flip an included lock into excluded mode when clearing while that filter is in exclude mode', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.excludeFilter('contentType')
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { clearFiltersEntries } = mountComposable()
      clearFiltersEntries()

      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
    })

    it('clearFiltersEntries removes everything when there are zero locks', () => {
      // Locks persist to localStorage (persist: true) across the jsdom-shared
      // localStorage instance, so a fresh pinia alone doesn't guarantee zero
      // locks here — clear explicitly.
      lockedFiltersStore.unlockAll()
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })

      const { clearFiltersEntries } = mountComposable()
      clearFiltersEntries()

      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual([])
    })
  })

  describe('unlockAll (icij/datashare#2330)', () => {
    let lockedFiltersStore

    beforeEach(() => {
      lockedFiltersStore = useLockedFiltersStore()
    })

    it('unlocks every locked value without touching the applied filter values', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { unlockAll } = mountComposable()
      unlockAll()

      expect(lockedFiltersStore.count).toBe(0)
      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
    })
  })

  describe('lockedFiltersCount (icij/datashare#2330)', () => {
    it('reflects the number of currently locked entries', () => {
      const lockedFiltersStore = useLockedFiltersStore()
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'text/plain', label: 'text/plain' })

      const { lockedFiltersCount } = mountComposable()

      expect(lockedFiltersCount.value).toBe(2)
    })
  })

  describe('hasConflictingLocks and applyLockedFilters (icij/datashare#2332)', () => {
    let lockedFiltersStore

    beforeEach(() => {
      lockedFiltersStore = useLockedFiltersStore()
      // Locks persist to localStorage (persist: true) across the jsdom-shared
      // localStorage instance, so a fresh pinia alone doesn't guarantee zero
      // locks here — clear explicitly.
      lockedFiltersStore.unlockAll()
    })

    it('reflects the store getter', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.excludeFilter('contentType')
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { hasConflictingLocks } = mountComposable()

      expect(hasConflictingLocks.value).toBe(true)
    })

    it('applies conflicting locks, refreshes the route, and toasts success', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.excludeFilter('contentType')
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { applyLockedFilters, wrapper } = mountComposable()
      vi.spyOn(wrapper.vm.$toast, 'success')
      vi.spyOn(wrapper.vm.$toast, 'error')

      await applyLockedFilters()

      expect(searchStore.getFilter({ name: 'contentType' }).values).toEqual(['application/pdf'])
      expect(searchStore.isFilterExcluded('contentType')).toBe(false)
      expect(wrapper.vm.$toast.success).toHaveBeenCalledOnce()
      expect(wrapper.vm.$toast.error).not.toHaveBeenCalled()
    })
  })
})
