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

    it('does not nest the lock icon inside a `role="button"` ancestor, which would hide its own aria attributes', () => {
      const props = { term: 'foo', locked: false, lockLabel: 'Lock' }
      const wrapper = mount(SearchParameterQueryTerm, { global, props })

      const lock = wrapper.find('.search-parameter-query-term__lock')
      expect(lock.attributes('aria-label')).toBe('Lock')
      expect(lock.element.parentElement.closest('[role="button"]')).toBeNull()
    })
  })

  describe('a chip with no lock icon (icij/datashare#2332)', () => {
    it('stays a native, keyboard-focusable <button> when a click listener is attached', () => {
      // `locked` never reaches a query chip (SearchParameter's
      // queryComponentProps doesn't forward it), so it's always null there -
      // DocumentGlobalSearchTermsEntry's clickable term chips need to stay
      // real buttons anyway, since a real onClick listener is attached.
      const props = { term: 'foo' }
      const wrapper = mount(SearchParameterQueryTerm, { global, props, attrs: { onClick: vi.fn() } })

      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.attributes('role')).not.toBe('presentation')
    })

    it('is not a focusable <button> when it renders read-only, with no click listener attached', () => {
      // A read-only breadcrumb display (saved search, batch search preview)
      // passes neither `locked` nor a click listener - it must not end up as
      // a focusable button with nothing behind it to activate.
      const props = { term: 'foo' }
      const wrapper = mount(SearchParameterQueryTerm, { global, props })

      expect(wrapper.element.tagName).not.toBe('BUTTON')
      expect(wrapper.attributes('role')).toBe('presentation')
    })
  })
})
