import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import { useLockedFiltersStore } from '@/store/modules'

describe('SearchBreadcrumbFormEntry.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
    // CoreSetup falls back to the app's singleton pinia (with the locked
    // filters store's `persist: true`), so entries otherwise leak across
    // tests in this file — reset before each test, same pattern as the
    // explicit searchStore resets in FilterType.spec.js.
    useLockedFiltersStore().unlockAll()
  })

  describe('operator prop', () => {
    it('hides the operator badge by default', () => {
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(wrapper.find('.search-parameter-query-term__operator').exists()).toBe(false)
    })

    it('renders the OR badge inside the chip when operator is "OR"', () => {
      const props = { filter: 'contentType', value: 'application/pdf', operator: 'OR' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      const badge = wrapper.find('.search-parameter-query-term__operator')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('OR')
    })

    it('renders the AND badge inside the chip when operator is "AND"', () => {
      const props = { filter: 'contentType', value: 'application/pdf', operator: 'AND' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      const badge = wrapper.find('.search-parameter-query-term__operator')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('AND')
    })
  })

  describe('lock button', () => {
    function findLockButton(wrapper) {
      return wrapper.find('.search-breadcrumb-form-entry__lock')
    }

    it('renders an unlocked lock button for a filter chip', () => {
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      const button = findLockButton(wrapper)
      expect(button.exists()).toBe(true)
      expect(button.attributes('aria-pressed')).toBe('false')
    })

    it('does not render a lock button for a free-text query chip', () => {
      const props = { query: 'foo' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(findLockButton(wrapper).exists()).toBe(false)
    })

    it('does not render a lock button for a project chip', () => {
      const props = { filter: 'project', value: 'my-project' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(findLockButton(wrapper).exists()).toBe(false)
    })

    it('renders a locked lock button when the value is already locked', () => {
      const lockedFiltersStore = useLockedFiltersStore()
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(findLockButton(wrapper).attributes('aria-pressed')).toBe('true')
    })

    it('locks the excluded-mode name when the chip is in exclude mode', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      const props = { filter: '-contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(findLockButton(wrapper).attributes('aria-pressed')).toBe('false')

      await findLockButton(wrapper).trigger('click')

      expect(lockedFiltersStore.isLocked({ name: '-contentType', value: 'application/pdf' })).toBe(true)
      expect(lockedFiltersStore.isLocked({ name: 'contentType', value: 'application/pdf' })).toBe(false)
    })

    it('locks the value in the lock store when clicking an unlocked button', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })

      await findLockButton(wrapper).trigger('click')

      expect(lockedFiltersStore.isLocked({ name: 'contentType', value: 'application/pdf' })).toBe(true)
    })

    it('unlocks the value in the lock store when clicking a locked button', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })

      await findLockButton(wrapper).trigger('click')

      expect(lockedFiltersStore.isLocked({ name: 'contentType', value: 'application/pdf' })).toBe(false)
    })

    it('applies a locked visual class to a locked chip', () => {
      const lockedFiltersStore = useLockedFiltersStore()
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(wrapper.classes()).toContain('search-breadcrumb-form-entry--locked')
    })

    it('does not apply the locked visual class to an unlocked chip', () => {
      const props = { filter: 'contentType', value: 'application/pdf' }
      const wrapper = mount(SearchBreadcrumbFormEntry, { global, props })
      expect(wrapper.classes()).not.toContain('search-breadcrumb-form-entry--locked')
    })
  })
})
