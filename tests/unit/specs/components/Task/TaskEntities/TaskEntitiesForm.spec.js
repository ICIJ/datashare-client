import { flushPromises, mount, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'

describe('TaskEntitiesForm.vue', () => {
  let api

  describe('on default project', () => {
    let plugins

    beforeEach(() => {
      api = { getNerPipelines: vi.fn(), findNames: vi.fn() }
      const core = CoreSetup.init(api).useAll().useRouter()
      const config = core.config
      plugins = core.plugins
      config.set('defaultProject', 'local-datashare')
      config.set('projects', [{ name: 'local-datashare' }, { name: 'banana-papers' }])
    })

    it('should display selected project "local-datashare" by default', async () => {
      const wrapper = mount(TaskEntitiesForm, { global: { plugins } })
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
      await flushPromises()
      expect(wrapper.find('.search-bar__field--selected').text()).toBe('local-datashare')
    })

    it('should load NER pipelines on component mounted', async () => {
      shallowMount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      expect(api.getNerPipelines).toBeCalledTimes(1)
    })

    it('should call findNames action with CORENLP pipeline, by default', async () => {
      const wrapper = shallowMount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await wrapper.vm.submit()
      await flushPromises()
      await expect(api.findNames).toBeCalledWith(
        'CORENLP',
        expect.objectContaining({
          syncModels: true
        })
      )
    })

    it('should display two pipelines without email', async () => {
      api.getNerPipelines.mockResolvedValue(['ANOTHERNLP', 'TOTONLP', 'EMAIL'])
      const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      expect(wrapper.findAll('[name=pipeline]')).toHaveLength(2)
    })

    it('should call findNames action with ANOTHERNLP pipeline', async () => {
      api.getNerPipelines.mockResolvedValue(['ANOTHERNLP', 'TOTONLP', 'EMAIL'])
      const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      wrapper.find('[name=pipeline][value=ANOTHERNLP]').setChecked()
      await wrapper.vm.submit()
      expect(api.findNames).toBeCalledWith(
        'ANOTHERNLP',
        expect.objectContaining({
          syncModels: true
        })
      )
    })

    it('should call findNames action with no models synchronization', async () => {
      api.getNerPipelines.mockResolvedValue(['ANOTHERNLP', 'CORENLP', 'EMAIL'])
      const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      wrapper.find('[name=pipeline][value=CORENLP]').setChecked()
      wrapper.find('[name=offline][value=true]').setChecked()
      await wrapper.vm.submit()
      expect(api.findNames).toBeCalledWith(
        'CORENLP',
        expect.objectContaining({
          syncModels: false
        })
      )
    })

    it('should reset the form on reset button clicked', async () => {
      api.getNerPipelines.mockResolvedValue(['ANOTHERNLP', 'CORENLP', 'EMAIL'])
      const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
      await flushPromises()
      wrapper.find('[name=pipeline][value=ANOTHERNLP]').setChecked()
      await wrapper.vm.reset()
      expect(wrapper.vm.pipeline).toBe('CORENLP')
    })
  })
})
