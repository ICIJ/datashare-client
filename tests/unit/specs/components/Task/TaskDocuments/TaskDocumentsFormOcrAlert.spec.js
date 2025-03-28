import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskDocumentsFormOcrAlert from '@/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert'

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

describe('TaskDocumentsFormOcrAlert.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper

  describe('OCR for italian language is installed', () => {
    it('should display an alert indicating that no OCR are installed', async () => {
      wrapper = mount(TaskDocumentsFormOcrAlert, {
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
      expect(wrapper.find('.task-documents-form-ocr-alert__install_ocr_language').exists()).toBe(true)
      expect(wrapper.find('.task-documents-form-ocr-alert').text()).not.toContain('Tesseract OCR is not installed.')
    })

    it('should display an alert indicating that tesseract is not installed', async () => {
      wrapper = mount(TaskDocumentsFormOcrAlert, {
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
      expect(wrapper.find('.task-documents-form-ocr-alert').text()).toContain('Tesseract OCR is not installed.')
    })
  })
})
