import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'
import flushPromises from 'flush-promises'

import Api from '@/api'
import { Core } from '@/core'
import Indexing from '@/pages/Indexing'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('Indexing.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeAll(async () => {
    // This intend to wait for the end of the mont of the component
    // And stop the polling part when available
    wrapper = await shallowMount(Indexing, { i18n, localVue, store, wait })
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.stopPolling()
    // eslint-disable-next-line promise/param-names
    await new Promise(r => setTimeout(r, 3000))
    await flushPromises()
  })

  beforeEach(() => {
    store.commit('indexing/reset')
    axios.request.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  it('should start polling tasks on mount and stop polling tasks on beforeRouteLeave', async () => {
    wrapper = await shallowMount(Indexing, { i18n, localVue, store, wait })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/all')
    }))
    expect(store.state.indexing.pollHandle).not.toBeNull()

    Indexing.beforeRouteLeave.call(wrapper.vm, undefined, undefined, jest.fn())
    expect(store.state.indexing.pollHandle).toBeNull()
  })

  it('should update tasks with polling request', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' },
      { name: 'foo.baz@456', progress: 0.2, state: 'RUNNING' }])

    expect(wrapper.findAll('li.indexing__tasks')).toHaveLength(2)
    expect(wrapper.findAll('li.indexing__tasks').at(0).text()).toContain('bar 123')
    expect(wrapper.findAll('li.indexing__tasks').at(1).text()).toContain('baz 456')
  })

  it('should display the extract and the find named entities buttons', () => {
    expect(wrapper.find('.btn-extract').element).toBeTruthy()
    expect(wrapper.find('.btn-find-named-entites').element).toBeTruthy()
  })

  it('should enable the find named entities button by default, and display no tooltip', () => {
    expect(wrapper.find('.btn-find-named-entites').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.span-find-named-entities').attributes('title')).toBe('')
  })

  it('should disable the find named entities button if a task is running and display a tooltip', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-find-named-entites').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.span-find-named-entities').attributes('title')).not.toBe('')
  })

  it('should not display the "Stop pending tasks" and "Delete done tasks" buttons', () => {
    expect(wrapper.find('.btn-stop-pending-tasks').element).toBeFalsy()
    expect(wrapper.find('.btn-delete-done-tasks').element).toBeFalsy()
  })

  it('should display the "Stop pending tasks" and "Delete done tasks" buttons, if a task is running', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-stop-pending-tasks').element).toBeTruthy()
    expect(wrapper.find('.btn-delete-done-tasks').element).toBeTruthy()
  })

  it('should enable the "Stop pending tasks" if a task is running', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-stop-pending-tasks').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.btn-delete-done-tasks').attributes('disabled')).toBe('disabled')
  })

  it('should enable the "Delete done tasks" if a task is done', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])

    expect(wrapper.find('.btn-stop-pending-tasks').attributes('disabled')).toBe('disabled')
    expect(wrapper.find('.btn-delete-done-tasks').attributes('disabled')).toBeUndefined()
  })

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.vm.tasks).toHaveLength(1)

    wrapper.find('.btn-stop-pending-tasks').trigger('click')
    await flushPromises()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/stopAll'),
      method: 'PUT'
    }))
    expect(wrapper.vm.tasks).toHaveLength(0)
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(wrapper.vm.tasks).toHaveLength(1)

    wrapper.find('.btn-delete-done-tasks').trigger('click')
    await flushPromises()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/clean'),
      method: 'POST'
    }))
    expect(wrapper.vm.tasks).toHaveLength(0)
  })

  it('should display 2 available "Stop task" buttons if 2 tasks are running', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task')).toHaveLength(2)
    expect(wrapper.findAll('.btn-stop-task').at(0).attributes('disabled')).toBeUndefined()
    expect(wrapper.findAll('.btn-stop-task').at(1).attributes('disabled')).toBeUndefined()
  })

  it('should call a backend endpoint on click on a "Stop task" icon', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task')).toHaveLength(1)

    wrapper.find('.btn-stop-task').trigger('click')
    await flushPromises()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/stop/' + encodeURIComponent('foo.bar@123')),
      method: 'PUT'
    }))
    expect(wrapper.vm.tasks).toHaveLength(0)
  })

  it('should display 1 disabled "Stop task" button if 1 task is done', async () => {
    await store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])

    expect(wrapper.findAll('.btn-stop-task')).toHaveLength(1)
    expect(wrapper.find('.btn-stop-task').attributes('disabled')).toBe('disabled')
  })

  it('should return 0 as progress number', () => {
    expect(wrapper.vm.getProgress(-1, 'RUNNING')).toBe(0)
  })

  it('should return 100 as progress number (1/2)', () => {
    expect(wrapper.vm.getProgress(-2, 'ERROR')).toBe(100)
  })

  it('should return 100 as progress number (2/2)', () => {
    expect(wrapper.vm.getProgress(1, 'DONE')).toBe(100)
  })

  it('should return 99 as progress number', () => {
    expect(wrapper.vm.getProgress(1, 'RUNNING')).toBe(99)
  })

  it('should return 40 as progress number', () => {
    expect(wrapper.vm.getProgress(0.4, 'RUNNING')).toBe(40)
  })

  it('should return 41 as progress number', () => {
    expect(wrapper.vm.getProgress(0.41, 'RUNNING')).toBe(41)
  })

  it('should return 42 as progress number', () => {
    expect(wrapper.vm.getProgress(0.418, 'RUNNING')).toBe(42)
  })

  it('should return 99 as progress number', () => {
    expect(wrapper.vm.getProgress(0.995, 'RUNNING')).toBe(99)
  })
})
