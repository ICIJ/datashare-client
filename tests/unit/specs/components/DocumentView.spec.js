import {createLocalVue, mount} from '@vue/test-utils'
import {IndexedDocument, letData} from '../../es_utils'
import esConnectionHelper from '../utils/esConnectionHelper'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import DocumentView from '@/components/document/DocumentView'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)
// ContentPlaceholder to display when content loading
Vue.component('content-placeholder', ContentPlaceholder)

const i18n = new VueI18n({locale: 'en', messages})

describe('DocumentView.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null
  beforeEach(async () => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(DocumentView, {i18n, router, store})
  })

  it('should display an empty page when document is not found', async () => {
    wrapped.vm.id = 'notfound'

    await wrapped.vm.getDoc()
    await Vue.nextTick()

    expect(wrapped.isEmpty()).to.equal(true)
  })

  it('should display a document', async () => {
    await letData(es).have(new IndexedDocument('foo.txt').withContent('this is foo document')).commit()
    wrapped.vm.id = 'foo.txt'

    await wrapped.vm.getDoc()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('h3').textContent).to.equal('foo.txt')
    expect(wrapped.vm.$el.querySelectorAll('dd')[2].textContent).to.equal('foo.txt')
  })

  it('should display a child document', async () => {
    await letData(es).have(new IndexedDocument('parent.txt').withContent('this is a parent document')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withContent('this is a children document').withParent('parent.txt')).commit()
    wrapped.vm.id = 'child.txt'
    wrapped.vm.routing = 'parent.txt'

    await wrapped.vm.getDoc()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('h3').textContent).to.equal('child.txt')
  })

  it('should mark named entities', async () => {
    await letData(es).have(new IndexedDocument('mydoc.txt').withContent('a NER doc with 2 NER2')
      .withNer('NER', 2, 'CATEGORY1').withNer('NER2', 17, 'CATEGORY2')).commit()
    wrapped.vm.id = 'mydoc.txt'

    await wrapped.vm.getDoc()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('mark').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].textContent).to.equal('NER')
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].classList.contains('category1')).to.equal(true)
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].textContent).to.equal('NER2')
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].classList.contains('category2')).to.equal(true)
  })

  it('should display a document with named entities and escaped HTML', async () => {
    await letData(es).have(new IndexedDocument('html_doc.txt').withContent('a foo document <with>HTML</with>')
      .withNer('foo', 2)).commit()
    wrapped.vm.id = 'html_doc.txt'

    await wrapped.vm.getDoc()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.text-pre-wrap').innerHTML).to.equal(
      'a <mark class="ner organization">foo</mark> document &lt;with&gt;HTML&lt;/with&gt;')
  })
})
