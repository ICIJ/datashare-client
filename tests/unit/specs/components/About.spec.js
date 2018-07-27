import Vuex from 'vuex'
import VueI18n from 'vue-i18n'

import { createLocalVue, mount } from '@vue/test-utils'
import sinon from 'sinon'
import { expect } from 'chai'
import fetchPonyfill from 'fetch-ponyfill'

import About from '@/components/About'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

const { fetch, Response } = fetchPonyfill()
window.fetch = fetch

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})

describe('About.vue', () => {
  var wrapped = null

  beforeEach(() => {
    sinon.stub(window, 'fetch')
  })

  afterEach(() => {
    window.fetch.restore()
  })

  it('should display client git sha1', () => {
    window.fetch.returns(jsonOk({}))
    wrapped = mount(About, {localVue, i18n, router, store})
    let sha1 = wrapped.vm.clientHash
    expect(sha1.match(/[a-z0-9]*/)[0]).to.equal(sha1)
    expect(sha1.length).to.equal(7)
  })

  it('should display server git sha1 and version', async () => {
    window.fetch.returns(jsonOk({
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
    wrapped = mount(About, {localVue, i18n, router, store})
    await wrapped.vm.promise
    expect(wrapped.vm.$el.querySelectorAll('.about dd')[0].textContent).to.equal('version')
    expect(wrapped.vm.$el.querySelectorAll('.about dd')[2].textContent).to.equal('sha1_abbrev')
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
