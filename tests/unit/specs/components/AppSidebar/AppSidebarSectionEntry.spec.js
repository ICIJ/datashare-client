import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppSidebarSectionEntry from '@/components/AppSidebar/AppSidebarSectionEntry'

// Regression guard for the hover/focus preload added to primary nav links
// (todo.md §3 "Preload search route chunks on hover/intent"). Uses a
// throwaway route with a spy loader instead of the real search route, so
// this stays a fast, deterministic unit test rather than paying for a real
// chunk transform.
describe('AppSidebarSectionEntry', () => {
  const loader = vi.fn(() => Promise.resolve({ default: { template: '<div/>' } }))
  const routes = [
    { path: '/', name: 'home', component: { template: '<div/>' } },
    { path: '/lazy', name: 'lazy', component: loader },
    { path: '/lazy-action', name: 'lazy-action', component: loader }
  ]
  const core = CoreSetup.init().useAll().useRouter(routes)
  const global = { plugins: core.plugins }

  beforeEach(() => {
    loader.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not preload before any interaction', () => {
    mount(AppSidebarSectionEntry, { global, props: { to: { name: 'lazy' } } })
    vi.runAllTimers()
    expect(loader).not.toHaveBeenCalled()
  })

  it('does not preload immediately on mouseenter', async () => {
    const wrapper = mount(AppSidebarSectionEntry, { global, props: { to: { name: 'lazy' } } })
    await wrapper.get('.app-sidebar-section-entry__link').trigger('mouseenter')
    expect(loader).not.toHaveBeenCalled()
  })

  it('preloads the target route chunk once the hover settles', async () => {
    const wrapper = mount(AppSidebarSectionEntry, { global, props: { to: { name: 'lazy' } } })
    await wrapper.get('.app-sidebar-section-entry__link').trigger('mouseenter')
    vi.runAllTimers()
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('cancels the pending preload on mouseleave', async () => {
    const wrapper = mount(AppSidebarSectionEntry, { global, props: { to: { name: 'lazy' } } })
    const link = wrapper.get('.app-sidebar-section-entry__link')
    await link.trigger('mouseenter')
    await link.trigger('mouseleave')
    vi.runAllTimers()
    expect(loader).not.toHaveBeenCalled()
  })

  it('cancels the pending preload on blur', async () => {
    const wrapper = mount(AppSidebarSectionEntry, { global, props: { to: { name: 'lazy' } } })
    const link = wrapper.get('.app-sidebar-section-entry__link')
    await link.trigger('focus')
    await link.trigger('blur')
    vi.runAllTimers()
    expect(loader).not.toHaveBeenCalled()
  })

  it('preloads the action link target separately', async () => {
    const wrapper = mount(AppSidebarSectionEntry, {
      global,
      props: { to: { name: 'home' }, actionTo: { name: 'lazy-action' }, actionTitle: 'Add' }
    })
    await wrapper.get('.app-sidebar-section-entry__action').trigger('mouseenter')
    vi.runAllTimers()
    expect(loader).toHaveBeenCalledTimes(1)
  })
})
