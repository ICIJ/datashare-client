import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingForm from '@/components/ExtractingForm'

describe('ExtractingForm.vue', () => {
  let wrapper, i18n, localVue, router, store, mockAxios, api, wait, config

  const propsData = {
    textLanguages: [
      { name: 'ENGLISH', iso6392: 'eng' },
      { name: 'FRENCH', iso6392: 'fra' }
    ],
    ocrLanguages: [{ name: 'ENGLISH', iso6392: 'eng' }],
    hasTesseract: true
  }

  beforeAll(() => {
    mockAxios = { request: jest.fn().mockResolvedValue([]), get: jest.fn().mockResolvedValue([]) }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    config = core.config
    localVue = core.localVue
    router = core.router
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    config.set('defaultProject', 'local-datashare')
    config.set('projects', [{ name: 'local-datashare' }])
    wrapper = shallowMount(ExtractingForm, { i18n, localVue, propsData, router, store, wait })
    mockAxios.request.mockClear()
    mockAxios.get.mockClear()
    mockAxios.request.mockResolvedValue({ data: {} })
    mockAxios.get.mockResolvedValue({ data: {} })
  })

  afterEach(() => store.commit('indexing/reset'))

  it('should call extract action without OCR option, by default', () => {
    wrapper.vm.submitExtract()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/batchUpdate/index/file'),
        method: 'POST',
        data: {
          options: expect.objectContaining({
            ocr: false,
            filter: true
          })
        }
      })
    )
  })

  it('should call extract action with OCR option and language', () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    wrapper.vm.$set(wrapper.vm, 'language', 'fra')
    wrapper.vm.submitExtract()

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/task/batchUpdate/index/file'),
        method: 'POST',
        data: {
          options: expect.objectContaining({
            ocr: true,
            filter: true,
            language: 'fra',
            ocrLanguage: 'fra'
          })
        }
      })
    )
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    await wrapper.vm.submitExtract()
    expect(wrapper.vm.ocr).toBeFalsy()
  })

  it('should call retrieve text and ocr languages', () => {
    wrapper.vm.loadLanguages()

    expect(mockAxios.request).toBeCalledTimes(2)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/settings/text/languages')
      })
    )
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/settings/ocr/languages')
      })
    )
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
