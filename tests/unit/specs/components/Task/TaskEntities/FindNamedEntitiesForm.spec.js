import { mount, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

describe('FindNamedEntitiesForm.vue', () => {
  let api

  beforeEach(() => {
    api = { getNerPipelines: vi.fn(), findNames: vi.fn() }
  })

  describe('on default project', () => {
    let wrapper

    beforeEach(() => {
      const { config, plugins, store } = CoreSetup.init(api).useAll()
      config.set('defaultProject', 'local-datashare')
      config.set('projects', [{ name: 'local-datashare' }])
      store.commit('indexing/reset')
      wrapper = shallowMount(FindNamedEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    })

    it('should load NER pipelines on component mounted', () => {
      expect(api.getNerPipelines).toBeCalledTimes(1)
    })

    it('should call findNames action with CORENLP pipeline, by default', async () => {
      await wrapper.vm.submitFindNamedEntities()
      await expect(api.findNames).toBeCalledWith(
        'CORENLP',
        expect.objectContaining({
          syncModels: true
        })
      )
    })

    it('should call findNames action with ANOTHERNLP pipeline', async () => {
      await wrapper.vm.$store.commit('indexing/formPipeline', 'ANOTHERNLP')
      await wrapper.vm.submitFindNamedEntities()
      expect(api.findNames).toBeCalledWith(
        'ANOTHERNLP',
        expect.objectContaining({
          syncModels: true
        })
      )
    })

    it('should call findNames action with no models synchronization', async () => {
      await wrapper.vm.$store.commit('indexing/formPipeline', 'CORENLP')
      await wrapper.vm.$store.commit('indexing/formOffline', true)
      await wrapper.vm.submitFindNamedEntities()
      expect(api.findNames).toBeCalledWith(
        'CORENLP',
        expect.objectContaining({
          syncModels: false
        })
      )
    })

    it('should reset the modal params on submitting the form', async () => {
      await wrapper.setData({ pipeline: 'ANOTHERNLP' })
      await wrapper.vm.submitFindNamedEntities()
      expect(wrapper.vm.pipeline).toBe('CORENLP')
    })

    it('should show the project selector when there is only one project', () => {
      expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeFalsy()
    })
  })

  describe('on another project', () => {
    let wrapper

    beforeEach(() => {
      const { config, plugins, store } = CoreSetup.init(api).useAll()
      config.set('defaultProject', 'foo')
      config.set('projects', [{ name: 'bar' }, { name: 'foo' }])
      store.commit('indexing/reset')
      wrapper = mount(FindNamedEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    })

    it('should show the project selector when there is several projects', async () => {
      expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeTruthy()
    })
  })
})
