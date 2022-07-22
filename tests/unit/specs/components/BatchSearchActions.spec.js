import Murmur from '@icij/murmur'
import VueRouter from 'vue-router'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import { Core } from '@/core'
import BatchSearchActions from '@/components/BatchSearchActions'

Api.getFullUrl = jest.fn() // mock static function
jest.mock('@/api', () => jest.fn())

describe('BatchSearchActions.vue', () => {
  let wrapper
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const routes = [
    {
      name: 'batch-search.results',
      path: 'batch-search/:index/:uuid'
    }, {
      name: 'document-standalone',
      path: '/ds/:index/:id/:routing?'
    }
  ]
  const router = new VueRouter({ routes })
  const propsData = {
    batchSearch: {
      uuid: '12',
      projects: [{
        name: 'BatchSearchActions'
      }],
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
    }
  }

  beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

  beforeEach(async () => {
    await router.push({ name: 'batch-search.results' }).catch(() => {})
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    wrapper.vm.$core.auth.reset()
  })

  afterAll(() => jest.unmock('@/api'))

  it('should display a button to delete the batchSearch', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$core.auth.getUsername()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeTruthy()
  })

  it('should NOT display a button to delete the batchSearch if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$core.auth.getUsername()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeFalsy()
  })

  it('should display a button to download queries', () => {
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    expect(wrapper.find('.batch-search-actions__item--download-queries').exists()).toBeTruthy()
  })

  it('should display a button to download results', () => {
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    expect(wrapper.find('.batch-search-actions__item--download-results').exists()).toBeTruthy()
  })

  it('should display a button to relaunch the BS', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeTruthy()
  })

  it('should NOT display a button to relaunch the BS if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })

  it('should NOT display a button to relaunch the BS if BS status is failure', async () => {
    const propsData = {
      batchSearch: {
        uuid: '155',
        projects: [{
          name: 'BatchSearchActions'
        }],
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
    }

    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })

  it('should redirect on batchSearch deletion', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.deleteBatchSearch()
    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search' })
  })
})
