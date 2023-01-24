import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingLanguageFormControl from '@/components/ExtractingLanguageFormControl'

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

describe('ExtractingLanguageFormControl.vue', () => {
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
  describe('Has languages available', () => {
    beforeEach(async () => {
      // Mock textLanguages method
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockImplementation(() => TEXT_LANGUAGES)
      spyOcr = jest.spyOn(Api.prototype, 'ocrLanguages').mockImplementation(() => OCR_LANGUAGES)
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
    })
    it('should list only ocr languages', () => {
      expect(wrapper.findAll('option')).toHaveLength(4)
    })

    it('should use the correct label for CHINESE', () => {
      expect(wrapper.findAll('option').at(1).text()).toBe('Chinese')
    })

    it('should use the correct label for ENGLISH', () => {
      expect(wrapper.findAll('option').at(2).text()).toBe('English')
    })

    it('should use the correct label for FRENCH', () => {
      expect(wrapper.findAll('option').at(3).text()).toBe('French')
    })
    it('should have 5 available languages', () => {
      expect(wrapper.find('.extracting_language_form_control__install_ocr').text()).toContain(
        'Choose among 5 languages to install'
      )
    })
  })
  describe('No languages installed', () => {
    beforeEach(async () => {
      // Mock textLanguages method
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockImplementation(() => TEXT_LANGUAGES)
      spyOcr = jest.spyOn(Api.prototype, 'ocrLanguages').mockImplementation(() => [])
    })
    it('should display an alert indicating that no ocr are installed', async () => {
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control--no-ocr').exists()).toBe(true)
      expect(wrapper.find('.extracting_language_form_control__ocr-options').exists()).toBe(false)
      expect(wrapper.find('.extracting_language_form_control__ocr-options').exists()).toBe(false)
    })
    it('should emit an ocr-error event', async () => {
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
      expect(wrapper.emitted()['ocr-error']).toBeDefined()
    })
  })
  describe('When a fetching error occurs ', () => {
    it('should emit an ocr-error event on text languages reject', async () => {
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockRejectedValue(() => {})
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control--no-ocr').exists()).toBe(true)
      expect(wrapper.find('.extracting_language_form_control__ocr-options').exists()).toBe(false)
      expect(wrapper.find('.extracting_language_form_control__ocr-options').exists()).toBe(false)
    })
    it('should emit an ocr-error event on ocr languages reject', async () => {
      spyOcr = jest.spyOn(Api.prototype, 'ocrLanguages').mockRejectedValue(() => {})
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
      expect(wrapper.emitted()['ocr-error']).toBeDefined()
    })
  })
})
