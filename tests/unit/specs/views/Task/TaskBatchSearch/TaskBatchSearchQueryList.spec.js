import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchSearchCard from '@/components/BatchSearch/BatchSeachCard/BatchSearchCard'
import TaskBatchSearchQueryList from '@/views/Task/TaskBatchSearch/TaskBatchSearchQueryList'

const UUID = 'e0fd5476-fa48-4a1f-ba61-b959ec8ed6fb'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getTask: vi.fn(),
      getBatchSearch: vi.fn(),
      getBatchSearchQueries: vi.fn().mockResolvedValue({ foo: 2 }),
      getUser: vi.fn().mockResolvedValue({
        uid: 'local',
        projects: [{ name: 'local-datashare' }],
        groups_by_applications: { datashare: ['local-datashare'] }
      })
    }
  }
})

function buildBatchSearchRecord(overrides = {}) {
  return {
    uuid: UUID,
    projects: ['local-datashare'],
    name: 'batch search',
    description: '',
    nbQueries: 3,
    nbResults: 2,
    nbQueriesWithoutResults: 1,
    date: '2025-03-06T06:47:19.820+00:00',
    state: 'DONE',
    user: { id: 'local' },
    published: false,
    phraseMatches: false,
    fuzziness: 0,
    uri: '/#/search?q=foo',
    errorMessage: null,
    errorQuery: null,
    ...overrides
  }
}

function buildTask(overrides = {}) {
  return {
    id: UUID,
    name: 'org.icij.datashare.tasks.BatchSearchRunner',
    state: 'DONE',
    createdAt: '2025-03-06T06:47:19.857+00:00',
    args: { user: { id: 'local' } },
    ...overrides
  }
}

describe('TaskBatchSearchQueryList', () => {
  let plugins
  let apiInstance
  let wrappers

  beforeEach(async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    wrappers = []
    // The view renders links relying on the current route params, so it has to be
    // mounted on its own route rather than on the router's default one.
    await core.router.push({
      name: 'task.batch-search-queries.list',
      params: { indices: 'local-datashare', uuid: UUID }
    })
    apiInstance = (await import('@/api/apiInstance')).apiInstance
  })

  afterEach(() => {
    wrappers.forEach(wrapper => wrapper.unmount())
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  async function mountWith({ task, record }) {
    vi.mocked(apiInstance.getTask).mockResolvedValue(task)
    vi.mocked(apiInstance.getBatchSearch).mockResolvedValue(record)
    const wrapper = mount(TaskBatchSearchQueryList, {
      props: { uuid: UUID, indices: 'local-datashare' },
      global: { plugins }
    })
    wrappers.push(wrapper)
    await flushPromises()
    return wrapper
  }

  function findBatchSearch(wrapper) {
    return wrapper.findComponent(BatchSearchCard).props('batchSearch')
  }

  // The download button is rendered as a link, so being disabled shows up as a class
  // on the anchor rather than as a "disabled" attribute.
  function isDownloadResultsDisabled(wrapper) {
    return wrapper.find('.batch-search-card-actions__download').classes('disabled')
  }

  it('should keep the record counts when the failed task carries no result', async () => {
    const task = buildTask({ state: 'FAILURE', error: { message: 'Something went wrong' } })
    const record = buildBatchSearchRecord({ state: 'FAILURE', nbResults: 2, nbQueriesWithoutResults: 1 })
    const wrapper = await mountWith({ task, record })
    const batchSearch = findBatchSearch(wrapper)
    expect(batchSearch.nbResults).toBe(2)
    expect(batchSearch.nbQueriesWithoutResults).toBe(1)
  })

  it('should enable the results download when the batch search failed with results', async () => {
    const task = buildTask({ state: 'FAILURE', error: { message: 'Something went wrong' } })
    const record = buildBatchSearchRecord({ state: 'FAILURE', nbResults: 2 })
    const wrapper = await mountWith({ task, record })
    expect(isDownloadResultsDisabled(wrapper)).toBe(false)
  })

  it('should disable the results download when the batch search failed without results', async () => {
    const task = buildTask({ state: 'FAILURE', error: { message: 'Something went wrong' } })
    const record = buildBatchSearchRecord({ state: 'FAILURE', nbResults: 0 })
    const wrapper = await mountWith({ task, record })
    expect(isDownloadResultsDisabled(wrapper)).toBe(true)
  })

  it('should keep the record counts when the task result is a bare number', async () => {
    const task = buildTask({ result: { value: 7 } })
    const record = buildBatchSearchRecord({ nbResults: 7, nbQueriesWithoutResults: 0 })
    const wrapper = await mountWith({ task, record })
    const batchSearch = findBatchSearch(wrapper)
    expect(batchSearch.nbResults).toBe(7)
    expect(batchSearch.nbQueriesWithoutResults).toBe(0)
  })

  it('should prefer the task result counts over the record ones', async () => {
    const task = buildTask({ result: { value: { nbResults: 3, nbQueriesWithoutResults: 0 } } })
    const record = buildBatchSearchRecord({ nbResults: 2, nbQueriesWithoutResults: 1 })
    const wrapper = await mountWith({ task, record })
    const batchSearch = findBatchSearch(wrapper)
    expect(batchSearch.nbResults).toBe(3)
    expect(batchSearch.nbQueriesWithoutResults).toBe(0)
  })
})
