import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppSidebar from '@/components/AppSidebar'
import router from '@/router'
import store from '@/store'
import { getOS } from '@/utils/utils'
import { createApp } from '@/main'
import mode from '@/modes'
import { jsonResp } from 'tests/unit/tests_utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('AppSidebar.vue', () => {
  let localVue = createLocalVue()

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonResp({ userProjects: [] }))
    localVue = createLocalVue()
    await createApp(localVue)
  })

  beforeEach(() => getOS.mockReset())

  it('should display the link to analyze my documents', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeTruthy()
  })

  it('should NOT display the link to analyze my documents according to config', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should NOT display the link to the analyse page in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should display the github help link', () => {
    Murmur.config.merge(mode('LOCAL'))
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('github.com'))
  })

  it('should display the jira help link in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('jira.icij.org'))
  })

  it('should NOT display a logout link', () => {
    Murmur.config.set('mode', 'LOCAL')
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeFalsy()
  })

  it('should display a logout link in server mode', () => {
    Murmur.config.set('mode', 'SERVER')
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeTruthy()
  })

  it('should NOT display the Mounted location component if not in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeFalsy()
  })

  it('should display the Mounted location component if in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { localVue, router, store, mocks: { $t: msg => msg } })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeTruthy()
  })
})
