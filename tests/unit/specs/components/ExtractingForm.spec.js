import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ExtractingForm from '@/components/ExtractingForm'

describe('ExtractingForm.vue', () => {
  let api, wrapper, core

  const props = {
    textLanguages: [
      { name: 'ENGLISH', iso6392: 'eng' },
      { name: 'FRENCH', iso6392: 'fra' }
    ],
    ocrLanguages: [{ name: 'ENGLISH', iso6392: 'eng' }],
    hasTesseract: true
  }

  beforeEach(async () => {
    api = {
      textLanguages: vi.fn(),
      ocrLanguages: vi.fn(),
      index: vi.fn()
    }
    core = CoreSetup.init(api).useAll()
    await core.config.set('defaultProject', 'local-datashare')
    await core.config.set('projects', [{ name: 'local-datashare' }])
    wrapper = shallowMount(ExtractingForm, { props, global: { plugins: core.plugins } })
  })

  afterEach(() => core.store.commit('indexing/reset'))

  it('should call extract action without OCR option, by default', () => {
    wrapper.vm.submitExtract()

    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(
      expect.objectContaining({
        ocr: false,
        filter: true
      })
    )
  })

  it('should call extract action with OCR option and language', () => {
    wrapper.findComponent({ name: 'extracting-language-form-control' }).setValue('fra')
    wrapper.vm.submitExtract()
    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(
      expect.objectContaining({
        language: 'fra'
      })
    )
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.setData({ ocr: true })
    await wrapper.vm.submitExtract()
    expect(wrapper.vm.ocr).toBe(false)
  })

  it('should call retrieve text and ocr languages', () => {
    api.textLanguages.mockReset() // called on mounted
    api.ocrLanguages.mockReset() // called on mounted
    wrapper.vm.loadLanguages()

    expect(api.textLanguages).toBeCalledTimes(1)
    expect(api.ocrLanguages).toBeCalledTimes(1)
  })

  it('should show the project selector when there is several projects', async () => {
    await core.config.set('defaultProject', 'foo')
    await core.config.set('projects', [{ name: 'bar' }, { name: 'foo' }])
    await wrapper.setData({ defaultProject: 'foo' })
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeTruthy()
  })

  it('should show the project selector when there is only one project', async () => {
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeFalsy()
  })
})
