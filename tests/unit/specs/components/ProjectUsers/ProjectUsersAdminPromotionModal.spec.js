import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import AppModal from '@/components/AppModal/AppModal.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'
import DisplayRole from '@/components/Display/DisplayRole.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'

describe('ProjectUsersAdminPromotionModal.vue', () => {
  let core, global

  const promotions = [
    { uid: 'alice@example.com', newRole: 'PROJECT_ADMIN' },
    { uid: 'bob@example.com', newRole: 'DOMAIN_ADMIN' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return mount(ProjectUsersAdminPromotionModal, {
      global: { ...global, stubs: { 'app-modal': { template: '<div><slot /></div>' } } },
      props: { modelValue: true, promotions, ...props }
    })
  }

  it('renders one display-user per promotion', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(DisplayUser)).toHaveLength(promotions.length)
  })

  it('renders one display-role per promotion', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAllComponents(DisplayRole)).toHaveLength(promotions.length)
  })

  it('passes each promotion uid to the corresponding display-user', () => {
    const wrapper = mountComponent()
    const values = wrapper.findAllComponents(DisplayUser).map(c => c.props('value'))
    expect(values).toEqual(promotions.map(p => p.uid))
  })

  it('emits confirm when the modal ok event fires', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(AppModal).vm.$emit('ok')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('closes the modal (sets modelValue to false) when ok fires', async () => {
    const wrapper = mountComponent()
    await wrapper.findComponent(AppModal).vm.$emit('ok')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
