import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { mount, shallowMount } from '@vue/test-utils'
import AppFooter from '@/components/AppFooter'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import { EventBus } from '@/utils/event-bus'
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
    jest.spyOn(window, 'fetch')
    window.fetch.mockReturnValue(jsonOk({}))
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
  })

  afterEach(() => {
    localStorage.removeItem('lang')
    i18n.locale = 'en'
    window.fetch.mockRestore()
    datashare.fetch.mockRestore()
  })

  afterAll(() => window.fetch.mockRestore())

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.clientHash

    expect(sha1.match(/[a-z0-9]*/)[0]).toEqual(sha1)
    expect(sha1.length).toEqual(7)
  })

  it('should display server git sha1 and version', async () => {
    window.fetch.mockReturnValue(jsonOk({
      'git.commit.message.short': '[launchBack] Increase Java RAM to 4Go',
      'git.build.user.name': 'Bruno Thomas',
      'git.remote.origin.url': 'git@github.com:ICIJ/datashare.git',
      'git.dirty': 'true',
      'git.build.user.email': 'bruno@barreverte.fr',
      'git.closest.tag.name': '',
      'git.branch': 'master',
      'git.tags': '',
      'git.build.time': '2018-07-19T10:30:50+0200',
      'git.commit.user.email': 'anne.lhote@gmail.com',
      'git.build.host': 'dev',
      'git.commit.id.describe-short': '6240439-dirty',
      'git.closest.tag.commit.count': '',
      'git.commit.message.full': '[launchBack] Increase Java RAM to 4Go',
      'git.commit.user.name': 'annelhote',
      'git.commit.time': '2018-07-18T15:23:59+0200',
      'git.commit.id.describe': '6240439-dirty',
      'git.build.version': 'version',
      'git.commit.id': 'sha1',
      'git.commit.id.abbrev': 'sha1_abbrev'
    }))
    wrapper = shallowMount(AppFooter, { appVue, i18n, router, store })
    await wrapper.vm.promise

    expect(wrapper.find('.app__footer__tooltip__server__value').text()).toEqual('sha1_abbrev')
    expect(wrapper.find('.app__footer__addon--version').text()).toEqual('version')
  })

  it('should display the interfaces in English by default', () => {
    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('English')
  })

  it('should display the interface in French if localStorage says so', () => {
    localStorage.setItem('lang', 'fr')
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('Français')
  })

  it('should display the interface in Spanish if localStorage says so', () => {
    localStorage.setItem('lang', 'es')
    wrapper = mount(AppFooter, { appVue, i18n, router, store })
    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('Español')
  })

  it('should display a lang bar with 3 languages', () => {
    expect(wrapper.find('.app__footer__addon--lang').exists()).toBeTruthy()
    expect(wrapper.findAll('.app__footer__addon--lang .dropdown-item').length).toEqual(3)
  })

  it('should switch from English to French interface language', async () => {
    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('English')

    wrapper.findAll('.app__footer__addon--lang .dropdown-item').at(1).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('Français')
    expect(localStorage.getItem('lang')).toEqual('fr')
  })

  it('should switch from English to Spanish interface language', async () => {
    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('English')

    wrapper.findAll('.app__footer__addon--lang .dropdown-item').at(2).trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.app__footer__addon--lang button').text()).toEqual('Español')
    expect(localStorage.getItem('lang')).toEqual('es')
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

  it('should emit an index::delete::all event when calling the deleteAll method', async () => {
    const mockCallback = jest.fn()
    EventBus.$on('index::delete::all', mockCallback)
    await wrapper.vm.deleteAll()
    await wrapper.vm.$nextTick()
    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})
