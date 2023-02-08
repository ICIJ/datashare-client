import { createLocalVue, mount } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'
import Indexing from '@/pages/Indexing'

// We use a custom flushPromises function with s`setImmediate`
// which is not mocked by jest when using fake timers
const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
const flushPromisesAndPendingTimers = async () => {
  jest.runOnlyPendingTimers()
  await flushPromises()
}

// Polling task list uses timers
// @see https://jestjs.io/fr/docs/timer-mocks
jest.useFakeTimers()

jest.mock('@/api/elasticsearch', () => {
  return {
    count: () => {
      return { count: 10 }
    }
  }
})
describe('Indexing.vue', () => {
  let i18n, localVue, store, wait, api, mockAxios

  const mockIndexedFiles = [
    { name: 'foo.baz@456', progress: 0.2, state: 'RUNNING' },
    { name: 'foo.bar@123', progress: 0.5, state: 'DONE' }
  ]
  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })
  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: mockIndexedFiles })
    store.commit('indexing/reset')
  })

  afterAll(() => {
    jest.unmock('@/api/elasticsearch')
  })

  it('should display tasks list', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()

    expect(wrapper.findAll('.tasks-list__tasks__item')).toHaveLength(2)
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(0).text()).toContain('baz')
    expect(wrapper.findAll('.tasks-list__tasks__item__name').at(1).text()).toContain('bar')
  })

  it('should enable the find named entities button by default, and display no tooltip', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()

    expect(wrapper.find('.indexing__actions__find-named-entites').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.indexing__actions__find-named-entites').attributes('title')).toBe('')
  })

  it('should disable the find named entities button if not task is done or has no documents', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    await wrapper.setData({ count: 0 })
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await flushPromises()

    expect(wrapper.find('.indexing__actions__find-named-entites').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.indexing__actions__find-named-entites').attributes('title')).not.toBe('')
  })

  it('should disable the "Stop pending tasks" and "Delete done tasks" buttons if no tasks', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [])
    await flushPromises()
    expect(wrapper.find('.indexing__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.indexing__actions__delete-done-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Stop pending tasks" button, if a task is running', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await flushPromises()
    expect(wrapper.find('.indexing__actions__stop-pending-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should disable the "Stop pending tasks" if no tasks are running', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromises()
    expect(wrapper.find('.indexing__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should not disable the "Delete done tasks" if a task is done', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromises()
    expect(wrapper.find('.indexing__actions__delete-done-tasks').attributes('disabled')).not.toBe('disabled')
  })

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    await flushPromises()

    mockAxios.request.mockClear()
    wrapper.find('.indexing__actions__stop-pending-tasks').trigger('click')
    await flushPromisesAndPendingTimers()

    const calledUrls = mockAxios.request.mock.calls.map((call) => call[0].url)
    expect(calledUrls).toContain(Api.getFullUrl('/api/task/stopAll'))
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromises()

    mockAxios.request.mockClear()
    wrapper.find('.indexing__actions__delete-done-tasks').trigger('click')
    await flushPromisesAndPendingTimers()

    const calledUrls = mockAxios.request.mock.calls.map((call) => call[0].url)
    expect(calledUrls).toContain(Api.getFullUrl('/api/task/clean'))
  })

  it('should display 1 available "Stop task" buttons if 1 tasks are running', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    expect(wrapper.findAll('.tasks-list__tasks__item__stop')).toHaveLength(1)
  })

  it('should call a backend endpoint on click on a "Stop task" icon', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    mockAxios.request.mockClear()
    wrapper.find('.tasks-list__tasks__item__stop').trigger('click')
    await flushPromisesAndPendingTimers()
    const calledUrls = mockAxios.request.mock.calls.map((call) => call[0].url)
    const stopUrl = Api.getFullUrl('/api/task/stop/' + encodeURIComponent('foo.baz@456'))
    expect(calledUrls).toContain(stopUrl)
  })

  it('should display 1 disabled "Stop task" button if 1 task is done', async () => {
    const wrapper = mount(Indexing, { i18n, localVue, store, wait })
    await flushPromisesAndPendingTimers()
    await wrapper.vm.unregisteredPolls()
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await flushPromises()
    expect(wrapper.findAll('.indexing__actions__stop-pending-tasks')).toHaveLength(1)
    expect(wrapper.find('.indexing__actions__stop-pending-tasks').attributes('disabled')).toBe('disabled')
  })
})
