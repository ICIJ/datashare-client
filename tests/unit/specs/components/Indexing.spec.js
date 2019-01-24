import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Indexing from '@/components/Indexing'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages })

describe('Indexing.vue', () => {
  let wrapper
  const es = esConnectionHelper.es
  esConnectionHelper()

  beforeEach(() => {
    wrapper = mount(Indexing, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
  })

  afterEach(() => {
    store.commit('indexing/reset')
  })

  it('should begin/stop polling when route enter/leave', () => {
    router.push('indexing')
    expect(store.state.indexing.pollHandle).toBeDefined()

    router.push('/')
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

  it('should return an empty index by default', () => {
    expect(wrapper.vm.isIndexEmpty).toBeTruthy()
  })

  it('should not be an empty index', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await store.dispatch('search/query')

    expect(wrapper.vm.isIndexEmpty).toBeFalsy()
    await store.commit('search/reset')
  })

  it('should display the extract and the find named entities buttons', () => {
    expect(wrapper.findAll('.btn-extract').length).toEqual(1)
    expect(wrapper.findAll('.btn-find-named-entites').length).toEqual(1)
  })

  it('should disable the find named entities buttton by default', () => {
    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toEqual('disabled')
  })

  it('should disable the find named entities buttton if a task is running', () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'RUNNING' }])

    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toEqual('disabled')
  })

  it('should enable the find named entities buttton if no tasks are running and the index is not empty', async () => {
    store.commit('indexing/updateTasks', [{ name: 'foo.bar@123', progress: 0.5, state: 'DONE' }])
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await store.dispatch('search/query')

    expect(wrapper.find('.btn-find-named-entites').attributes().disabled).toBeUndefined()
    await store.commit('search/reset')
  })
})
