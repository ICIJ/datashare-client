import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useSearchStore } from '@/store/modules'

describe('useSearchBreadcrumb composable', () => {
  let core, plugins, searchStore

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
    mount(TestComponent, { global: { plugins } })
    return result
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
})
