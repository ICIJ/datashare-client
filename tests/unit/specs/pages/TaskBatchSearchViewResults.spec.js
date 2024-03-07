import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { Core } from '@/core'
import TaskBatchSearchViewResults from '@/pages/TaskBatchSearchViewResults'

describe('TaskBatchSearchViewResults.vue', () => {
  let wrapper = null
  let i18n, localVue, store, wait
  const router = new VueRouter({
    routes: [
      {
        name: 'task.batch-search.view.results',
        path: 'batch-search/:indices/:uuid'
      },
      {
        name: 'document-standalone',
        path: '/ds/:indices/:id/:routing?'
      }
    ]
  })
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const propsData = { uuid: '12', indices: project.concat(',', anotherProject) }

  beforeEach(async () => {
    Murmur.config.merge({ mode: 'SERVER' })
    const api = vi.fn()
    api.getBatchSearch = vi.fn().mockResolvedValue({
      uuid: '12',
      projects: [{ name: 'batchsearchresults' }, { name: 'anotherbatchsearchresults' }],
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
      user: {
        id: 'test'
      }
    })
    api.copyBatchSearch = vi.fn()
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    wrapper = shallowMount(TaskBatchSearchViewResults, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
  })

  it('should display the batch search details', () => {
    expect(wrapper.find('batch-search-results-details-stub').exists()).toBeTruthy()
  })
  it('should display one queries active filter has applied search filters', async () => {
    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__queries').exists()).toBeFalsy()

    await router.push({
      name: 'task.batch-search.view.results',
      params: { indices: 'toto', uuid: 'test' },
      query: { queries: 'query_01, query_02' }
    })
    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__queries').exists()).toBeTruthy()
  })
  it('should display content type active filters has applied search filters', async () => {
    expect(
      wrapper.findAll('.task-batch-search-view-results__applied-search-filters__content-types').exists()
    ).toBeFalsy()

    await router.push({
      name: 'task.batch-search.view.results',
      params: { indices: 'toto', uuid: 'test' },
      query: { contentTypes: 'type_01, type_02' }
    })
    expect(
      wrapper.findAll('.task-batch-search-view-results__applied-search-filters__content-types').exists()
    ).toBeTruthy()
  })
  it('should display clear filters button', () => {
    expect(wrapper.find('batch-search-clear-filters-stub').exists()).toBeTruthy()
  })

  it('should display batch search results table', () => {
    expect(wrapper.find('batch-search-results-table-stub').exists()).toBeTruthy()
  })

  it('should display document in modal', () => {
    expect(wrapper.find('document-in-modal-stub').exists()).toBeTruthy()
  })

  it('should change the batchSearch published state', () => {
    vi.spyOn(store, 'dispatch')

    wrapper.vm.changePublished(false)

    expect(store.dispatch).toBeCalled()
    expect(store.dispatch).toBeCalledWith('batchSearch/updateBatchSearch', { batchId: '12', published: false })
  })
})
