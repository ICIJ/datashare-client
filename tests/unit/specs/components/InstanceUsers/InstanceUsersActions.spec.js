import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import ButtonRowActionRoles from '@/components/Button/ButtonRowAction/ButtonRowActionRoles.vue'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'

describe('InstanceUsersActions.vue', () => {
  let global

  const user = { uid: 'alice@example.org', name: 'Alice', email: 'alice@example.org' }

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function mountComponent(props = {}) {
    return shallowMount(InstanceUsersActions, {
      global,
      props: { user, canManageAccount: true, ...props }
    })
  }

  it('disables the delete action for the viewer\'s own account', () => {
    const wrapper = mountComponent({ isCurrentUser: true })
    expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBeDefined()
  })

  it('does not disable the delete action for another user', () => {
    const wrapper = mountComponent({ isCurrentUser: false })
    expect(wrapper.findComponent(ButtonRowActionDelete).attributes('disabled')).toBe('false')
  })

  it('only shows the manage-roles action when the viewer cannot manage accounts', () => {
    const wrapper = mountComponent({ canManageAccount: false })
    expect(wrapper.findComponent(ButtonRowActionRoles).exists()).toBe(true)
    expect(wrapper.findComponent(ButtonRowActionEdit).exists()).toBe(false)
    expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(false)
  })

  // The modals live on the users page, which opens them from the URL.
  it.each([
    ['manage', ButtonRowActionRoles],
    ['edit', ButtonRowActionEdit],
    ['delete', ButtonRowActionDelete]
  ])('asks to open the %s modal for its user when its row action is clicked', async (action, button) => {
    const wrapper = mountComponent()
    await wrapper.findComponent(button).vm.$emit('click')
    expect(wrapper.emitted('open')).toEqual([[{ action, uid: user.uid }]])
  })
})
