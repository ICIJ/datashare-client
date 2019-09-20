import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { shallowMount } from '@vue/test-utils'
import messages from '@/lang/en'
import AppSidebar from '@/components/AppSidebar'
import router from '@/router'
import store from '@/store'
import { getOS } from '@/utils/utils'
import { createApp } from '@/main'
import mode from '@/modes'
import { jsonOk } from 'tests/unit/tests_utils'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('AppSidebar.vue', () => {
  let appVue, i18n

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: [] }))
    appVue = await createApp()
    i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })
  })

  beforeEach(() => getOS.mockReset())

  it('should display the link to analyze my documents', () => {
    Murmur.config.set('analyzeDocuments', true)
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').length).toEqual(1)
  })

  it('should NOT display the link to analyze my documents according to config', () => {
    Murmur.config.set('analyzeDocuments', false)
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').length).toEqual(0)
  })

  it('should not display the link to the analyse page in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').length).toEqual(0)
  })

  it('should display the github help link', () => {
    Murmur.config.merge(mode('LOCAL'))
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes().href).toEqual(expect.stringContaining('github.com'))
  })

  it('should display the jira help link in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes().href).toEqual(expect.stringContaining('jira.icij.org'))
  })

  it('should NOT display a logout link', () => {
    Murmur.config.set('multiTenant', false)
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').length).toEqual(0)
  })

  it('should display a logout link in multiTenant mode', () => {
    Murmur.config.set('multiTenant', true)
    const wrapper = shallowMount(AppSidebar, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').length).toEqual(1)
  })
})
