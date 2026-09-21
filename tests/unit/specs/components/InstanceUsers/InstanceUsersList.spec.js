import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'
import InstanceUsersList from '@/components/InstanceUsers/InstanceUsersList.vue'
import InstanceUsersRoleBadges from '@/components/InstanceUsers/InstanceUsersRoleBadges.vue'

describe('InstanceUsersList.vue', () => {
  let core, global

  function makeUsers() {
    return [
      { uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', permissions: [] },
      { uid: 'bob@example.org', name: 'Bob B', email: 'bob@example.org', permissions: [] }
    ]
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins, renderStubDefaultSlot: true, stubs: { PageTableGeneric: false } }
  })

  function mountComponent(props = {}) {
    return shallowMount(InstanceUsersList, {
      global,
      props: { users: makeUsers(), ...props }
    })
  }

  it('shows the empty label when there are no users and no search query', () => {
    const wrapper = mountComponent({ users: [], query: '' })
    expect(wrapper.text()).toContain(core.i18n.global.t('settings.users.empty'))
  })

  it('shows the no-results label when there are no users and a search query is set', () => {
    const wrapper = mountComponent({ users: [], query: 'zzz' })
    expect(wrapper.text()).toContain(core.i18n.global.t('settings.users.noResults'))
  })

  it('does not show an empty label when users are present', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).not.toContain(core.i18n.global.t('settings.users.empty'))
  })

  it('renders a row per user', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('page-table-tr-stub')).toHaveLength(2)
  })

  it('passes no role badges when the user has no permissions', () => {
    const wrapper = mountComponent({
      users: [{ uid: 'alice@example.org', name: 'Alice A', email: 'alice@example.org', permissions: [] }]
    })
    expect(wrapper.findComponent(InstanceUsersRoleBadges).props('roles')).toEqual([])
  })

  it('builds one badge per grant instead of grouping by role tier', () => {
    const wrapper = mountComponent({
      users: [
        {
          uid: 'alice@example.org',
          name: 'Alice A',
          email: 'alice@example.org',
          permissions: [
            { v1: 'INSTANCE_ADMIN', v2: '*::*' },
            { v1: 'PROJECT_ADMIN', v2: 'default::project-a' },
            { v1: 'PROJECT_ADMIN', v2: 'default::project-b' }
          ]
        }
      ]
    })
    expect(wrapper.findComponent(InstanceUsersRoleBadges).props('roles')).toEqual([
      { role: 'INSTANCE_ADMIN', project: null },
      { role: 'PROJECT_ADMIN', project: 'project-a' },
      { role: 'PROJECT_ADMIN', project: 'project-b' }
    ])
  })

  it('badges a domain admin grant like instance admin, with no project', () => {
    const wrapper = mountComponent({
      users: [
        {
          uid: 'alice@example.org',
          name: 'Alice A',
          email: 'alice@example.org',
          permissions: [
            { v1: 'DOMAIN_ADMIN', v2: 'default::*' },
            { v1: 'PROJECT_ADMIN', v2: 'default::project-a' }
          ]
        }
      ]
    })
    expect(wrapper.findComponent(InstanceUsersRoleBadges).props('roles')).toEqual([
      { role: 'DOMAIN_ADMIN', project: null },
      { role: 'PROJECT_ADMIN', project: 'project-a' }
    ])
  })

  it('sorts badges by role rank, highest first', () => {
    const wrapper = mountComponent({
      users: [
        {
          uid: 'alice@example.org',
          name: 'Alice A',
          email: 'alice@example.org',
          permissions: [
            { v1: 'PROJECT_MEMBER', v2: 'default::project-a' },
            { v1: 'INSTANCE_ADMIN', v2: '*::*' },
            { v1: 'PROJECT_ADMIN', v2: 'default::project-b' }
          ]
        }
      ]
    })
    expect(wrapper.findComponent(InstanceUsersRoleBadges).props('roles').map(({ role }) => role)).toEqual([
      'INSTANCE_ADMIN',
      'PROJECT_ADMIN',
      'PROJECT_MEMBER'
    ])
  })

  it('forwards user:updated from a row action up to its own listeners', () => {
    const wrapper = mountComponent()
    wrapper.findComponent(InstanceUsersActions).vm.$emit('user:updated', { uid: 'alice@example.org' })
    expect(wrapper.emitted('user:updated')).toEqual([[{ uid: 'alice@example.org' }]])
  })

  it('forwards user:deleted from a row action up to its own listeners', () => {
    const wrapper = mountComponent()
    wrapper.findComponent(InstanceUsersActions).vm.$emit('user:deleted', { uid: 'alice@example.org' })
    expect(wrapper.emitted('user:deleted')).toEqual([[{ uid: 'alice@example.org' }]])
  })
})
