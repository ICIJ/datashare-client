import axios from 'axios'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import Api from '@/api'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('FindNamedEntitiesForm.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(FindNamedEntitiesForm, { localVue, store, mocks: { $t: msg => msg } })
  })

  afterEach(() => {
    store.commit('indexing/reset')
    axios.request.mockClear()
  })

  it('should call findNames action with CoreNLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      body: JSON.stringify({ options: { syncModels: true } })
    })
  })

  it('should call findNames action with OpenNLP pipeline', () => {
    wrapper.vm.pipeline = 'opennlp'
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      url: Api.getFullUrl('/api/task/findNames/OPENNLP'),
      method: 'POST',
      body: JSON.stringify({ options: { syncModels: true } })
    })
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.pipeline = 'corenlp'
    wrapper.vm.offline = true
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      body: JSON.stringify({ options: { syncModels: false } })
    })
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.pipeline = 'opennlp'
    await wrapper.vm.submitFindNamedEntities()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pipeline).toBe('corenlp')
  })

  it('should NOT show offline checkbox in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(FindNamedEntitiesForm, { localVue, store, mocks: { $t: msg => msg } })

    expect(wrapper.contains('.find-named-entities-form__offline')).toBeFalsy()
  })
})
