import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import SearchResultsItem from '@/components/SearchResultsItem'
import Document from '@/api/Document'
import router from '@/router'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

describe('SearchResultsItem.vue', () => {
  it('should reduce named entities : zero named entities', () => {
    const wrapper = shallowMount(SearchResultsItem, {
      localVue,
      router,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: 'a/b/c/foo.txt'
          } })
      }
    })

    expect(wrapper.vm.namedEntities).toEqual([])
  })

  it('should reduce named entities : one named entities', () => {
    const wrapper = shallowMount(SearchResultsItem, {
      localVue,
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
                  }
                ]
              }
            }
          }
        }
        )
      } })

    expect(wrapper.vm.namedEntities).toEqual([{ _source: { id: 'id', mention: 'foo' } }])
  })

  it('should reduce named entities : two named entities', () => {
    const wrapper = shallowMount(SearchResultsItem, {
      localVue,
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
    const wrapper = shallowMount(SearchResultsItem, {
      localVue,
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
    const wrapper = shallowMount(SearchResultsItem, {
      localVue,
      router,
      propsData: {
        'doc': new Document({
          _id: 1,
          _source: {
            path: '/home/data/folder_01/folder_02/foo.txt'
          } })
      }
    })

    expect(wrapper.vm.location).toEqual('.folder_01/folder_02/')
  })
})
