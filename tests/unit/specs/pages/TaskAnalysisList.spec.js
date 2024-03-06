import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import TaskAnalysisList from '@/pages/TaskAnalysisList'

const flushPromisesAndPendingTimers = async ({ vm }) => {
  await vm.$nextTick()
  await vi.runOnlyPendingTimersAsync()
}

vi.mock('@/api/elasticsearch', () => {
  return {
    count: () => {
      return { count: 10 }
    }
  }
})

describe('TaskAnalysisList.vue', () => {
  let i18n, localVue, store, wait, api

  const mockIndexedFiles = [
    { name: 'foo.baz@456', progress: 0.2, state: 'RUNNING' },
    { name: 'foo.bar@123', progress: 0.5, state: 'DONE' }
  ]

  beforeAll(() => {
    api = {
      index: vi.fn(),
      getTasks: vi.fn(),
      deleteDoneTasks: vi.fn(),
      stopPendingTasks: vi.fn(),
      stopTask: vi.fn(),
      elasticsearch: { count: vi.fn().mockResolvedValue({}) }
    }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    api.getTasks.mockResolvedValue(mockIndexedFiles)
    store.commit('indexing/reset')
  })

  afterAll(() => {
    vi.useRealTimers()
    vi.unmock('@/api/elasticsearch')
  })

  it('should display tasks list', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)

    expect(wrapper.findAll('.tasks-list__tasks__item')).toHaveLength(2)
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(0).text()).toContain('baz')
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(1).text()).toContain('bar')
  })

  it.only('should disable the "Stop pending tasks" and "Delete done tasks" buttons if no tasks', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [])
    await flushPromisesAndPendingTimers(wrapper)
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.task-analysis-list__actions__delete-done-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Stop pending tasks" button, if a task is running', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await flushPromisesAndPendingTimers(wrapper)
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should disable the "Stop pending tasks" if no tasks are running', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromisesAndPendingTimers(wrapper)
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Delete done tasks" if a task is done', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromisesAndPendingTimers(wrapper)
    expect(wrapper.find('.task-analysis-list__actions__delete-done-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await flushPromisesAndPendingTimers(wrapper)

    wrapper.find('.task-analysis-list__actions__stop-pending-tasks').trigger('click')
    await flushPromisesAndPendingTimers(wrapper)

    expect(api.stopPendingTasks).toBeCalledTimes(1)
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromisesAndPendingTimers(wrapper)

    wrapper.find('.task-analysis-list__actions__delete-done-tasks').trigger('click')
    await flushPromisesAndPendingTimers(wrapper)

    expect(api.deleteDoneTasks).toBeCalledTimes(1)
  })

  it('should display 1 available "Stop task" buttons if 1 tasks are running', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    expect(wrapper.findAll('.tasks-list__tasks__item__stop')).toHaveLength(1)
  })

  it('should call a backend endpoint on click on a "Stop task" icon', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    wrapper.find('.tasks-list__tasks__item__stop').trigger('click')
    await flushPromisesAndPendingTimers(wrapper)
    expect(api.stopTask).toBeCalledTimes(1)
    expect(api.stopTask).toBeCalledWith('foo.baz@456')
  })

  it('should display 1 disabled "Stop task" button if 1 task is done', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromisesAndPendingTimers(wrapper)
    expect(wrapper.findAll('.task-analysis-list__actions__stop-pending-tasks')).toHaveLength(1)
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })
})
