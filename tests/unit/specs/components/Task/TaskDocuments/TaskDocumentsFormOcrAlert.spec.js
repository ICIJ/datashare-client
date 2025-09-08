import { mount, flushPromises } from '@vue/test-utils'

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
  let wrapper

  describe('OCR for italian language is not installed', () => {
    beforeEach(async () => {
      const { plugins } = CoreSetup.init().createPinia().useAll()

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
      console.log(wrapper.html())
      expect(wrapper.text()).toContain('OCR for "Italian" is not installed.')
    })
  })

  describe('OCR for french language is installed', () => {
    beforeEach(async () => {
      const { plugins } = CoreSetup.init().createPinia().useAll()

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
      expect(wrapper.text()).not.toContain('OCR for "french" is not installed.')
    })
  })
})
