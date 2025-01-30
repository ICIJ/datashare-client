import { mount, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'
vi.mock('@/composables/wait', () => ({
  useWait: vi.fn(() => ({
    waitFor: vi.fn().mockReturnValue(vi.fn())
  }))
}))
describe('TaskEntitiesForm.vue', () => {
  let api

  beforeEach(() => {
    api = { getNerPipelines: vi.fn(), findNames: vi.fn() }
  })

  describe('on default project', () => {
    let wrapper, plugins
    beforeAll(() => {
      const core = CoreSetup.init(api).useAll().useRouter()
      const config = core.config
      plugins = core.plugins
      config.set('defaultProject', 'local-datashare')
      config.set('projects', [{ name: 'local-datashare' }, { name: 'banana-papers' }])
    })

    it('should display selected project "local-datashare" by default', async () => {
      wrapper = mount(TaskEntitiesForm, { global: { plugins } })
      expect(wrapper.find('.search-bar__field--selected').text()).toBe('local-datashare')
    })

    it('reactively updates content when projectName changes', async () => {
      const wrapper = mount(TaskEntitiesForm, {
        global: { plugins },
        props: {
          projectName: 'banana-papers'
        }
      })
      expect(wrapper.find('.search-bar__field--selected').text()).toBe('banana-papers')
      await wrapper.setProps({ projectName: 'local-datashare' })
      expect(wrapper.find('.search-bar__field--selected').text()).toBe('local-datashare')
    })
    it('should display default project "local-datashare"', () => {
      wrapper = mount(TaskEntitiesForm, { global: { plugins } })
      const projectSelection = wrapper.find('.search-bar__field--selected')
      expect(projectSelection.text()).toBe('local-datashare')
    })
    it('should display "local-datashare"', () => {
      wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      const projectSelection = wrapper.find('.search-bar__field--selected')
      expect(projectSelection.text()).toBe('local-datashare')
    })
    it('should load NER pipelines on component mounted', () => {
      wrapper = shallowMount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })

      expect(api.getNerPipelines).toBeCalledTimes(1)
    })

    it('should call findNames action with CORENLP pipeline, by default', async () => {
      await wrapper.vm.submit()
      await expect(api.findNames).toBeCalledWith(
        'CORENLP',
        expect.objectContaining({
          syncModels: true
        })
      )
    })

    it('should call findNames action with ANOTHERNLP pipeline', async () => {
      await wrapper.vm.$store.commit('indexing/formPipeline', 'ANOTHERNLP')
      await wrapper.vm.submit()
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
      wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    })

    it('should show the project selector when there is several projects', async () => {
      expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeTruthy()
    })
  })
})
