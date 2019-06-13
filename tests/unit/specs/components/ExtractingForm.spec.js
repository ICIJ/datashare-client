import VueI18n from 'vue-i18n'
import { shallowMount } from '@vue/test-utils'
import ExtractingForm from '@/components/ExtractingForm'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import DatashareClient from '@/api/DatashareClient'
import { createApp } from '@/main'
import { jsonOk } from 'tests/unit/tests_utils'

describe('ExtractingForm.vue', () => {
  let wrapper, appVue, i18n

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: [] }))
    appVue = await createApp()
    i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })
  })

  beforeEach(() => {
    wrapper = shallowMount(ExtractingForm, { appVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockClear()
  })

  afterEach(() => store.commit('indexing/reset'))

  afterAll(() => {
    window.fetch.mockRestore()
    datashare.fetch.mockRestore()
  })

  it('should call extract action without OCR option, by default', () => {
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: false } }), credentials: 'same-origin' })
  })

  it('should call extract action with OCR option', () => {
    wrapper.vm.ocr = true
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: true } }), credentials: 'same-origin' })
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.ocr = true
    await wrapper.vm.submitExtract()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ocr).toBeFalsy()
  })
})
