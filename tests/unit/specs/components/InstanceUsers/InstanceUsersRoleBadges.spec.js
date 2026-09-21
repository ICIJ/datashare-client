import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import InstanceUsersRoleBadges from '@/components/InstanceUsers/InstanceUsersRoleBadges.vue'

describe('InstanceUsersRoleBadges.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(InstanceUsersRoleBadges, { global, props })
  }

  it('shows a dash when there are no roles', () => {
    const wrapper = mountComponent({ roles: [] })
    expect(wrapper.text()).toContain('-')
  })

  it('renders one badge per role, passed through as-is', () => {
    const wrapper = mountComponent({
      roles: [
        { role: 'INSTANCE_ADMIN', project: null },
        { role: 'PROJECT_ADMIN', project: 'nairobi-papers' }
      ]
    })
    const badges = wrapper.findAllComponents(InstanceUsersRoleBadge)
    expect(badges).toHaveLength(2)
    expect(badges.map(b => b.props())).toEqual([
      { role: 'INSTANCE_ADMIN', project: null },
      { role: 'PROJECT_ADMIN', project: 'nairobi-papers' }
    ])
  })

  it('does not show a "more" toggle when there are 3 or fewer roles', () => {
    const wrapper = mountComponent({
      roles: [
        { role: 'PROJECT_ADMIN', project: 'a' },
        { role: 'PROJECT_EDITOR', project: 'b' },
        { role: 'PROJECT_MEMBER', project: 'c' }
      ]
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('collapses roles beyond the limit behind a "+N more" toggle that expands on click', async () => {
    const wrapper = mountComponent({
      roles: [
        { role: 'PROJECT_ADMIN', project: 'a' },
        { role: 'PROJECT_ADMIN', project: 'b' },
        { role: 'PROJECT_EDITOR', project: 'c' },
        { role: 'PROJECT_MEMBER', project: 'd' }
      ]
    })
    expect(wrapper.findAllComponents(InstanceUsersRoleBadge)).toHaveLength(3)
    expect(wrapper.text()).toContain('+1 more')

    await wrapper.find('button').trigger('click')

    expect(wrapper.findAllComponents(InstanceUsersRoleBadge)).toHaveLength(4)
    expect(wrapper.text()).toContain('Show less')
  })
})
