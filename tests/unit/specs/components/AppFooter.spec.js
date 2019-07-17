import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { mount, shallowMount } from '@vue/test-utils'
import AppFooter from '@/components/AppFooter'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import fetchPonyfill from 'fetch-ponyfill'
import { jsonOk } from 'tests/unit/tests_utils'
import { createApp } from '@/main'

const { fetch } = fetchPonyfill()
window.fetch = fetch

describe('AppFooter.vue', () => {
  let wrapper, appVue, i18n

  beforeAll(async () => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonOk({ userIndices: [] }))
    appVue = await createApp()
    i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })
  })

  beforeEach(() => {
    Murmur.config.merge({ mode: 'LOCAL' })
    jest.spyOn(window, 'fetch')
    window.fetch.mockReturnValue(jsonOk())
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
  })

  afterEach(() => {
    localStorage.removeItem('locale')
    i18n.locale = 'en'
    window.fetch.mockRestore()
    datashare.fetch.mockRestore()
  })

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.clientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toEqual(sha1)
    expect(sha1.length).toEqual(7)
  })

  it('should display server git sha1 and version', async () => {
    window.fetch.mockReturnValue(jsonOk({
      'git.build.version': 'version',
      'git.commit.id.abbrev': 'sha1_abbrev'
    }))
    wrapper = shallowMount(AppFooter, { appVue, i18n, router, store })
    await wrapper.vm.promise

    expect(wrapper.find('.app__footer__tooltip__server__value').text()).toEqual('sha1_abbrev')
    expect(wrapper.find('.app__footer__addon--version').text()).toEqual('version')
  })

  it('should display the interfaces in English by default', () => {
    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('English')
  })

  it('should display the interface in French if localStorage says so', () => {
    localStorage.setItem('locale', 'fr')
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('Français')
  })

  it('should display the interface in Spanish if localStorage says so', () => {
    localStorage.setItem('locale', 'es')
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('Español')
  })

  it('should display a lang bar with 3 languages', () => {
    expect(wrapper.find('.app__footer__addon--locale').exists()).toBeTruthy()
    expect(wrapper.findAll('.app__footer__addon--locale .dropdown-item').length).toEqual(3)
  })

  it('should switch from English to French interface language', async () => {
    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('English')

    wrapper.findAll('.app__footer__addon--locale .dropdown-item').at(1).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('Français')
    expect(localStorage.getItem('locale')).toEqual('fr')
  })

  it('should switch from English to Spanish interface language', async () => {
    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('English')

    wrapper.findAll('.app__footer__addon--locale .dropdown-item').at(2).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.app__footer__addon--locale button').text()).toEqual('Español')
    expect(localStorage.getItem('locale')).toEqual('es')
  })

  it('should display the app__footer__addon in LOCAL mode', () => {
    expect(wrapper.findAll('.app__footer .app__footer__addon--homedir')).toHaveLength(1)
  })

  it('should NOT display the app__footer__addon in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app__footer .app__footer__addon--homedir')).toHaveLength(0)
  })

  it('should display the delete index button', () => {
    expect(wrapper.findAll('.app__footer .app__footer__addon--delete-index')).toHaveLength(1)
  })

  it('should NOT display the delete index button in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    wrapper = shallowMount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.findAll('.app__footer .app__footer__addon--delete-index')).toHaveLength(0)
  })

  it('should emit an index::delete::all event when calling the deleteAll method', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('index::delete::all', mockCallback)

    await wrapper.vm.deleteAll()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})
