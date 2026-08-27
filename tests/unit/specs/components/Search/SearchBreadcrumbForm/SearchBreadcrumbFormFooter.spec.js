import { mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchBreadcrumbFormFooter from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormFooter'

describe('SearchBreadcrumbFormFooter', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountFooter(props = {}) {
    return mount(SearchBreadcrumbFormFooter, { global: { plugins }, props })
  }

  function findButton(wrapper, label) {
    return wrapper.findAllComponents(ButtonIcon).find(button => button.text().includes(label))
  }

  it('shows "Clear locks" disabled when there are no locked filters, so its position never shifts', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 0 })

    expect(findButton(wrapper, 'Clear locks').find('button').element.disabled).toBe(true)
  })

  it('does not show a "0" badge on "Clear locks" when there are no locked filters', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 0 })

    expect(findButton(wrapper, 'Clear locks').props('counter')).toBeNull()
  })

  it('renders "Clear locks" with the current lock count as a badge', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 3 })

    const unlockButton = findButton(wrapper, 'Clear locks')
    expect(unlockButton.props('counter')).toBe(3)
  })

  it('enables "Clear locks" when locked filters exist', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 2 })

    expect(findButton(wrapper, 'Clear locks').find('button').element.disabled).toBe(false)
  })

  it('emits unlock:all when the button is clicked', async () => {
    const wrapper = mountFooter({ lockedFiltersCount: 2 })

    await findButton(wrapper, 'Clear locks').trigger('click')

    expect(wrapper.emitted('unlock:all')).toHaveLength(1)
  })

  describe('Apply locked filters (icij/datashare#2332)', () => {
    it('shows "Apply locked filters" alongside "Clear locks" when locks conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      expect(wrapper.text()).toContain('Apply locked filters')
      expect(wrapper.text()).toContain('Clear locks')
    })

    it('places "Apply locked filters" before "Clear locks"', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      const buttons = wrapper.findAllComponents(ButtonIcon)
      const labels = buttons.map(button => button.text())
      const applyIndex = labels.findIndex(label => label.includes('Apply locked filters'))
      const unlockIndex = labels.findIndex(label => label.includes('Clear locks'))
      expect(applyIndex).toBeLessThan(unlockIndex)
    })

    it('enables "Apply locked filters" while a lock conflicts', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      expect(findButton(wrapper, 'Apply locked filters').find('button').element.disabled).toBe(false)
    })

    it('shows "Apply locked filters" always, even with no locks, so its position never shifts', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 0, hasConflictingLocks: false })

      expect(findButton(wrapper, 'Apply locked filters')).toBeTruthy()
    })

    it('disables "Apply locked filters" when locks exist but none conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 2, hasConflictingLocks: false })

      expect(findButton(wrapper, 'Apply locked filters').find('button').element.disabled).toBe(true)
    })

    it('disables "Apply locked filters" when there are no locks at all', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 0, hasConflictingLocks: false })

      expect(findButton(wrapper, 'Apply locked filters').find('button').element.disabled).toBe(true)
    })

    // A disabled native <button> never fires mouse events, so a tooltip
    // targeting the button itself never shows while disabled - the one time
    // it's actually needed. The `title` lives on the wrapping span instead,
    // which browsers show on hover regardless of the child's disabled state.
    it('tooltips "All locked filters are already applied" when locks exist but none conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 2, hasConflictingLocks: false })

      const span = wrapper.find('span.d-inline-block')
      expect(span.attributes('title')).toBe('All locked filters are already applied')
    })

    it('tooltips "No locks to apply" when there are no locks at all', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 0, hasConflictingLocks: false })

      const span = wrapper.find('span.d-inline-block')
      expect(span.attributes('title')).toBe('No locks to apply')
    })

    it('has no title tooltip on the wrapping span while "Apply locked filters" is enabled', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      const span = wrapper.find('span.d-inline-block')
      expect(span.attributes('title')).toBeUndefined()
    })

    it('emits apply:locked-filters when the enabled button is clicked', async () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      await findButton(wrapper, 'Apply locked filters').trigger('click')

      expect(wrapper.emitted('apply:locked-filters')).toHaveLength(1)
    })
  })
})
