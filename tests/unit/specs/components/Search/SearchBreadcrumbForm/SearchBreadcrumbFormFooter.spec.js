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

  it('renders "Unlock filters (N)" with the current lock count', () => {
    const wrapper = mountFooter({ lockedFiltersCount: 3 })

    expect(wrapper.text()).toContain('Unlock filters (3)')
  })

  it('emits unlock:all when the button is clicked', async () => {
    const wrapper = mountFooter({ lockedFiltersCount: 2 })

    const buttons = wrapper.findAllComponents(ButtonIcon)
    const unlockButton = buttons.find(button => button.text().includes('Unlock filters'))
    await unlockButton.trigger('click')

    expect(wrapper.emitted('unlock:all')).toHaveLength(1)
  })

  describe('Apply locked filters (icij/datashare#2332)', () => {
    it('shows "Apply locked filters" instead of "Unlock filters" when locks conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      expect(wrapper.text()).toContain('Apply locked filters')
      expect(wrapper.text()).not.toContain('Unlock filters')
    })

    it('shows "Unlock filters (N)" when locks exist and none conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 2, hasConflictingLocks: false })

      expect(wrapper.text()).toContain('Unlock filters (2)')
      expect(wrapper.text()).not.toContain('Apply locked filters')
    })

    it('shows neither button when there are no locks and none conflict', () => {
      const wrapper = mountFooter({ lockedFiltersCount: 0, hasConflictingLocks: false })

      expect(wrapper.text()).not.toContain('Unlock filters')
      expect(wrapper.text()).not.toContain('Apply locked filters')
    })

    it('emits apply:locked-filters when the button is clicked', async () => {
      const wrapper = mountFooter({ lockedFiltersCount: 1, hasConflictingLocks: true })

      const buttons = wrapper.findAllComponents(ButtonIcon)
      const applyButton = buttons.find(button => button.text().includes('Apply locked filters'))
      await applyButton.trigger('click')

      expect(wrapper.emitted('apply:locked-filters')).toHaveLength(1)
    })
  })
})
