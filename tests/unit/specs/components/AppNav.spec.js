import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import messages from '@/messages'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppNav from '@/components/AppNav'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import router from '@/router'
import store from '@/store'
import getOS from '@/utils/user'

jest.mock('@/utils/user', () => jest.fn())

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.component('font-awesome-icon', FontAwesomeIcon)
localVue.use(VueI18n)
const i18n = new VueI18n({ locale: 'en', messages })

describe('AppNav.vue', () => {
  let wrapper

  beforeEach(() => {
    getOS.mockReset()
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
  })

  it('should display a menu', () => {
    expect(wrapper.find('.app__nav__container__main__menu').exists()).toBeTruthy()
    expect(wrapper.findAll('.app__nav__container__main__menu__item').length).toEqual(6)
  })

  it('should display the Mac link to the doc', () => {
    getOS.mockImplementation(() => 'mac')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.find('.app__nav__container__main__menu__item a').attributes().href).toEqual('https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare')
  })

  it('should display the Windows link to the doc', () => {
    getOS.mockImplementation(() => 'windows')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.find('.app__nav__container__main__menu__item a').attributes().href).toEqual('https://icij.gitbook.io/datashare/windows/how-to-add-documents-to-datashare')
  })

  it('should display the Linux link to the doc', () => {
    getOS.mockImplementation(() => 'linux')
    wrapper = shallowMount(AppNav, { localVue, i18n, router, store })
    expect(wrapper.find('.app__nav__container__main__menu__item a').attributes().href).toEqual('https://icij.gitbook.io/datashare/linux/how-to-add-documents-to-datashare')
  })

  it('should display the default link to the doc', () => {
    expect(wrapper.find('.app__nav__container__main__menu__item a').attributes().href).toEqual('https://icij.gitbook.io/datashare/')
  })
})
