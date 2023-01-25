import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingLanguageFormControl from '@/components/ExtractingLanguageFormControl'

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
  let spyText
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
  })
  describe('Has languages available', () => {
    beforeEach(async () => {
      // Mock textLanguages method
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockImplementation(() => TEXT_LANGUAGES)
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
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
  describe('When a fetching error occurs ', () => {
    it('should emit an ocr-error event on text languages reject', async () => {
      spyText = jest.spyOn(Api.prototype, 'textLanguages').mockRejectedValue(() => {})
      wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
      await flushPromises()
      expect(wrapper.find('.extracting_language_form_control--no-language').exists()).toBe(true)
      expect(wrapper.find('.extracting_language_form_control--no-language').text()).toBe('Failed to retrieve languages')
    })
  })
})
