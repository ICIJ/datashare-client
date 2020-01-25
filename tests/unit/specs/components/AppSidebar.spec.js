import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppSidebar from '@/components/AppSidebar'
import { getOS } from '@/utils/utils'
import { App } from '@/main'
import mode from '@/modes'
import { jsonResp } from 'tests/unit/tests_utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

describe('AppSidebar.vue', () => {
  let localVue = null
  let router = null
  let store = null
  let mocks = { $t: msg => msg }

  beforeAll(async () => {
    ({ router, store, localVue } = App.init(createLocalVue()).useAll())
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonResp({ userProjects: [] }))
  })

  beforeEach(() => getOS.mockReset())

  it('should display the link to analyze my documents', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeTruthy()
  })

  it('should NOT display the link to analyze my documents according to config', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should NOT display the link to the analyse page in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should display the github help link', () => {
    Murmur.config.merge(mode('LOCAL'))
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('github.com'))
  })

  it('should display the jira help link in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('jira.icij.org'))
  })

  it('should NOT display a logout link', () => {
    Murmur.config.set('mode', 'LOCAL')
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeFalsy()
  })

  it('should display a logout link in server mode', () => {
    Murmur.config.set('mode', 'SERVER')
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeTruthy()
  })

  it('should NOT display the Mounted location component if not in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeFalsy()
  })

  it('should display the Mounted location component if in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { localVue, store, router, mocks })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeTruthy()
  })
})
