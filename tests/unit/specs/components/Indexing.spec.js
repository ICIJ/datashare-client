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
  })

  it('should start polling tasks on beforeRouteEnter and stop polling tasks on beforeRouteLeave', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    await Indexing.beforeRouteEnter(undefined, undefined, jest.fn())

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/'),
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
    expect(wrapper.findAll('.btn-extract').length).toEqual(1)
    expect(wrapper.findAll('.btn-find-named-entites').length).toEqual(1)
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
