import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'
import {mount, createLocalVue} from 'vue-test-utils'
import elasticsearch from 'elasticsearch-browser'
import esMapping from '@/datashare_index_mappings.json'
import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Search from '@/components/Search'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('Search.vue', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  var wrapped = null
  before(done => {
    es.indices.create({index: process.env.CONFIG.es_index})
    es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping}).then(() => { done() })
  })
  after(done => {
    es.indices.delete({index: process.env.CONFIG.es_index}).then(() => { done() })
  })
  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(router)
    localVue.use(VueI18n)
    wrapped = mount(Search, {i18n})
  })

  it('should display no document found', done => {
    wrapped.vm.query = 'foo'
    wrapped.vm.search().then(() => {
      expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('No document found for "foo"')
      done()
    })
  })

  //
  // it('should display one document found', done => {
  //   es.insert(new Document("bar").withContent('this is bar document'))
  //
  //   var p = wvm.vm.search('bar')
  //
  //   p.then(() => {
  //     Vue.nextTick(() => {
  //       console.log(wvm.vm.$el.outerHTML)
  //       expect(wvm.vm.$el.querySelector('.search-results h3')).to.equal('1 document found for "bar"')
  //       expect(wvm.vm.$el.querySelector('.search-results .fragment')).to.equal('this is <mark>bar</mark> document')
  //       done()
  //     })
  //   })
  // })
})
