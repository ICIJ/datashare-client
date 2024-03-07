import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import ExtractingForm from '@/components/ExtractingForm'

describe('ExtractingForm.vue', () => {
  let wrapper, i18n, localVue, router, store, api, wait, config

  const propsData = {
    textLanguages: [
      { name: 'ENGLISH', iso6392: 'eng' },
      { name: 'FRENCH', iso6392: 'fra' }
    ],
    ocrLanguages: [{ name: 'ENGLISH', iso6392: 'eng' }],
    hasTesseract: true
  }

  beforeAll(() => {
    api = {
      textLanguages: vi.fn(),
      ocrLanguages: vi.fn(),
      index: vi.fn()
    }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    config = core.config
    localVue = core.localVue
    router = core.router
    store = core.store
    wait = core.wait
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    await config.set('defaultProject', 'local-datashare')
    await config.set('projects', [{ name: 'local-datashare' }])
    wrapper = shallowMount(ExtractingForm, { i18n, localVue, propsData, router, store, wait })
  })

  afterEach(() => store.commit('indexing/reset'))

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
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    wrapper.vm.$set(wrapper.vm, 'language', 'fra')
    wrapper.vm.submitExtract()
    expect(api.index).toBeCalledTimes(1)
    expect(api.index).toBeCalledWith(
      expect.objectContaining({
        ocr: true,
        filter: true,
        language: 'fra'
      })
    )
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
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

  it.only('should show the project selector when there is several projects', async () => {
    await config.set('defaultProject', 'foo')
    await config.set('projects', [{ name: 'bar' }, { name: 'foo' }])
    await wrapper.setData({ defaultProject: 'foo' })
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeTruthy()
  })

  it('should show the project selector when there is only one project', async () => {
    expect(wrapper.findComponent({ name: 'ProjectSelector' }).exists()).toBeFalsy()
  })
})
