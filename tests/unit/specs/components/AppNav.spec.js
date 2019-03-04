import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppNav from '@/components/AppNav'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import router from '@/router'
import store from '@/store'
import { getOS } from '@/utils/user'

jest.mock('@/utils/user', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.component('font-awesome-icon', FontAwesomeIcon)
localVue.use(VueI18n)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('AppNav.vue', () => {
  let wrapper

  beforeEach(() => {
    getOS.mockReset()
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
  })

  afterEach(() => {
    localVue.prototype.config = { mode: 'LOCAL' }
  })

  it('should display a menu', () => {
    expect(wrapper.find('.app__nav__container__main__menu').exists()).toBeTruthy()
  })

  it('should display the link to analyze my documents', () => {
    expect(wrapper.findAll('.app__nav__container__main__menu__item router-link-stub').length).toEqual(1)
  })

  it('should NOT display the link to analyze my documents in SERVER mode', () => {
    localVue.prototype.config = { mode: 'SERVER' }
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item router-link-stub').length).toEqual(0)
  })

  it('should display the default link to the doc', () => {
    expect(wrapper.findAll('.app__nav__container__main__menu__item--documents').length).toEqual(1)
    expect(wrapper.find('.app__nav__container__main__menu__item--documents a').attributes().href).toEqual('https://icij.gitbook.io/datashare/')
  })

  it('should display the Mac link to the doc', () => {
    getOS.mockImplementation(() => 'mac')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item--documents a').at(0).attributes().href).toEqual('https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare')
  })

  it('should display the Windows link to the doc', () => {
    getOS.mockImplementation(() => 'windows')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item--documents a').at(0).attributes().href).toEqual('https://icij.gitbook.io/datashare/windows/how-to-add-documents-to-datashare')
  })

  it('should display the Linux link to the doc', () => {
    getOS.mockImplementation(() => 'linux')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item--documents a').at(0).attributes().href).toEqual('https://icij.gitbook.io/datashare/linux/how-to-add-documents-to-datashare')
  })

  it('should not display the link to the doc in SERVER mode', () => {
    localVue.prototype.config = { mode: 'SERVER' }
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item--documents').length).toEqual(0)
  })

  it('should display the github help link', () => {
    expect(wrapper.find('.app__nav__container__main__menu__item--help a').attributes().href).toEqual(expect.stringContaining('github.com'))
  })

  it('should display the jira help link in SERVER mode', () => {
    localVue.prototype.config = { mode: 'SERVER' }
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.find('.app__nav__container__main__menu__item--help a').attributes().href).toEqual(expect.stringContaining('jira.icij.org'))
  })

  it('should NOT display a logout link', () => {
    expect(wrapper.findAll('.app__nav__container__main__menu__item.logout').length).toEqual(0)
  })

  it('should NOT display a logout link in LOCAL mode', () => {
    localVue.prototype.config = { mode: 'LOCAL' }
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item.logout').length).toEqual(0)
  })

  it('should display a logout link in SERVER mode', () => {
    localVue.prototype.config = { mode: 'SERVER' }
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.findAll('.app__nav__container__main__menu__item.logout').length).toEqual(1)
  })
})
