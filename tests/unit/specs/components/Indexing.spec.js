import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Indexing from '@/components/Indexing'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import vBTooltip from 'bootstrap-vue/es/components/tooltip/tooltip'
import DatashareClient from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.directive('b-tooltip', vBTooltip)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages })

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
    datashare.fetch.mockReturnValue(jsonOk({}))
    await Indexing.beforeRouteEnter(undefined, undefined, jest.fn())

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/all'),
      { credentials: 'same-origin' })
    expect(store.state.indexing.pollHandle).not.toBeNull()

    Indexing.beforeRouteLeave(undefined, undefined, jest.fn())
    expect(store.state.indexing.pollHandle).toBeNull()
  })

  it('should update tasks with polling request', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' },
      { name: 'foo.baz@456', progress: 0.2, state: 'RUNNING' }])

    expect(wrapper.findAll('li.indexing__tasks').length).toEqual(2)
    expect(wrapper.findAll('li.indexing__tasks').at(0).text()).toContain('bar (123)')
    expect(wrapper.findAll('li.indexing__tasks').at(1).text()).toContain('baz (456)')
  })

  it('should open extract form if no tasks is running', () => {
    expect(wrapper.find('.extracting__form').isVisible()).toBeTruthy()
    expect(wrapper.find('.find-named-entities__form').isVisible()).toBeFalsy()
  })

  it('should not open extract form if some tasks are running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    wrapper = mount(Indexing, { localVue, i18n, router, store })

    expect(wrapper.find('.extracting__form').isVisible()).toBeFalsy()
    expect(wrapper.find('.find-named-entities__form').isVisible()).toBeFalsy()
  })

  it('should display the extract and the find named entities buttons', () => {
    expect(wrapper.contains('.btn-extract')).toBeTruthy()
    expect(wrapper.contains('.btn-find-named-entites')).toBeTruthy()
  })

  it('should enable the find named entities buttton by default, and display no tooltip', () => {
    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toBeUndefined()
    expect(wrapper.find('.span-find-named-entities').attributes().title).toEqual('')
  })

  it('should disable the find named entities buttton if a task is running and display a tooltip', async () => {
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

  it('should call backend on click on the "Stop pending tasks" button and delete the pending tasks', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])
    expect(wrapper.vm.tasks.length).toEqual(1)

    wrapper.find('.btn-stop-pending-tasks').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stopAll'),
      { method: 'PUT', credentials: 'same-origin' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })

  it('should call a backend endpoint on click on the "Delete done tasks" button', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    expect(wrapper.vm.tasks.length).toEqual(1)

    wrapper.find('.btn-delete-done-tasks').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/clean'),
      { method: 'POST', body: '{}', credentials: 'same-origin' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })

  it('should display 2 "Stop task" icons if 2 tasks are running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' },
      { name: 'foo.bar@456', progress: 0.7, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task').length).toEqual(2)
  })

  it('should call a backend endpoint on click on a "Stop task" icon', () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.findAll('.btn-stop-task').length).toEqual(1)

    wrapper.find('.btn-stop-task svg').trigger('click')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/stop/' + encodeURIComponent('foo.bar@123')),
      { method: 'PUT', credentials: 'same-origin' })
    expect(wrapper.vm.tasks.length).toEqual(0)
  })
})

function jsonOk (body) {
  const mockResponse = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
