import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayRole from '@/components/Display/DisplayRole.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import ProjectRoleThumbnail from '@/components/Project/ProjectRoleThumbnail.vue'

describe('InstanceUsersRoleBadge.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(InstanceUsersRoleBadge, { global, props })
  }

  it('shows the role label with its icon when there is no project, for instance-wide roles', () => {
    const wrapper = mountComponent({ role: 'INSTANCE_ADMIN', project: null })
    expect(wrapper.findComponent(DisplayRole).props()).toMatchObject({ value: 'INSTANCE_ADMIN', noIcon: false })
    expect(wrapper.findComponent(ProjectRoleThumbnail).exists()).toBe(false)
  })

  it('shows the project thumbnail and name instead of the role label when a project is set', () => {
    const wrapper = mountComponent({ role: 'PROJECT_ADMIN', project: 'nairobi-papers' })
    expect(wrapper.findComponent(DisplayRole).exists()).toBe(false)
    expect(wrapper.findComponent(ProjectRoleThumbnail).props()).toMatchObject({
      project: 'nairobi-papers',
      role: 'PROJECT_ADMIN'
    })
    expect(wrapper.text()).toContain('nairobi-papers')
  })
})
