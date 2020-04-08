import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import AppSidebar from '@/components/AppSidebar'
import { Core } from '@/core'
import mode from '@/modes'
import { getOS } from '@/utils/utils'
import { jsonResp } from 'tests/unit/tests_utils'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()

describe('AppSidebar.vue', () => {
  beforeAll(() => {
    window.fetch = jest.fn().mockReturnValue(jsonResp({ userProjects: [] }))
  })

  beforeEach(() => getOS.mockReset())

  afterAll(() => jest.unmock('@/utils/utils'))

  it('should display the link to analyze my documents', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeTruthy()
  })

  it('should NOT display the link to analyze my documents according to config', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should NOT display the link to the analyse page in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--documents').exists()).toBeFalsy()
  })

  it('should display the github help link', () => {
    Murmur.config.merge(mode('LOCAL'))
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toEqual(expect.stringContaining('github.com'))
  })

  it('should display the help link in SERVER mode', () => {
    Murmur.config.merge(mode('SERVER'))
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.find('.app-sidebar__container__menu__item--help a').attributes('href')).toBe('https://support.cloud.icij.org/')
  })

  it('should NOT display a logout link', () => {
    Murmur.config.set('mode', 'LOCAL')
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeFalsy()
  })

  it('should display a logout link in server mode', () => {
    Murmur.config.set('mode', 'SERVER')
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item--logout').exists()).toBeTruthy()
  })

  it('should NOT display the Mounted location component if not in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', false)
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeFalsy()
  })

  it('should display the Mounted location component if in manageDocuments mode', () => {
    Murmur.config.set('manageDocuments', true)
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__data-location').exists()).toBeTruthy()
  })

  it('should disable menu links if no projects', () => {
    Murmur.config.set('datashare_projects', [])
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item__link--disabled')).toHaveLength(1)
  })

  it('should enable menu links if projects', () => {
    Murmur.config.set('datashare_projects', ['project'])
    const wrapper = shallowMount(AppSidebar, { i18n, localVue, store, router })
    expect(wrapper.findAll('.app-sidebar__container__menu__item__link--disabled').exists()).toBeFalsy()
  })
})
