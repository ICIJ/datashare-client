import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

describe('FiltersPanelSectionFilterEntry.vue', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  function findLockButton(wrapper) {
    return wrapper.find('.filters-panel-section-filter-entry__lock')
  }

  it('does not render a lock button when the row is unticked', () => {
    const props = { label: 'Confidential', modelValue: false, locked: false }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    expect(findLockButton(wrapper).exists()).toBe(false)
  })

  it('renders an unlocked lock button when the row is ticked', () => {
    const props = { label: 'Confidential', modelValue: true, locked: false }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    const button = findLockButton(wrapper)
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-pressed')).toBe('false')
  })

  it('renders a locked lock button when the row is ticked and locked', () => {
    const props = { label: 'Confidential', modelValue: true, locked: true }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    const button = findLockButton(wrapper)
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('emits update:locked with true when clicking an unlocked button', async () => {
    const props = { label: 'Confidential', modelValue: true, locked: false }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    await findLockButton(wrapper).trigger('click')
    expect(wrapper.emitted('update:locked')).toEqual([[true]])
  })

  it('emits update:locked with false when clicking a locked button', async () => {
    const props = { label: 'Confidential', modelValue: true, locked: true }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    await findLockButton(wrapper).trigger('click')
    expect(wrapper.emitted('update:locked')).toEqual([[false]])
  })

  it('hides the count badge while the row is locked', () => {
    const props = { label: 'Confidential', modelValue: true, locked: true, count: 5 }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    expect(wrapper.find('.filters-panel-section-filter-entry__count').exists()).toBe(false)
  })

  it('shows the count badge while ticked but not locked', () => {
    const props = { label: 'Confidential', modelValue: true, locked: false, count: 5 }
    const wrapper = mount(FiltersPanelSectionFilterEntry, { global, props })
    expect(wrapper.find('.filters-panel-section-filter-entry__count').exists()).toBe(true)
  })
})
