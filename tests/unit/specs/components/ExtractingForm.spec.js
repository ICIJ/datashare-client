import axios from 'axios'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import ExtractingForm from '@/components/ExtractingForm'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('ExtractingForm.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(ExtractingForm, { i18n, localVue, router, store })
    axios.request.mockClear()
  })

  afterEach(() => store.commit('indexing/reset'))

  it('should call extract action without OCR option, by default', () => {
    wrapper.vm.submitExtract()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/batchUpdate/index/file'),
      method: 'POST',
      data: {
        options: {
          ocr: false,
          filter: true
        }
      }
    }))
  })

  it('should call extract action with OCR option', () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    wrapper.vm.submitExtract()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/task/batchUpdate/index/file'),
      method: 'POST',
      data: {
        options: {
          ocr: true,
          filter: true
        }
      }
    }))
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.$set(wrapper.vm, 'ocr', true)
    await wrapper.vm.submitExtract()

    expect(wrapper.vm.ocr).toBeFalsy()
  })
})
