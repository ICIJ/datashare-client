import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { mount, createLocalVue } from '@vue/test-utils'
import { expect } from 'chai'

import esConnectionHelper from '../utils/esConnectionHelper'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import SearchResultsItem from '@/components/SearchResultsItem'
import Document from '@/api/Document'
import messages from '@/messages'

import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages })

describe('SearchResultsItem.vue', () => {
  esConnectionHelper()

  it('should reduce named entities : zero named entities', async () => {
    var wrapped = mount(SearchResultsItem, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: 'a/b/c/foo.txt'
          }})
      }
    })
    expect(wrapped.vm.namedEntities).to.eql([])
  })

  it('should reduce named entities : one named entities', async () => {
    var wrapped = mount(SearchResultsItem, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: 'a/b/c/foo.txt'
          },
          inner_hits: {
            NamedEntity: {
              hits: {
                hits: [
                  {
                    _source: {
                      id: 'id',
                      mention: 'foo'
                    }
                  }
                ]
              }
            }
          }
        }
        )
      }})

    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}])
  })

  it('should reduce named entities : two named entities', async () => {
    var wrapped = mount(SearchResultsItem, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: 'a/b/c/foo.txt'
          },
          inner_hits: {
            NamedEntity: {
              hits: {
                hits: [
                  {
                    _source: {
                      id: 'id',
                      mention: 'foo'
                    }
                  }, {
                    _source: {
                      id: 'id_bar',
                      mention: 'bar'
                    }
                  }
                ]
              }
            }
          }
        })
      }
    })

    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}])
  })

  it('should reduce named entities : two named entities with duplicates', async () => {
    var wrapped = mount(SearchResultsItem, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: 'a/b/c/foo.txt'
          },
          inner_hits: {
            NamedEntity: {
              hits: {
                hits: [
                  {
                    _source: {
                      id: 'id',
                      mention: 'foo'
                    }
                  }, {
                    _source: {
                      id: 'id2',
                      mention: 'foo'
                    }
                  }, {
                    _source: {
                      id: 'id_bar',
                      mention: 'bar'
                    }
                  }
                ]
              }
            }
          }
        })
      }
    })

    expect(wrapped.vm.namedEntities).to.eql([{_source: {id: 'id', mention: 'foo'}}, {_source: {id: 'id_bar', mention: 'bar'}}])
  })
})
