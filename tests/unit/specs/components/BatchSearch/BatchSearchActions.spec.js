import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import BatchSearchActions from '@/components/BatchSearch/BatchSearchActions'
import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    deleteBatchSearch: vi.fn()
  }
})

describe('BatchSearchActions.vue', () => {
  let wrapper, plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
  })

  beforeEach(async () => {
    api.deleteBatchSearch.mockClear()
  })

  it('should display a button to relaunch the batchSearch', async () => {
    const props = {
      uuid: '12'
    }
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    expect(wrapper.find('button-row-action-stub[label="Relaunch"]').exists()).toBe(true)
  })
  it('should display a button to edit the batchSearch', async () => {
    const props = {
      uuid: '12'
    }
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    expect(wrapper.find('button-row-action-stub[label="Edit"]').exists()).toBe(true)
  })
  it('should display a button to delete the batchSearch', async () => {
    const props = {
      uuid: '12'
    }
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    expect(wrapper.find('button-row-action-stub[label="Delete"]').exists()).toBe(true)
  })

  it.skip('should NOT display a button to relaunch the BS if BS status is failure', async () => {
    const props = {
      batchSearch: {
        uuid: '155',
        projects: [
          {
            name: 'BatchSearchActions'
          }
        ],
        description: 'This is the description of the batch search',
        state: 'QUEUED',
        date: '2019-07-18T14:45:34.869+0000',
        nbResults: 333,
        phraseMatch: 1,
        fuzziness: 1,
        fileTypes: [],
        paths: [],
        published: true,
        user: { id: 'test' }
      }
    }

    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })
})
