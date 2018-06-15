import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import noop from 'lodash/noop'
import trim from 'lodash/trim'
import 'es6-promise/auto'
import {mount, createLocalVue} from 'vue-test-utils'

import esConnectionHelper from 'test/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import Search from '@/components/Search'
import {IndexedDocument, letData} from 'test/unit/es_utils'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('coontent-placeholder', ContentPlaceholder)

describe('Search.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null
  beforeEach(async () => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    Search.created = noop
    wrapped = mount(Search, {i18n, router, store})
  })

  it('should display no document found', async () => {
    await wrapped.vm.search('foo')
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__number-of-results').textContent)).to.equal('No documents found')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await wrapped.vm.search('bar')
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__number-of-results').textContent)).to.equal('1 document found')
    expect(trim(wrapped.vm.$el.querySelector('.search-results-item__fragments').innerHTML)).to.equal('this is <mark>bar</mark> document')
  })

  it('should display two documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()

    await wrapped.vm.search('bar')
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__number-of-results').textContent)).to.equal('2 documents found')
    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(2)
  })

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()
    await wrapped.vm.search('document')
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results-item__basename a').href).to.match(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()

    await wrapped.vm.search('children')
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results-item__basename a').href).to.match(/child.txt\/parent.txt/)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 2 })
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('this is the second document')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('this is the third document')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withContent('this is the fourth document')).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 3 })
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(3)
  })

  it('should display Next page', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await wrapped.vm.search('bar')
    await Vue.nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__pagination').textContent)).to.equal('Next page')
  })

  it('should display Page suivante in french', async () => {
    const Constructor = Vue.extend(Search)
    const vm = new Constructor({store, router, i18n: new VueI18n({locale: 'fr', messages})}).$mount()

    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    await vm.search('bar')
    await Vue.nextTick()

    expect(trim(vm.$el.querySelector('.search-results__header__pagination').textContent)).to.equal('Page suivante')
  })
})
