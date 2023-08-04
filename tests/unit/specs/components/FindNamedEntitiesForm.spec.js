import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

describe('FindNamedEntitiesForm.vue', () => {
  let wrapper, i18n, localVue, store, wait, api, config

  beforeAll(() => {
    api = { getNerPipelines: jest.fn(), findNames: jest.fn() }
  })

  beforeEach(() => {
    const core = Core.init(createLocalVue(), api).useAll()
    config = core.config
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    config.set('defaultProject', 'local-datashare')
    config.set('projects', [{ name: 'local-datashare' }])
    store.commit('indexing/reset')
    wrapper = shallowMount(FindNamedEntitiesForm, { i18n, localVue, store, wait })
  })

  it('should load NER pipelines on component mounted', () => {
    expect(api.getNerPipelines).toBeCalledTimes(1)
  })

  it('should call findNames action with CORENLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()
    expect(api.findNames).toBeCalledWith(
      'CORENLP',
      expect.objectContaining({
        syncModels: true
      })
    )
  })

  it('should call findNames action with ANOTHERNLP pipeline', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    wrapper.vm.submitFindNamedEntities()
    expect(api.findNames).toBeCalledWith(
      'ANOTHERNLP',
      expect.objectContaining({
        syncModels: true
      })
    )
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'CORENLP')
    wrapper.vm.$set(wrapper.vm, 'offline', true)
    wrapper.vm.submitFindNamedEntities()
    expect(api.findNames).toBeCalledWith(
      'CORENLP',
      expect.objectContaining({
        syncModels: false
      })
    )
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'pipeline', 'ANOTHERNLP')
    await wrapper.vm.submitFindNamedEntities()
    expect(wrapper.vm.pipeline).toBe('CORENLP')
  })

  it('should show the project selector when there is several projects', async () => {
    await config.set('defaultProject', 'foo')
    await config.set('projects', [{ name: 'bar' }, { name: 'foo' }])
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeTruthy()
  })

  it('should show the project selector when there is only one project', async () => {
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeFalsy()
  })
})
