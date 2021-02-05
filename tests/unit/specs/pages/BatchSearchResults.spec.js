import toLower from 'lodash/toLower'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import BatchSearchResults, { auth } from '@/pages/BatchSearchResults'
import Murmur from '@icij/murmur'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Api from '@/api'

Api.getFullUrl = jest.fn() // mock static function

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearchResults: jest.fn().mockResolvedValue([
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentName: '42.pdf',
          contentType: 'type_03',
          query: 'query_01',
          rootId: 42
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentName: '43.pdf',
          contentType: 'type_02',
          query: 'query_01',
          rootId: 43
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentName: '44.pdf',
          contentType: 'type_01',
          query: 'query_02',
          rootId: 44
        }
      ]),
      getBatchSearch: jest.fn().mockResolvedValue({
        uuid: '12',
        project: { name: 'ProjectName' },
        name: 'BatchSearch Test',
        description: 'This is the description of the batch search',
        state: 'SUCCESS',
        date: '2019-07-18T14:45:34.869+0000',
        nbResults: 333,
        phraseMatch: 1,
        fuzziness: 1,
        fileTypes: [],
        paths: [],
        published: true,
        queries: {
          query_01: 6,
          query_02: 6,
          query_03: 6
        },
        user: { id: 'test' }
      }),
      copyBatchSearch: jest.fn()
    }
  })
})

