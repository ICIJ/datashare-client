import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import ButtonToggleLock from '@/components/Button/ButtonToggleLock'

describe('PathTreeViewEntry.vue (locked filters, icij/datashare#2336)', () => {
  const core = CoreSetup.init().useAll()

  function mountEntry(provide = {}, props = {}) {
    return mount(PathTreeViewEntry, {
      props: {
        name: 'foo',
        path: '/data/foo',
        noStats: true,
        ...props
      },
      global: { plugins: core.plugins, provide }
    })
  }

  it('does not render a lock button when no lock context is provided (every non-FilterTypePath consumer)', () => {
    const wrapper = mountEntry(undefined, { selected: true })
    expect(wrapper.findComponent(ButtonToggleLock).exists()).toBe(false)
  })

  it('renders a lock button on an unselected row when pathLockable is provided (hover-revealed via CSS)', () => {
    const wrapper = mountEntry({ pathLockable: true }, { selected: false })
    expect(wrapper.findComponent(ButtonToggleLock).exists()).toBe(true)
  })

  it('renders a lock button on a selected row when pathLockable is provided', () => {
    const wrapper = mountEntry({ pathLockable: true }, { selected: true })
    expect(wrapper.findComponent(ButtonToggleLock).exists()).toBe(true)
  })

  it('reflects isPathLocked for this entry\'s own path', () => {
    const wrapper = mountEntry({
      pathLockable: true,
      isPathLocked: path => path === '/data/foo'
    }, { selected: true })
    expect(wrapper.findComponent(ButtonToggleLock).props('locked')).toBe(true)
  })

  it('calls toggleLockPath with this entry\'s own path when the lock button is clicked', async () => {
    const toggleLockPath = vi.fn()
    const wrapper = mountEntry({ pathLockable: true, toggleLockPath }, { selected: true })

    await wrapper.findComponent(ButtonToggleLock).vm.$emit('update:locked', true)

    expect(toggleLockPath).toHaveBeenCalledWith('/data/foo', true)
  })

  // Regression: same stretched-link overlay issue as PathTreeViewEntryName's
  // caret (see that component's own spec) — the lock button sits in the same
  // position:relative ancestor, so a real click on it could be swallowed by
  // the row's stretched-link and mistaken for a click-to-expand instead of
  // reaching the button. Confirmed live via Chrome automation: clicking the
  // lock icon on both an expanded and a collapsed selected row toggled the
  // lock without changing the collapse state either way.
  it('keeps the lock button above the stretched-link overlay stack', () => {
    const wrapper = mountEntry({ pathLockable: true }, { selected: true })
    expect(wrapper.findComponent(ButtonToggleLock).classes()).toContain('above-stretched-link')
  })
})
