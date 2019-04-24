import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
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
        'doc': new Document({
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
        'doc': new Document({
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

    expect(wrapper.vm.namedEntities).toEqual([{ _source: { id: 'id', mention: 'foo' } }, { _source: { id: 'id_bar', mention: 'bar' } }])
  })

  it('should reduce named entities : two named entities with duplicates', () => {
    const wrapper = shallowMount(SearchResultsLink, {
      localVue,
      store,
      router,
      propsData: {
        'doc': new Document({
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
        'doc': new Document({
          _id: 1,
          _source: {
            path: '/home/data/folder_01/folder_02/foo.txt'
          }
        })
      }
    })

    expect(wrapper.vm.location).toEqual('.folder_01/folder_02/')
  })
})
