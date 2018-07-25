import {mount} from '@vue/test-utils'
import SearchResultsItem from '@/components/SearchResultsItem'
import Document from '@/api/Document'
import messages from '@/messages'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import router from '@/router'
import store from '@/store'

Vue.use(VueI18n)
const i18n = new VueI18n({locale: 'en', messages})

describe('Indexing.vue', () => {
  it('should reduce named entities : zero named entities', async () => {
    var wrapped = mount(SearchResultsItem, {i18n, router, store, propsData: {'doc': new Document({_source: {path: 'a/b/c/foo.txt'}})}})
    expect(wrapped.vm.namedEntities).to.eql([])
  })

  it('should reduce named entities : one named entities', async () => {
    var wrapped = mount(SearchResultsItem, {i18n, router, store, propsData: {'doc': new Document({_source: {path: 'a/b/c/foo.txt'}, inner_hits: {NamedEntity: {hits: {hits: [{_source: {id: 'id', mention: 'foo'}}]}}}})}})
    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}])
  })

  it('should reduce named entities : two named entities', async () => {
    var wrapped = mount(SearchResultsItem, {i18n, router, store, propsData: {'doc': new Document({_source: {path: 'a/b/c/foo.txt'}, inner_hits: {NamedEntity: {hits: {hits: [{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}]}}}})}})
    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}])
  })

  it('should reduce named entities : two named entities with duplicates', async () => {
    var wrapped = mount(SearchResultsItem, {i18n, router, store, propsData: {'doc': new Document({_source: {path: 'a/b/c/foo.txt'}, inner_hits: {NamedEntity: {hits: {hits: [{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id2', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}]}}}})}})
    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}])
  })
})