describe('BatchSearchResults.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter({
    routes: [
      {
        name: 'batch-search.results',
        path: 'batch-search/:index/:uuid'
      }, {
        name: 'document',
        path: '/d/:index/:id/:routing?'
      }
    ]
  })
  const project = toLower('BatchSearchResults')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let propsData = null
  let wrapper = null

  beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    propsData = { uuid: '12', project }
    wrapper = shallowMount(BatchSearchResults, { i18n, localVue, store, router, wait, propsData })
    await wrapper.vm.$router.push({
      name: 'batch-search.results',
      params: { index: project, uuid: '12' },
      query: { page: 1 }
    }).catch(() => {})
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    auth.reset()
  })

  afterAll(() => jest.unmock('@/api'))

  it('should display a button to delete the batchSearch', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__delete').exists()).toBeTruthy()
  })

  it('should NOT display a button to delete the batchSearch if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__delete').exists()).toBeFalsy()
  })

  it('should display a button to download queries', () => {
    expect(wrapper.find('.batch-search-results__download-queries').exists()).toBeTruthy()
  })

  it('should display a button to download results', () => {
    expect(wrapper.find('.batch-search-results__download-results').exists()).toBeTruthy()
  })

  it('should NOT display a button to download results if there are no results', async () => {
    await store.commit('batchSearch/results', [])

    expect(wrapper.find('.batch-search-results__download-results').exists()).toBeFalsy()
  })

  it('should display a button to rerun the BS', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__rerun').exists()).toBeTruthy()
  })

  it('should NOT display a button to rerun the BS if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__rerun').exists()).toBeFalsy()
  })

  it('should display an enabled button to rerun the BS if is NOT already run', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__rerun .btn-light').attributes('disabled')).toBeFalsy()
  })

  it('should display an disabled button to rerun the BS if is already run', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    await wrapper.vm.copyBatchSearch()
    expect(wrapper.find('.batch-search-results__rerun .btn-light').attributes('disabled')).toBeTruthy()
  })

  it('should NOT display a button to rerun the BS if BS status is failure', () => {
    const batchSearch = {
      uuid: '155',
      project: { name: 'ProjectName' },
      description: 'This is the description of the batch search',
      state: 'QUEUED',
      date: '2019-07-18T14:45:34.869+0000',
      nbResults: 333,
      phraseMatch: 1,
      fuzziness: 1,
      fileTypes: [],
      paths: [],
      published: true,
      queries: {
        query_01: 6,
        query_02: 6,
        query_03: 6
      },
      user: { id: 'test' }
    }
    store.commit('batchSearch/batchSearch', batchSearch)

    expect(wrapper.find('.batch-search-results__rerun').exists()).toBeFalsy()
  })

  it('should call the API to rerun the BS on click on submit button', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    const copyBatchSearchMock = jest.spyOn(wrapper.vm, 'copyBatchSearch')
    await wrapper.vm.checkIsMyBatchSearch()
    wrapper.vm.$set(wrapper.vm, 'name', 'Test')

    wrapper.find('.card-footer .d-flex b-button-stub').trigger('submit')

    expect(copyBatchSearchMock).toBeCalledTimes(1)
  })

  it('should call the API to delete the BS on click on submit button when delete is checked', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    jest.spyOn(store, 'dispatch')
    await wrapper.vm.checkIsMyBatchSearch()
    wrapper.vm.$set(wrapper.vm, 'name', 'Test')
    wrapper.vm.$set(wrapper.vm, 'deleteAfterRerun', true)

    await wrapper.vm.copyBatchSearch()

    expect(store.dispatch).toBeCalled()
    expect(store.dispatch).toBeCalledWith('batchSearch/deleteBatchSearch', { batchId: '12' })
  })

  it('should display default values for name and description on BS rerun form', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.vm.name).toEqual('BatchSearch Test')
    expect(wrapper.vm.description).toEqual('This is the description of the batch search')
  })

  it('should display 11 info about the BatchSearch', () => {
    expect(wrapper.find('.batch-search-results__info').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results__info dd')).toHaveLength(11)
    expect(wrapper.findAll('.batch-search-results__info dd').at(10).text()).toBe('test')
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should redirect on sort changed', () => {
    jest.spyOn(router, 'push')

    wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({
      name: 'batch-search.results',
      params: { index: project, uuid: '12' },
      query: { page: 1, queries: [], sort: 'content_type', order: 'desc' }
    })
  })

  it('should redirect on batchSearch deletion', async () => {
    jest.spyOn(router, 'push')

    await wrapper.vm.deleteBatchSearch()

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search' })
  })

  it('should return empty string if the document size is 0', () => {
    expect(wrapper.vm.getDocumentSize(undefined)).toBe('-')
  })

  it('should return the document size as human readable', () => {
    expect(wrapper.vm.getDocumentSize(42)).toBe('42.00 B')
  })

  it('should change the batchSearch published state', () => {
    jest.spyOn(store, 'dispatch')

    wrapper.vm.changePublished(false)

    expect(store.dispatch).toBeCalled()
    expect(store.dispatch).toBeCalledWith('batchSearch/updateBatchSearch', { batchId: '12', published: false })
  })

  describe('count the number of pages', () => {
    it('should display all results', () => {
      expect(wrapper.vm.numberOfPages).toBe(4)
    })

    it('should filter results and adapt number of pages', () => {
      store.commit('batchSearch/selectedQueries', ['query_01'])

      expect(wrapper.vm.numberOfPages).toBe(1)
    })
  })

  it('should redirect to document including the search query', async () => {
    wrapper = mount(BatchSearchResults, { i18n, localVue, store, router, wait, propsData })
    await wrapper.vm.$router.push({
      name: 'batch-search.results',
      params: { index: project, uuid: '12' },
      query: { page: 1 }
    }).catch(() => {})

    await wrapper.vm.fetch()

    expect(wrapper.findAll('.batch-search-results__queries__query')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results__queries__query__link').attributes('href'))
      .toBe(`#/d/${project}/42/42?q=query_01`)
  })

  it('should cast queries param into array on beforeRouteEnter and beforeRouteUpdate', async () => {
    wrapper = await shallowMount(BatchSearchResults, { i18n, localVue, store, router, wait, propsData })
    const toObject = {
      name: 'batch-search.results',
      params: { index: project, uuid: '12' },
      query: { page: 1, queries: 'simple_text' }
    }

    BatchSearchResults.beforeRouteEnter.call(wrapper.vm, toObject, undefined, fn => fn(wrapper.vm))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.queries).toEqual(['simple_text'])

    BatchSearchResults.beforeRouteUpdate.call(wrapper.vm, toObject, undefined, jest.fn())
    expect(wrapper.vm.queries).toEqual(['simple_text'])
  })
})
