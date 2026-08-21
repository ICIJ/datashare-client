import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchParameterQueryTerm from '@/components/Search/SearchParameter/SearchParameterQueryTerm'

describe('SearchParameterQueryTerm.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  describe('lock icon keyboard reachability', () => {
    it('does not nest the lock icon inside a native <button>, so it stays in the tab order', () => {
      const props = { term: 'foo', locked: false, lockLabel: 'Lock' }
      const wrapper = mount(SearchParameterQueryTerm, { global, props })

      const lock = wrapper.find('.search-parameter-query-term__lock')
      expect(lock.exists()).toBe(true)
      // A native <button> ancestor excludes focusable descendants from the
      // tab order regardless of their own tabindex — the chip's root must
      // not render as one.
      expect(wrapper.element.tagName).not.toBe('BUTTON')
    })

    it('emits click:lock when the lock icon is activated', async () => {
      const props = { term: 'foo', locked: false, lockLabel: 'Lock' }
      const wrapper = mount(SearchParameterQueryTerm, { global, props })

      await wrapper.find('.search-parameter-query-term__lock').trigger('click')

      expect(wrapper.emitted('click:lock')).toHaveLength(1)
    })
  })
})
