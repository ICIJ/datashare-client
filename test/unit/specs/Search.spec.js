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
  beforeEach(done => {
    es.deleteByQuery({index: process.env.CONFIG.es_index, body: {query: {match_all: {}}}}).then(() => { done() })
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(Search, {i18n, router})
  })

  it('should display no document found', done => {
    wrapped.vm.query = 'foo'
    wrapped.vm.search().then(() => {
      expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('No document found for "foo"')
      done()
    })
  })

  it('should display one document found', done => {
    letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit(done)
    wrapped.vm.query = 'bar'
    wrapped.vm.search().then(() => {
      Vue.nextTick(() => {
        expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('1 document found for "bar"')
        expect(wrapped.vm.$el.querySelector('.search-results .fragment').innerHTML).to.equal('this is <mark>bar</mark> document')
        done()
      })
    })
  })

  it('should display two documents found', done => {
    letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit(done)
    letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit(done)
    wrapped.vm.query = 'bar'
    wrapped.vm.search().then(() => {
      Vue.nextTick(() => {
        expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('2 documents found for "bar"')
        expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(2)
        done()
      })
    })
  })

  it('NER aggregation: should display empty list', done => {
    wrapped.vm.aggregate().then(() => {
      Vue.nextTick(() => {
        expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(0)
        done()
      })
    })
  })
})

function letData (index) {
  return new IndexBuilder(index)
}

class IndexedDocument {
  constructor (path) {
    this.path = path
    this.join = {name: 'Document'}
    this.type = 'Document'
    this.metadata = {}
  }
  withContent (content) {
    this.content = content
    return this
  }
}

class IndexBuilder {
  constructor (index) {
    this.index = index
  }
  have (document) {
    this.document = document
    return this
  }
  commit (done) {
    this.index.create({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      refresh: true,
      id: this.document.path,
      body: this.document
    }).then(() => { done() })
  }
}
