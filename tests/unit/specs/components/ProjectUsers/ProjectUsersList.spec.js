import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'

describe('ProjectUsersList.vue', () => {
  let core, global

  const users = [
    { name: 'Alice Martin', role: 'INSTANCE_ADMIN' },
    { name: 'Bob Chen', role: 'DOMAIN_ADMIN' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  it('shows EmptyState when users is empty', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users: [] } })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  it('does not show EmptyState when users are present', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users } })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })

  it('renders a row for each user', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users } })
    expect(wrapper.findAll('tr')).toHaveLength(users.length)
  })
})
