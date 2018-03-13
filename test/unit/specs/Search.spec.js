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
    wrapped = mount(Search, {i18n, router})
  })

  it('should display no document found', async () => {
    wrapped.vm.query = 'foo'
    await wrapped.vm.search()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('No document found for "foo"')
  })

  it('should display one document found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar.txt').withContent('this is bar document')).commit()
    wrapped.vm.query = 'bar'
    await wrapped.vm.search()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('1 document found for "bar"')
    expect(wrapped.vm.$el.querySelector('.search-results .fragment').innerHTML).to.equal('this is <mark>bar</mark> document')
  })

  it('should display two documents found', async () => {
    await letData(es).have(new IndexedDocument('docs/bar1.txt').withContent('this is bar 1 document')).commit()
    await letData(es).have(new IndexedDocument('docs/bar2.txt').withContent('this is bar 2 document')).commit()
    wrapped.vm.query = 'bar'

    await wrapped.vm.search()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelector('.search-results h3').textContent).to.equal('2 documents found for "bar"')
    expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(2)
  })

  it('NER aggregation: should display empty list', async () => {
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(0)
  })

  it('NER aggregation: should display one named entity', async () => {
    await letData(es).have(new IndexedDocument('docs/naz.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(1)
    expect(wrapped.vm.$el.querySelector('span.aggregation').textContent).to.equal('1 occurrences, 1 documents')
  })

  it('NER aggregation: should display two named entities in one document', async () => {
    await letData(es).have(new IndexedDocument('docs/qux.txt').withContent('this is a document')
      .withNer('qux').withNer('foo')).commit()
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(2)
  })

  it('NER aggregation: should display one named entity in two documents', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER document contain 2 NER').withNer('NER', 2).withNer('NER', 25)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('another document with NER').withNer('NER', 22)).commit()

    debugger
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.search-results__item').length).to.equal(1)
    // TODO: BUG ! this should be '3 occurrences, 2 documents'
    expect(wrapped.vm.$el.querySelector('span.aggregation').textContent).to.equal('3 occurrences, 1 documents')
  })
})

function letData (index) {
  return new IndexBuilder(index)
}

class IndexedNe {
  constructor (mention, offset) {
    this.mention = mention
    this.offset = offset
  }
}

class IndexedDocument {
  constructor (path) {
    this.path = path
    this.join = {name: 'Document'}
    this.type = 'Document'
    this.metadata = {}
    this.nerList = []
  }
  withContent (content) {
    this.content = content
    return this
  }
  withNer (mention, offset = 1) {
    this.nerList.push(new IndexedNe(mention, offset))
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
  async commit () {
    var docId = this.document.path
    await this.index.create({
      index: process.env.CONFIG.es_index,
      type: 'doc',
      refresh: true,
      id: docId,
      body: this.document
    })
    for (var i = 0; i < this.document.nerList.length; i++) {
      let ner = this.document.nerList[i]
      await this.index.create({
        index: process.env.CONFIG.es_index,
        type: 'doc',
        refresh: true,
        id: ner.mention + ner.offset,
        routing: docId,
        body: {
          mention: ner.mention,
          mentionNorm: ner.mention,
          offset: ner.offset,
          type: 'NamedEntity',
          join: {name: 'NamedEntity', parent: docId}
        }
      })
    }
  }
}
