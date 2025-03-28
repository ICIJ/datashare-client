import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlExtractingLanguage from '@/components/Form/FormControl/FormControlExtractingLanguage'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      textLanguages: vi.fn().mockResolvedValue([
        { name: 'CHINESE', iso6392: 'zho' },
        { name: 'ENGLISH', iso6392: 'eng' },
        { name: 'FRENCH', iso6392: 'fra' },
        { name: 'SPANISH', iso6392: 'spa' },
        { name: 'ITALIAN', iso6392: 'ita' }
      ])
    }
  }
})

describe('FormControlExtractingLanguage.vue', () => {
  describe('Has languages available', () => {
    let wrapper

    beforeEach(async () => {
      const { plugins } = CoreSetup.init().useAll()
      wrapper = mount(FormControlExtractingLanguage, { global: { plugins } })
      await flushPromises()
    })

    afterAll(() => {
      vi.resetAllMocks()
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
      const { plugins } = CoreSetup.init().useAll()
      wrapper = mount(FormControlExtractingLanguage, { global: { plugins } })
      await flushPromises()
    })

    it('should emit an ocr-error event on text languages reject', () => {
      expect(wrapper.find('.form-control-extracting-language--no-language').exists()).toBeTruthy()
      expect(wrapper.find('.form-control-extracting-language--no-language').text()).toBe('Failed to retrieve languages')
    })
  })
})
