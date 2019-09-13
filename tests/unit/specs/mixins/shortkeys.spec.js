import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import store from '@/store'
import router from '@/router'

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

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueShortkey)

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
