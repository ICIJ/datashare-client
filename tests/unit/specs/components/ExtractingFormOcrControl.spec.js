import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
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
  const { plugins } = CoreSetup.init().useAll()
  let wrapper

  describe('OCR for italian language is installed', () => {
    it('should display an alert indicating that no ocr are installed', async () => {
      wrapper = mount(ExtractingFormOcrControl, {
        global: {
          plugins
        },
        props: {
          isoLang: 'ita',
          textLanguages: TEXT_LANGUAGES,
          ocrLanguages: OCR_LANGUAGES,
          hasTesseract: true
        }
      })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control__install_ocr_language').exists()).toBe(true)
      expect(wrapper.find('.extracting_language_form_control').text()).not.toContain('Tesseract OCR is not installed.')
    })

    it('should display an alert indicating that tesseract is not installed', async () => {
      wrapper = mount(ExtractingFormOcrControl, {
        global: {
          plugins
        },
        props: {
          isoLang: 'ita',
          textLanguages: TEXT_LANGUAGES,
          ocrLanguages: OCR_LANGUAGES,
          hasTesseract: false
        }
      })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control').text()).toContain('Tesseract OCR is not installed.')
    })
  })
})
