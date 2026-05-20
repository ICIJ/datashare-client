import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'

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

  it('renders a FormControlSearch input', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users } })
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })

  it('filters rows by name (case-insensitive substring)', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users } })
    await wrapper.findComponent(FormControlSearch).setValue('alice')
    expect(wrapper.findAll('tr')).toHaveLength(1)
    expect(wrapper.find('tr td').text()).toBe('Alice Martin')
  })

  it('shows EmptyState with noResults label when query matches nothing', async () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users } })
    await wrapper.findComponent(FormControlSearch).setValue('zzz')
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.findComponent(EmptyState).props('label')).toContain('match')
  })

  it('shows FormControlSearch even when users list is empty', () => {
    const wrapper = shallowMount(ProjectUsersList, { global, props: { users: [] } })
    expect(wrapper.findComponent(FormControlSearch).exists()).toBe(true)
  })
})
