import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import store from '@/store'
import router from '@/router'

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

  it('getKeys should return the keys combination for default OS', () => {
    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['ctrl', 'arrowleft'])
    expect(wrapper.vm.getKeys('goToNextDocument')).toEqual(['ctrl', 'arrowright'])
  })

  it('getKeys should return the keys combination for mac OS', () => {
    const languageGetter = jest.spyOn(window.navigator, 'platform', 'get')
    languageGetter.mockReturnValue('MacIntel')

    expect(wrapper.vm.getKeys('goToPreviousDocument')).toEqual(['meta', 'arrowleft'])
    expect(wrapper.vm.getKeys('goToNextDocument')).toEqual(['meta', 'arrowright'])
  })

  it('getAction should execute the matching method', () => {
    wrapper.vm.goToPreviousDocument = jest.fn()
    jest.spyOn(wrapper.vm, 'goToPreviousDocument')

    wrapper.vm.getAction('goToPreviousDocument')

    expect(wrapper.vm.goToPreviousDocument).toHaveBeenCalledTimes(1)
  })
})
