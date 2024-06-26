import { shallowMount } from '@vue/test-utils'

import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { Core } from '@/core'

vi.mock('@/utils/shortkeys.json', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    SearchDocumentNavbar: {
      goToPreviousDocument: {
        keys: {
          mac: ['meta', 'arrowleft'],
          default: ['ctrl', 'arrowleft']
        },
        action: 'goToPreviousDocument'
      },
      goToNextDocument: {
        keys: {
          mac: ['meta', 'arrowright'],
          default: ['ctrl', 'arrowright']
        },
        action: 'goToNextDocument'
      },
      backToSearchResults: {
        keys: {
          mac: ['esc'],
          default: ['esc']
        },
        action: 'back'
      }
    }
  }
})

const { store, router } = Core.init().useAll().useRouter()

describe('shortkeys mixin', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchDocumentNavbar, { store, router, mocks: { $t: (msg) => msg } })
  })

  it('should return the getShortkey object for "goToPreviousDocument" action', () => {
    const result = {
      keys: { mac: ['meta', 'arrowleft'], default: ['ctrl', 'arrowleft'] },
      action: 'goToPreviousDocument'
    }
    expect(wrapper.vm.getShortkey('goToPreviousDocument')).toMatchObject(result)
  })

  it('should return "undefined" for getShortkey of an undefined action', () => {
    expect(wrapper.vm.getShortkey('undefinedAction')).toEqual(undefined)
  })

  it('should return the keys combination for "goToPreviousDocument" action for default OS', () => {
    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['ctrl', 'arrowleft'])
  })

  it('should return the keys combination for "goToPreviousDocument" action for mac OS', () => {
    const languageGetter = vi.spyOn(window.navigator, 'platform', 'get')
    languageGetter.mockReturnValue('MacIntel')

    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['meta', 'arrowleft'])
  })

  it('should return "undefined" for getKeys of an undefined action', () => {
    expect(wrapper.vm.getKeys('undefinedAction')).toEqual(undefined)
  })

  it('should execute the getAction of the matching method for "goToPreviousDocument"', () => {
    wrapper.vm.goToPreviousDocument = vi.fn()
    vi.spyOn(wrapper.vm, 'goToPreviousDocument')

    wrapper.vm.getAction('goToPreviousDocument')

    expect(wrapper.vm.goToPreviousDocument).toHaveBeenCalledTimes(1)
  })
})
