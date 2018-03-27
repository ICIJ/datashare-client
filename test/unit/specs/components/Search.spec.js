import Vue from 'vue'
import VueI18n from 'vue-i18n'
import noop from 'lodash/noop'
import trim from 'lodash/trim'
import 'es6-promise/auto'
import {mount, createLocalVue} from 'vue-test-utils'
import elasticsearch from 'elasticsearch-browser'

import esMapping from '@/datashare_index_mappings.json'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Search from '@/components/Search'
import {IndexedDocument, letData} from 'test/unit/es_utils'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('Search.vue', () => {
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
  var wrapped = null
  before(async () => {
    await es.indices.create({index: process.env.CONFIG.es_index})
    await es.indices.putMapping({index: process.env.CONFIG.es_index, type: 'doc', body: esMapping})
  })
  after(async () => {
    await es.indices.delete({index: process.env.CONFIG.es_index})
  })
  beforeEach(async () => {
    await es.deleteByQuery({index: process.env.CONFIG.es_index, conflicts: 'proceed', body: {query: {match_all: {}}}})
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    Search.created = noop
    wrapped = mount(Search, {i18n, router, store})
  })

  it('should display no document found', async () => {
    wrapped.vm.q = 'foo'
    await wrapped.vm.search()
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results h4').textContent)).to.equal('No documents found for "foo"')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    wrapped.vm.q = 'bar'
    await wrapped.vm.search()
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results h4').textContent)).to.equal('1 document found for "bar"')
    expect(trim(wrapped.vm.$el.querySelector('.search-results__items__item__fragments').innerHTML)).to.equal('this is <mark>bar</mark> document')
  })

  it('should display two documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()
    wrapped.vm.q = 'bar'

    await wrapped.vm.search()
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results h4').textContent)).to.equal('2 documents found for "bar"')
    expect(wrapped.vm.$el.querySelectorAll('.search-results__items__item').length).to.equal(2)
  })

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()
    wrapped.vm.q = 'document'

    await wrapped.vm.search()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results__items__item__link').href).to.match(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()
    wrapped.vm.q = 'children'

    await wrapped.vm.search()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results__items__item__link').href).to.match(/child.txt\/parent.txt/)
  })
})
