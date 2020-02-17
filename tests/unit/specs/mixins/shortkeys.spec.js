import { createLocalVue, shallowMount } from '@vue/test-utils'

import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { Core } from '@/core'

jest.mock('@/utils/shortkeys.json', () => {
  return {
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

const { localVue, router, store } = Core.init(createLocalVue()).useAll()

describe('shortkeys mixin', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchDocumentNavbar, { localVue, store, router, mocks: { $t: msg => msg } })
  })

  it('should return the getShortkey object for "goToPreviousDocument" action', () => {
    const result = { keys: { mac: ['meta', 'arrowleft'], default: ['ctrl', 'arrowleft'] }, action: 'goToPreviousDocument' }
    expect(wrapper.vm.getShortkey('goToPreviousDocument')).toEqual(result)
  })

  it('should return "undefined" for getShortkey of an undefined action', () => {
    expect(wrapper.vm.getShortkey('undefinedAction')).toEqual(undefined)
  })

  it('should return the keys combination for "goToPreviousDocument" action for default OS', () => {
    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['ctrl', 'arrowleft'])
  })

  it('should return the keys combination for "goToPreviousDocument" action for mac OS', () => {
    const languageGetter = jest.spyOn(window.navigator, 'platform', 'get')
    languageGetter.mockReturnValue('MacIntel')

    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['meta', 'arrowleft'])
  })

  it('should return "undefined" for getKeys of an undefined action', () => {
    expect(wrapper.vm.getKeys('undefinedAction')).toEqual(undefined)
  })

  it('should execute the getAction of the matching method for "goToPreviousDocument"', () => {
    wrapper.vm.goToPreviousDocument = jest.fn()
    jest.spyOn(wrapper.vm, 'goToPreviousDocument')

    wrapper.vm.getAction('goToPreviousDocument')

    expect(wrapper.vm.goToPreviousDocument).toHaveBeenCalledTimes(1)
  })
})
