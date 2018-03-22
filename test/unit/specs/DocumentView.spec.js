import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {createLocalVue, mount} from 'vue-test-utils'
import esMapping from '@/datashare_index_mappings.json'
import elasticsearch from 'elasticsearch-browser'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import DocumentView from '@/components/DocumentView'
import {IndexedDocument, letData} from 'test/unit/es_utils'

Vue.use(VueI18n)
const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('DocumentView.vue', () => {
  var wrapped = null
  var es = new elasticsearch.Client({host: process.env.CONFIG.es_host})
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
})
