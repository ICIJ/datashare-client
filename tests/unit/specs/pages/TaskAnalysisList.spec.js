import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import TaskAnalysisList from '@/pages/TaskAnalysisList'

const flushPromisesAndPendingTimers = async ({ vm }) => {
  await vm.$nextTick()
  await vi.runOnlyPendingTimersAsync()
}

describe('TaskAnalysisList.vue', () => {
  let i18n, localVue, store, wait

  const api = {
    index: vi.fn(),
    getTasks: vi.fn().mockResolvedValue([
      { id: 'IndexTask@456', name: 'org.icij.datashare.tasks.IndexTask', progress: 0.2, state: 'RUNNING' },
      { id: 'ScanTask@123', name: 'org.icij.datashare.tasks.ScanTask', progress: 0.5, state: 'DONE' }
    ]),
    deleteDoneTasks: vi.fn(),
    stopPendingTasks: vi.fn(),
    stopTask: vi.fn(),
    elasticsearch: {
      count: vi.fn().mockResolvedValue({ count: 10 })
    }
  }

  beforeAll(() => {
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    vi.useFakeTimers()
    store.commit('indexing/reset')
  })

  afterAll(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should display tasks list', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)

    expect(wrapper.findAll('.tasks-list__tasks__item')).toHaveLength(2)
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(0).text()).toContain('Index')
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(1).text()).toContain('Scan')
  })

  it('should disable the "Stop pending tasks" and "Delete done tasks" buttons if no tasks', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.task-analysis-list__actions__delete-done-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Stop pending tasks" button, if a task is running', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should disable the "Stop pending tasks" if no tasks are running', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Delete done tasks" if a task is done', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.task-analysis-list__actions__delete-done-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await wrapper.vm.$nextTick()

    wrapper.find('.task-analysis-list__actions__stop-pending-tasks').trigger('click')
    await flushPromisesAndPendingTimers(wrapper)

    expect(api.stopPendingTasks).toBeCalledTimes(1)
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await wrapper.vm.$nextTick()

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
    expect(api.stopTask).toBeCalledWith('IndexTask@456')
  })

  it('should display 1 disabled "Stop task" button if 1 task is done', async () => {
    const wrapper = mount(TaskAnalysisList, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers(wrapper)
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.task-analysis-list__actions__stop-pending-tasks')).toHaveLength(1)
    expect(wrapper.find('.task-analysis-list__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })
})
