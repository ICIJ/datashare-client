import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import { datashare } from '@/store/modules/indexing'
import Api from '@/api'
import ExtractingForm from '@/components/ExtractingForm'
import { jsonResp } from 'tests/unit/tests_utils'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('ExtractingForm.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ExtractingForm, { localVue, router, store, mocks: { $t: msg => msg } })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
    datashare.fetch.mockClear()
  })

  afterEach(() => store.commit('indexing/reset'))

  afterAll(() => {
    datashare.fetch.mockRestore()
  })

  it('should call extract action without OCR option, by default', () => {
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/task/batchUpdate/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: false, filter: true } }) })
  })

  it('should call extract action with OCR option', () => {
    wrapper.vm.ocr = true
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/task/batchUpdate/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: true, filter: true } }) })
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.ocr = true
    await wrapper.vm.submitExtract()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ocr).toBeFalsy()
  })
})
