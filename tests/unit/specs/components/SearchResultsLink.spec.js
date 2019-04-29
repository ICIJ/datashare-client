import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import SearchResultsLink from '@/components/SearchResultsLink'
import Document from '@/api/Document'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('SearchResultsLink.vue', () => {
  it('should reduce named entities : zero named entities', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 1,
          _source: {
            path: 'doc.txt'
          }
        })
      }
    })

    expect(wrapper.vm.namedEntities).toEqual([])
  })

  it('should reduce named entities : one named entities', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 1,
          _source: {
            path: 'doc.txt'
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
      }
    })

    expect(wrapper.vm.namedEntities).toEqual([{ _source: { id: 'id', mention: 'foo' } }])
  })

  it('should reduce named entities : two named entities', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
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

    expect(wrapper.vm.namedEntities).toEqual([{ _source: { id: 'id', mention: 'foo' } }, { _source: { id: 'id_bar', mention: 'bar' } }])
  })

  it('should reduce named entities : two named entities with duplicates', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 1,
          _source: {
            path: 'doc.txt'
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

    expect(wrapper.vm.namedEntities).toEqual([{ _source: { id: 'id', mention: 'foo' } }, { _source: { id: 'id_bar', mention: 'bar' } }])
  })

  it('should display the correct location', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 1,
          _source: {
            path: '/home/data/folder_01/folder_02/foo.txt'
          }
        })
      }
    })

    expect(wrapper.vm.location).toEqual('.folder_01/folder_02/')
  })

  it('should make a link without routing for a document', () => {
    const wrapper = mount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 'foo',
          _index: process.env.VUE_APP_ES_INDEX
        })
      }
    })

    expect(wrapper.find('.search-results-link').attributes().href).toMatch(/foo\/foo$/)
  })

  it('should make a link with routing for a child document', () => {
    const wrapper = mount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 'child',
          _index: process.env.VUE_APP_ES_INDEX,
          _routing: 'parent'
        })
      }
    })

    expect(wrapper.find('.search-results-link').attributes().href).toMatch(/child\/parent$/)
  })

  it('should display the document sliced name', () => {
    const wrapper = mount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        doc: new Document({
          _id: 'doc.txt',
          _index: process.env.VUE_APP_ES_INDEX,
          inner_hits: {
            NamedEntity: {
              hits: {
                hits: [
                  {
                    _source: {
                      id: 'ne',
                      mention: 'paris'
                    }
                  }
                ]
              }
            }
          }
        })
      }
    })
    expect(wrapper.findAll('.search-results-link .search-results-link__basename .document-sliced-name__item__root').at(0).text()).toEqual('doc.txt')
  })
})
