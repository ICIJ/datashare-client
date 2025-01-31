import { shallowMount, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'
import ExtractingLanguageFormControl from '@/components/Task/TaskDocuments/ExtractingLanguageFormControl'
// TODO file renamed but the tests have to be rewritten
describe('TaskDocumentsForm.vue', () => {
  let api, plugins

  beforeEach(async () => {
    api = {
      textLanguages: vi.fn().mockResolvedValue([
        { name: 'ENGLISH', iso6392: 'eng' },
        { name: 'FRENCH', iso6392: 'fra' }
      ]),
      ocrLanguages: vi.fn().mockResolvedValue([{ name: 'ENGLISH', iso6392: 'eng' }]),
      index: vi.fn(),
      indexPath: vi.fn()
    }
    const core = CoreSetup.init(api).useAll().useRouter()
    plugins = core.plugins
    await core.config.set('defaultProject', 'local-datashare')
    await core.config.set('dataDir', '/data')
    await core.config.set('projects', [{ name: 'local-datashare' }])
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
    await wrapper.findComponent(ExtractingLanguageFormControl).setValue('fra')
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

  it('retrieves text and ocr languages', async () => {
    api.textLanguages.mockClear() // called on mounted
    api.ocrLanguages.mockClear() // called on mounted
    shallowMount(TaskDocumentsForm, { global: { plugins } })

    expect(api.textLanguages).toBeCalledTimes(1)
    expect(api.ocrLanguages).toBeCalledTimes(1)
  })

  it('should show the project selector', async () => {
    const wrapper = mount(TaskDocumentsForm, {
      global: { plugins, renderStubDefaultSlot: true }
    })
    const projectSelector = wrapper.findComponent({ name: 'search-bar-input-dropdown-for-projects' })
    expect(projectSelector.exists()).toBeTruthy()
    expect(projectSelector.props('modelValue')).toEqual({ name: 'local-datashare' })
  })
  // test to add: show conditionnaly message about ocr

  // test to add: show conditionnaly message about ocr
})
