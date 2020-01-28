import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import toLower from 'lodash/toLower'

import { App } from '@/main'
import Document from '@/api/resources/Document'
import SearchResultsListLink from '@/components/SearchResultsListLink'

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('SearchResultsListLink.vue', () => {
  const index = toLower('SearchResultsListLink')

  it('should display the correct location', () => {
    const wrapper = shallowMount(SearchResultsListLink, {
      localVue,
      store,
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
          _index: index
        })
      }
    })

    expect(wrapper.find('.search-results-list-link').attributes('href')).toMatch(/foo\/foo/)
  })

  it('should make a link with routing for a child document', () => {
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: 'child',
          _index: index,
          _routing: 'parent'
        })
      }
    })

    expect(wrapper.find('.search-results-list-link').attributes('href')).toMatch(/child\/parent/)
  })

  it('should make a link to document with query', () => {
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: 'foo',
          _index: index
        })
      }
    })

    store.commit('search/query', 'other')

    expect(wrapper.find('.search-results-list-link').attributes('href')).toMatch(/foo\/foo\?q=other$/)
  })

  it('should display the document sliced name', () => {
    const documentName = 'document'
    Murmur.config.merge({ userProjects: [index] })
    const wrapper = mount(SearchResultsListLink, {
      localVue,
      store,
      router,
      propsData: {
        document: new Document({
          _id: documentName,
          _index: index,
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
