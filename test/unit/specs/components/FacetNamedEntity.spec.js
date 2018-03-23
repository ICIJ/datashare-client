import 'es6-promise/auto'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import trim from 'lodash/trim'
import find from 'lodash/find'
import elasticsearch from 'elasticsearch-browser'

import {mount, createLocalVue} from 'vue-test-utils'

import esMapping from '@/datashare_index_mappings.json'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import {IndexedDocument, letData} from 'test/unit/es_utils'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('FacetNamedEntity.vue', () => {
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
    wrapped = mount(FacetNamedEntity, {i18n, router, store})
    wrapped.setProps({facet: find(store.state.aggregation.facets, {name: 'named-entity'})})
  })

  it('should display empty list', async () => {
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item').length).to.equal(0)
  })

  it('should display one named entity', async () => {
    await letData(es).have(new IndexedDocument('docs/naz.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item').length).to.equal(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet-named-entity__mentions__item__description').textContent)).to.equal('one occurrence in one document')
  })

  it('should display two named entities in one document', async () => {
    await letData(es).have(new IndexedDocument('docs/qux.txt').withContent('this is a document')
      .withNer('qux').withNer('foo')).commit()
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item').length).to.equal(2)
  })

  it('should display one named entity in two documents', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER document contain 2 NER').withNer('NER', 2).withNer('NER', 25)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('another document with NER').withNer('NER', 22)).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item').length).to.equal(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet-named-entity__mentions__item__description').textContent)).to.equal('3 occurrences in 2 documents')
  })

  it('should display three named entities in two documents with right order', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER2 doc with NER2 NER2 NER1 and NER3')
      .withNer('NER2', 2).withNer('NER2', 16).withNer('NER2', 21).withNer('NER1', 26).withNer('NER3', 35)).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item').length).to.equal(3)
    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item__key')[0].textContent.trim()).to.equal('NER1')
    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item__key')[1].textContent.trim()).to.equal('NER2')
    expect(wrapped.vm.$el.querySelectorAll('.facet-named-entity__mentions__item__key')[2].textContent.trim()).to.equal('NER3')
  })
})
