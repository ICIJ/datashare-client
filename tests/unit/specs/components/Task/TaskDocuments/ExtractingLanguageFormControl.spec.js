import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import ExtractingLanguageFormControl from '@/components/Task/TaskDocuments/ExtractingLanguageFormControl'

const TEXT_LANGUAGES = [
  { name: 'CHINESE', iso6392: 'zho' },
  { name: 'ENGLISH', iso6392: 'eng' },
  { name: 'FRENCH', iso6392: 'fra' },
  { name: 'SPANISH', iso6392: 'spa' },
  { name: 'ITALIAN', iso6392: 'ita' }
]

describe('ExtractingLanguageFormControl.vue', () => {
  let api

  beforeEach(async () => {
    api = { textLanguages: vi.fn() }
  })

  describe('Has languages available', () => {
    let wrapper

    beforeEach(async () => {
      api.textLanguages.mockResolvedValue(TEXT_LANGUAGES)
      const { plugins } = CoreSetup.init(api).useAll()
      wrapper = mount(ExtractingLanguageFormControl, { global: { plugins } })
      await flushPromises()
    })

    it('should list text languages and default', () => {
      expect(wrapper.findAll('option')).toHaveLength(6)
    })

    it('should have default as first option', () => {
      expect(wrapper.findAll('option').at(0).text()).toBe('Detect automatically (default)')
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
  })

  describe('When a fetching error occurs', () => {
    let wrapper

    beforeEach(async () => {
      api.textLanguages.mockRejectedValue({})
      const { plugins } = CoreSetup.init(api).useAll()
      wrapper = mount(ExtractingLanguageFormControl, { global: { plugins } })
      await flushPromises()
    })

    it('should emit an ocr-error event on text languages reject', () => {
      expect(wrapper.find('.extracting-language-form-control--no-language').exists()).toBeTruthy()
      expect(wrapper.find('.extracting-language-form-control--no-language').text()).toBe('Failed to retrieve languages')
    })
  })
})
