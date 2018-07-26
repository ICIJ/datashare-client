import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import { mount, createLocalVue } from '@vue/test-utils'
import { expect } from 'chai'

import noop from 'lodash/noop'
import trim from 'lodash/trim'
import 'es6-promise/auto'

import esConnectionHelper from '../utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Search from '@/components/Search'
import { IndexedDocuments, IndexedDocument, letData } from '../../es_utils'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages })

describe('Search.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null
  beforeEach(() => {
    Search.created = noop
    wrapped = mount(Search, {localVue, i18n, router, store})
    store.commit('search/reset')
  })

  it('should display no documents found', async () => {
    await wrapped.vm.search('foo')
    await wrapped.vm.$nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__number-of-results').textContent)).to.equal('No documents found')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()

    await wrapped.vm.search('bar')
    await wrapped.vm.$nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress__pagination').textContent)).to.equal('1 - 1')
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress_number-of-results').textContent)).to.equal('on 1 document found')
    expect(trim(wrapped.vm.$el.querySelector('.search-results-item__fragments').innerHTML)).to.equal('this is <mark>bar</mark> document')
  })

  it('should display 2 documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()

    await wrapped.vm.search('bar')
    await wrapped.vm.$nextTick()

    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress__pagination').textContent)).to.equal('1 - 2')
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress_number-of-results').textContent)).to.equal('on 2 documents found')
    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(2)
  })

  it('should make a link without routing for a document', async () => {
    await letData(es).have(new IndexedDocument('doc.txt').withContent('this is a document')).commit()
    
    await wrapped.vm.search('document')
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results-item__basename a').href).to.match(/doc.txt$/)
  })

  it('should make a link with routing for a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()

    await wrapped.vm.search('children')
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results-item__basename a').href).to.match(/child.txt\/parent.txt/)
  })

  it('should return 2 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 2 })
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(2)
  })

  it('should return 3 documents', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 3 })
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(3)
  })

  it('should not display the pagination', async () => {
    await wrapped.vm.search('foo')
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__first-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__previous-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__next-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__last-page').length).to.equal(0)
  })

  it('should not display the pagination', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is the first document')).commit()

    await wrapped.vm.search('document')
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__first-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__previous-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__next-page').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__last-page').length).to.equal(0)
  })

  it('should display the pagination', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 3 })
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__first-page').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__previous-page').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__next-page').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__last-page').length).to.equal(2)
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress__pagination').textContent)).to.equal('1 - 3')
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress_number-of-results').textContent)).to.equal('on 4 documents found')
    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(3)
  })

  it('should display the first and the previous page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 3 })
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__first-page.disabled').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__previous-page.disabled').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__next-page.disabled').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__last-page.disabled').length).to.equal(0)
  })

  it('should display the next and the last page as unavailable', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 3, size: 3 })
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__first-page.disabled').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__previous-page.disabled').length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__next-page.disabled').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('.search-results__header__last-page.disabled').length).to.equal(2)
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress__pagination').textContent)).to.equal('4 - 4')
    expect(trim(wrapped.vm.$el.querySelector('.search-results__header__progress_number-of-results').textContent)).to.equal('on 4 documents found')
    expect(wrapped.vm.$el.querySelectorAll('.search-results-item').length).to.equal(1)
  })

  it('should display the select to choose the number of results per page', async () => {
    await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('this is a document').count(4)).commit()

    await wrapped.vm.search({ query: 'document', from: 0, size: 10 })
    await wrapped.vm.$nextTick()

    let e = wrapped.vm.$el.querySelectorAll('.search-results__header .search-results__header__size select')[0]

    expect(wrapped.vm.$el.querySelectorAll('.search-results__header').length).to.equal(2)
    expect(e.options[e.selectedIndex].value).to.equal('10')
  })
})
