import { mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { flushPromises } from '~tests/unit/tests_utils'
import BatchSearchActions from '@/components/BatchSearchActions'
import { getMode, MODE_NAME } from '@/mode'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchActions.vue', () => {
  let wrapper, plugins, router, api, store

  const props = {
    batchSearch: {
      uuid: '12',
      projects: [
        {
          name: 'BatchSearchActions'
        }
      ],
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
      user: {
        id: 'test'
      }
    }
  }

  beforeAll(() => {
    api = { deleteBatchSearch: vi.fn() }
    const core = CoreSetup.init(api, getMode(MODE_NAME.SERVER)).useAll().useRouter()
    router = core.router
    plugins = core.plugins
    store = core.store
  })

  beforeEach(async () => {
    api.deleteBatchSearch.mockClear()
    await router.push({
      name: 'task.batch-search.view.results',
      params: {
        indices: 'test',
        uuid: 'uuid'
      }
    })
    await flushPromises()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    wrapper.vm.$core.auth.reset()
  })

  it('should display a button to delete the batchSearch', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { props, global: { plugins } })
    await wrapper.vm.$core.auth.getUsername()
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeTruthy()
  })

  it('should NOT display a button to delete the batchSearch if it is not mine', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { props, global: { plugins } })
    await wrapper.vm.$core.auth.getUsername()
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeFalsy()
  })

  it('should display a button to download queries', () => {
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    expect(wrapper.find('.batch-search-actions__item--download-queries').exists()).toBeTruthy()
  })

  it('should build a link to download queries without results', () => {
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    expect(wrapper.vm.downloadQueriesWithoutResultsUrl).toContain('maxResults=0')
  })

  it('should display a button to download results', async () => {
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--download-results').exists()).toBeTruthy()
  })

  it('should NOT display a button to relaunch the BS if it is not mine', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })

  it('should display a button to relaunch the BS', async () => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeTruthy()
  })

  it('should NOT display a button to relaunch the BS if BS status is failure', async () => {
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

  it('should redirect on batchSearch deletion', async () => {
    api.deleteBatchSearch.mockResolvedValue(true)
    vi.spyOn(router, 'push')
    wrapper = shallowMount(BatchSearchActions, { props, global: { plugins } })
    await wrapper.vm.deleteBatchSearch()
    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'task.batch-search.list' })
  })
})
