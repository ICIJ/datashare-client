import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ExtractingForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'

describe('TaskDocumentsForm.vue', () => {
  let api, wrapper, core

  const stubs = ['form-control-path']

  const props = {
    projectName: 'local-datashare',
    values: {
      language: null,
      extractOcr: false,
      skipIndexedDocuments: true,
      hasTesseract: true
    }
  }

  beforeEach(async () => {
    api = { textLanguages: vi.fn().mockResolvedValue([]), ocrLanguages: vi.fn().mockResolvedValue([]), index: vi.fn() }
    core = CoreSetup.init(api).useAll().useRouter()
    const config = core.config
    const plugins = core.plugins
    config.set('defaultProject', 'local-datashare')
    config.set('projects', [{ name: 'local-datashare' }, { name: 'banana-papers' }])
    wrapper = mount(ExtractingForm, { props, global: { plugins, stubs } })
    await flushPromises()
  })

  it('should call extract action without OCR option, by default', async () => {
    await wrapper.vm.submit()
    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(expect.objectContaining({ ocr: false, filter: true }))
  })

  it('should call extract action with OCR option and language', async () => {
    wrapper.findComponent({ name: 'extracting-language-form-control' }).setValue('fra')
    await wrapper.vm.submit()
    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(expect.objectContaining({ language: 'fra' }))
  })

  it('should set the extract OCR value to true', async () => {
    wrapper.find('[name=extract-ocr][value=true]').setChecked()
    expect(wrapper.vm.extractOcr).toBe(true)
  })

  it('should call retrieve text and ocr languages', () => {
    api.textLanguages.mockReset()
    api.ocrLanguages.mockReset()
    wrapper.vm.loadLanguages()

    expect(api.textLanguages).toBeCalledTimes(1)
    expect(api.ocrLanguages).toBeCalledTimes(1)
  })

  it('should show the project selector', async () => {
    const projectSelector = wrapper.findComponent({ name: 'search-bar-input-dropdown-for-projects' })
    expect(projectSelector.exists()).toBeTruthy()
    expect(projectSelector.props('modelValue')).toEqual({ name: 'local-datashare' })
  })
})
