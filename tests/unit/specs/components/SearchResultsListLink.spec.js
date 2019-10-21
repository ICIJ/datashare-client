import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import SearchResultsListLink from '@/components/SearchResultsListLink'
import Document from '@/api/Document'
import { App } from '@/main'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('SearchResultsListLink', () => {
  it('should display the correct location', () => {
    const wrapper = shallowMount(SearchResultsListLink, {
      localVue,
      propsData: {
        document: new Document({
          _id: 1,
          _source: {
            path: '/home/data/folder_01/folder_02/foo.txt'
          }
        })
      }
    })

    expect(wrapper.vm.location).toBe('.folder_01/folder_02/')
  })

  it('should make a link without routing for a document', () => {
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: 'foo',
          _index: process.env.VUE_APP_ES_INDEX
        })
      }
    })

    expect(wrapper.find('.search-results-list-link').attributes('href')).toMatch(/foo\/foo$/)
  })

  it('should make a link with routing for a child document', () => {
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: 'child',
          _index: process.env.VUE_APP_ES_INDEX,
          _routing: 'parent'
        })
      }
    })

    expect(wrapper.find('.search-results-list-link').attributes('href')).toMatch(/child\/parent$/)
  })

  it('should display the document sliced name', () => {
    const documentName = 'document'
    Murmur.config.merge({ userProjects: [process.env.VUE_APP_ES_INDEX] })
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: documentName,
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
    expect(wrapper.find('.search-results-list-link .search-results-list-link__basename .document-sliced-name__item__single').text()).toBe(documentName)
  })
})
