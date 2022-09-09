import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

describe('FindNamedEntitiesForm.vue', () => {
  let wrapper, i18n, localVue, store, wait, api, mockAxios
  beforeEach(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })
  })

  beforeEach(() => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: {} })
    store.commit('indexing/reset')
  })

  it('should load NER pipelines on component mounted', () => {
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/ner/pipelines')
    }))
  })

  it('should call findNames action with CORENLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      data: { options: { syncModels: true } }
    }))
  })

  it('should call findNames action with ANOTHERNLP pipeline', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    wrapper.vm.submitFindNamedEntities()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/ANOTHERNLP'),
      method: 'POST',
      data: { options: { syncModels: true } }
    }))
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'CORENLP')
    wrapper.vm.$set(wrapper.vm, 'offline', true)
    wrapper.vm.submitFindNamedEntities()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      data: { options: { syncModels: false } }
    }))
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    await wrapper.vm.submitFindNamedEntities()

    expect(wrapper.vm.pipeline).toBe('CORENLP')
  })

  it('should NOT show offline checkbox in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })

    expect(wrapper.find('.find-named-entities-form__offline').element).toBeFalsy()
  })
})
