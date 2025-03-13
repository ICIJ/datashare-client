import { flushPromises, mount, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getNerPipelines: vi.fn().mockResolvedValue(['CORENLP', 'ANOTHERNLP', 'TOTONLP', 'EMAIL']),
      findNames: vi.fn()
    }
  }
})

describe('TaskEntitiesForm.vue', () => {
  let plugins

  beforeEach(() => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const config = core.config
    plugins = core.plugins
    config.set('defaultProject', 'local-datashare')
    config.set('projects', [{ name: 'local-datashare' }, { name: 'banana-papers' }])
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display selected project "local-datashare" by default', async () => {
    const wrapper = mount(TaskEntitiesForm, { global: { plugins } })
    expect(wrapper.find('.search-bar__field--selected').text()).toBe('local-datashare')
  })

  it('reactively updates content when project changes', async () => {
    const wrapper = mount(TaskEntitiesForm, {
      global: { plugins },
      props: {
        project: 'banana-papers'
      }
    })

    expect(wrapper.find('.search-bar__field--selected').text()).toBe('banana-papers')
    await wrapper.setProps({ project: 'local-datashare' })
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

  it('should display three pipelines without email', async () => {
    const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    expect(wrapper.findAll('[name=pipeline]')).toHaveLength(3)
  })

  it('should call findNames action with ANOTHERNLP pipeline', async () => {
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
    const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    wrapper.find('[name=pipeline][value=ANOTHERNLP]').setChecked()
    wrapper.find('[name=offline][value=true]').setChecked()
    await wrapper.vm.submit()
    expect(api.findNames).toBeCalledWith(
      'ANOTHERNLP',
      expect.objectContaining({
        syncModels: false
      })
    )
  })

  it('should reset the form on reset button clicked', async () => {
    const wrapper = mount(TaskEntitiesForm, { global: { plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    wrapper.find('[name=pipeline][value=ANOTHERNLP]').setChecked()
    await wrapper.vm.reset()
    expect(wrapper.vm.pipeline).toBe('CORENLP')
  })
})
