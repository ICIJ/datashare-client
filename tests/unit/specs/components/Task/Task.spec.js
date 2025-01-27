import { shallowMount } from '@vue/test-utils'

import Task from '@/views/Task/Task'
import CoreSetup from '~tests/unit/CoreSetup'

describe('Task', () => {
  it('renders correctly', () => {
    const { plugins } = CoreSetup.init().useAll().useRouter()

    const wrapper = shallowMount(Task, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
  })

  /* it('should stop pending tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/stopPendingTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(api.stopPendingTasks).toBeCalledTimes(1)
  })

  it('should stop the task named 456', async () => {
    store.commit('indexing/updateTasks', [
      { name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }
    ])
    expect(store.state.indexing.tasks).toHaveLength(2)

    await store.dispatch('indexing/stopTask', 'foo.bar@456')

    expect(store.state.indexing.tasks).toHaveLength(1)
    expect(api.stopTask).toBeCalledTimes(1)
    expect(api.stopTask).toBeCalledWith('foo.bar@456')
  })

  it('should delete done tasks', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(store.state.indexing.tasks).toHaveLength(1)

    await store.dispatch('indexing/deleteDoneTasks')

    expect(store.state.indexing.tasks).toHaveLength(0)
    expect(api.deleteDoneTasks).toBeCalledTimes(1)
  }) */
})
