import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('FindNamedEntitiesForm.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })
  })

  beforeEach(() => {
    store.commit('indexing/reset')
    axios.request.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  it('should load NER pipelines on component mounted', () => {
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/ner/pipelines')
    }))
  })

  it('should call findNames action with CORENLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      data: { options: { syncModels: true } }
    }))
  })

  it('should call findNames action with ANOTHERNLP pipeline', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/ANOTHERNLP'),
      method: 'POST',
      data: { options: { syncModels: true } }
    }))
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'CORENLP')
    wrapper.vm.$set(wrapper.vm, 'offline', true)
    wrapper.vm.submitFindNamedEntities()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/findNames/CORENLP'),
      method: 'POST',
      data: { options: { syncModels: false } }
    }))
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    await wrapper.vm.submitFindNamedEntities()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pipeline).toBe('CORENLP')
  })

  it('should NOT show offline checkbox in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })

    expect(wrapper.find('.find-named-entities-form__offline').element).toBeFalsy()
  })
})
