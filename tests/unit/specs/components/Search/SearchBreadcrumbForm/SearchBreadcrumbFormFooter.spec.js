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

  it('does not render the "Unlock filters" button when there are no locked filters', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 0 })

    expect(wrapper.text()).not.toContain('Unlock filters')
  })

  it('renders "Unlock filters" with the current lock count as a badge', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 3 })

    const unlockButton = wrapper.findAllComponents(ButtonIcon).find(button => button.text().includes('Unlock filters'))
    expect(unlockButton.props('counter')).toBe(3)
  })

  it('emits unlock:all when the button is clicked', async () => {
    const wrapper = mountFooter({ lockedFiltersCount: 2 })

    const buttons = wrapper.findAllComponents(ButtonIcon)
    const unlockButton = buttons.find(button => button.text().includes('Unlock filters'))
    await unlockButton.trigger('click')

    expect(wrapper.emitted('unlock:all')).toHaveLength(1)
  })

  describe('Apply locked filters (icij/datashare#2332)', () => {
    function findButton(wrapper, label) {
      return wrapper.findAllComponents(ButtonIcon).find(button => button.text().includes(label))
    }

    it('shows "Apply locked filters" alongside "Unlock filters" when locks conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      expect(wrapper.text()).toContain('Apply locked filters')
      expect(wrapper.text()).toContain('Unlock filters')
    })

    it('places "Apply locked filters" before "Unlock filters"', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      const buttons = wrapper.findAllComponents(ButtonIcon)
      const labels = buttons.map(button => button.text())
      const applyIndex = labels.findIndex(label => label.includes('Apply locked filters'))
      const unlockIndex = labels.findIndex(label => label.includes('Unlock filters'))
      expect(applyIndex).toBeLessThan(unlockIndex)
    })

    it('enables "Apply locked filters" while a lock conflicts', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      expect(findButton(wrapper, 'Apply locked filters').find('button').element.disabled).toBe(false)
    })

    it('shows "Apply locked filters" disabled when locks exist but none conflict, so the pair holds a stable position', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 2, hasConflictingLocks: false })

      const applyButton = findButton(wrapper, 'Apply locked filters')
      expect(applyButton).toBeTruthy()
      expect(applyButton.find('button').element.disabled).toBe(true)
    })

    it('shows neither button when there are no locks at all', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 0, hasConflictingLocks: false })

      expect(wrapper.text()).not.toContain('Unlock filters')
      expect(wrapper.text()).not.toContain('Apply locked filters')
    })

    it('emits apply:locked-filters when the enabled button is clicked', async () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      await findButton(wrapper, 'Apply locked filters').trigger('click')

      expect(wrapper.emitted('apply:locked-filters')).toHaveLength(1)
    })
  })
})
