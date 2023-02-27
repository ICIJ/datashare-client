import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingForm from '@/components/ExtractingForm'

describe('ExtractingForm.vue', () => {
  let wrapper, i18n, localVue, router, store, mockAxios, api, wait

  beforeAll(() => {
    mockAxios = { request: jest.fn(), get: jest.fn() }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    wrapper = shallowMount(ExtractingForm, { i18n, localVue, router, store, wait })
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
          options: {
            ocr: false,
            filter: true
          }
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
          options: {
            ocr: true,
            filter: true,
            language: 'fra',
            ocrLanguage: 'fra'
          }
        }
      })
    )
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    await wrapper.vm.submitExtract()

    expect(wrapper.vm.ocr).toBeFalsy()
  })
})
