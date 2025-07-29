import { shallowMount } from '@vue/test-utils'

import TaskActions from '@/components/Task/TaskActions'
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: key => key
  })
}))
describe('Task Actions', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(TaskActions)
    expect(wrapper.exists()).toBe(true)
  })
  it('does not emit stop-pending when there is no pending tasks', async () => {
    const wrapper = shallowMount(TaskActions, { global: { renderStubDefaultSlot: true } })
    const stopButton = wrapper.find('.task-actions__stop-pending-tasks')
    expect(stopButton.exists()).toBe(true)
    expect(stopButton.attributes().disabled).toBe('true')
    await stopButton.trigger('click')
    expect(wrapper.emitted('stop-pending')).toBeUndefined()
  })

  it('emits stop-pending on clicking stop pending tasks', async () => {
    const props = { hasPendingTasks: true }
    const wrapper = shallowMount(TaskActions, {
      props,
      global: { renderStubDefaultSlot: true }
    })
    await wrapper.find('.task-actions__stop-pending-tasks').trigger('click')
    expect(wrapper.emitted('stop-pending')).toHaveLength(1)
  })

  it('does not emit delete-done when there is no done tasks', async () => {
    const wrapper = shallowMount(TaskActions, { global: { renderStubDefaultSlot: true } })
    const deleteButton = wrapper.find('.task-actions__delete-done-tasks')
    expect(deleteButton.exists()).toBe(true)
    expect(deleteButton.attributes().disabled).toBe('true')
    await deleteButton.trigger('click')
    expect(wrapper.emitted('delete-done')).toBeUndefined()
  })

  it('emits delete-done on clicking delete done tasks', async () => {
    const props = { hasDoneTasks: true }
    const wrapper = shallowMount(TaskActions, {
      props,
      global: { renderStubDefaultSlot: true }
    })
    await wrapper.find('.task-actions__delete-done-tasks').trigger('click')
    expect(wrapper.emitted('delete-done')).toHaveLength(1)
  })
})
