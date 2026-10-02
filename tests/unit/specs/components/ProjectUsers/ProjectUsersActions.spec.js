import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'

describe('ProjectUsersActions.vue', () => {
  let core, global

  const user = { uid: 'alice@example.org', role: 'PROJECT_ADMIN' }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectUsersActions, {
      global,
      props: { user, ...props }
    })
  }

  // Removing someone from a project goes through the role dropdown (no role); deleting an account
  // lives in Settings > Users, so the only row action left here is copying the username.
  it('only renders a copy button', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('haptic-copy-stub')).toHaveLength(1)
    expect(wrapper.findAll('button-row-action-stub')).toHaveLength(0)
  })

  it('copy button is a haptic-copy configured to copy the user id', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('haptic-copy-stub').attributes('text')).toBe(user.uid)
  })
})
