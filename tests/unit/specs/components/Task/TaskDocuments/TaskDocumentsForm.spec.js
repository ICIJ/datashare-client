import { shallowMount, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlExtractingLanguage from '@/components/Form/FormControl/FormControlExtractingLanguage'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      index: vi.fn(),
      indexPath: vi.fn(),
      ocrLanguages: vi.fn().mockResolvedValue([{ name: 'ENGLISH', iso6392: 'eng' }]),
      textLanguages: vi.fn().mockResolvedValue([
        { name: 'ENGLISH', iso6392: 'eng' },
        { name: 'FRENCH', iso6392: 'fra' }
      ])
    }
  }
})

// @todo file renamed but the tests have to be rewritten
describe('TaskDocumentsForm.vue', () => {
  let plugins

  beforeEach(async () => {
    vi.clearAllMocks()
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    await core.config.set('defaultProject', 'local-datashare')
    await core.config.set('dataDir', '/data')
    await core.config.set('projects', [{ name: 'local-datashare' }])
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should call extract action without OCR option on default project, by default', async () => {
    const wrapper = shallowMount(TaskDocumentsForm, { global: { plugins } })
    await wrapper.trigger('submit')

    expect(api.indexPath).toBeCalledTimes(1)
    expect(api.indexPath).toBeCalledWith(
      '/data',
      expect.objectContaining({
        defaultProject: 'local-datashare',
        filter: true,
        language: null,
        ocr: false
      })
    )
  })

  it('should call extract action selected language "fra"', async () => {
    const wrapper = shallowMount(TaskDocumentsForm, {
      global: { plugins, renderStubDefaultSlot: true }
    })
    await wrapper.findComponent(FormControlExtractingLanguage).setValue('fra')
    await wrapper.trigger('submit')
    expect(api.indexPath).toBeCalledTimes(1)
    expect(api.indexPath).toBeCalledWith(
      '/data',
      expect.objectContaining({
        language: 'fra'
      })
    )
  })

  it('should index document with OCR to true when selected', async () => {
    const wrapper = mount(TaskDocumentsForm, {
      global: { plugins, renderStubDefaultSlot: true }
    })

    expect(wrapper.vm.extractOcr).toBe(false)
    const radio = wrapper.find('input[name="extract-ocr"][value=true]')
    expect(radio.element.checked).toBe(false)
    await radio.setValue(true)
    expect(radio.element.checked).toBe(true)
    const form = wrapper.find('form')
    await form.trigger('submit')
    expect(api.indexPath).toBeCalledTimes(1)
    expect(api.indexPath).toBeCalledWith(
      '/data',
      expect.objectContaining({
        ocr: true
      })
    )
  })

  it('should show the project selector', async () => {
    const wrapper = mount(TaskDocumentsForm, {
      global: { plugins, renderStubDefaultSlot: true }
    })
    const projectSelector = wrapper.findComponent({ name: 'search-bar-input-dropdown-for-projects' })
    expect(projectSelector.exists()).toBeTruthy()
    expect(projectSelector.props('modelValue')).toEqual({ name: 'local-datashare' })
  })
})
