import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'
import fetchPonyfill from 'fetch-ponyfill'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Indexing from '@/components/Indexing'
import esConnectionHelper from '..//utils/esConnectionHelper'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'

const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('Indexing.vue', () => {
  var wrapped = null
  esConnectionHelper()

  beforeEach(() => {
    wrapped = mount(Indexing, {localVue, i18n, router, store})
    jest.spyOn(datashare, 'fetch')
  })

  afterEach(() => {
    wrapped.vm.$store.commit('indexing/reset')
  })

  it('should begin/stop polling when route enter/leave', () => {
    router.push('indexing')
    expect(wrapped.vm.$store.state.indexing.pollHandle).not.toEqual(undefined)

    router.push('/')
    expect(wrapped.vm.$store.state.indexing.pollHandle).toEqual(null)
  })

  it('should update tasks with polling request', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateTasks', [{name: 'foo.bar@123', progress: 0.5, state: 'DONE'},
      {name: 'foo.baz@456', progress: 0.2, state: 'RUNNING'}])
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks').length).toEqual(2)
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[0].textContent).toContain('bar(123)')
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[1].textContent).toContain('baz(456)')
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
