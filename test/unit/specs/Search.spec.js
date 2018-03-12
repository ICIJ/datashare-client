import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'
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
  before(done => {
    es.indices.create({index: process.env.CONFIG.es_index})
    es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping}).then(() => { done() })
  })
  after(done => {
    es.indices.delete({index: process.env.CONFIG.es_index}).then(() => { done() })
  })

  it('should display no document found', done => {
    const Constructor = Vue.extend(Search)
    const vm = new Constructor({i18n, router}).$mount()

    vm.query = 'foo'
    var p = vm.search()
    p.then(() => {
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.search-results h3').textContent).to.equal('No document found for "foo"')
        done()
      })
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
