import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'
import { useLockedFiltersStore } from '@/store/modules'

describe('SearchBreadcrumbUri.vue', () => {
  let core, global, wrapper

  beforeEach(async () => {
    core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
    // CoreSetup falls back to the app's singleton pinia (with the locked
    // filters store's `persist: true`), so entries otherwise leak across
    // tests in this file.
    useLockedFiltersStore().unlockAll()
  })

  describe('a boolean query on one index', () => {
    beforeEach(() => {
      const uri = '/?q=foo%20AND%20bar&from=0&size=25&sort=relevance&index=project&custom=baz'
      const props = { uri }
      wrapper = mount(SearchBreadcrumbUri, { global, props })
    })

    it('should parse all fields from the URI', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries).toHaveLength(2)
    })

    it('should parse the index and show it first', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(0).props('filter')).toBe('project')
    })

    it('should parse the query and show it second', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(1).props('filter')).toBeUndefined()
      expect(entries.at(1).props('query')).toBe('foo AND bar')
    })
  })

  describe('a simple query on two indices', () => {
    beforeEach(() => {
      const uri = '/?q=foo&from=0&size=25&index=banana,apple'
      const props = { uri }
      wrapper = mount(SearchBreadcrumbUri, { global, props })
    })

    it('should parse all fields from the URI', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries).toHaveLength(3)
    })

    it('should parse the "banana" index and show it first', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(0).props('filter')).toBe('project')
      expect(entries.at(0).props('value')).toBe('banana')
    })

    it('should parse the "apple" index and show it second', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(1).props('filter')).toBe('project')
      expect(entries.at(1).props('value')).toBe('apple')
    })

    it('should parse the query and show it third', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(2).props('filter')).toBeUndefined()
      expect(entries.at(2).props('query')).toBe('foo')
    })
  })

  describe('a simple query on two indices with a filter on contentType', () => {
    beforeEach(() => {
      const uri = '/?q=foo&from=0&size=25&index=banana,apple&f[contentType]=application/pdf'
      const props = { uri }
      wrapper = mount(SearchBreadcrumbUri, { global, props })
    })

    it('should parse all fields from the URI', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries).toHaveLength(4)
    })

    it('should parse the "banana" index and show it first', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(0).props('filter')).toBe('project')
      expect(entries.at(0).props('value')).toBe('banana')
    })

    it('should parse the "apple" index and show it second', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(1).props('filter')).toBe('project')
      expect(entries.at(1).props('value')).toBe('apple')
    })

    it('should parse the query and show it third', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(2).props('filter')).toBeUndefined()
      expect(entries.at(2).props('query')).toBe('foo')
    })

    it('should parse the content type filter and show it last', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(3).props('filter')).toBe('contentType')
      expect(entries.at(3).props('value')).toBe('application/pdf')
    })
  })

  describe('a simple query on one index with 2 filters on contentType', () => {
    beforeEach(() => {
      const uri = '/?q=bar&index=cherry&f[contentType]=application/pdf&f[contentType]=image/png'
      const props = { uri }
      wrapper = mount(SearchBreadcrumbUri, { global, props })
    })

    it('should parse all fields from the URI', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries).toHaveLength(4)
    })

    it('should parse the "cherry" index and show it first', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(0).props('filter')).toBe('project')
      expect(entries.at(0).props('value')).toBe('cherry')
    })

    it('should parse the query and show it second', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(1).props('filter')).toBeUndefined()
      expect(entries.at(1).props('query')).toBe('bar')
    })

    it('should parse the content type filter and show it third for PDF', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(2).props('filter')).toBe('contentType')
      expect(entries.at(2).props('value')).toBe('application/pdf')
    })

    it('should parse the content type filter and show it fourth for PNG', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      expect(entries.at(3).props('filter')).toBe('contentType')
      expect(entries.at(3).props('value')).toBe('image/png')
    })
  })

  describe('with a locked filter value not present in the URI', () => {
    beforeEach(() => {
      useLockedFiltersStore().lock({ name: 'language', value: 'ENGLISH', label: 'ENGLISH' })
      const uri = '/?q=foo&from=0&size=25&index=cherry'
      const props = { uri }
      wrapper = mount(SearchBreadcrumbUri, { global, props })
    })

    it('should not render the locked value as a chip', () => {
      const entries = wrapper.findAllComponents(SearchBreadcrumbFormEntry)
      const languageEntries = entries.filter(entry => entry.props('filter') === 'language')
      expect(languageEntries).toHaveLength(0)
    })
  })
})
