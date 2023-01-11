import { createLocalVue, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ExtractingLanguageFormControl from '@/components/ExtractingLanguageFormControl'

const TEXT_LANGUAGES = [
  { name: 'CHINESE', iso6392: 'zho' },
  { name: 'ENGLISH', iso6392: 'eng' },
  { name: 'FRENCH', iso6392: 'fra' }
]

// Mock textLanguages method
jest.spyOn(Api.prototype, 'textLanguages').mockImplementation(() => TEXT_LANGUAGES)

describe('ExtractingLanguageFormControl.vue', () => {
  let wrapper

  beforeAll(async () => {
    const api = new Api()
    const localVue = createLocalVue()
    const { wait, store, i18n } = Core.init(localVue, api).useAll()
    wrapper = mount(ExtractingLanguageFormControl, { wait, store, i18n, localVue })
    await flushPromises()
  })

  it('should list all languages', () => {
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
})
