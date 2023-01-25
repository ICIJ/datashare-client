import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingFormOcrControl from '@/components/ExtractingFormOcrControl'

const OCR_LANGUAGES = [
  { name: 'CHINESE', iso6392: 'zho' },
  { name: 'ENGLISH', iso6392: 'eng' },
  { name: 'FRENCH', iso6392: 'fra' }
]

const TEXT_LANGUAGES = [
  { name: 'CHINESE', iso6392: 'zho' },
  { name: 'ENGLISH', iso6392: 'eng' },
  { name: 'FRENCH', iso6392: 'fra' },
  { name: 'SPANISH', iso6392: 'spa' },
  { name: 'ITALIAN', iso6392: 'ita' }
]

describe('ExtractingFormOcrControl.vue', () => {
  let wrapper
  let wait, store, i18n, api, localVue
  let spyText, spyOcr
  beforeAll(async () => {
    api = new Api()
    localVue = createLocalVue()
    const core = Core.init(localVue, api).useAll()
    wait = core.wait
    store = core.store
    i18n = core.i18n
  })
  afterEach(() => {
    spyText?.mockClear()
    spyOcr?.mockClear()
  })

  describe('OCR for italian language is installed', () => {
    beforeEach(async () => {
      // Mock textLanguages method
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockImplementation(() => TEXT_LANGUAGES)
      spyOcr = jest.spyOn(Api.prototype, 'ocrLanguages').mockImplementation(() => OCR_LANGUAGES)
    })
    it('should display an alert indicating that no ocr are installed', async () => {
      wrapper = mount(ExtractingFormOcrControl, { wait, store, i18n, localVue, propsData: { isoLang: 'ita' } })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control__install_ocr').exists()).toBe(true)
      expect(wrapper.find('.extracting_language_form_control__install_ocr').text()).toContain("'Italian'")
    })
  })
})
