import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'

describe('SearchBreadcrumbFormEntry.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
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
})
