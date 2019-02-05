import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppFooter from '@/components/AppFooter'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/lang/en'
import router from '@/router'
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item'
import bTooltip from 'bootstrap-vue/es/components/tooltip/tooltip'
import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Response } = fetchPonyfill()
window.fetch = fetch

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.component('font-awesome-icon', FontAwesomeIcon)
localVue.component('b-dropdown', bDropdown)
localVue.component('b-dropdown-item', bDropdownItem)
localVue.component('b-tooltip', bTooltip)
localVue.directive('b-tooltip', bTooltip)
localVue.prototype.config = { userDir: '/home/foo/Datashare' }
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('AppFooter.vue', () => {
  let wrapper

  beforeEach(() => {
    jest.spyOn(window, 'fetch')
    window.fetch.mockReturnValue(jsonOk({}))
    wrapper = shallowMount(AppFooter, { localVue, i18n, router })
  })

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
    wrapper = shallowMount(AppFooter, { localVue, i18n, router })
    await wrapper.vm.promise

    expect(wrapper.find('.app__footer__tooltip__server__value').text()).toEqual('sha1_abbrev')
    expect(wrapper.find('.app__footer__addon--version').text()).toEqual('version')
  })

  it('should display a lang bar with 2 languages', () => {
    expect(wrapper.find('.app__footer__addon--lang').exists()).toBeTruthy()
    expect(wrapper.findAll('.app__footer__addon--lang .dropdown-item').length).toEqual(2)
  })

  it('should switch from english to french interface language', async () => {
    expect(wrapper.find('.app__footer__addon').text()).toBe('Analyze my documents')

    wrapper.findAll('.app__footer__addon--lang .dropdown-item').at(1).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.app__footer__addon').text()).toBe('Analyser mes documents')
  })
})

function jsonOk (body) {
  const mockResponse = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
