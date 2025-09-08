import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskDocumentsFormOcrAlert from '@/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert'

vi.mock('@/api/apiInstance', () => {
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

  return {
    apiInstance: {
      index: vi.fn(),
      indexPath: vi.fn(),
      ocrLanguages: vi.fn().mockResolvedValue(OCR_LANGUAGES),
      textLanguages: vi.fn().mockResolvedValue(TEXT_LANGUAGES)
    }
  }
})

describe('TaskDocumentsFormOcrAlert.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('OCR for italian language is not installed', () => {
    beforeEach(async () => {
      wrapper = mount(TaskDocumentsFormOcrAlert, {
        global: {
          plugins
        },
        props: {
          language: 'ita'
        }
      })
      await flushPromises()
    })

    it('should display an alert indicating that no OCR is installed for italian', () => {
      expect(wrapper.find('.task-documents-form-ocr-alert').text()).toContain('OCR for "Italian" is not installed.')
      expect(wrapper.find('.task-documents-form-ocr-alert__install-ocr-language').exists()).toBeTruthy()
    })
  })

  describe('OCR for french language is installed', () => {
    beforeEach(async () => {
      wrapper = mount(TaskDocumentsFormOcrAlert, {
        global: {
          plugins
        },
        props: {
          language: 'fra'
        }
      })
      await flushPromises()
    })

    it('should not display an alert indicating that no OCR is installed for french', () => {
      expect(wrapper.find('.task-documents-form-ocr-alert').text()).not.toContain('OCR for "french" is not installed.')
      expect(wrapper.find('.task-documents-form-ocr-alert__install-ocr-language').exists()).toBeFalsy()
    })
  })
})
