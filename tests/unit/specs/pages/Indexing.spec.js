import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'
import Indexing from '@/pages/Indexing'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import DatashareClient from '@/api/DatashareClient'
import { jsonOk } from 'tests/unit/tests_utils'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('Indexing.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Indexing, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
  })

  afterEach(() => {
    store.commit('indexing/reset')
    datashare.fetch.mockClear()
  })

  it('should start polling tasks on beforeRouteEnter and stop polling tasks on beforeRouteLeave', async () => {
    datashare.fetch.mockReturnValue(jsonOk())
    await Indexing.beforeRouteEnter(undefined, undefined, jest.fn())

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/all'), {})
    expect(store.state.indexing.pollHandle).not.toBeNull()

    Indexing.beforeRouteLeave(undefined, undefined, jest.fn())
    expect(store.state.indexing.pollHandle).toBeNull()
  })

  it('should update tasks with polling request', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' },
      { name: 'foo.baz@456', progress: 0.2, state: 'RUNNING' }])

    expect(wrapper.findAll('li.indexing__tasks').length).toEqual(2)
    expect(wrapper.findAll('li.indexing__tasks').at(0).text()).toContain('bar 123')
    expect(wrapper.findAll('li.indexing__tasks').at(1).text()).toContain('baz 456')
  })

  it('should display the extract and the find named entities buttons', () => {
    expect(wrapper.contains('.btn-extract')).toBeTruthy()
    expect(wrapper.contains('.btn-find-named-entites')).toBeTruthy()
  })

  it('should enable the find named entities button by default, and display no tooltip', () => {
    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toBeUndefined()
    expect(wrapper.find('.span-find-named-entities').attributes().title).toEqual('')
  })

  it('should disable the find named entities button if a task is running and display a tooltip', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toEqual('disabled')
    expect(wrapper.find('.span-find-named-entities').attributes().title).not.toEqual('')
  })

  it('should not display the "Stop pending tasks" and "Delete done tasks" buttons', () => {
    expect(wrapper.contains('.btn-stop-pending-tasks')).toBeFalsy()
    expect(wrapper.contains('.btn-delete-done-tasks')).toBeFalsy()
  })

  it('should display the "Stop pending tasks" and "Delete done tasks" buttons, if a task is running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.contains('.btn-stop-pending-tasks')).toBeTruthy()
    expect(wrapper.contains('.btn-delete-done-tasks')).toBeTruthy()
  })

  it('should enable the "Stop pending tasks" if a task is running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-stop-pending-tasks').attributes().disabled).toBeUndefined()
    expect(wrapper.find('.btn-delete-done-tasks').attributes().disabled).toEqual('disabled')
  })

  it('should enable the "Delete done tasks" if a task is done', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])

    expect(wrapper.find('.btn-stop-pending-tasks').attributes().disabled).toEqual('disabled')
    expect(wrapper.find('.btn-delete-done-tasks').attributes().disabled).toBeUndefined()
  })

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', () => {
    datashare.fetch.mockReturnValue(jsonOk())
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(wrapper.vm.tasks.length).toEqual(1)

    wrapper.find('.btn-stop-pending-tasks').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stopAll'),
      { method: 'PUT' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', () => {
    datashare.fetch.mockReturnValue(jsonOk())
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(wrapper.vm.tasks.length).toEqual(1)

    wrapper.find('.btn-delete-done-tasks').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/clean'),
      { method: 'POST', body: '{}' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })

  it('should display 2 available "Stop task" buttons if 2 tasks are running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task').length).toEqual(2)
    expect(wrapper.findAll('.btn-stop-task').at(0).attributes.disabled).toBeUndefined()
    expect(wrapper.findAll('.btn-stop-task').at(1).attributes.disabled).toBeUndefined()
  })

  it('should call a backend endpoint on click on a "Stop task" icon', () => {
    datashare.fetch.mockReturnValue(jsonOk())
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task').length).toEqual(1)

    wrapper.find('.btn-stop-task').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stop/' + encodeURIComponent('foo.bar@123')),
      { method: 'PUT' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })

  it('should display 1 disabled "Stop task" button if 1 task is done', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])

    expect(wrapper.findAll('.btn-stop-task').length).toEqual(1)
    expect(wrapper.find('.btn-stop-task').attributes().disabled).toEqual('disabled')
  })

  it('should return 0 as progress number', () => {
    expect(wrapper.vm.getProgress(-1, 'RUNNING')).toEqual(0)
  })

  it('should return 100 as progress number (1/2)', () => {
    expect(wrapper.vm.getProgress(-2, 'ERROR')).toEqual(100)
  })

  it('should return 100 as progress number (2/2)', () => {
    expect(wrapper.vm.getProgress(1, 'DONE')).toEqual(100)
  })

  it('should return 99 as progress number', () => {
    expect(wrapper.vm.getProgress(1, 'RUNNING')).toEqual(99)
  })

  it('should return 40 as progress number', () => {
    expect(wrapper.vm.getProgress(0.4, 'RUNNING')).toEqual(40)
  })

  it('should return 41 as progress number', () => {
    expect(wrapper.vm.getProgress(0.41, 'RUNNING')).toEqual(41)
  })

  it('should return 42 as progress number', () => {
    expect(wrapper.vm.getProgress(0.418, 'RUNNING')).toEqual(42)
  })

  it('should return 99 as progress number', () => {
    expect(wrapper.vm.getProgress(0.995, 'RUNNING')).toEqual(99)
  })
})
