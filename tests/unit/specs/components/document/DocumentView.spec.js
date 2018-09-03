import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'

import { createLocalVue, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import DocumentView from '@/components/document/DocumentView'
import trim from 'lodash/trim'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages })

describe('DocumentView.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es

  afterEach(async () => {
    store.commit('document/reset')
  })

  it('should display an error message when document is not found', async () => {
    const id = 'notfound'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('span').textContent).toEqual('Document not found')
  })

  it('should display a document', async () => {
    const id = 'foo.txt'
    const wrapped = mount(DocumentView, {localVue, i18n, router, store, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('h3 > span').textContent).toEqual(id)
    expect(wrapped.vm.$el.querySelectorAll('dd')[2].textContent).toEqual(id)
  })

  it('should display a child document', async () => {
    const id = 'child.txt'
    const routing = 'parent.txt'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id, routing }})

    await letData(es).have(new IndexedDocument(routing)
      .withContent('this is a parent document'))
      .commit()
    await letData(es).have(new IndexedDocument(id)
      .withContent('this is a children document')
      .withParent(routing))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('h3 > span').textContent).toEqual(id)
  })

  it('should mark named entities', async () => {
    const id = 'mydoc.txt'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a NER doc with 2 NER2')
      .withNer('NER', 2, 'CATEGORY1')
      .withNer('NER2', 17, 'CATEGORY2'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('mark').length).toEqual(2)
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].textContent).toEqual('NER')
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].classList.contains('bg-category-category1')).toEqual(true)
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].textContent).toEqual('NER2')
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].classList.contains('bg-category-category2')).toEqual(true)
  })

  it('should display a document with named entities and escaped HTML', async () => {
    const id = 'html_doc.txt'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withNer('foo', 2))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.text-pre-wrap').innerHTML).toEqual(
      'a <mark class="ner bg-category-organization">foo</mark> document &lt;with&gt;HTML&lt;/with&gt;')
  })

  it('should display named entities in the dedicated tab', async () => {
    const id = 'html_doc.txt'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withNer('mention_01', 2, 'CATEGORY_01')
      .withNer('mention_02', 5, 'CATEGORY_02')
      .withNer('mention_03', 12, 'CATEGORY_03'))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    const pills = wrapped.vm.$el.querySelectorAll('.document__named-entities .badge-pill')

    expect(pills.length).toEqual(3)
    expect(trim(pills[0].querySelector('span:first-child').textContent)).toEqual('mention_01')
    expect(pills[0].classList.contains('border-category-category_01')).toEqual(true)
    expect(trim(pills[1].querySelector('span:first-child').textContent)).toEqual('mention_02')
    expect(pills[1].classList.contains('border-category-category_02')).toEqual(true)
    expect(trim(pills[2].querySelector('span:first-child').textContent)).toEqual('mention_03')
    expect(pills[2].classList.contains('border-category-category_03')).toEqual(true)
  })
})
