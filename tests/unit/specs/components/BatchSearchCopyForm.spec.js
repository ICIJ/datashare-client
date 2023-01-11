import Murmur from '@icij/murmur'
import VueRouter from 'vue-router'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import BatchSearchCopyForm from '@/components/BatchSearchCopyForm'

describe('BatchSearchCopyForm.vue', () => {
  let wrapper
  let i18n, localVue, store, wait
  const routes = [
    {
      name: 'batch-search',
      path: '/batch-search'
    },
    {
      name: 'batch-search.results',
      path: '/batch-search/:index/:uuid'
    },
    {
      name: 'document-standalone',
      path: '/ds/:index/:id/:routing?'
    }
  ]
  const router = new VueRouter({ routes })
  const propsData = {
    batchSearch: {
      uuid: '12',
      project: 'BatchSearchCopyForm',
      name: 'BatchSearch Test',
      description: 'This is the description of the batch search'
    }
  }

  beforeAll(() => {
    Murmur.config.merge({ mode: 'SERVER' })
    const mockApi = jest.fn()
    mockApi.copyBatchSearch = jest.fn()
    mockApi.runBatchSearch = jest.fn()
    const core = Core.init(createLocalVue(), mockApi).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  beforeEach(async () => {
    await router.push({ name: 'batch-search.results' })
    wrapper = shallowMount(BatchSearchCopyForm, { i18n, localVue, propsData, router, store, wait })
  })

  afterAll(() => jest.unmock('@/api'))

  it('should call "copyBatchSearch" method on click on submit button', async () => {
    const copyBatchSearchMock = jest.spyOn(wrapper.vm, 'copyBatchSearch')
    wrapper.setData({ name: 'Test' })
    wrapper.find('.card-footer .d-flex b-btn-stub').trigger('submit')
    expect(copyBatchSearchMock).toBeCalledTimes(1)
  })

  it('should call the API to delete the BS on call of "copyBatchSearch" method', async () => {
    const storeDispatchMock = jest.spyOn(store, 'dispatch')
    wrapper.setData({ name: 'Test' })
    wrapper.setData({ deleteAfterRelaunch: true })
    await wrapper.vm.copyBatchSearch()
    expect(storeDispatchMock).toBeCalled()
    expect(storeDispatchMock).toBeCalledWith('batchSearch/deleteBatchSearch', { batchId: '12' })
  })

  it('should display default values for name and description on BS relaunch form', () => {
    expect(wrapper.vm.name).toBe('BatchSearch Test')
    expect(wrapper.vm.description).toBe('This is the description of the batch search')
  })
})
