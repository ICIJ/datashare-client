import { shallowMount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchViewResults from '@/views/TaskBatchSearchViewResults'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      copyBatchSearch: vi.fn(),
      getBatchSearch: vi.fn().mockResolvedValue({
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
    }
  }
})

describe('TaskBatchSearchViewResults.vue', () => {
  const routes = [
    {
      name: 'task.batch-search.view.results',
      path: '/batch-search/:indices/:uuid'
    },
    {
      name: 'document-standalone',
      path: '/ds/:indices/:id/:routing?'
    }
  ]
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const props = { uuid: '12', indices: project.concat(',', anotherProject) }

  let core, wrapper

  beforeEach(async () => {
    core = CoreSetup.init().useAll().useRouter(routes)
    core.config.merge({ mode: 'SERVER' })
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    wrapper = shallowMount(TaskBatchSearchViewResults, { props, global: { plugins: core.plugins } })
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    core.store.commit('batchSearch/reset')
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
  })

  it('should display the batch search details', () => {
    expect(wrapper.find('batch-search-results-details-stub').exists()).toBeTruthy()
  })
  it('should display one queries active filter has applied search filters', async () => {
    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__queries').exists()).toBeFalsy()

    await core.router.push({
      name: 'task.batch-search.view.results',
      params: { indices: 'toto', uuid: 'test' },
      query: { queries: 'query_01, query_02' }
    })

    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__queries').exists()).toBeTruthy()
  })
  it('should display content type active filters has applied search filters', async () => {
    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__content-types').exists()).toBeFalsy()

    await core.router.push({
      name: 'task.batch-search.view.results',
      params: { indices: 'toto', uuid: 'test' },
      query: { contentTypes: 'type_01, type_02' }
    })

    expect(wrapper.find('.task-batch-search-view-results__applied-search-filters__content-types').exists()).toBeTruthy()
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
    vi.spyOn(core.store, 'dispatch')

    wrapper.vm.changePublished(false)

    expect(core.store.dispatch).toBeCalled()
    expect(core.store.dispatch).toBeCalledWith('batchSearch/updateBatchSearch', { batchId: '12', published: false })
  })
})
